import bcrypt from 'bcryptjs';
import { userRepository } from '../repositories/userRepository.js';
import { userSettingsRepository } from '../repositories/userSettingsRepository.js';
import { fileUploadService } from './fileUploadService.js';
import { generateToken } from '../lib/jwt.js';
import { getLogger } from '../lib/loggerContext.js';

export class UserService {
  constructor() {
    this.userRepository = userRepository;
    this.userSettingsRepository = userSettingsRepository;
    this.fileUploadService = fileUploadService;
  }

  get logger() {
    return getLogger();
  }

  async getAllUsers(options = {}) {
    this.logger.info('[userService] getAllUsers start');
    try {
      const result = await userRepository.findManyWithPagination(options);
      result.data = result.data.map((user) => this.excludePassword(user));
      this.logger.info('[userService] getAllUsers success');
      return result;
    } catch (error) {
      this.logger.error({ err: error }, '[userService] getAllUsers error');
      throw error;
    }
  }

  async getUserById(id) {
    this.logger.info('[userService] getUserById start');
    const user = await userRepository.findById(id, { include: { user_settings: true } });
    if (!user) {
      throw new Error('User not found');
    }
    this.logger.info('[userService] getUserById success');
    return this.excludePassword(user);
  }

  async createUser(userData) {
    this.logger.info('[userService] createUser start');
    try {
      const emailExists = await userRepository.emailExists(userData.email);
      if (emailExists) throw new Error('Email is already registered');

      if (userData.username) {
        const usernameExists = await userRepository.usernameExists(userData.username);
        if (usernameExists) throw new Error('Username is already taken');
      }

      if (!userData.username) {
        userData.username = this.generateUsername(userData.first_name, userData.last_name);
      }

      if (userData.role) {
        userData.role = String(userData.role).toUpperCase();
      }

      if (userData.password) {
        userData.password = await bcrypt.hash(userData.password, 12);
      }

      const user = await userRepository.createWithSettings(userData);
      this.logger.info('[userService] createUser success');
      return this.excludePassword(user);
    } catch (error) {
      this.logger.error({ err: error }, '[userService] createUser error');
      throw error;
    }
  }

  async updateUser(id, updateData) {
    this.logger.info('[userService] updateUser start');
    const existingUser = await userRepository.findById(id);
    if (!existingUser) throw new Error('User not found');

    if (updateData.role) {
      updateData.role = String(updateData.role).toUpperCase();
    }

    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 12);
    }

    if (updateData.email && updateData.email !== existingUser.email) {
      const emailExists = await userRepository.emailExists(updateData.email);
      if (emailExists) throw new Error('Email is already registered');
    }

    const user = await userRepository.update(id, updateData);
    this.logger.info('[userService] updateUser success');
    return this.excludePassword(user);
  }

  async deleteUser(id) {
    this.logger.info('[userService] deleteUser start');
    const user = await userRepository.findById(id);
    if (!user) throw new Error('User not found');
    await userRepository.delete(id);
    this.logger.info('[userService] deleteUser success');
  }

  async login(email, password, rememberMe = false, server) {
    this.logger.info('[userService] login start');
    const user = await userRepository.findByEmail(email);
    if (!user) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    const token = generateToken(server, user, rememberMe);
    this.logger.info('[userService] login success');
    return {
      user: this.excludePassword(user),
      token,
      expiresIn: rememberMe ? '30 days' : '1 day',
    };
  }

  async register(userData, server) {
    this.logger.info('[userService] register start');
    try {
      const emailExists = await userRepository.emailExists(userData.email);
      if (emailExists) {
        const error = new Error('Email is already registered');
        error.statusCode = 400;
        throw error;
      }

      const username = this.generateUsername(userData.first_name, userData.last_name);
      const hashedPassword = await bcrypt.hash(userData.password, 12);

      const userDataWithHashedPassword = {
        ...userData,
        username,
        password: hashedPassword,
        role: 'USER',
      };

      const user = await userRepository.createWithSettings(userDataWithHashedPassword);
      const token = generateToken(server, user, false);

      this.logger.info('[userService] register success');
      return {
        user: this.excludePassword(user),
        token,
        expiresIn: '1 day',
      };
    } catch (error) {
      this.logger.error({ err: error }, '[userService] register error');
      throw error;
    }
  }

  async getCurrentUser(userId) {
    this.logger.info('[userService] getCurrentUser start');
    const user = await userRepository.findById(userId);
    if (!user) throw new Error('User not found');
    this.logger.info('[userService] getCurrentUser success');
    return this.excludePassword(user);
  }

  async getUserSettings(userId) {
    this.logger.info('[userService] getUserSettings start');
    try {
      const settings = await userSettingsRepository.getUserSettings(userId);
      this.logger.info('[userService] getUserSettings success');
      return settings;
    } catch (error) {
      this.logger.error({ err: error }, '[userService] getUserSettings error');
      throw error;
    }
  }

  async updateUserSettings(userId, settingsArray) {
    this.logger.info('[userService] updateUserSettings start');
    try {
      const result = await userSettingsRepository.updateUserSettings(userId, settingsArray);
      this.logger.info('[userService] updateUserSettings success');
      return result;
    } catch (error) {
      this.logger.error({ err: error }, '[userService] updateUserSettings error');
      throw error;
    }
  }

  async updateNotificationPreferences(userId, preferences) {
    this.logger.info('[userService] updateNotificationPreferences start');
    try {
      const validKeys = ['promo_notification', 'job_notification', 'program_notification'];
      const validatedPreferences = {};

      for (const key of validKeys) {
        validatedPreferences[key] = preferences.hasOwnProperty(key) ? Boolean(preferences[key]) : false;
      }

      const result = await userSettingsRepository.upsertUserSetting(userId, 'notification_preferences', validatedPreferences);
      this.logger.info('[userService] updateNotificationPreferences success');
      return result;
    } catch (error) {
      this.logger.error({ err: error }, '[userService] updateNotificationPreferences error');
      throw error;
    }
  }

  async getNotificationPreferences(userId) {
    this.logger.info('[userService] getNotificationPreferences start');
    try {
      const setting = await userSettingsRepository.getUserSettingByKey(userId, 'notification_preferences');

      if (!setting || !setting.value) {
        return {
          promo_notification: true,
          job_notification: true,
          program_notification: true,
        };
      }

      this.logger.info('[userService] getNotificationPreferences success');
      return setting.value;
    } catch (error) {
      this.logger.error({ err: error }, '[userService] getNotificationPreferences error');
      throw error;
    }
  }

  async updateUserAccount(userId, accountData) {
    this.logger.info('[userService] updateUserAccount start');
    try {
      if (accountData.avatarFile) {
        try {
          const publicUrl = this.fileUploadService.generatePublicFileUrl(accountData.avatarFile);
          accountData.avatar = publicUrl;
        } catch (uploadError) {
          throw new Error('Failed to upload avatar');
        }
        delete accountData.avatarFile;
      } else if (accountData.avatar === '') {
        accountData.avatar = null;
      }

      if (accountData.email) {
        const existingUser = await userRepository.findByEmail(accountData.email);
        if (existingUser && existingUser.id !== userId) {
          throw new Error('Email is already registered');
        }
      }

      const updatedUser = await userRepository.update(userId, accountData);
      this.logger.info('[userService] updateUserAccount success');
      return this.excludePassword(updatedUser);
    } catch (error) {
      this.logger.error({ err: error }, '[userService] updateUserAccount error');
      throw error;
    }
  }

  async updateUserPassword(userId, password) {
    this.logger.info('[userService] updateUserPassword start');
    try {
      const hashedPassword = await bcrypt.hash(password, 12);
      const updatedUser = await userRepository.update(userId, { password: hashedPassword });
      this.logger.info('[userService] updateUserPassword success');
      return this.excludePassword(updatedUser);
    } catch (error) {
      this.logger.error({ err: error }, '[userService] updateUserPassword error');
      throw error;
    }
  }

  excludePassword(user) {
    if (!user) return null;
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  generateUsername(firstName, lastName) {
    return `${firstName.toLowerCase()}${lastName.toLowerCase()}`.replace(/[^a-z0-9]/g, '');
  }
}

export const userService = new UserService();

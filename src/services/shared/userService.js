import bcrypt from 'bcryptjs';
import { userRepository } from '../../repositories/shared/userRepository.js';
import { userSettingsRepository } from '../../repositories/shared/userSettingsRepository.js';
import { fileUploadService } from './fileUploadService.js';
import { generateToken } from '../../utils/jwt.js';
import { getLogger } from '../../utils/loggerContext.js';

export class UserService {
  constructor() {
    this.userRepository = userRepository;
    this.userSettingsRepository = userSettingsRepository;
    this.fileUploadService = fileUploadService;
  }

  get logger() {
    return getLogger();
  }

  async exportAllForExcel(params = {}) {
    this.logger.info('[userService] exportAllForExcel start');
    try {
      const result = await userRepository.findManyWithPagination({ ...params, limit: 10000 });
      result.data = result.data.map((user) => this.excludePassword(user));
      this.logger.info('[userService] exportAllForExcel success');
      return result.data;
    } catch (error) {
      this.logger.error({ err: error }, '[userService] exportAllForExcel error');
      throw error;
    }
  }

  async generateExcelFile(users) {
    this.logger.info('[userService] generateExcelFile start');
    try {
      const XLSX = await import('xlsx');
      const workbook = XLSX.utils.book_new();
      const sheetData = this._prepareSheetData(users);
      const sheet = XLSX.utils.aoa_to_sheet(sheetData);
      sheet['!cols'] = this._calculateColumnWidths(sheetData);
      XLSX.utils.book_append_sheet(workbook, sheet, 'Users');
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      this.logger.info('[userService] generateExcelFile success');
      return buffer;
    } catch (error) {
      this.logger.error({ err: error }, '[userService] generateExcelFile error');
      throw new Error('Failed to generate Excel file');
    }
  }

  _prepareSheetData(users) {
    const headers = ['ID', 'Username', 'First Name', 'Last Name', 'Email', 'Phone', 'Role', 'Gender', 'Country', 'Province', 'City', 'Last Education', 'Current Job', 'Current Company', 'Created At'];
    const rows = [headers];
    users.forEach((user) => {
      rows.push([
        user.id,
        user.username || '',
        user.first_name || '',
        user.last_name || '',
        user.email || '',
        user.phone || '',
        user.role || '',
        user.gender || '',
        user.country || '',
        user.province || '',
        user.city || '',
        user.last_education || '',
        user.current_job || '',
        user.current_company || '',
        user.created_at ? new Date(user.created_at).toLocaleString() : '',
      ]);
    });
    return rows;
  }

  _calculateColumnWidths(sheetData) {
    if (!sheetData?.length) return [];
    const numColumns = sheetData[0].length;
    const columnWidths = [];
    for (let col = 0; col < numColumns; col++) {
      let maxWidth = 0;
      for (const row of sheetData) {
        if (row?.[col]) maxWidth = Math.max(maxWidth, String(row[col]).length);
      }
      const optimalWidth = Math.min(Math.max(maxWidth + 2, 8), 50);
      columnWidths.push({ width: optimalWidth, wch: optimalWidth });
    }
    return columnWidths;
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
      await this.validateUserCreation(userData);

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
    this.logger.debug({ id, updateData }, '[userService] raw');

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
        if (preferences.hasOwnProperty(key)) {
          validatedPreferences[key] = Boolean(preferences[key]);
        } else {
          validatedPreferences[key] = false;
        }
      }

      const result = await userSettingsRepository.upsertUserSetting(userId, 'notification_preferences', validatedPreferences);
      this.logger.info('[userService] updateNotificationPreferences success');
      return result.value;
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

      // Convert Prisma JSON to plain object by serializing and deserializing
      const preferences = JSON.parse(JSON.stringify(setting.value));

      this.logger.info('[userService] getNotificationPreferences success');
      return preferences;
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

      // Strip empty strings for optional fields so Prisma doesn't try to assign '' to enum/nullable columns
      const OPTIONAL_FIELDS = ['phone', 'gender', 'country', 'province', 'city', 'last_education', 'current_job', 'current_company'];
      for (const field of OPTIONAL_FIELDS) {
        if (accountData[field] === '') delete accountData[field];
      }

      if (accountData.email) {
        const existingUser = await userRepository.findByEmail(accountData.email);
        if (existingUser && existingUser.id !== userId) {
          const error = new Error('Email is already registered');
          error.statusCode = 400;
          throw error;
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

  async validateUserCreation(userData) {
    if (!userData.email) {
      const error = new Error('Email is required');
      error.statusCode = 400;
      throw error;
    }
    if (!userData.first_name) {
      const error = new Error('First name is required');
      error.statusCode = 400;
      throw error;
    }
    if (!userData.last_name) {
      const error = new Error('Last name is required');
      error.statusCode = 400;
      throw error;
    }

    const emailExists = await userRepository.emailExists(userData.email);
    if (emailExists) {
      const error = new Error('Email already exists');
      error.statusCode = 400;
      throw error;
    }

    if (userData.username) {
      const usernameExists = await userRepository.usernameExists(userData.username);
      if (usernameExists) {
        const error = new Error('Username already exists');
        error.statusCode = 400;
        throw error;
      }
    }
  }

  generateUsername(firstName, lastName) {
    this.logger.info('[userService] generateUsername start');

    const username = `${firstName.toLowerCase()}${lastName.toLowerCase()}`.replace(/[^a-z0-9]/g, '');

    this.logger.info('[userService] generateUsername - generated username');
    return username;
  }

  async validateUserRegistration(userData) {
    if (!userData.password || userData.password.length < 6) {
      const error = new Error('Password must be at least 6 characters long');
      error.statusCode = 400;
      throw error;
    }

    await this.validateUserCreation(userData);
  }
}

export const userService = new UserService();

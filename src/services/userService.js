import bcrypt from 'bcryptjs';
import { userRepository } from '../repositories/userRepository.js';
import { userSettingsRepository } from '../repositories/userSettingsRepository.js';
import { generateToken } from '../lib/jwt.js';
import { getLogger } from '../lib/loggerContext.js';

/**
 * User business logic service
 */
export class UserService {
  get logger() {
    return getLogger();
  }

  /**
   * Get all users with pagination and filtering
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Paginated users
   */
  async getAllUsers(options = {}) {
    this.logger.info('[userService] getAllUsers start');
    this.logger.debug({ options }, '[userService] raw');
    try {
      const result = await userRepository.findManyWithPagination(options);

      // Remove passwords from all users
      result.data = result.data.map((user) => this.excludePassword(user));

      this.logger.info('[userService] getAllUsers success');
      return result;
    } catch (error) {
      this.logger.error({ err: error }, '[userService] getAllUsers error');
      throw error;
    }
  }

  /**
   * Get user by ID
   * @param {number} id - User ID
   * @returns {Promise<Object>} User data
   * @throws {Error} If user not found
   */
  async getUserById(id) {
    this.logger.info('[userService] getUserById start');
    this.logger.debug({ id }, '[userService] params');
    const user = await userRepository.findById(id, {
      include: { user_setting: true },
    });

    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      this.logger.error({ err: error }, '[userService] getUserById not_found');
      throw error;
    }

    this.logger.info('[userService] getUserById success');
    return this.excludePassword(user);
  }

  /**
   * Create new user
   * @param {Object} userData - User data
   * @returns {Promise<Object>} Created user
   * @throws {Error} If validation fails or user exists
   */
  async createUser(userData) {
    this.logger.info('[userService] createUser start');
    this.logger.debug({ email: userData?.email }, '[userService] rawBody');
    try {
      // Validate user data
      await this.validateUserCreation(userData);

      // Generate username if not provided
      if (!userData.username) {
        userData.username = await this.generateUniqueUsername(userData.first_name, userData.last_name);
      }

      // Ensure role uppercase as DB enum
      if (userData.role) {
        userData.role = String(userData.role).toUpperCase();
      }

      // Hash password
      if (userData.password) {
        userData.password = await bcrypt.hash(userData.password, 12);
      }

      // Create user with settings
      const user = await userRepository.createWithSettings(userData);

      this.logger.info('[userService] createUser success');
      return this.excludePassword(user);
    } catch (error) {
      this.logger.error({ err: error }, '[userService] createUser error');
      throw error;
    }
  }

  /**
   * Update user by ID
   * @param {number} id - User ID
   * @param {Object} updateData - Update data
   * @returns {Promise<Object>} Updated user
   * @throws {Error} If user not found or validation fails
   */
  async updateUser(id, updateData) {
    this.logger.info('[userService] updateUser start');
    this.logger.debug({ id, updateData }, '[userService] raw');
    // Check if user exists
    const existingUser = await userRepository.findById(id);
    if (!existingUser) {
      const error = new Error('User not found');
      error.statusCode = 404;
      this.logger.error({ err: error }, '[userService] updateUser not_found');
      throw error;
    }

    // Ensure role uppercase as DB enum if provided
    if (updateData.role) {
      updateData.role = String(updateData.role).toUpperCase();
    }

    // Hash password if provided
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 12);
    }

    // Validate email uniqueness if changed
    if (updateData.email && updateData.email !== existingUser.email) {
      const emailExists = await userRepository.emailExists(updateData.email);
      if (emailExists) {
        const error = new Error('Email already exists');
        error.statusCode = 400;
        this.logger.error({ err: error }, '[userService] updateUser email_exists');
        throw error;
      }
    }

    const user = await userRepository.update(id, updateData);
    this.logger.info('[userService] updateUser success');
    return this.excludePassword(user);
  }

  /**
   * Delete user by ID
   * @param {number} id - User ID
   * @returns {Promise<void>}
   * @throws {Error} If user not found
   */
  async deleteUser(id) {
    this.logger.info('[userService] deleteUser start');
    this.logger.debug({ id }, '[userService] params');
    const user = await userRepository.findById(id);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      this.logger.error({ err: error }, '[userService] deleteUser not_found');
      throw error;
    }

    await userRepository.delete(id);
    this.logger.info('[userService] deleteUser success');
  }

  /**
   * Login user
   */
  async login(email, password, rememberMe = false, server) {
    this.logger.info('[userService] login start');
    this.logger.debug({ email, rememberMe }, '[userService] login input');

    const user = await userRepository.findByEmail(email);

    if (!user) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      this.logger.error({ err: error }, '[userService] login user_not_found');
      throw error;
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      this.logger.error({ err: error }, '[userService] login invalid_password');
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

  /**
   * Register new user
   */
  async register(userData, server) {
    this.logger.info('[userService] register start');
    this.logger.debug({ email: userData?.email }, '[userService] rawInput');

    try {
      this.logger.info('[userService] validating registration');
      await this.validateUserRegistration(userData);

      this.logger.info('[userService] generating username');
      const username = await this.generateUniqueUsername(userData.first_name, userData.last_name);

      this.logger.info('[userService] hashing password');
      const hashedPassword = await bcrypt.hash(userData.password, 12);

      const userDataWithHashedPassword = {
        ...userData,
        username,
        password: hashedPassword,
        role: 'USER',
      };

      this.logger.info('[userService] creating user with settings');
      const user = await userRepository.createWithSettings(userDataWithHashedPassword);

      this.logger.info('[userService] generating jwt');
      const token = generateToken(server, user, false);

      this.logger.info('[userService] register success');
      return {
        user: this.excludePassword(user),
        token,
        expiresIn: '1 day',
      };
    } catch (error) {
      this.logger.error({ err: error, email: userData?.email }, '[userService] register error');
      throw error;
    }
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(userId) {
    this.logger.info({ userId }, '[userService] getCurrentUser start');
    const user = await userRepository.findById(userId, { include: { user_setting: true } });

    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      this.logger.error({ err: error }, '[userService] getCurrentUser not_found');
      throw error;
    }

    this.logger.info('[userService] getCurrentUser success');
    return this.excludePassword(user);
  }

  /**
   * Get user settings
   */
  async getUserSettings(userId) {
    this.logger.info('[userService] getUserSettings start');
    let userSettings = await userSettingsRepository.findByUserId(userId);

    if (!userSettings) {
      userSettings = await userSettingsRepository.createDefault(userId);
    }

    this.logger.info('[userService] getUserSettings success');
    return userSettings;
  }

  /**
   * Update user settings
   */
  async updateUserSettings(userId, settingsData) {
    this.logger.info('[userService] updateUserSettings start');
    this.logger.debug({ userId, settingsData }, '[userService] raw');
    const result = await userSettingsRepository.upsertByUserId(userId, settingsData);
    this.logger.info('[userService] updateUserSettings success');
    return result;
  }

  /**
   * Check username availability
   */
  async checkUsernameAvailability(username) {
    this.logger.info('[userService] checkUsernameAvailability start');
    const exists = await userRepository.usernameExists(username);
    this.logger.info('[userService] checkUsernameAvailability success');
    return { username, available: !exists };
  }

  /**
   * Generate username suggestions
   */
  async generateUsernameSuggestions(firstName, lastName) {
    this.logger.info('[userService] generateUsernameSuggestions start');
    const suggestions = [];
    const baseUsername = `${firstName.toLowerCase()}${lastName.toLowerCase()}`.replace(/[^a-z0-9]/g, '');

    for (let i = 0; i < 5; i++) {
      let username;
      if (i === 0) username = baseUsername;
      else username = `${baseUsername}${Math.floor(Math.random() * 1000)}`;
      const exists = await userRepository.usernameExists(username);
      suggestions.push({ username, available: !exists });
    }

    this.logger.info('[userService] generateUsernameSuggestions success');
    return suggestions;
  }

  /**
   * Generate unique username
   */
  async generateUniqueUsername(firstName, lastName) {
    this.logger.debug({ firstName, lastName }, '[userService] generateUniqueUsername');
    const baseUsername = `${firstName.toLowerCase()}${lastName.toLowerCase()}`.replace(/[^a-z0-9]/g, '');
    let username = baseUsername;
    let counter = 1;

    while (await userRepository.usernameExists(username)) {
      username = `${baseUsername}${counter}`;
      counter++;
    }

    return username;
  }

  /**
   * Remove password from user object
   */
  excludePassword(user) {
    if (!user) return null;
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Validate user creation data
   */
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

  /**
   * Validate user registration data
   */
  async validateUserRegistration(userData) {
    if (!userData.password || userData.password.length < 6) {
      const error = new Error('Password must be at least 6 characters long');
      error.statusCode = 400;
      throw error;
    }

    await this.validateUserCreation(userData);
  }
}

// Export instance
export const userService = new UserService();

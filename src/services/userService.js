import bcrypt from 'bcryptjs';
import { userRepository } from '../repositories/userRepository.js';
import { userSettingsRepository } from '../repositories/userSettingsRepository.js';
import { generateToken } from '../lib/jwt.js';

/**
 * User business logic service
 */
export class UserService {
  /**
   * Get all users with pagination and filtering
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Paginated users
   */
  async getAllUsers(options = {}) {
    const result = await userRepository.findManyWithPagination(options);

    // Remove passwords from all users
    result.data = result.data.map((user) => this.excludePassword(user));

    return result;
  }

  /**
   * Get user by ID
   * @param {number} id - User ID
   * @returns {Promise<Object>} User data
   * @throws {Error} If user not found
   */
  async getUserById(id) {
    const user = await userRepository.findById(id, {
      include: { user_setting: true },
    });

    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    return this.excludePassword(user);
  }

  /**
   * Create new user
   * @param {Object} userData - User data
   * @returns {Promise<Object>} Created user
   * @throws {Error} If validation fails or user exists
   */
  async createUser(userData) {
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

    return this.excludePassword(user);
  }

  /**
   * Update user by ID
   * @param {number} id - User ID
   * @param {Object} updateData - Update data
   * @returns {Promise<Object>} Updated user
   * @throws {Error} If user not found or validation fails
   */
  async updateUser(id, updateData) {
    // Check if user exists
    const existingUser = await userRepository.findById(id);
    if (!existingUser) {
      const error = new Error('User not found');
      error.statusCode = 404;
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
        throw error;
      }
    }

    const user = await userRepository.update(id, updateData);
    return this.excludePassword(user);
  }

  /**
   * Delete user by ID
   * @param {number} id - User ID
   * @returns {Promise<void>}
   * @throws {Error} If user not found
   */
  async deleteUser(id) {
    const user = await userRepository.findById(id);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    await userRepository.delete(id);
  }

  /**
   * Login user
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {boolean} rememberMe - Remember me option
   * @param {Object} server - Fastify server instance for JWT
   * @returns {Promise<Object>} Login result with user and token
   * @throws {Error} If credentials invalid
   */
  async login(email, password, rememberMe = false, server) {
    const user = await userRepository.findByEmail(email);

    if (!user) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    // Validate password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    // Generate JWT token
    const token = generateToken(server, user, rememberMe);

    return {
      user: this.excludePassword(user),
      token,
      expiresIn: rememberMe ? '30 days' : '1 day',
    };
  }

  /**
   * Register new user
   * @param {Object} userData - User registration data
   * @param {Object} server - Fastify server instance for JWT
   * @returns {Promise<Object>} Registration result with user and token
   * @throws {Error} If validation fails or user exists
   */
  async register(userData, server) {
    console.log('[UserService] Starting user registration', { email: userData.email });

    try {
      // Validate registration data
      console.log('[UserService] Validating registration data...');
      await this.validateUserRegistration(userData);
      console.log('[UserService] Registration data validated');

      // Generate unique username
      console.log('🔠 [UserService] Generating unique username...');
      const username = await this.generateUniqueUsername(userData.first_name, userData.last_name);
      console.log('[UserService] Generated username:', username);

      // Hash password
      console.log('🔑 [UserService] Hashing password...');
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      console.log('[UserService] Password hashed');

      // Prepare user data
      const userDataWithHashedPassword = {
        ...userData,
        username,
        password: hashedPassword,
        role: 'USER',
      };
      console.log('[UserService] Prepared user data for creation');

      // Create user with settings
      console.log('👤 [UserService] Creating user in database...');
      const user = await userRepository.createWithSettings(userDataWithHashedPassword);
      console.log('[UserService] User created successfully', { userId: user.id });

      // Generate JWT token
      console.log('🔐 [UserService] Generating JWT token...');
      const token = generateToken(server, user, false);
      console.log('[UserService] JWT token generated');

      console.log('[UserService] Registration completed successfully', {
        userId: user.id,
        email: user.email,
      });

      return {
        user: this.excludePassword(user),
        token,
        expiresIn: '1 day',
      };
    } catch (error) {
      console.error('[UserService] Registration failed', {
        error: error.message,
        stack: error.stack,
        userData: { email: userData.email },
      });
      throw error;
    }
  }

  /**
   * Get current user profile
   * @param {number} userId - User ID from JWT
   * @returns {Promise<Object>} User profile
   * @throws {Error} If user not found
   */
  async getCurrentUser(userId) {
    const user = await userRepository.findById(userId, {
      include: { user_setting: true },
    });

    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    return this.excludePassword(user);
  }

  /**
   * Get user settings
   * @param {number} userId - User ID
   * @returns {Promise<Object>} User settings
   */
  async getUserSettings(userId) {
    let userSettings = await userSettingsRepository.findByUserId(userId);

    // Create default settings if not exists
    if (!userSettings) {
      userSettings = await userSettingsRepository.createDefault(userId);
    }

    return userSettings;
  }

  /**
   * Update user settings
   * @param {number} userId - User ID
   * @param {Object} settingsData - Settings data
   * @returns {Promise<Object>} Updated settings
   */
  async updateUserSettings(userId, settingsData) {
    return await userSettingsRepository.upsertByUserId(userId, settingsData);
  }

  /**
   * Check username availability
   * @param {string} username - Username to check
   * @returns {Promise<Object>} Availability result
   */
  async checkUsernameAvailability(username) {
    const exists = await userRepository.usernameExists(username);
    return {
      username,
      available: !exists,
    };
  }

  /**
   * Generate username suggestions
   * @param {string} firstName - First name
   * @param {string} lastName - Last name
   * @returns {Promise<Array>} Username suggestions
   */
  async generateUsernameSuggestions(firstName, lastName) {
    const suggestions = [];
    const baseUsername = `${firstName.toLowerCase()}${lastName.toLowerCase()}`.replace(/[^a-z0-9]/g, '');

    // Generate 5 suggestions
    for (let i = 0; i < 5; i++) {
      let username;
      if (i === 0) {
        username = baseUsername;
      } else {
        username = `${baseUsername}${Math.floor(Math.random() * 1000)}`;
      }

      const exists = await userRepository.usernameExists(username);
      suggestions.push({
        username,
        available: !exists,
      });
    }

    return suggestions;
  }

  /**
   * Generate unique username
   * @private
   * @param {string} firstName - First name
   * @param {string} lastName - Last name
   * @returns {Promise<string>} Unique username
   */
  async generateUniqueUsername(firstName, lastName) {
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
   * @private
   * @param {Object} user - User object
   * @returns {Object} User without password
   */
  excludePassword(user) {
    if (!user) return null;
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Validate user creation data
   * @private
   * @param {Object} userData - User data
   * @throws {Error} If validation fails
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

    // Check if email already exists
    const emailExists = await userRepository.emailExists(userData.email);
    if (emailExists) {
      const error = new Error('Email already exists');
      error.statusCode = 400;
      throw error;
    }

    // Check if username already exists (if provided)
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
   * @private
   * @param {Object} userData - User data
   * @throws {Error} If validation fails
   */
  async validateUserRegistration(userData) {
    if (!userData.password || userData.password.length < 6) {
      const error = new Error('Password must be at least 6 characters long');
      error.statusCode = 400;
      throw error;
    }

    // Use the same validation as creation
    await this.validateUserCreation(userData);
  }
}

// Export instance
export const userService = new UserService();

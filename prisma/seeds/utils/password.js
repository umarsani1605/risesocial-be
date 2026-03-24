/**
 * Password utility for hashing passwords using bcrypt
 */

import bcrypt from 'bcryptjs';

/**
 * Hash a password using bcrypt with 12 rounds
 * @param {string} password - Plain text password to hash
 * @returns {Promise<string>} Hashed password
 */
export async function hashPassword(password) {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

/**
 * Hash multiple passwords in parallel
 * @param {Array<string>} passwords - Array of plain text passwords
 * @returns {Promise<Array<string>>} Array of hashed passwords
 */
export async function hashPasswords(passwords) {
  return await Promise.all(passwords.map((password) => hashPassword(password)));
}

/**
 * Verify a password against a hash
 * @param {string} password - Plain text password
 * @param {string} hash - Hashed password
 * @returns {Promise<boolean>} True if password matches hash
 */
export async function verifyPassword(password, hash) {
  return await bcrypt.compare(password, hash);
}

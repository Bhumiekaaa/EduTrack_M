const jwt = require('jsonwebtoken');
const config = require('../config');

/**
 * Generate JWT token
 * @param {string} userId - User ID
 * @param {string} role - User role
 * @returns {string} JWT token
 */
const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET || config.jwt.secret,
    { expiresIn: process.env.JWT_EXPIRE || config.jwt.expiresIn }
  );
};

/**
 * Verify JWT token
 * @param {string} token - JWT token
 * @returns {Object} Decoded token payload
 */
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET || config.jwt.secret);
};

/**
 * Generate random string for password reset token
 * @param {number} length - Length of the token
 * @returns {string} Random string
 */
const generateRandomToken = (length = 32) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

module.exports = {
  generateToken,
  verifyToken,
  generateRandomToken
};

// JWT utilities untuk Rise Social Backend
// Menggunakan @fastify/jwt yang sudah terdaftar di server

/**
 * Generate JWT token dengan user info dan role menggunakan Fastify JWT
 * @param {Object} fastify - Fastify instance
 * @param {Object} user - User object dari database
 * @param {boolean} rememberMe - True jika "Remember Me" dicentang
 * @returns {string} JWT token
 */
export function generateToken(fastify, user, rememberMe = false) {
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    firstName: user.first_name,
    lastName: user.last_name,
    avatar: user.avatar,
  };

  const options = {
    expiresIn: rememberMe ? '30d' : '1d', // 30 hari vs 1 hari
  };

  return fastify.jwt.sign(payload, options);
}

/**
 * Verify dan decode JWT token menggunakan Fastify JWT
 * @param {Object} fastify - Fastify instance
 * @param {string} token - JWT token
 * @returns {Object|null} Decoded payload atau null jika invalid
 */
export async function verifyToken(fastify, token) {
  try {
    const decoded = await fastify.jwt.verify(token);
    return decoded;
  } catch (error) {
    console.error('JWT verification failed:', error.message);
    return null;
  }
}

/**
 * Extract token dari Authorization header
 * @param {string} authHeader - Authorization header value
 * @returns {string|null} Token atau null
 */
export function extractTokenFromHeader(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  return authHeader.substring(7); // Remove "Bearer "
}

/**
 * Check apakah user memiliki role tertentu
 * @param {Object} decodedToken - Decoded JWT payload
 * @param {string[]} allowedRoles - Array role yang diizinkan
 * @returns {boolean}
 */
export function hasRole(decodedToken, allowedRoles) {
  if (!decodedToken || !decodedToken.role) {
    return false;
  }
  return (allowedRoles || []).includes(decodedToken.role);
}

/**
 * Middleware untuk require role tertentu menggunakan Fastify JWT
 * @param {string[]} allowedRoles - Array role yang diizinkan
 */
export function requireRole(allowedRoles) {
  return async function (request, reply) {
    try {
      // Pastikan user sudah authenticated dengan Fastify JWT
      await request.jwtVerify();

      // Check role dari payload yang sudah di-decode
      if (!hasRole(request.user, allowedRoles)) {
        return reply.status(403).send({
          success: false,
          message: `Access denied. Required role: ${allowedRoles.join(' or ')}`,
        });
      }
    } catch (err) {
      return reply.status(401).send({
        success: false,
        message: 'Invalid or missing token',
      });
    }
  };
}

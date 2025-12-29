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
    expiresIn: rememberMe ? '30d' : '1d',
  };

  return fastify.jwt.sign(payload, options);
}

export async function verifyToken(fastify, token) {
  try {
    const decoded = await fastify.jwt.verify(token);
    return decoded;
  } catch (error) {
    console.error('JWT verification failed:', error.message);
    return null;
  }
}

export function extractTokenFromHeader(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  return authHeader.substring(7);
}

export function hasRole(decodedToken, allowedRoles) {
  if (!decodedToken || !decodedToken.role) {
    return false;
  }
  return (allowedRoles || []).includes(decodedToken.role);
}

export function requireRole(allowedRoles) {
  return async function (request, reply) {
    try {
      await request.jwtVerify();

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

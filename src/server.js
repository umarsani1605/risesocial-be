import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import multipart from '@fastify/multipart';
import fastifyCaching from '@fastify/caching';
import fastifyStatic from '@fastify/static';
import dotenv from 'dotenv';
import { disconnectDatabase } from './lib/prisma.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs-extra';

import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';

import { errorHandler, notFoundHandler } from './middleware/index.js';

import userRoutes from './routes/userRoutes.js';
import authRoutes from './routes/authRoutes.js';
import bootcampRoutes from './routes/bootcamp/index.js';
import bootcampRelatedRoutes from './routes/bootcamp/bootcampRelatedRoutes.js';
import instructorRoutes from './routes/instructor/instructorRoutes.js';
import enrollmentRoutes from './routes/enrollment/index.js';
import { jobsRoutes } from './routes/jobs/index.js';
import { programsRoutes } from './routes/programs/index.js';
import { testimonialsRoutes } from './routes/testimonials/index.js';
import { fileUploadRoutes } from './routes/upload/fileUploadRoutes.js';
import { rylsRegistrationRoutes } from './routes/registration/rylsRegistrationRoutes.js';
import rylsPaymentRoutes from './routes/payments/rylsPaymentRoutes.js';

dotenv.config();

const fastify = Fastify({
  logger: {
    level: process.env.NODE_ENV === 'development' ? 'info' : 'error',
  },
});

await fastify.register(cors, {
  origin: (origin, cb) => {
    const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:3000';
    if (!origin || origin === allowedOrigin) {
      cb(null, true);
      return;
    }
    cb(new Error('Not allowed by CORS'), false);
  },
  credentials: true,
});

await fastify.register(multipart, {
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

// Register static file serving for uploads folder
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsPath = path.join(__dirname, '..', 'uploads');

console.log('[Server] Static file serving setup:');
console.log('[Server] __dirname:', __dirname);
console.log('[Server] Uploads path:', uploadsPath);
console.log('[Server] Uploads path exists:', await fs.pathExists(uploadsPath));

await fastify.register(fastifyStatic, {
  root: uploadsPath,
  prefix: '/uploads/',
  decorateReply: false,
  // Remove host constraints to allow all hosts
  // constraints: {
  //   host: 'localhost',
  // },
});

console.log('[Server] Static file serving registered for /uploads/');

await fastify.register(jwt, {
  secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-for-development',
  sign: {
    issuer: 'rise-social',
    audience: 'rise-social-users',
  },
  verify: {
    issuer: 'rise-social',
    audience: 'rise-social-users',
  },
});

await fastify.register(fastifyCaching, {
  privacy: fastifyCaching.privacy.PUBLIC,
  expiresIn: 60, // 1 hour
  cacheSegment: 'rise-social',
});

await fastify.register(swagger, {
  swagger: {
    info: {
      title: 'Rise Social API',
      description: 'Backend API documentation for the Rise Social platform.',
      version: '1.0.0',
    },
    externalDocs: {
      url: 'https://swagger.io',
      description: 'Find more info here',
    },
    host: `localhost:${process.env.PORT || 8000}`,
    schemes: ['http'],
    consumes: ['application/json'],
    produces: ['application/json'],
    tags: [
      { name: 'User', description: 'User-related endpoints' },
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Bootcamp', description: 'Bootcamp-related endpoints' },
      { name: 'Instructors', description: 'Instructor-related endpoints' },
      { name: 'Instructor Assignments', description: 'Instructor-bootcamp assignment endpoints' },
      { name: 'Enrollments', description: 'Enrollment management endpoints' },
      { name: 'Enrollment Analytics', description: 'Enrollment analytics and reporting endpoints' },
      { name: 'Jobs', description: 'Job-related endpoints' },
      { name: 'Programs', description: 'Program-related endpoints' },
      { name: 'Testimonials', description: 'Testimonial-related endpoints' },
      { name: 'File Upload', description: 'File upload and management endpoints' },
      { name: 'RYLS Registration', description: 'Rise Young Leaders Summit registration endpoints' },
      { name: 'RYLS Payments', description: 'Rise Young Leaders Summit payment endpoints' },
    ],
  },
});

await fastify.register(swaggerUi, {
  routePrefix: '/documentation',
  uiConfig: {
    docExpansion: 'list',
    deepLinking: true,
  },
  staticCSP: true,
  transformSpecificationClone: true,
});

fastify.setErrorHandler(errorHandler);
fastify.setNotFoundHandler(notFoundHandler);

fastify.get('/health', async (request, reply) => {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'rise-social-backend',
  };
});

fastify.register(userRoutes, { prefix: '/api/users' });
fastify.register(authRoutes, { prefix: '/api/auth' });
fastify.register(bootcampRoutes, { prefix: '/api/bootcamps' });
fastify.register(bootcampRelatedRoutes, { prefix: '/api/bootcamp-related' });
fastify.register(instructorRoutes, { prefix: '/api/instructors' });
fastify.register(enrollmentRoutes, { prefix: '/api/enrollments' });
fastify.register(jobsRoutes, { prefix: '/api/jobs' });
fastify.register(programsRoutes, { prefix: '/api/programs' });
fastify.register(testimonialsRoutes, { prefix: '/api/testimonials' });
fastify.register(fileUploadRoutes, { prefix: '/api/uploads' });
fastify.register(rylsRegistrationRoutes, { prefix: '/api/ryls/registrations' });
fastify.register(rylsPaymentRoutes, { prefix: '/api/payments' });

const gracefulShutdown = async (signal) => {
  console.log(`\nReceived ${signal}. Starting graceful shutdown...`);

  try {
    await fastify.close();
    await disconnectDatabase();
    console.log('Graceful shutdown completed.');
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

const start = async () => {
  try {
    const port = process.env.PORT || 3001;
    const host = process.env.HOST || '0.0.0.0';

    await fastify.listen({ port: Number(port), host });

    console.log('Rise Social Backend Server Started!');
    console.log(`📡 Server running on http://localhost:${port}`);
  } catch (err) {
    fastify.log.error(err);
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

start();

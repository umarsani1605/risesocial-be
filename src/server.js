import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import multipart from '@fastify/multipart';
import fastifyCaching from '@fastify/caching';
import fastifyStatic from '@fastify/static';
import dotenv from 'dotenv';
import { disconnectDatabase } from './lib/prisma.js';
import pino from 'pino';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs-extra';

import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';

import { errorHandler, notFoundHandler } from './middleware/index.js';

import rylsPaymentRoutes from './routes/payments/rylsPaymentRoutes.js';
import userRylsRegistrationRoutes from './routes/user/rylsRegistrationRoutes.js';
import adminRylsRegistrationRoutes from './routes/admin/rylsRegistrationRoutes.js';
import adminSystemSettingsRoutes from './routes/admin/systemSettingsRoutes.js';
import authRoutes from './routes/authRoutes.js';
import userUserRoutes from './routes/user/userRoutes.js';
import adminUserRoutes from './routes/admin/userRoutes.js';
import userAcademyRoutes from './routes/user/academyRoutes.js';
import adminAcademyRoutes from './routes/admin/academyRoutes.js';
import userInstructorRoutes from './routes/user/instructorRoutes.js';
import adminInstructorRoutes from './routes/admin/instructorRoutes.js';
import userEnrollmentRoutes from './routes/user/enrollmentRoutes.js';
import adminEnrollmentRoutes from './routes/admin/enrollmentRoutes.js';
import userJobsRoutes from './routes/user/jobsRoutes.js';
import adminJobsRoutes from './routes/admin/jobsRoutes.js';
import userTestimonialsRoutes from './routes/user/testimonialsRoutes.js';
import adminTestimonialsRoutes from './routes/admin/testimonialsRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { runWithLogger } from './lib/loggerContext.js';

dotenv.config();

const env = process.env.NODE_ENV || 'development';

const envToLogger = {
  development: {
    level: process.env.LOG_LEVEL || 'debug',
    transport: {
      targets: [
        {
          target: 'pino-pretty',
          options: {
            colorize: false,
            translateTime: 'yyyy-mm-dd HH:MM:ss',
            ignore: 'pid,hostname',
          },
        },
        {
          target: 'pino-pretty',
          options: {
            colorize: false,
            translateTime: 'yyyy-mm-dd HH:MM:ss',
            ignore: 'pid,hostname',
            destination: './logs/app.log',
            mkdir: true,
          },
        },
      ],
    },
  },
  production: {
    level: process.env.LOG_LEVEL || 'info',
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: false,
        translateTime: 'yyyy-mm-dd HH:MM:ss',
        ignore: 'pid,hostname',
        destination: './logs/app.log',
        mkdir: true,
        messageFormat: '{time} [{level}] {msg}',
      },
    },
  },
  test: false,
};

const fastify = Fastify({
  logger: envToLogger[env] ?? true,
});

fastify.addHook('onRequest', (req, reply, done) => {
  runWithLogger({ logger: req.log }, done);
});

await fastify.register(cors, {
  origin: (origin, cb) => {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const backendUrl = `http://localhost:${process.env.PORT || 8000}`;

    const allowedOrigins = [frontendUrl, backendUrl];

    if (!origin || allowedOrigins.includes(origin)) {
      cb(null, true);
      return;
    }
    cb(new Error('Not allowed by CORS'), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});

await fastify.register(multipart, {
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsPath = path.join(__dirname, '..', 'uploads');

// Ensure uploads directory exists
await fs.ensureDir(uploadsPath);
await fs.ensureDir(path.join(uploadsPath, 'images'));
await fs.ensureDir(path.join(uploadsPath, 'images', 'academies'));
await fs.ensureDir(path.join(uploadsPath, 'images', 'instructors'));
await fs.ensureDir(path.join(uploadsPath, 'images', 'testimonials'));
await fs.ensureDir(path.join(uploadsPath, 'documents'));

await fastify.register(fastifyStatic, {
  root: uploadsPath,
  prefix: '/uploads/',
  decorateReply: false,
});

// Register static file serving for images
await fastify.register(fastifyStatic, {
  root: path.join(uploadsPath, 'images'),
  prefix: '/images/',
  decorateReply: false,
});

await fastify.register(jwt, {
  secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-for-development',
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
    securityDefinitions: {
      bearerAuth: {
        type: 'apiKey',
        name: 'Authorization',
        in: 'header',
        description: 'Enter your Bearer token in the format: Bearer <token>',
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    tags: [
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'User Self-Management', description: 'User profile and account management' },
      { name: 'User Utilities', description: 'User utility endpoints' },
      { name: 'User Academies', description: 'User academy browsing and information' },
      { name: 'User Instructors', description: 'User instructor browsing and information' },
      { name: 'User Jobs', description: 'User job browsing endpoints' },
      { name: 'User Testimonials', description: 'User testimonial viewing' },
      { name: 'User Enrollments', description: 'User enrollment management' },
      { name: 'User File Upload', description: 'User file upload functionality' },
      { name: 'User RYLS Registration', description: 'User RYLS registration' },
      { name: 'Admin User Management', description: 'Admin user management' },
      { name: 'Admin Academies', description: 'Admin academy management' },
      { name: 'Admin Instructors', description: 'Admin instructor management' },
      { name: 'Admin Jobs', description: 'Admin job management endpoints' },
      { name: 'Admin Testimonials', description: 'Admin testimonial management' },
      { name: 'Admin Enrollments', description: 'Admin enrollment management' },
      { name: 'Admin File Upload', description: 'Admin file upload management' },
      { name: 'Admin', description: 'Admin operations' },
      { name: 'Admin RYLS Registration', description: 'Admin RYLS registration management' },
      { name: 'Admin System Settings', description: 'Admin system configuration' },
      { name: 'Academy Related', description: 'Combined academy data endpoints' },
      { name: 'Academy Pricing', description: 'Academy pricing management' },
      { name: 'Academy Features', description: 'Academy features management' },
      { name: 'Academy Topics', description: 'Academy topics and curriculum' },
      { name: 'Academy FAQs', description: 'Academy FAQ management' },
      { name: 'System', description: 'System health and debugging endpoints' },
      { name: 'RYLS Payments', description: 'RYLS payment processing and management' },
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

fastify.get(
  '/health',
  {
    schema: {
      tags: ['System'],
      summary: 'Health check endpoint',
      description: 'Returns the health status of the API server',
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            service: { type: 'string' },
          },
        },
      },
    },
  },
  async (request, reply) => {
    return {
      status: 'ok',
      service: 'rise-social-backend',
    };
  }
);

fastify.get(
  '/debug/routes',
  {
    schema: {
      tags: ['System'],
      summary: 'Debug routes endpoint',
      description: 'Returns list of all registered routes for debugging',
      response: {
        200: {
          type: 'object',
          properties: {
            routes: {
              type: 'array',
              items: { type: 'string' },
            },
          },
        },
      },
    },
  },
  async (request, reply) => {
    try {
      const routes = fastify.printRoutes();
      return {
        routes: routes.split('\n').filter((route) => route.trim()),
      };
    } catch (error) {
      return {
        error: error.message,
      };
    }
  }
);

fastify.register(authRoutes, { prefix: '/auth' });
fastify.register(userUserRoutes, { prefix: '/users' });
fastify.register(adminUserRoutes, { prefix: '/admin/users' });
fastify.register(userAcademyRoutes, { prefix: '/academies' });
fastify.register(adminAcademyRoutes, { prefix: '/admin/academies' });
fastify.register(userInstructorRoutes, { prefix: '/instructors' });
fastify.register(adminInstructorRoutes, { prefix: '/admin/instructors' });
fastify.register(userEnrollmentRoutes, { prefix: '/enrollments' });
fastify.register(adminEnrollmentRoutes, { prefix: '/admin/enrollments' });
fastify.register(adminJobsRoutes, { prefix: '/admin/jobs' });
fastify.register(userJobsRoutes, { prefix: '/jobs' });
fastify.register(userTestimonialsRoutes, { prefix: '/testimonials' });
fastify.register(adminTestimonialsRoutes, { prefix: '/admin/testimonials' });
fastify.register(userRylsRegistrationRoutes, { prefix: '/ryls/registrations' });
fastify.register(adminRylsRegistrationRoutes, { prefix: '/admin/ryls/registrations' });
fastify.register(adminSystemSettingsRoutes, { prefix: '/admin/system/settings' });
fastify.register(adminRoutes, { prefix: '/admin' });
fastify.register(rylsPaymentRoutes, { prefix: '/payments' });

const gracefulShutdown = async (signal) => {
  fastify.log.info(`\nReceived ${signal}. Starting graceful shutdown...`);

  try {
    await fastify.close();
    await disconnectDatabase();
    fastify.log.info('Graceful shutdown completed.');
    process.exit(0);
  } catch (error) {
    fastify.log.error({ err: error }, 'Error during shutdown');
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
  } catch (err) {
    fastify.log.error(err);
    fastify.log.error({ err }, 'Failed to start server');
    process.exit(1);
  }
};

start();

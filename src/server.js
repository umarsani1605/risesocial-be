/**
 * Rise Social Backend Server - Entry Point
 *
 * File ini bertanggung jawab untuk:
 * 1. Menginisialisasi Fastify.
 * 2. Mendaftarkan plugin-plugin global (CORS, dll).
 * 3. Mendaftarkan semua modul route dari folder /routes.
 * 4. Mengatur graceful shutdown.
 * 5. Menjalankan server.
 */

import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import multipart from '@fastify/multipart';
import dotenv from 'dotenv';
import { disconnectDatabase } from './lib/prisma.js';

// Import Swagger plugins
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';

// Import middleware
import { errorHandler, notFoundHandler } from './middleware/index.js';

// Import route plugins
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

// Load environment variables dari file .env
dotenv.config();

// Inisialisasi Fastify dengan logger
const fastify = Fastify({
  logger: {
    level: process.env.NODE_ENV === 'development' ? 'info' : 'error',
  },
});

// --- 1. Mendaftarkan Plugin Global ---

// Daftarkan CORS
await fastify.register(cors, {
  origin: (origin, cb) => {
    // Memungkinkan request dari Postman/Insomnia (tanpa origin) dan dari frontend URL
    const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:3000';
    if (!origin || origin === allowedOrigin) {
      cb(null, true);
      return;
    }
    cb(new Error('Not allowed by CORS'), false);
  },
  credentials: true,
});

// Daftarkan Multipart plugin untuk file uploads
await fastify.register(multipart, {
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

// Daftarkan JWT plugin
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

// Daftarkan Swagger untuk dokumentasi API
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

// Daftarkan Swagger UI untuk antarmuka yang interaktif
await fastify.register(swaggerUi, {
  routePrefix: '/documentation',
  uiConfig: {
    docExpansion: 'list', // 'full', 'none'
    deepLinking: true,
  },
  staticCSP: true,
  transformSpecificationClone: true,
});

// --- Register Error Handlers ---
fastify.setErrorHandler(errorHandler);
fastify.setNotFoundHandler(notFoundHandler);

// --- 2. Mendaftarkan Route Modules ---

// Health check endpoint untuk memverifikasi server berjalan
fastify.get('/health', async (request, reply) => {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'rise-social-backend',
  };
});

// Daftarkan userRoutes dengan prefix /api/users
fastify.register(userRoutes, { prefix: '/api/users' });

// Daftarkan authRoutes dengan prefix /api/auth
fastify.register(authRoutes, { prefix: '/api/auth' });

// Daftarkan bootcampRoutes dengan prefix /api/bootcamps
fastify.register(bootcampRoutes, { prefix: '/api/bootcamps' });

// Daftarkan bootcampRelatedRoutes dengan prefix /api/bootcamp-related
fastify.register(bootcampRelatedRoutes, { prefix: '/api/bootcamp-related' });

// Daftarkan instructorRoutes dengan prefix /api/instructors
fastify.register(instructorRoutes, { prefix: '/api/instructors' });

// Daftarkan enrollmentRoutes dengan prefix /api/enrollments
fastify.register(enrollmentRoutes, { prefix: '/api/enrollments' });

// Daftarkan jobsRoutes dengan prefix /api/jobs
fastify.register(jobsRoutes, { prefix: '/api/jobs' });

// Daftarkan programsRoutes dengan prefix /api/programs
fastify.register(programsRoutes, { prefix: '/api/programs' });

// Daftarkan testimonialsRoutes dengan prefix /api/testimonials
fastify.register(testimonialsRoutes, { prefix: '/api/testimonials' });

// Daftarkan fileUploadRoutes dengan prefix /api/uploads
fastify.register(fileUploadRoutes, { prefix: '/api/uploads' });

// Daftarkan rylsRegistrationRoutes dengan prefix /api/registrations
fastify.register(rylsRegistrationRoutes, { prefix: '/api/registrations' });

// Daftarkan rylsPaymentRoutes dengan prefix /api/payments
fastify.register(rylsPaymentRoutes, { prefix: '/api/payments' });

// --- 3. Pengaturan Server (Startup & Shutdown) ---

// Fungsi untuk graceful shutdown
const gracefulShutdown = async (signal) => {
  console.log(`\n⚠️  Received ${signal}. Starting graceful shutdown...`);

  try {
    await fastify.close();
    // Koneksi prisma akan ditutup oleh fastify.close() jika didaftarkan sebagai plugin,
    // namun kita panggil manual untuk memastikan.
    await disconnectDatabase();
    console.log('✅ Graceful shutdown completed.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
};

// Menangani sinyal shutdown dari sistem (misal: Ctrl+C)
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Fungsi untuk menjalankan server
const start = async () => {
  try {
    const port = process.env.PORT || 3001;
    const host = process.env.HOST || '0.0.0.0';

    await fastify.listen({ port: Number(port), host });

    console.log('🚀 Rise Social Backend Server Started!');
    console.log(`📡 Server running on http://localhost:${port}`);
  } catch (err) {
    fastify.log.error(err);
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
};

// Jalankan server
start();

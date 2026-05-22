import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs-extra';

import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import multipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';

import { swaggerConfig, swaggerUiConfig } from './swagger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsPath = path.join(__dirname, '..', '..', 'uploads');

export async function registerPlugins(fastify) {
  // cors
  await fastify.register(cors, {
    origin: (origin, cb) => {
      const frontendUrls = (process.env.FRONTEND_URL || "http://localhost:3000")
        .split(",")
        .map(url => url.trim())
        .filter(Boolean);
      const port = process.env.PORT || 8000;
      const allowedOrigins = new Set([
        ...frontendUrls,
        "http://localhost:" + port,
        "http://127.0.0.1:" + port,
        "http://0.0.0.0:" + port,
      ]);

      if (process.env.NODE_ENV !== "production") {
        allowedOrigins.add('http://localhost:3000');
        allowedOrigins.add('http://127.0.0.1:3000');
        allowedOrigins.add('http://localhost:3001');
        allowedOrigins.add('http://127.0.0.1:3001');
      }

      if (!origin || allowedOrigins.has(origin)) {
        cb(null, true);
        return;
      }
      cb(new Error('Not allowed by CORS'), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-POSTHOG-DISTINCT-ID',
      'X-POSTHOG-SESSION-ID',
    ],
  });

  // Multipart (file uploads)
  await fastify.register(multipart, {
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  });

  await fs.ensureDir(uploadsPath);
  await fs.ensureDir(path.join(uploadsPath, 'images'));
  await fs.ensureDir(path.join(uploadsPath, 'images', 'academies'));
  await fs.ensureDir(path.join(uploadsPath, 'images', 'instructors'));
  await fs.ensureDir(path.join(uploadsPath, 'images', 'testimonials'));
  await fs.ensureDir(path.join(uploadsPath, 'documents'));

  // Static file serving
  await fastify.register(fastifyStatic, {
    root: uploadsPath,
    prefix: '/uploads/',
    decorateReply: false,
  });

  await fastify.register(fastifyStatic, {
    root: path.join(uploadsPath, 'images'),
    prefix: '/images/',
    decorateReply: false,
  });

  // JWT
  await fastify.register(jwt, {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-for-development',
  });

  // Swagger
  await fastify.register(swagger, swaggerConfig);
  await fastify.register(swaggerUi, swaggerUiConfig);
}

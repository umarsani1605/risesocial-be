import Fastify from 'fastify';
import dotenv from 'dotenv';

import { getLoggerConfig } from './config/logger.js';
import { registerPlugins } from './config/plugins.js';
import { registerRoutes } from './config/routes.js';
import { errorHandler, notFoundHandler } from './middleware/index.js';
import { disconnectDatabase } from './config/database.js';
import posthog from './config/posthog.js';
import posthogRequestEvent from './plugins/posthogRequestEvent.js';

dotenv.config();

const fastify = Fastify({
  logger: getLoggerConfig(),
});

await fastify.register(posthogRequestEvent);
await registerPlugins(fastify);
await registerRoutes(fastify);

fastify.setErrorHandler(errorHandler);
fastify.setNotFoundHandler(notFoundHandler);

const gracefulShutdown = async (signal) => {
  try {
    await fastify.close();
    await disconnectDatabase();
    await posthog.shutdown();
    process.exit(0);
  } catch {
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
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

start();

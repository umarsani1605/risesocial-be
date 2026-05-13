import Fastify from 'fastify';
import dotenv from 'dotenv';

import { getLoggerConfig } from './config/logger.js';
import { registerPlugins } from './config/plugins.js';
import { registerRoutes } from './config/routes.js';
import { errorHandler, notFoundHandler } from './middleware/index.js';
import { disconnectDatabase } from './config/database.js';
import { runWithLogger } from './utils/loggerContext.js';
import posthog from './config/posthog.js';

dotenv.config();

const fastify = Fastify({
  logger: getLoggerConfig(),
});

fastify.addHook('onRequest', (req, reply, done) => {
  runWithLogger({ logger: req.log }, done);
});

await registerPlugins(fastify);
await registerRoutes(fastify);

fastify.setErrorHandler(errorHandler);
fastify.setNotFoundHandler(notFoundHandler);

const gracefulShutdown = async (signal) => {
  fastify.log.info(`Received ${signal}. Starting graceful shutdown...`);

  try {
    await fastify.close();
    await disconnectDatabase();
    await posthog.shutdown();
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
    fastify.log.error({ err }, 'Failed to start server');
    process.exit(1);
  }
};

start();

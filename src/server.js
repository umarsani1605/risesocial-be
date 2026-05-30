import Fastify from 'fastify';
import dotenv from 'dotenv';

import { getLoggerConfig } from './config/logger.js';
import { registerPlugins } from './config/plugins.js';
import { registerRoutes } from './config/routes.js';
import { errorHandler, notFoundHandler } from './middleware/index.js';
import { disconnectDatabase } from './config/database.js';
import posthog from './config/posthog.js';
import posthogRequestEvent from './plugins/posthogRequestEvent.js';
import jobSyncScheduler from './plugins/jobSyncScheduler.js';

dotenv.config();

const fastify = Fastify({
  logger: getLoggerConfig(),
});

fastify.log.info('[startup] register posthogRequestEvent');
await fastify.register(posthogRequestEvent);
fastify.log.info('[startup] posthogRequestEvent registered');
fastify.log.info('[startup] register shared plugins');
await registerPlugins(fastify);
fastify.log.info('[startup] shared plugins registered');
fastify.log.info('[startup] register routes');
await registerRoutes(fastify);
fastify.log.info('[startup] routes registered');
fastify.log.info('[startup] register jobSyncScheduler');
await fastify.register(jobSyncScheduler);
fastify.log.info('[startup] jobSyncScheduler registered');

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

    fastify.log.info({ host, port: Number(port) }, '[startup] listen begin');
    await fastify.listen({ port: Number(port), host });
    fastify.log.info('[startup] listen resolved');
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

await start();

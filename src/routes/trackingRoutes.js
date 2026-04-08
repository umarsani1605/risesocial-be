import { trackingController } from '../controllers/trackingController.js';

export default async function trackingRoutes(fastify) {
  fastify.post('/event', {
    handler: trackingController.trackEvent,
  });
}

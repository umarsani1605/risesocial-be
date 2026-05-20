import { trackingController } from '../../controllers/shared/trackingController.js';

export default async function trackingRoutes(fastify) {
  fastify.post('/event', {
    handler: trackingController.trackEvent.bind(trackingController),
  });
}


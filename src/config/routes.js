import * as userRoutes from '../routes/user/index.js';
import * as adminRoutes from '../routes/admin/index.js';
import * as paymentRoutes from '../routes/payments/index.js';
import authRoutes from '../routes/authRoutes.js';
import adminMainRoutes from '../routes/adminRoutes.js';
import webhookRoutes from '../routes/shared/webhookRoutes.js';
import trackingRoutes from '../routes/shared/trackingRoutes.js';

export async function registerRoutes(fastify) {
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
    async () => ({ status: 'ok', service: 'rise-social-backend' }),
  );

  fastify.register(authRoutes, { prefix: '/auth' });

  fastify.register(webhookRoutes, { prefix: '/api/webhooks' });
  fastify.register(trackingRoutes, { prefix: '/tracking' });

  fastify.register(userRoutes.user, { prefix: '/users' });
  fastify.register(userRoutes.academy, { prefix: '/academies' });
  fastify.register(userRoutes.instructor, { prefix: '/instructors' });
  fastify.register(userRoutes.jobs, { prefix: '/jobs' });
  fastify.register(userRoutes.testimonials, { prefix: '/testimonials' });
  fastify.register(userRoutes.rylsRegistration, { prefix: '/ryls/registrations' });
  fastify.register(userRoutes.fileUpload, { prefix: '/uploads' });

  fastify.register(paymentRoutes.rylsPayment, { prefix: '/payments' });
  fastify.register(paymentRoutes.academyPayment, { prefix: '/payments' });

  fastify.register(adminMainRoutes, { prefix: '/admin' });
  fastify.register(adminRoutes.analytics, { prefix: '/admin/analytics' });
  fastify.register(adminRoutes.user, { prefix: '/admin/users' });
  fastify.register(adminRoutes.academy, { prefix: '/admin/academies' });
  fastify.register(adminRoutes.instructor, { prefix: '/admin/instructors' });
  fastify.register(adminRoutes.jobs, { prefix: '/admin/jobs' });
  fastify.register(adminRoutes.testimonials, { prefix: '/admin/testimonials' });
  fastify.register(adminRoutes.rylsRegistration, { prefix: '/admin/ryls/registrations' });
  fastify.register(adminRoutes.systemSettings, { prefix: '/admin/system/settings' });
  fastify.register(adminRoutes.cohort, { prefix: '/admin/cohorts' });
  fastify.register(adminRoutes.transaction, { prefix: '/admin/transactions' });
  fastify.register(adminRoutes.permission, { prefix: '/admin/permissions' });
  fastify.register(adminRoutes.placement, { prefix: '/admin/academy-enrollments' });
  fastify.register(adminRoutes.cohortPlacement, { prefix: '/admin/cohort-placements' });
  fastify.register(adminRoutes.broadcast, { prefix: '/admin/broadcasts' });

  fastify.register(userRoutes.cohort, { prefix: '/cohorts' });
  fastify.register(userRoutes.certificateVerify, { prefix: '/certificates' });
  fastify.register(userRoutes.settings, { prefix: '/settings' });
}

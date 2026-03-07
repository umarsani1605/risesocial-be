import { webhookController } from '../../controllers/shared/webhookController.js';

/**
 * Webhook routes for payment providers
 * @param {Object} fastify - Fastify instance
 */
export default async function webhookRoutes(fastify) {
  // Midtrans webhook endpoint
  fastify.post(
    '/midtrans',
    {
      schema: {
        description: 'Midtrans payment notification webhook',
        tags: ['webhooks'],
        body: {
          type: 'object',
          required: ['order_id', 'transaction_status', 'signature_key'],
          properties: {
            order_id: { type: 'string' },
            transaction_status: { type: 'string' },
            transaction_id: { type: 'string' },
            status_code: { type: 'string' },
            gross_amount: { type: 'string' },
            signature_key: { type: 'string' },
            payment_type: { type: 'string' },
            fraud_status: { type: 'string' },
            bank: { type: 'string' },
            store: { type: 'string' },
            settlement_time: { type: 'string' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              order_id: { type: 'string' },
              status: { type: 'string' },
            },
          },
          400: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
            },
          },
          500: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      return webhookController.handleMidtransWebhook(request, reply);
    },
  );
}

import { adminSystemSettingsController } from '../../controllers/admin/systemSettingsController.js';

const siteSettingsObject = {
  type: 'object',
  properties: {
    contact: {
      type: 'object',
      properties: {
        phone: { type: 'string' },
        email: { type: 'string' },
        address: { type: 'string' },
      },
    },
    social_media: {
      type: 'object',
      properties: {
        instagram: { type: 'string' },
        facebook: { type: 'string' },
        linkedin: { type: 'string' },
        tiktok: { type: 'string' },
      },
    },
  },
};

export default async function publicSettingsRoutes(fastify) {
  fastify.get('/public', {
    schema: {
      tags: ['Site Settings'],
      summary: 'Public site settings',
      description: 'Public contact and social media details for the website footer and contact page. No authentication required.',
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: siteSettingsObject,
          },
        },
      },
    },
    handler: adminSystemSettingsController.getPublicSiteSettings,
  });
}

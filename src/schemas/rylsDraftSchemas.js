/**
 * RYLS Draft Registration Schemas
 * Fastify JSON Schema validation for draft endpoints
 */
export const rylsDraftSchemas = {
  saveDraft: {
    description: 'Save or update a draft registration',
    body: {
      type: 'object',
      properties: {
        email: { type: 'string', format: 'email', maxLength: 255 },
        resumeToken: { type: 'string', maxLength: 64 },
        step: { type: 'integer', minimum: 1, maximum: 3 },
        formData: { type: 'object' },
      },
      required: ['email', 'step', 'formData'],
    },
    response: {
      200: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
          data: {
            type: 'object',
            properties: {
              resumeToken: { type: 'string' },
              currentStep: { type: 'integer' },
              savedAt: { type: 'string' },
            },
          },
          timestamp: { type: 'string' },
        },
      },
    },
  },

  getDraft: {
    description: 'Get draft by resume token',
    params: {
      type: 'object',
      properties: {
        token: { type: 'string', minLength: 1 },
      },
      required: ['token'],
    },
    response: {
      200: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
          data: {
            type: 'object',
            properties: {
              formData: { type: 'object', additionalProperties: true },
              currentStep: { type: 'integer' },
              scholarshipType: { type: 'string', nullable: true },
              email: { type: 'string' },
              createdAt: { type: 'string' },
              updatedAt: { type: 'string' },
              expiresAt: { type: 'string' },
            },
          },
          timestamp: { type: 'string' },
        },
      },
    },
  },

  deleteDraft: {
    description: 'Delete draft by token',
    params: {
      type: 'object',
      properties: {
        token: { type: 'string', minLength: 1 },
      },
      required: ['token'],
    },
    response: {
      200: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
          timestamp: { type: 'string' },
        },
      },
    },
  },
};

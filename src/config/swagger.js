export const swaggerConfig = {
  swagger: {
    info: {
      title: 'Rise Social API',
      description: `
# Rise Social Platform API Documentation

Complete REST API documentation for the Rise Social platform - a comprehensive learning management system (LMS) with job board functionality.

## Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control (USER/ADMIN)
- **Academy Management**: Complete CRUD operations for academies, pricing, features, instructors, topics, FAQs, and testimonials
- **Cohort System**: Manage cohorts, modules, and student enrollments
- **Job Board**: Full-featured job posting and search functionality with company profiles
- **Payment Processing**: Integrated payment system with Midtrans support
- **File Upload**: Secure file upload with validation and storage management
- **User Management**: User profiles, settings, and notification preferences
- **RYLS Registration**: Rise Young Leaders Summit registration and payment

## Base URL

- **Development**: http://localhost:3001
- **Production**: https://api.risesocial.com

## Authentication

Most endpoints require authentication using JWT Bearer tokens. Include the token in the Authorization header:

\`\`\`
Authorization: Bearer <your_jwt_token>
\`\`\`

To obtain a token, use the \`POST /auth/login\` or \`POST /auth/register\` endpoints.

## Rate Limiting

API requests are rate-limited to prevent abuse:
- Authentication endpoints: 5 requests per 15 minutes
- General API: 100 requests per minute
- File uploads: 10 requests per hour
- Payment endpoints: 3 requests per 5 minutes

## Pagination

List endpoints support pagination with the following query parameters:
- \`page\`: Page number (default: 1)
- \`limit\`: Items per page (default: 10, max: 100)

Response includes pagination metadata:
\`\`\`json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
\`\`\`

## Error Handling

All errors follow a consistent format:
\`\`\`json
{
  "success": false,
  "message": "Error description",
  "statusCode": 400,
  "code": "ERROR_CODE"
}
\`\`\`

Common HTTP status codes:
- \`200\`: Success
- \`201\`: Created
- \`400\`: Bad Request
- \`401\`: Unauthorized
- \`403\`: Forbidden
- \`404\`: Not Found
- \`409\`: Conflict
- \`429\`: Too Many Requests
- \`500\`: Internal Server Error

## File Upload

File upload endpoints accept multipart/form-data with the following constraints:
- **Academy Images**: Max 5MB, formats: JPG, PNG, WebP
- **Instructor Avatars**: Max 2MB, formats: JPG, PNG, WebP
- **User Avatars**: Max 2MB, formats: JPG, PNG, WebP
- **Documents**: Max 10MB, formats: PDF, DOC, DOCX

## Filtering & Search

Many list endpoints support filtering and search:
- \`search\`: Full-text search across relevant fields
- \`status\`: Filter by status (DRAFT, ACTIVE, ARCHIVED)
- \`category\`: Filter by category
- \`sortBy\`: Sort field
- \`sortOrder\`: Sort direction (asc/desc)

## Webhooks

The API supports webhooks for payment notifications:
- \`POST /api/webhooks/midtrans\`: Midtrans payment notifications

## Support

For API support, contact: api@risesocial.com
      `,
      version: '1.0.0',
      contact: {
        name: 'Rise Social API Support',
        email: 'api@risesocial.com',
        url: 'https://risesocial.com/support',
      },
      license: {
        name: 'Proprietary',
        url: 'https://risesocial.com/terms',
      },
    },
    externalDocs: {
      url: 'https://docs.risesocial.com',
      description: 'Complete API documentation and guides',
    },
    host: `localhost:${process.env.PORT || 3001}`,
    schemes: ['http', 'https'],
    consumes: ['application/json', 'multipart/form-data'],
    produces: ['application/json'],
    securityDefinitions: {
      bearerAuth: {
        type: 'apiKey',
        name: 'Authorization',
        in: 'header',
        description: 'JWT Bearer token. Format: Bearer <token>. Obtain token from /auth/login or /auth/register endpoints.',
      },
    },
    security: [{ bearerAuth: [] }],
    tags: [
      {
        name: 'System',
        description: 'System health check and status endpoints',
      },
      {
        name: 'Auth',
        description: 'Authentication and authorization endpoints - login, register, logout, session management',
      },
      {
        name: 'User Self-Management',
        description: 'User profile and account management - update profile, change password, manage settings and notification preferences',
      },
      {
        name: 'User Academies',
        description: 'Public academy browsing and information - view academies, pricing, features, instructors, topics, FAQs, and testimonials',
      },
      {
        name: 'User Cohorts',
        description: 'Public cohort information - view cohorts, modules, and schedules',
      },
      {
        name: 'User Instructors',
        description: 'Public instructor profiles and information',
      },
      {
        name: 'User Jobs',
        description: 'Public job board - browse jobs, search, filter by location/type/experience, view companies',
      },
      {
        name: 'User Testimonials',
        description: 'Public testimonial viewing',
      },
      {
        name: 'User File Upload',
        description: 'User file upload functionality - upload avatars and documents',
      },
      {
        name: 'User RYLS Registration',
        description: 'Rise Young Leaders Summit registration - create and manage registrations',
      },
      {
        name: 'RYLS Payments',
        description: 'RYLS payment processing - create payment links, check status, handle callbacks',
      },
      {
        name: 'Certificates',
        description: 'Certificate verification and validation',
      },
      {
        name: 'Webhooks',
        description: 'Webhook endpoints for external service notifications (Midtrans payments)',
      },
      {
        name: 'Admin',
        description: 'General admin operations and utilities',
      },
      {
        name: 'Admin User Management',
        description: 'Admin user management - CRUD operations for users, roles, and permissions',
      },
      {
        name: 'Admin Academies',
        description: 'Admin academy management - full CRUD for academies, pricing, features, instructors, topics, FAQs, and testimonials',
      },
      {
        name: 'Admin Cohorts',
        description: 'Admin cohort management - create cohorts, manage modules, enrollments, and schedules',
      },
      {
        name: 'Admin Instructors',
        description: 'Admin instructor management - CRUD operations for instructor profiles',
      },
      {
        name: 'Admin Jobs',
        description: 'Admin job management - create, update, delete job postings and manage companies',
      },
      {
        name: 'Admin Testimonials',
        description: 'Admin testimonial management - CRUD operations for testimonials',
      },
      {
        name: 'Admin RYLS Registration',
        description: 'Admin RYLS registration management - view, update, and manage registrations',
      },
      {
        name: 'Admin System Settings',
        description: 'Admin system configuration - manage system-wide settings and preferences',
      },
    ],
  },
};

export const swaggerUiConfig = {
  routePrefix: '/documentation',
  uiConfig: {
    docExpansion: 'list',
    deepLinking: true,
  },
  transformSpecificationClone: true,
};

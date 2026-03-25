import swaggerJSDoc from 'swagger-jsdoc';

export function buildOpenApiSpec() {
  const definition = {
    openapi: '3.0.3',
    info: {
      title: 'PropFlow API',
      version: '1.0.0',
      description: 'Role-based API for listings, bookings, CRM, and dashboards.',
    },
    servers: [{ url: 'http://localhost:4000', description: 'Local development' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'object',
              properties: {
                code: { type: 'string' },
                message: { type: 'string' },
                details: {},
              },
            },
          },
        },
      },
    },
    paths: {
      '/health': {
        get: {
          summary: 'Health check',
          responses: { 200: { description: 'OK' } },
        },
      },
      '/auth/register-client': {
        post: {
          summary: 'Register a new client account',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name', 'email', 'password'],
                  properties: {
                    name: { type: 'string' },
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string', minLength: 8 },
                  },
                },
              },
            },
          },
          responses: { 201: { description: 'Client created' }, 400: { description: 'Validation error' } },
        },
      },
      '/auth/login': {
        post: {
          summary: 'Login and get JWT',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: { 200: { description: 'Logged in' }, 401: { description: 'Unauthorized' } },
        },
      },
      '/auth/me': {
        get: {
          summary: 'Get current user profile',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Current user' }, 401: { description: 'Unauthorized' } },
        },
      },
      '/users': {
        get: {
          summary: 'List users (Admin)',
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: 'query', name: 'role', schema: { type: 'string' } },
            { in: 'query', name: 'status', schema: { type: 'string' } },
          ],
          responses: { 200: { description: 'Users list' }, 403: { description: 'Forbidden' } },
        },
        post: {
          summary: 'Create user (Admin)',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['role', 'name', 'email', 'password'],
                  properties: {
                    role: { type: 'string', enum: ['ADMIN', 'AGENT'] },
                    name: { type: 'string' },
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string', minLength: 8 },
                  },
                },
              },
            },
          },
          responses: { 201: { description: 'User created' }, 403: { description: 'Forbidden' } },
        },
      },
      '/users/{id}': {
        patch: {
          summary: 'Update user (Admin)',
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    status: { type: 'string', enum: ['ACTIVE', 'DEACTIVATED'] },
                  },
                },
              },
            },
          },
          responses: { 200: { description: 'User updated' }, 404: { description: 'Not found' } },
        },
      },
      '/properties': {
        get: {
          summary: 'List properties',
          parameters: [
            { in: 'query', name: 'q', schema: { type: 'string' } },
            { in: 'query', name: 'city', schema: { type: 'string' } },
            { in: 'query', name: 'status', schema: { type: 'string' } },
            { in: 'query', name: 'limit', schema: { type: 'integer' } },
            { in: 'query', name: 'offset', schema: { type: 'integer' } },
          ],
          responses: { 200: { description: 'Property list' } },
        },
        post: {
          summary: 'Create property (Admin)',
          security: [{ bearerAuth: [] }],
          responses: { 201: { description: 'Property created' } },
        },
      },
      '/properties/{id}': {
        get: {
          summary: 'Get property by id',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Property' }, 404: { description: 'Not found' } },
        },
        patch: {
          summary: 'Update property (Admin/Agent)',
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Property updated' } },
        },
      },
      '/bookings': {
        get: {
          summary: 'List bookings (scoped by role)',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Booking list' } },
        },
        post: {
          summary: 'Create viewing request (Client)',
          security: [{ bearerAuth: [] }],
          responses: { 201: { description: 'Booking request created' } },
        },
      },
      '/bookings/{id}/approve': {
        patch: {
          summary: 'Approve booking (Agent)',
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Approved' }, 409: { description: 'Conflict' } },
        },
      },
      '/bookings/{id}/propose': {
        patch: {
          summary: 'Propose alternate time (Agent)',
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Proposed' } },
        },
      },
      '/bookings/{id}/decline': {
        patch: {
          summary: 'Decline booking (Agent)',
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Declined' } },
        },
      },
      '/bookings/{id}/cancel': {
        patch: {
          summary: 'Cancel booking (Client)',
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Cancelled' } },
        },
      },
      '/crm/notes': {
        post: {
          summary: 'Create CRM note (Agent)',
          security: [{ bearerAuth: [] }],
          responses: { 201: { description: 'Note created' } },
        },
      },
      '/crm/clients/{clientId}/notes': {
        get: {
          summary: 'List CRM notes for client (Agent/Admin)',
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'clientId', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Notes list' } },
        },
      },
      '/dashboard/kpis': {
        get: {
          summary: 'Get KPI dashboard (Admin)',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'KPI payload' } },
        },
      },
    },
  };

  return swaggerJSDoc({ definition, apis: [] });
}


const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'DevTinder API',
    version: '1.0.0',
    description:
      'REST API for DevTinder — a developer networking platform. All protected routes require a JWT stored in an httpOnly cookie (`token`).',
  },
  servers: [{ url: 'http://localhost:3000', description: 'Local dev server' }],

  components: {
    securitySchemes: {
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'token',
      },
    },
    schemas: {
      ErrorResponse: {
        type: 'object',
        properties: {
          requestId: { type: 'string', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' },
          error: { type: 'string', example: 'Invalid email or password' },
          status: { type: 'integer', example: 400 },
        },
      },
      User: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '64abc123def456' },
          firstName: { type: 'string', example: 'Kartikeya' },
          lastName: { type: 'string', example: 'Sharma' },
          emailId: { type: 'string', example: 'kartikeya@example.com' },
          age: { type: 'integer', example: 22 },
          gender: { type: 'string', enum: ['Male', 'Female', 'Other'] },
          skills: { type: 'array', items: { type: 'string' }, example: ['JavaScript', 'Node.js'] },
          bio: { type: 'string', example: 'Full-stack dev who loves open source' },
          photoUrl: { type: 'string', example: 'https://example.com/photo.jpg' },
        },
      },
      ConnectionRequest: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          fromUserId: { type: 'string' },
          toUserId: { type: 'string' },
          status: { type: 'string', enum: ['Interested', 'Ignore', 'Accepted', 'Rejected'] },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  },

  paths: {
    // ── AUTH ──────────────────────────────────────────────────────────────────
    '/signup': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new developer account',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['firstName', 'lastName', 'emailId', 'password'],
                properties: {
                  firstName: { type: 'string', example: 'Kartikeya' },
                  lastName: { type: 'string', example: 'Sharma' },
                  emailId: { type: 'string', example: 'kartikeya@example.com' },
                  password: { type: 'string', example: 'MyStr0ng@Pass' },
                  age: { type: 'integer', example: 22 },
                  gender: { type: 'string', enum: ['Male', 'Female', 'Other'] },
                  skills: { type: 'array', items: { type: 'string' }, example: ['JavaScript', 'React'] },
                  bio: { type: 'string', example: 'Full-stack dev who loves open source' },
                  photoUrl: { type: 'string', example: 'https://example.com/photo.jpg' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'User registered successfully',
            content: {
              'application/json': {
                schema: { type: 'object', properties: { message: { type: 'string', example: 'User registered successfully' } } },
              },
            },
          },
          400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },

    '/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login and receive an auth cookie',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['emailId', 'password'],
                properties: {
                  emailId: { type: 'string', example: 'kartikeya@example.com' },
                  password: { type: 'string', example: 'MyStr0ng@Pass' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Login successful — sets httpOnly `token` cookie',
            headers: {
              'Set-Cookie': { schema: { type: 'string', example: 'token=eyJhb...; HttpOnly' } },
            },
            content: {
              'application/json': {
                schema: { type: 'object', properties: { message: { type: 'string', example: 'Login successful' } } },
              },
            },
          },
          400: { description: 'Invalid credentials', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },

    '/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Clear auth cookie and log out',
        security: [{ cookieAuth: [] }],
        responses: {
          200: {
            description: 'Logged out successfully',
            content: {
              'application/json': {
                schema: { type: 'object', properties: { message: { type: 'string', example: 'Logged out successfully' } } },
              },
            },
          },
        },
      },
    },

    // ── PROFILE ───────────────────────────────────────────────────────────────
    '/profile/view': {
      get: {
        tags: ['Profile'],
        summary: 'Get logged-in user profile',
        security: [{ cookieAuth: [] }],
        responses: {
          200: { description: 'User object', content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } } },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },

    '/profile/edit': {
      patch: {
        tags: ['Profile'],
        summary: 'Update profile fields',
        security: [{ cookieAuth: [] }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  firstName: { type: 'string' },
                  lastName: { type: 'string' },
                  age: { type: 'integer' },
                  gender: { type: 'string', enum: ['Male', 'Female', 'Other'] },
                  skills: { type: 'array', items: { type: 'string' } },
                  photoUrl: { type: 'string' },
                  bio: { type: 'string' },
                  emailId: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Profile updated successfully' },
          400: { description: 'Invalid fields', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },

    '/profile/password': {
      patch: {
        tags: ['Profile'],
        summary: 'Change password',
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['oldPassword', 'newPassword'],
                properties: {
                  oldPassword: { type: 'string', example: 'OldPass@1' },
                  newPassword: { type: 'string', example: 'NewPass@1' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Password updated successfully' },
          400: { description: 'Old password incorrect', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },

    // ── REQUESTS ──────────────────────────────────────────────────────────────
    '/request/send/{status}/{toUserId}': {
      post: {
        tags: ['Connection Requests'],
        summary: 'Send a connection request',
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: 'status',
            in: 'path',
            required: true,
            schema: { type: 'string', enum: ['Interested', 'Ignore'] },
            description: 'Action to take on the target user',
          },
          {
            name: 'toUserId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'MongoDB ObjectId of the target user',
          },
        ],
        responses: {
          200: {
            description: 'Request sent',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'Kartikeya is Interested to connect with John' },
                    data: { $ref: '#/components/schemas/ConnectionRequest' },
                  },
                },
              },
            },
          },
          400: { description: 'Duplicate request or invalid status', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          404: { description: 'Target user not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },

    '/request/respond/{status}/{requestId}': {
      post: {
        tags: ['Connection Requests'],
        summary: 'Accept or reject an incoming connection request',
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: 'status',
            in: 'path',
            required: true,
            schema: { type: 'string', enum: ['Accepted', 'Rejected'] },
          },
          {
            name: 'requestId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'MongoDB ObjectId of the connection request',
          },
        ],
        responses: {
          200: {
            description: 'Request responded to',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'Connection request accepted successfully' },
                    data: { $ref: '#/components/schemas/ConnectionRequest' },
                  },
                },
              },
            },
          },
          400: { description: 'Invalid status', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          404: { description: 'Request not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },

    // ── USER / FEED ───────────────────────────────────────────────────────────
    '/user/requests/received': {
      get: {
        tags: ['User'],
        summary: 'Get all pending Interested requests sent to you',
        security: [{ cookieAuth: [] }],
        responses: {
          200: {
            description: 'List of pending requests',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'Connection requests fetched successfully' },
                    connectionRequests: { type: 'array', items: { $ref: '#/components/schemas/ConnectionRequest' } },
                  },
                },
              },
            },
          },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },

    '/user/connections': {
      get: {
        tags: ['User'],
        summary: 'Get all accepted connections',
        security: [{ cookieAuth: [] }],
        responses: {
          200: {
            description: 'List of accepted connections',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'Connections fetched successfully' },
                    data: { type: 'array', items: { $ref: '#/components/schemas/User' } },
                  },
                },
              },
            },
          },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },

    '/feed': {
      get: {
        tags: ['User'],
        summary: 'Paginated developer feed — excludes already-interacted users',
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10, maximum: 50 } },
        ],
        responses: {
          200: {
            description: 'Paginated list of developers',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: { type: 'array', items: { $ref: '#/components/schemas/User' } },
                  },
                },
              },
            },
          },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },
  },
};

module.exports = swaggerDefinition;

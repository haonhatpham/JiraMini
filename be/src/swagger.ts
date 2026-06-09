import { createSchema } from 'zod-openapi';
import { z } from 'zod';
import {
  authDetailResponseSchema,
  authResponseSchema,
  authUserResponseSchema,
  createTaskSchema,
  listTasksResponseSchema,
  taskDetailResponseSchema,
  taskResponseSchema,
  taskUserResponseSchema,
  updateTaskSchema,
  updateTaskStatusSchema,
  loginSchema,
  registerSchema
} from '@jiramini/shared';

function buildComponentSchema(name: string, schema: z.ZodTypeAny) {
  return { [name]: createSchema(schema, { schemaRefPath: '#/components/schemas/' }).schema };
}

const componentSchemas = {
  ...buildComponentSchema('RegisterInput', registerSchema.shape.body),
  ...buildComponentSchema('LoginInput', loginSchema.shape.body),
  ...buildComponentSchema('AuthUserResponse', authUserResponseSchema),
  ...buildComponentSchema('AuthResponse', authResponseSchema),
  ...buildComponentSchema('AuthDetailResponse', authDetailResponseSchema),
  ...buildComponentSchema('TaskUserResponse', taskUserResponseSchema),
  ...buildComponentSchema('TaskResponse', taskResponseSchema),
  ...buildComponentSchema('TaskDetailResponse', taskDetailResponseSchema),
  ...buildComponentSchema('ListTasksResponse', listTasksResponseSchema),
  ...buildComponentSchema('CreateTaskInput', createTaskSchema.shape.body),
  ...buildComponentSchema('UpdateTaskInput', updateTaskSchema.shape.body),
  ...buildComponentSchema('UpdateTaskStatusInput', updateTaskStatusSchema.shape.body),
  ...buildComponentSchema(
    'ErrorResponse',
    z.object({
      error: z.object({
        code: z.string(),
        message: z.string(),
        details: z
          .array(
            z.object({
              field: z.string(),
              message: z.string()
            })
          )
          .optional()
      })
    })
  )
};

const openApiDocument = {
  openapi: '3.0.3',
  info: {
    title: 'JiraMini API',
    version: '1.0.0',
    description: 'Generated OpenAPI documentation for the JiraMini backend.',
    termsOfService: 'https://jiramini.example.com/terms',
    contact: {
      email: 'support@jiramini.example.com'
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT'
    }
  },
  servers: [
    {
      url: '/v1/api',
      description: 'Default API prefix'
    }
  ],
  tags: [
    { name: 'auth', description: 'Authentication APIs' },
    { name: 'tasks', description: 'Task management APIs' },
    { name: 'users', description: 'User management APIs' }
  ],
  paths: {
    '/auth/register': {
      post: {
        tags: ['auth'],
        summary: 'Register a new user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/RegisterInput'
              }
            }
          }
        },
        responses: {
          '201': {
            description: 'Auth response with access token',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/AuthDetailResponse'
                }
              }
            }
          },
          '400': {
            description: 'Invalid request or email already exists',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse'
                }
              }
            }
          }
        }
      }
    },
    '/auth/login': {
      post: {
        tags: ['auth'],
        summary: 'Authenticate a user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/LoginInput'
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Auth response with access token',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/AuthDetailResponse'
                }
              }
            }
          },
          '401': {
            description: 'Invalid credentials',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse'
                }
              }
            }
          }
        }
      }
    },
    '/tasks': {
      get: {
        tags: ['tasks'],
        summary: 'List tasks accessible to the current user',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['backlog', 'todo', 'in-progress', 'done'] } },
          {
            name: 'priority',
            in: 'query',
            schema: {
              type: 'array',
              items: {
                type: 'string',
                enum: ['low', 'medium', 'high', 'critical']
              }
            },
            style: 'form',
            explode: false
          },
          { name: 'assigneeId', in: 'query', schema: { type: 'string', format: 'uuid' } },
          { name: 'dueDateFrom', in: 'query', schema: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$' } },
          { name: 'dueDateTo', in: 'query', schema: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$' } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 } },
          {
            name: 'sortBy',
            in: 'query',
            schema: {
              type: 'string',
              enum: ['createdAt', 'dueDate', 'position', 'priority', 'status', 'title']
            }
          },
          { name: 'sortOrder', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'] } }
        ],
        responses: {
          '200': {
            description: 'Paginated task list',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ListTasksResponse'
                }
              }
            }
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse'
                }
              }
            }
          }
        }
      },
      post: {
        tags: ['tasks'],
        summary: 'Create a new task',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/CreateTaskInput'
              }
            }
          }
        },
        responses: {
          '201': {
            description: 'Created task response',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/TaskDetailResponse'
                }
              }
            }
          },
          '400': {
            description: 'Validation error',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse'
                }
              }
            }
          }
        }
      }
    },
    '/tasks/{id}': {
      get: {
        tags: ['tasks'],
        summary: 'Get task details by ID',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          '200': {
            description: 'Task detail response',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/TaskDetailResponse'
                }
              }
            }
          },
          '404': {
            description: 'Task not found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse'
                }
              }
            }
          }
        }
      },
      put: {
        tags: ['tasks'],
        summary: 'Update a task by ID',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/UpdateTaskInput'
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Updated task response',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/TaskDetailResponse'
                }
              }
            }
          },
          '400': {
            description: 'Validation error',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse'
                }
              }
            }
          },
          '404': {
            description: 'Task not found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse'
                }
              }
            }
          }
        }
      },
      delete: {
        tags: ['tasks'],
        summary: 'Delete a task by ID',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          '204': {
            description: 'Task deleted successfully'
          },
          '404': {
            description: 'Task not found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse'
                }
              }
            }
          }
        }
      }
    },
    '/tasks/{id}/status': {
      patch: {
        tags: ['tasks'],
        summary: 'Update a task status and position',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/UpdateTaskStatusInput'
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Task status updated',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/TaskDetailResponse'
                }
              }
            }
          },
          '400': {
            description: 'Validation error',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse'
                }
              }
            }
          },
          '404': {
            description: 'Task not found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse'
                }
              }
            }
          }
        }
      }
    },
    '/users': {
      get: {
        tags: ['users'],
        summary: 'List users',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'User list response',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/TaskUserResponse'
                  }
                }
              }
            }
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse'
                }
              }
            }
          }
        }
      }
    }
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    },
    schemas: componentSchemas
  }
};

export default openApiDocument;

import { createRoute, z } from '@hono/zod-openapi';
import { StateDetailsResponseSchema } from '../schemas/state';
import { createSuccessSchema, ErrorSchema } from '../schemas/common';

export const getStateByNameRoute = createRoute({
  method: 'get',
  path: '/state/{name}',
  summary: 'Get tactical intelligence of a specific state by its name',
  request: {
    params: z.object({
      name: z.string().openapi({ example: 'Tamaulipas' }),
    }),
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: createSuccessSchema(StateDetailsResponseSchema, 'StateDetailsResponse'),
        },
      },
      description: 'The state intelligence has been successfully retrieved',
    },
    404: {
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
      description: 'State not found',
    },
    500: {
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
      description: 'Database error',
    },
  },
});

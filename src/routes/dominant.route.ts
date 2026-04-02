import { createRoute, z } from '@hono/zod-openapi';
import { DominantPresenceSchema } from '../schemas/map';
import { createSuccessSchema, ErrorSchema } from '../schemas/common';

export const dominantPresenceRoute = createRoute({
  method: 'get',
  path: '/dominant-presence',
  summary: 'Get all states with dominant presence of cartels',
  responses: {
    200: {
      content: {
        'application/json': {
          schema: createSuccessSchema(z.array(DominantPresenceSchema), 'DominantPresenceResponse'),
        },
      },
      description: 'The dominant presence data has been successfully retrieved',
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

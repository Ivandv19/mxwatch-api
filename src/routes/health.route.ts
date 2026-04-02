import { createRoute, z } from '@hono/zod-openapi';
import { createSuccessSchema, ErrorSchema } from '../schemas/common';

export const healthRoute = createRoute({
  method: 'get',
  path: '/health',
  summary: 'Check the health of the API and database',
  responses: {
    200: {
      content: {
        'application/json': {
          schema: createSuccessSchema(z.object({
            status: z.string().openapi({ example: 'healthy' }),
            timestamp: z.string().datetime(),
          }), 'HealthResponse'),
        },
      },
      description: 'API is healthy',
    },
    503: {
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
      description: 'API or database is unhealthy',
    },
  },
});

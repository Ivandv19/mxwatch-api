import { createRoute, z } from '@hono/zod-openapi';
import { MapStatePresenceSchema } from '../schemas/map';
import { createSuccessSchema, ErrorSchema } from '../schemas/common';

export const mapRoute = createRoute({
  method: 'get',
  path: '/map',
  summary: 'Get all map data (states and their cartels)',
  responses: {
    200: {
      content: {
        'application/json': {
          schema: createSuccessSchema(z.array(MapStatePresenceSchema), 'MapResponse'),
        },
      },
      description: 'The map data has been successfully retrieved',
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

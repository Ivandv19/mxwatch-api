import { createRoute, z } from '@hono/zod-openapi';
import { CartelSchema, FactionSchema, LeaderSchema, ArmedWingSchema, EconomySchema } from '../schemas/cartel';
import { createSuccessSchema, ErrorSchema } from '../schemas/common';

export const listCartelsRoute = createRoute({
  method: 'get',
  path: '/cartels',
  summary: 'List all cartels in the database',
  responses: {
    200: {
      content: {
        'application/json': {
          schema: createSuccessSchema(z.array(CartelSchema), 'ListCartelsResponse'),
        },
      },
      description: 'The cartels have been successfully retrieved',
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

export const getCartelBySlugRoute = createRoute({
  method: 'get',
  path: '/cartel/{slug}',
  summary: 'Get details of a specific cartel by its slug',
  request: {
    params: z.object({
      slug: z.string().openapi({ example: 'sinaloa' }),
    }),
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: createSuccessSchema(z.object({
            id: z.string().uuid(),
            name: z.string(),
            slug: z.string(),
            color: z.string(),
            globalStatus: z.string().nullable(),
            foreignDesignation: z.string().nullable(),
            fifaRiskLevel: z.string().nullable(),
            presence: z.object({
              states: z.array(z.object({
                state: z.string(),
                isDominant: z.boolean(),
                note: z.string().nullable(),
              })),
              totalStates: z.number(),
              dominantStates: z.number(),
            }),
            factions: z.array(z.object({ name: z.string(), focus: z.string().nullable() })),
            leaders: z.array(z.object({ name: z.string(), alias: z.string().nullable() })),
            armedWings: z.array(z.object({ name: z.string() })),
            economicActivities: z.array(z.object({ name: z.string() })),
          }), 'CartelDetailResponse'),
        },
      },
      description: 'The cartel has been successfully retrieved',
    },
    404: {
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
      description: 'Cartel not found',
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

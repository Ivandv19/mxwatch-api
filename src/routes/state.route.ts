import { createRoute, z } from '@hono/zod-openapi';
import { StateDetailsResponseSchema } from '../schemas/state';
import { createSuccessSchema, ErrorSchema } from '../schemas/common';

/**
 * Endpoint: Inteligencia granular por entidad.
 */

// --- 1. ANALÍTICA ESTATAL ---

/** 
 * Informe de grupos, facciones y líderes en un estado específico.
 */
export const getStateByNameRoute = createRoute({
  method: 'get',
  path: '/state/{name}',
  summary: 'Inteligencia Estatal',
  description: 'Desglose detallado de seguridad por estado.',
  request: {
    params: z.object({
      name: z.string().openapi({ example: 'Sinaloa' }),
    }),
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: createSuccessSchema(StateDetailsResponseSchema, 'StateDetailsResponse'),
        },
      },
      description: 'Éxito.',
    },
    404: {
      content: { 'application/json': { schema: ErrorSchema } },
      description: 'Estado no encontrado.',
    },
    500: {
      content: { 'application/json': { schema: ErrorSchema } },
      description: 'Error de análisis.',
    },
  },
  security: [{ apiKey: [] }],
});

import { createRoute, z } from '@hono/zod-openapi';
import { DominantPresenceSchema } from '../schemas/map';
import { createSuccessSchema, ErrorSchema } from '../schemas/common';

/**
 * Endpoints de Análisis de Hegemonía Territorial.
 */

// -----------------------------------------------------------------------------
// 1. RESUMEN DE DOMINANCIA
// -----------------------------------------------------------------------------

/**
 * dominantPresenceRoute: Mapa de Control Único
 * Identifica qué organización tiene el control predominante en cada entidad federativa.
 */
export const dominantPresenceRoute = createRoute({
  method: 'get',
  path: '/dominant-presence',
  summary: 'Resumen de Hegemonía Estatal',
  description: 'Obtiene la lista de todos los estados y el cártel que ejerce la presencia dominante en cada uno.',
  responses: {
    200: {
      content: {
        'application/json': {
          schema: createSuccessSchema(z.array(DominantPresenceSchema), 'DominantPresenceResponse'),
        },
      },
      description: 'Datos de hegemonía recuperados con éxito.',
    },
    500: {
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
      description: 'Error crítico al procesar el análisis de dominancia regional.',
    },
  },
  security: [{ apiKey: [] }],
});

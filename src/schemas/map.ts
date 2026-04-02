import { z } from '@hono/zod-openapi';

export const MapStatePresenceSchema = z.object({
  stateSlug: z.string().openapi({ example: 'tamaulipas' }),
  stateName: z.string().openapi({ example: 'Tamaulipas' }),
  cartels: z.array(z.object({
    id: z.string().uuid(),
    name: z.string().openapi({ example: 'Cártel del Golfo' }),
    color: z.string().openapi({ example: '#ffcc00' }),
    isDominant: z.boolean().openapi({ example: true }),
    slug: z.string().openapi({ example: 'golfo' }),
  })),
}).openapi('MapStatePresence');

export const DominantPresenceSchema = z.object({
  state: z.string().openapi({ example: 'Sinaloa' }),
  cartel: z.string().openapi({ example: 'Cártel de Sinaloa' }),
  cartelColor: z.string().openapi({ example: '#ff0000' }),
}).openapi('DominantPresence');

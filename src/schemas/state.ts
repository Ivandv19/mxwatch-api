import { z } from '@hono/zod-openapi';
import { CartelSchema, FactionSchema, LeaderSchema, ArmedWingSchema, EconomySchema } from './cartel';

export const StateSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().openapi({ example: 'Tamaulipas' }),
  slug: z.string().openapi({ example: 'tamaulipas' }),
}).openapi('State');

export const StateCartelPresenceSchema = CartelSchema.extend({
  isDominant: z.boolean().openapi({ example: true }),
  localIntelligenceNote: z.string().nullable().openapi({ example: 'Disputando la garita con CDN' }),
  factions: z.array(FactionSchema),
  leaders: z.array(LeaderSchema),
  armedWings: z.array(ArmedWingSchema),
  economicActivities: z.array(EconomySchema),
}).openapi('StateCartelPresence');

export const StateDetailsResponseSchema = z.object({
  stateName: z.string().openapi({ example: 'Tamaulipas' }),
  stateSlug: z.string().openapi({ example: 'tamaulipas' }),
  totalCartels: z.number().openapi({ example: 4 }),
  dominantCartels: z.number().openapi({ example: 1 }),
  cartels: z.array(StateCartelPresenceSchema),
}).openapi('StateDetailsResponse');

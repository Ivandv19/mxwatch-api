import { z } from '@hono/zod-openapi';

export const FactionSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().openapi({ example: 'Frontera Chica' }),
  focus: z.string().nullable().openapi({ example: 'Tráfico de Fentanilo' }),
}).openapi('Faction');

export const LeaderSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().openapi({ example: 'Ismael El Mayo Zambada' }),
  alias: z.string().nullable().openapi({ example: 'El Mayo' }),
}).openapi('Leader');

export const ArmedWingSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().openapi({ example: 'Los Ántrax' }),
}).openapi('ArmedWing');

export const EconomySchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().openapi({ example: 'Extorsión' }),
}).openapi('EconomicActivity');

export const CartelSchema = z.object({
  id: z.string().uuid(),
  name: z.string().openapi({ example: 'Cártel de Sinaloa' }),
  slug: z.string().openapi({ example: 'sinaloa' }),
  color: z.string().openapi({ example: '#ff0000' }),
  globalStatus: z.string().nullable().openapi({ example: 'Activo' }),
  foreignDesignation: z.string().nullable().openapi({ example: 'DTO' }),
  fifaRiskLevel: z.string().nullable().openapi({ example: 'High' }),
}).openapi('Cartel');

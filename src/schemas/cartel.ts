import { z } from '@hono/zod-openapi';

/**
 * Esquemas de Inteligencia Criminal y Organizacional.
 * Define la estructura de datos para Cárteles, Facciones, Líderes y Actividades.
 */

// -----------------------------------------------------------------------------
// 1. ORGANIZACIONES PRINCIPALES
// -----------------------------------------------------------------------------

/**
 * CartelSchema: El núcleo de la organización criminal.
 * Representa la entidad criminal principal con sus metadatos globales y visuales.
 */
export const CartelSchema = z.object({
  id: z.string().uuid(),
  name: z.string().openapi({ example: 'Cártel de Sinaloa' }),
  slug: z.string().openapi({ example: 'cds' }),
  color: z.string().openapi({ example: '#FFA500' }),
  globalStatus: z.string().nullable().openapi({ example: 'Activo / Hegemónico' }),
  foreignDesignation: z.string().nullable().openapi({ example: 'DTO (Drug Trafficking Organization)' }),
  fifaRiskLevel: z.string().nullable().openapi({ example: 'Crítico' }),
}).openapi('Cartel');

// -----------------------------------------------------------------------------
// 2. ESTRUCTURAS SUBORDINADAS
// -----------------------------------------------------------------------------

/**
 * FactionSchema: Células Operativas
 * Representa subdivisiones o brazos específicos que operan bajo el mando de un cártel.
 */
export const FactionSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().openapi({ example: 'Los Chapitos' }),
  focus: z.string().nullable().openapi({ example: 'Narcotráfico / Control Territorial' }),
}).openapi('Faction');

/**
 * LeaderSchema: Cadena de Mando
 * Personajes clave identificados en la estructura criminal nacional o regional.
 */
export const LeaderSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().openapi({ example: 'Ismael Zambada García' }),
  alias: z.string().nullable().openapi({ example: 'El Mayo' }),
}).openapi('Leader');

/** 
 * ArmedWingSchema: Brazos Armados
 * Grupos de sicarios con identidad propia vinculados a las organizaciones.
 */
export const ArmedWingSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().openapi({ example: 'Fuerzas Especiales Ántrax' }),
}).openapi('ArmedWing');

// -----------------------------------------------------------------------------
// 3. ACTIVIDADES ECONÓMICAS
// -----------------------------------------------------------------------------

/**
 * EconomySchema: Mercados Ilícitos
 * Áreas de especialización delictiva gestionadas por las organizaciones.
 */
export const EconomySchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().openapi({ example: 'Extorsión / Huachicol' }),
}).openapi('Economy');

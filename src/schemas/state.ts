import { z } from "@hono/zod-openapi";
import {
	ArmedWingSchema,
	EconomySchema,
	FactionSchema,
	LeaderSchema,
} from "./cartel";

/**
 * Esquemas para la Inteligencia Geográfica Táctica.
 */

// -----------------------------------------------------------------------------
// 1. INTELIGENCIA REGIONAL
// -----------------------------------------------------------------------------

/**
 * CartelInStateSchema: Perfil Local de Organización.
 * Incluye datos específicos de la operación regional de un cártel dentro de un estado.
 */
export const CartelInStateSchema = z.object({
	id: z.string().uuid(),
	name: z.string().openapi({ example: "Cártel Jalisco Nueva Generación" }),
	slug: z.string().openapi({ example: "cjng" }),
	color: z.string().openapi({ example: "#EE0000" }),
	isDominant: z.boolean().openapi({ example: true }),
	localIntelligenceNote: z
		.string()
		.nullable()
		.openapi({ example: "Control hegemónico de rutas logísticas." }),
	globalStatus: z.string().nullable(),
	foreignDesignation: z.string().nullable(),
	fifaRiskLevel: z.string().nullable(),
	factions: z.array(FactionSchema),
	leaders: z.array(LeaderSchema),
	armedWings: z.array(ArmedWingSchema).optional(),
	economicActivities: z.array(EconomySchema).optional(),
});

// -----------------------------------------------------------------------------
// 2. RESPUESTA TÁCTICA ESTATAL
// -----------------------------------------------------------------------------

/**
 * StateDetailsResponseSchema: Panorama de Seguridad por Entidad.
 * Resume la situación operativa y de control de un estado completo.
 */
export const StateDetailsResponseSchema = z
	.object({
		stateName: z.string().openapi({ example: "Colima" }),
		stateSlug: z.string().openapi({ example: "colima" }),
		totalCartels: z.number().openapi({ example: 2 }),
		dominantCartels: z.number().openapi({ example: 1 }),
		cartels: z.array(CartelInStateSchema),
	})
	.openapi("StateDetailsResponse");

import { z } from "@hono/zod-openapi";

/**
 * Esquemas para visualización en el cliente.
 */

// --- 1. PRESENCIA TERRITORIAL ---

/**
 * Data del mapa: Cárteles por estado y control dominante.
 */
export const MapStatePresenceSchema = z
	.object({
		stateSlug: z.string().openapi({ example: "sinaloa" }),
		stateName: z.string().openapi({ example: "Sinaloa" }),
		cartels: z.array(
			z.object({
				id: z.string().uuid(),
				name: z.string().openapi({ example: "Cártel de Sinaloa" }),
				color: z.string().openapi({ example: "#FFA500" }),
				isDominant: z.boolean().openapi({ description: "Control hegemónico" }),
				slug: z.string().openapi({ example: "cds" }),
			}),
		),
	})
	.openapi("MapStatePresence");

// --- 2. HEGEMONÍA ---

/**
 * Resumen de control estatal absoluto.
 */
export const DominantPresenceSchema = z
	.object({
		state: z.string().openapi({ example: "Chihuahua" }),
		cartel: z.string().openapi({ example: "Cártel de Juárez" }),
		cartelColor: z.string().openapi({ example: "#800080" }),
	})
	.openapi("DominantPresence");

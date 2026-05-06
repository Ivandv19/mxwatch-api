import { createRoute, z } from "@hono/zod-openapi";
import { CartelSchema } from "../schemas/cartel";
import { createSuccessSchema, ErrorSchema } from "../schemas/common";

/**
 * Endpoints: Catálogo e Inteligencia de Cárteles.
 */

// --- 1. LISTADO ---

/**
 * Listar todas las organizaciones documentadas.
 */
export const listCartelsRoute = createRoute({
	method: "get",
	path: "/cartels",
	summary: "Listado General",
	description:
		"Catálogo completo de organizaciones criminales y sus metadatos.",
	responses: {
		200: {
			content: {
				"application/json": {
					schema: createSuccessSchema(
						z.array(CartelSchema),
						"ListCartelsResponse",
					),
				},
			},
			description: "Éxito.",
		},
		500: {
			content: { "application/json": { schema: ErrorSchema } },
			description: "Error de base de datos.",
		},
	},
	security: [{ apiKey: [] }],
});

// --- 2. DETALLE ---

/**
 * Ficha técnica: Líderes, facciones y zonas de riesgo.
 */
export const getCartelBySlugRoute = createRoute({
	method: "get",
	path: "/cartel/{slug}",
	summary: "Ficha de Inteligencia",
	description: "Perfil detallado de una organización mediante su slug.",
	request: {
		params: z.object({
			slug: z.string().openapi({ example: "cds" }),
		}),
	},
	responses: {
		200: {
			content: {
				"application/json": {
					schema: createSuccessSchema(
						z.object({
							id: z.string().uuid(),
							name: z.string(),
							slug: z.string(),
							color: z.string(),
							globalStatus: z.string().nullable(),
							foreignDesignation: z.string().nullable(),
							fifaRiskLevel: z.string().nullable(),
							presence: z.object({
								states: z.array(
									z.object({
										state: z.string(),
										isDominant: z.boolean(),
										note: z.string().nullable(),
									}),
								),
								totalStates: z.number(),
								dominantStates: z.number(),
							}),
							factions: z.array(
								z.object({ name: z.string(), focus: z.string().nullable() }),
							),
							leaders: z.array(
								z.object({ name: z.string(), alias: z.string().nullable() }),
							),
							armedWings: z.array(z.object({ name: z.string() })),
							economicActivities: z.array(z.object({ name: z.string() })),
						}),
						"CartelDetailResponse",
					),
				},
			},
			description: "Éxito.",
		},
		404: {
			content: { "application/json": { schema: ErrorSchema } },
			description: "No encontrado.",
		},
		500: {
			content: { "application/json": { schema: ErrorSchema } },
			description: "Error interno.",
		},
	},
	security: [{ apiKey: [] }],
});

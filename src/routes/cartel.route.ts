import { createRoute, z } from "@hono/zod-openapi";
import { CartelSchema } from "../schemas/cartel";
import { createSuccessSchema, ErrorSchema } from "../schemas/common";

export const listCartelsRoute = createRoute({
	method: "get",
	path: "/cartels",
	summary: "Listado General",
	description: "Catálogo completo de organizaciones criminales.",
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
							nombre: z.string(),
							slug: z.string(),
							color: z.string(),
							presencia: z.object({
								estados: z.array(
									z.object({
										nombre_estado: z.string(),
									}),
								),
								total_estados: z.number(),
							}),
							facciones: z.array(
								z.object({
									nombre: z.string(),
									enfoque: z.string().nullable(),
								}),
							),
							personas: z.array(
								z.object({ nombre: z.string(), alias: z.string().nullable() }),
							),
							brazos_armados: z.array(z.object({ nombre: z.string() })),
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

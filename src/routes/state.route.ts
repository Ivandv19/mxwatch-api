// Schemas de respuesta
import { createRoute, z } from "@hono/zod-openapi";
import { createSuccessSchema, ErrorSchema } from "../schemas/common";
import { DetalleEstadoSchema } from "../schemas/state";

// Inteligencia detallada de un estado por nombre
export const getStateByNameRoute = createRoute({
	method: "get",
	path: "/state/{name}",
	summary: "Inteligencia Estatal",
	description: "Desglose detallado de seguridad por estado.",
	request: {
		params: z.object({
			name: z.string().openapi({ example: "Sinaloa" }),
		}),
	},
	responses: {
		200: {
			content: {
				"application/json": {
					schema: createSuccessSchema(
						DetalleEstadoSchema,
						"StateDetailsResponse",
					),
				},
			},
			description: "Éxito.",
		},
		404: {
			content: { "application/json": { schema: ErrorSchema } },
			description: "Estado no encontrado.",
		},
		500: {
			content: { "application/json": { schema: ErrorSchema } },
			description: "Error de análisis.",
		},
	},
	security: [{ apiKey: [] }],
});

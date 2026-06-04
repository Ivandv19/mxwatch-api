// Schemas de respuesta
import { createRoute, z } from "@hono/zod-openapi";
import { createSuccessSchema, ErrorSchema } from "../schemas/common";

// Health check público (sin autenticación)
export const healthRoute = createRoute({
	method: "get",
	path: "/health",
	summary: "Diagnóstico de Salud (Público)",
	description:
		"Verifica la conectividad con la base de datos y el estado general del runtime del servidor.",
	responses: {
		200: {
			content: {
				"application/json": {
					schema: createSuccessSchema(
						z.object({
							estado: z.string().openapi({ example: "saludable" }),
							marca_tiempo: z.iso.datetime(),
						}),
						"HealthResponse",
					),
				},
			},
			description:
				"El servidor y la base de datos están operando correctamente (VIVO).",
		},
		503: {
			content: {
				"application/json": {
					schema: ErrorSchema,
				},
			},
			description:
				"El servidor o la base de datos están fuera de servicio (MUERTO/CRITICAL).",
		},
	},
});

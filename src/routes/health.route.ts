import { createRoute, z } from "@hono/zod-openapi";
import { createSuccessSchema, ErrorSchema } from "../schemas/common";

/**
 * Endpoints de Diagnóstico e Infraestructura.
 */

// -----------------------------------------------------------------------------
// 1. HEALTH CHECK (PÚBLICO)
// -----------------------------------------------------------------------------

/**
 * healthRoute: Diagnóstico de Supervivencia
 * Permite que sistemas externos (Uptime Kuma, Cloudflare, etc.) verifiquen
 * la salud del servidor y la conectividad SQL sin autenticación.
 */
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
							status: z.string().openapi({ example: "healthy" }),
							timestamp: z.string().datetime(),
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

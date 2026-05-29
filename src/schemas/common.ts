import { z } from "@hono/zod-openapi";

export const ErrorSchema = z
	.object({
		exito: z.literal(false),
		error: z.string().openapi({
			example: "No autorizado — API Key inválida",
		}),
		detalle: z.string().optional(),
	})
	.openapi("ErrorResponse");

export function createSuccessSchema<T extends z.ZodTypeAny>(
	dataSchema: T,
	name: string,
) {
	return z
		.object({
			exito: z.literal(true),
			datos: dataSchema,
			marca_tiempo: z.iso.datetime().optional(),
			conteo: z.number().optional(),
		})
		.openapi(name);
}

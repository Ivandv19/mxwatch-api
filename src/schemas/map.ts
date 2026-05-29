import { z } from "@hono/zod-openapi";

export const MapStatePresenceSchema = z
	.object({
		slug_estado: z.string().openapi({ example: "sinaloa" }),
		nombre_estado: z.string().openapi({ example: "Sinaloa" }),
		carteles: z.array(
			z.object({
				id: z.string().uuid(),
				nombre: z.string().openapi({ example: "Cártel de Sinaloa" }),
				color: z.string().openapi({ example: "#2a7de1" }),
				slug: z.string().openapi({ example: "cds" }),
			}),
		),
	})
	.openapi("MapStatePresence");

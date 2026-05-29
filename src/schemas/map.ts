import { z } from "@hono/zod-openapi";

export const MapStatePresenceSchema = z
	.object({
		stateSlug: z.string().openapi({ example: "sinaloa" }),
		stateName: z.string().openapi({ example: "Sinaloa" }),
		cartels: z.array(
			z.object({
				id: z.string().uuid(),
				name: z.string().openapi({ example: "Cártel de Sinaloa" }),
				color: z.string().openapi({ example: "#2a7de1" }),
				slug: z.string().openapi({ example: "cds" }),
			}),
		),
	})
	.openapi("MapStatePresence");

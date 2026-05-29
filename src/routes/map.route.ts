import { createRoute, z } from "@hono/zod-openapi";
import { createSuccessSchema, ErrorSchema } from "../schemas/common";
import { MapStatePresenceSchema } from "../schemas/map";

export const mapRoute = createRoute({
	method: "get",
	path: "/map",
	summary: "Datos de Visualización Territorial (Mapa)",
	description:
		"Proporciona la lista de estados junto con la presencia de cárteles, optimizado para el renderizado del mapa interactivo.",
	responses: {
		200: {
			content: {
				"application/json": {
					schema: createSuccessSchema(
						z.array(MapStatePresenceSchema),
						"MapResponse",
					),
				},
			},
			description: "Censo geográfico recuperado con éxito.",
		},
		500: {
			content: {
				"application/json": {
					schema: ErrorSchema,
				},
			},
			description:
				"Error crítico en el motor de base de datos durante la consulta espacial.",
		},
	},
	security: [{ apiKey: [] }],
});

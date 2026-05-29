import { z } from "@hono/zod-openapi";
import { BrazoArmadoSchema, FaccionSchema, PersonaSchema } from "./cartel";

export const CartelEnEstadoSchema = z.object({
	id: z.string().uuid(),
	nombre: z.string().openapi({ example: "Cártel Jalisco Nueva Generación" }),
	slug: z.string().openapi({ example: "cjng" }),
	color: z.string().openapi({ example: "#e63946" }),
	facciones: z.array(FaccionSchema),
	personas: z.array(PersonaSchema),
	brazosArmados: z.array(BrazoArmadoSchema).optional(),
});

export const DetalleEstadoSchema = z
	.object({
		stateName: z.string().openapi({ example: "Colima" }),
		stateSlug: z.string().openapi({ example: "colima" }),
		totalCartels: z.number().openapi({ example: 2 }),
		cartels: z.array(CartelEnEstadoSchema),
	})
	.openapi("StateDetailsResponse");

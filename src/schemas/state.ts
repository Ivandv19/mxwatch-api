import { z } from "@hono/zod-openapi";
import { BrazoArmadoSchema, FaccionSchema, PersonaSchema } from "./cartel";

export const CartelEnEstadoSchema = z.object({
	id: z.string().uuid(),
	nombre: z.string().openapi({ example: "Cártel Jalisco Nueva Generación" }),
	slug: z.string().openapi({ example: "cjng" }),
	color: z.string().openapi({ example: "#e63946" }),
	jefes: z.array(PersonaSchema),
	facciones: z.array(FaccionSchema),
	personas: z.array(PersonaSchema),
	brazos_armados: z.array(BrazoArmadoSchema).optional(),
});

export const DetalleEstadoSchema = z
	.object({
		nombre_estado: z.string().openapi({ example: "Colima" }),
		slug_estado: z.string().openapi({ example: "colima" }),
		total_carteles: z.number().openapi({ example: 2 }),
		carteles: z.array(CartelEnEstadoSchema),
	})
	.openapi("StateDetailsResponse");

import { z } from "@hono/zod-openapi";

export const CartelSchema = z
	.object({
		id: z.string().uuid(),
		name: z.string().openapi({ example: "Cártel de Sinaloa" }),
		slug: z.string().openapi({ example: "cds" }),
		color: z.string().openapi({ example: "#2a7de1" }),
	})
	.openapi("Cartel");

export const FaccionSchema = z
	.object({
		id: z.string().uuid().optional(),
		nombre: z.string().openapi({ example: "Los Chapitos" }),
		enfoque: z.string().nullable().openapi({ example: "Fentanilo industrial" }),
	})
	.openapi("Faccion");

export const PersonaSchema = z
	.object({
		id: z.string().uuid().optional(),
		nombre: z.string().openapi({ example: "Ismael Zambada García" }),
		alias: z.string().nullable().openapi({ example: "El Mayo" }),
	})
	.openapi("Persona");

export const BrazoArmadoSchema = z
	.object({
		id: z.string().uuid().optional(),
		nombre: z.string().openapi({ example: "Los Mata Zetas" }),
	})
	.openapi("BrazoArmado");

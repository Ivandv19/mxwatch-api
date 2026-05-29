import { eq } from "drizzle-orm";
import type { Context } from "hono";
import { db } from "../db";
import { estados } from "../db/schema";

export async function obtenerEstadoPorNombre(c: Context) {
	try {
		const { name } = c.req.valid("param");
		const stateName = decodeURIComponent(name);
		const stateRecord = await db.query.estados.findFirst({
			where: eq(estados.nombre, stateName),
			with: {
				presencias: {
					with: {
						cartel: true,
						facciones: { with: { faccion: true } },
						operadores: { with: { persona: true } },
						brazosArmados: { with: { brazoArmado: true } },
					},
				},
			},
		});

		if (!stateRecord)
			return c.json({ success: false, error: "State not found" }, 404);

		return c.json(
			{
				success: true,
				data: {
					stateName: stateRecord.nombre,
					stateSlug: stateRecord.slug,
					totalCartels: stateRecord.presencias.length,
					cartels: stateRecord.presencias.map((p) => ({
						id: p.cartel.id,
						nombre: p.cartel.nombre,
						slug: p.cartel.slug,
						color: p.cartel.color,
						facciones: p.facciones.map((f) => ({
							id: f.faccion.id,
							nombre: f.faccion.nombre,
							enfoque: f.faccion.enfoque,
						})),
						personas: p.operadores.map((l) => ({
							id: l.persona.id,
							nombre: l.persona.nombre,
							alias: l.persona.alias,
						})),
						brazosArmados:
							p.brazosArmados?.map((aw) => ({
								id: aw.brazoArmado.id,
								nombre: aw.brazoArmado.nombre,
							})) || [],
					})),
				},
			},
			200,
		);
	} catch (_error) {
		return c.json({ success: false, error: "Database error" }, 500);
	}
}

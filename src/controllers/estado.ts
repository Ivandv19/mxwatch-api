import { eq } from "drizzle-orm";
import type { Context } from "hono";
import { db } from "../db";
import { estados, personas } from "../db/schema";

export async function obtenerEstadoPorNombre(c: Context) {
	try {
		const { name } = c.req.param() as { name: string };
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
			return c.json({ exito: false, error: "Estado no encontrado" }, 404);

		// Jefes máximos de cada cártel (nacional, no estado-específico)
		const todosJefes = await db.query.personas.findMany({
			where: eq(personas.esJefe, true),
		});
		const jefesPorCartel: Record<string, (typeof todosJefes)[number][]> = {};
		for (const j of todosJefes) {
			if (j.cartelId) {
				if (!jefesPorCartel[j.cartelId]) jefesPorCartel[j.cartelId] = [];
				jefesPorCartel[j.cartelId].push(j);
			}
		}

		return c.json(
			{
				exito: true,
				datos: {
					nombre_estado: stateRecord.nombre,
					slug_estado: stateRecord.slug,
					total_carteles: stateRecord.presencias.length,
					carteles: stateRecord.presencias.map((p) => ({
						id: p.cartel.id,
						nombre: p.cartel.nombre,
						slug: p.cartel.slug,
						color: p.cartel.color,
						jefes: (jefesPorCartel[p.cartel.id] || []).map((j) => ({
							id: j.id,
							nombre: j.nombre,
							alias: j.alias,
						})),
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
						brazos_armados:
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
		return c.json({ exito: false, error: "Error de base de datos" }, 500);
	}
}

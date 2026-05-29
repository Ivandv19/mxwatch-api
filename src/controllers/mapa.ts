import type { Context } from "hono";
import { db } from "../db";

export async function obtenerMapa(c: Context) {
	try {
		const records = await db.query.estados.findMany({
			with: {
				presencias: {
					with: { cartel: true },
				},
			},
			orderBy: (estados, { asc }) => [asc(estados.nombre)],
		});

		const result = records.map((r) => ({
			slug_estado: r.slug,
			nombre_estado: r.nombre,
			carteles: r.presencias.map((p) => ({
				id: p.cartel.id,
				nombre: p.cartel.nombre,
				color: p.cartel.color,
				slug: p.cartel.slug,
			})),
		}));

		return c.json(
			{
				exito: true,
				datos: result,
				marca_tiempo: new Date().toISOString(),
			},
			200,
		);
	} catch (_error) {
		return c.json({ exito: false, error: "Error de base de datos" }, 500);
	}
}

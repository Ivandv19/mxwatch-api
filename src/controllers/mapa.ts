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
			stateSlug: r.slug,
			stateName: r.nombre,
			cartels: r.presencias.map((p) => ({
				id: p.cartel.id,
				name: p.cartel.nombre,
				color: p.cartel.color,
				slug: p.cartel.slug,
			})),
		}));

		return c.json(
			{ success: true, data: result, timestamp: new Date().toISOString() },
			200,
		);
	} catch (_error) {
		return c.json({ success: false, error: "Database error" }, 500);
	}
}

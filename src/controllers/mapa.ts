import type { Context } from "hono";
import { db } from "../db";

// Obtiene todos los estados con su presencia de cárteles
export async function obtenerMapa(c: Context) {
	try {
		// Consulta estados con presencias y sus cárteles asociados
		const records = await db.query.estados.findMany({
			with: {
				presencias: {
					with: { cartel: true },
				},
			},
			orderBy: (estados, { asc }) => [asc(estados.nombre)],
		});

		// Mapea a formato de respuesta
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
		// Error de conexión o consulta
		return c.json({ exito: false, error: "Error de base de datos" }, 500);
	}
}

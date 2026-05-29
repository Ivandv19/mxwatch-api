import { eq } from "drizzle-orm";
import type { Context } from "hono";
import { db } from "../db";
import { carteles } from "../db/schema";

export async function listarCarteles(c: Context) {
	try {
		const allCarteles = await db.query.carteles.findMany({
			orderBy: (carteles, { asc }) => [asc(carteles.nombre)],
		});
		return c.json(
			{
				exito: true,
				datos: allCarteles.map((cr) => ({
					id: cr.id,
					nombre: cr.nombre,
					slug: cr.slug,
					color: cr.color,
				})),
				conteo: allCarteles.length,
			},
			200,
		);
	} catch (_error) {
		return c.json({ exito: false, error: "Error de base de datos" }, 500);
	}
}

export async function obtenerCartelPorSlug(c: Context) {
	try {
		const { slug } = c.req.param() as { slug: string };
		const cartelRecord = await db.query.carteles.findFirst({
			where: eq(carteles.slug, slug),
			with: {
				presencias: {
					with: {
						estado: true,
						facciones: { with: { faccion: true } },
						operadores: { with: { persona: true } },
						brazosArmados: { with: { brazoArmado: true } },
					},
				},
			},
		});

		if (!cartelRecord)
			return c.json({ exito: false, error: "Cártel no encontrado" }, 404);

		const uniqueFactions = new Map();
		const uniqueLeaders = new Map();
		const uniqueArmedWings = new Map();
		const statePresence: Array<{ nombre_estado: string }> = [];

		cartelRecord.presencias.forEach((presence) => {
			statePresence.push({ nombre_estado: presence.estado.nombre });
			presence.facciones.forEach((pf) => {
				uniqueFactions.set(pf.faccion.id, {
					nombre: pf.faccion.nombre,
					enfoque: pf.faccion.enfoque,
				});
			});
			presence.operadores.forEach((pl) => {
				uniqueLeaders.set(pl.persona.id, {
					nombre: pl.persona.nombre,
					alias: pl.persona.alias,
				});
			});
			presence.brazosArmados?.forEach((aw) => {
				uniqueArmedWings.set(aw.brazoArmado.id, {
					nombre: aw.brazoArmado.nombre,
				});
			});
		});

		return c.json(
			{
				exito: true,
				datos: {
					id: cartelRecord.id,
					nombre: cartelRecord.nombre,
					slug: cartelRecord.slug,
					color: cartelRecord.color,
					presencia: {
						estados: statePresence,
						total_estados: statePresence.length,
					},
					facciones: Array.from(uniqueFactions.values()),
					personas: Array.from(uniqueLeaders.values()),
					brazos_armados: Array.from(uniqueArmedWings.values()),
				},
			},
			200,
		);
	} catch (_error) {
		return c.json({ exito: false, error: "Error de base de datos" }, 500);
	}
}

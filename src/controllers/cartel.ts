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
				success: true,
				data: allCarteles.map((cr) => ({
					id: cr.id,
					name: cr.nombre,
					slug: cr.slug,
					color: cr.color,
				})),
				count: allCarteles.length,
			},
			200,
		);
	} catch (_error) {
		return c.json({ success: false, error: "Database error" }, 500);
	}
}

export async function obtenerCartelPorSlug(c: Context) {
	try {
		const { slug } = c.req.valid("param");
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
			return c.json({ success: false, error: "Cartel not found" }, 404);

		const uniqueFactions = new Map();
		const uniqueLeaders = new Map();
		const uniqueArmedWings = new Map();
		const statePresence: Array<{ state: string }> = [];

		cartelRecord.presencias.forEach((presence) => {
			statePresence.push({ state: presence.estado.nombre });
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
				success: true,
				data: {
					id: cartelRecord.id,
					name: cartelRecord.nombre,
					slug: cartelRecord.slug,
					color: cartelRecord.color,
					presence: {
						states: statePresence,
						totalStates: statePresence.length,
					},
					factions: Array.from(uniqueFactions.values()),
					leaders: Array.from(uniqueLeaders.values()),
					armedWings: Array.from(uniqueArmedWings.values()),
				},
			},
			200,
		);
	} catch (_error) {
		return c.json({ success: false, error: "Database error" }, 500);
	}
}

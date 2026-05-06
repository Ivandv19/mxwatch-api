import { swaggerUI } from "@hono/swagger-ui";
import { OpenAPIHono } from "@hono/zod-openapi";
import { eq } from "drizzle-orm";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { db, healthCheck } from "./db";
import { cartels, regionalPresence, states } from "./db/schema";
import { authMiddleware } from "./middleware/auth";
import { getCartelBySlugRoute, listCartelsRoute } from "./routes/cartel.route";
import { dominantPresenceRoute } from "./routes/dominant.route";
// Rutas e Infraestructura
import { healthRoute } from "./routes/health.route";
import { mapRoute } from "./routes/map.route";
import { getStateByNameRoute } from "./routes/state.route";

/**
 * MXWATCH API: Núcleo Hono con OpenAPI.
 */

const app = new OpenAPIHono();
const api = new OpenAPIHono();

// --- Middleware Global ---

app.use("*", logger());

app.use(
	"/*",
	cors({
		origin: [
			"https://mxwatch.mgdc.site",
			"https://mxwatch.fluxdv.icu",
			"https://mxwatch-api.fluxdv.icu",
			"http://localhost:3000",
			"http://localhost:3001",
		],
	}),
);

/**
 * Auth Middleware (Fail-Closed).
 * Protege /api/* excepto rutas públicas (health/docs).
 */
api.use("*", async (c, next) => {
	const publicRoutes = ["/api/health", "/api/docs", "/api/doc"];
	if (publicRoutes.includes(c.req.path)) return await next();
	return await authMiddleware(c, next);
});

// --- Handlers de Rutas ---

api.openapi(healthRoute, async (c) => {
	const isHealthy = await healthCheck();
	if (!isHealthy)
		return c.json({ success: false, error: "DB Connection failed" }, 503);
	return c.json(
		{
			success: true,
			data: { status: "healthy", timestamp: new Date().toISOString() },
		},
		200,
	);
});

api.openapi(mapRoute, async (c) => {
	try {
		const presenceRecords = await db.query.states.findMany({
			with: {
				presences: {
					with: { cartel: true },
					orderBy: (presences, { desc }) => [desc(presences.isDominant)],
				},
			},
			orderBy: (states, { asc }) => [asc(states.name)],
		});

		const result = presenceRecords.map((stateRecord) => ({
			stateSlug: stateRecord.slug,
			stateName: stateRecord.name,
			cartels: stateRecord.presences.map((p) => ({
				id: p.cartel.id,
				name: p.cartel.name,
				color: p.cartel.color,
				isDominant: p.isDominant,
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
});

api.openapi(listCartelsRoute, async (c) => {
	try {
		const allCartels = await db.query.cartels.findMany({
			orderBy: (cartels, { asc }) => [asc(cartels.name)],
		});
		return c.json(
			{
				success: true,
				data: allCartels.map((cr) => ({
					id: cr.id,
					name: cr.name,
					slug: cr.slug,
					color: cr.color,
					globalStatus: cr.globalStatus,
					foreignDesignation: cr.foreignDesignation,
					fifaRiskLevel: cr.fifaRiskLevel,
				})),
				count: allCartels.length,
			},
			200,
		);
	} catch (_error) {
		return c.json({ success: false, error: "Database error" }, 500);
	}
});

api.openapi(getCartelBySlugRoute, async (c) => {
	try {
		const { slug } = c.req.valid("param");
		const cartelRecord = await db.query.cartels.findFirst({
			where: eq(cartels.slug, slug),
			with: {
				presences: {
					with: {
						state: true,
						factions: { with: { faction: true } },
						leaders: { with: { leader: true } },
						armedWings: { with: { armedWing: true } },
						economies: { with: { economy: true } },
					},
				},
			},
		});

		if (!cartelRecord)
			return c.json({ success: false, error: "Cartel not found" }, 404);

		const uniqueFactions = new Map();
		const uniqueLeaders = new Map();
		const uniqueArmedWings = new Map();
		const uniqueEconomies = new Map();
		const statePresence: Array<{
			state: string;
			isDominant: boolean;
			note: string | null;
		}> = [];

		cartelRecord.presences.forEach((presence) => {
			statePresence.push({
				state: presence.state.name,
				isDominant: presence.isDominant,
				note: presence.localIntelligenceNote,
			});
			presence.factions.forEach((pf) => {
				uniqueFactions.set(pf.faction.id, {
					name: pf.faction.name,
					focus: pf.faction.focus,
				});
			});
			presence.leaders.forEach((pl) => {
				uniqueLeaders.set(pl.leader.id, {
					name: pl.leader.name,
					alias: pl.leader.alias,
				});
			});
			presence.armedWings?.forEach((aw) => {
				uniqueArmedWings.set(aw.armedWing.id, { name: aw.armedWing.name });
			});
			presence.economies?.forEach((pe) => {
				uniqueEconomies.set(pe.economy.id, { name: pe.economy.name });
			});
		});

		return c.json(
			{
				success: true,
				data: {
					id: cartelRecord.id,
					name: cartelRecord.name,
					slug: cartelRecord.slug,
					color: cartelRecord.color,
					globalStatus: cartelRecord.globalStatus,
					foreignDesignation: cartelRecord.foreignDesignation,
					fifaRiskLevel: cartelRecord.fifaRiskLevel,
					presence: {
						states: statePresence,
						totalStates: statePresence.length,
						dominantStates: statePresence.filter((s) => s.isDominant).length,
					},
					factions: Array.from(uniqueFactions.values()),
					leaders: Array.from(uniqueLeaders.values()),
					armedWings: Array.from(uniqueArmedWings.values()),
					economicActivities: Array.from(uniqueEconomies.values()),
				},
			},
			200,
		);
	} catch (_error) {
		return c.json({ success: false, error: "Database error" }, 500);
	}
});

api.openapi(getStateByNameRoute, async (c) => {
	try {
		const { name } = c.req.valid("param");
		const stateName = decodeURIComponent(name);
		const stateRecord = await db.query.states.findFirst({
			where: eq(states.name, stateName),
			with: {
				presences: {
					with: {
						cartel: true,
						factions: { with: { faction: true } },
						leaders: { with: { leader: true } },
						armedWings: { with: { armedWing: true } },
						economies: { with: { economy: true } },
					},
					orderBy: (presences, { desc }) => [desc(presences.isDominant)],
				},
			},
		});

		if (!stateRecord)
			return c.json({ success: false, error: "State not found" }, 404);

		return c.json(
			{
				success: true,
				data: {
					stateName: stateRecord.name,
					stateSlug: stateRecord.slug,
					totalCartels: stateRecord.presences.length,
					dominantCartels: stateRecord.presences.filter((p) => p.isDominant)
						.length,
					cartels: stateRecord.presences.map((p) => ({
						id: p.cartel.id,
						name: p.cartel.name,
						slug: p.cartel.slug,
						color: p.cartel.color,
						isDominant: p.isDominant,
						localIntelligenceNote: p.localIntelligenceNote,
						globalStatus: p.cartel.globalStatus,
						foreignDesignation: p.cartel.foreignDesignation,
						fifaRiskLevel: p.cartel.fifaRiskLevel,
						factions: p.factions.map((f) => ({
							id: f.faction.id,
							name: f.faction.name,
							focus: f.faction.focus,
						})),
						leaders: p.leaders.map((l) => ({
							id: l.leader.id,
							name: l.leader.name,
							alias: l.leader.alias,
						})),
						armedWings:
							p.armedWings?.map((aw) => ({
								id: aw.armedWing.id,
								name: aw.armedWing.name,
							})) || [],
						economicActivities:
							p.economies?.map((e) => ({
								id: e.economy.id,
								name: e.economy.name,
							})) || [],
					})),
				},
			},
			200,
		);
	} catch (_error) {
		return c.json({ success: false, error: "Database error" }, 500);
	}
});

api.openapi(dominantPresenceRoute, async (c) => {
	try {
		const dominantPresence = await db.query.regionalPresence.findMany({
			where: eq(regionalPresence.isDominant, true),
			with: { state: true, cartel: true },
			orderBy: (presence, { asc }) => [asc(presence.stateId)],
		});
		const result = dominantPresence.map((p) => ({
			state: p.state.name,
			cartel: p.cartel.name,
			cartelColor: p.cartel.color,
		}));
		return c.json({ success: true, data: result, count: result.length }, 200);
	} catch (_error) {
		return c.json({ success: false, error: "Database error" }, 500);
	}
});

// --- Documentación OpenAPI ---

app.openAPIRegistry.registerComponent("securitySchemes", "apiKey", {
	type: "apiKey",
	name: "x-api-key",
	in: "header",
	description: "Introduce tu API Key.",
});

app.route("/api", api);

app.doc("/api/doc", {
	openapi: "3.0.0",
	info: {
		version: "1.0.0",
		title: "MXWatch API",
		description: "API de inteligencia táctica.",
	},
});

app.get("/api/docs", swaggerUI({ url: "/api/doc" }));

export default { port: 3001, fetch: app.fetch };

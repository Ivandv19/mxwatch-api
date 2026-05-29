import { swaggerUI } from "@hono/swagger-ui";
import { OpenAPIHono } from "@hono/zod-openapi";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { OPENAPI_INFO, SECURITY_SCHEME } from "./config/openapi";
import { listarCarteles, obtenerCartelPorSlug } from "./controllers/cartel";
import { obtenerEstadoPorNombre } from "./controllers/estado";
import { obtenerMapa } from "./controllers/mapa";
import { verificarSalud } from "./controllers/salud";
import { authMiddleware } from "./middlewares/auth";
import { getCartelBySlugRoute, listCartelsRoute } from "./routes/cartel.route";
import { healthRoute } from "./routes/health.route";
import { mapRoute } from "./routes/map.route";
import { getStateByNameRoute } from "./routes/state.route";

const app = new OpenAPIHono();
const api = new OpenAPIHono();

const PUBLIC_ROUTES = ["/api/health", "/api/docs", "/api/doc"];

app.use("*", logger());
app.use(
	"/*",
	cors({
		origin: (
			process.env.CORS_ORIGINS || "http://localhost:3000,http://localhost:3001"
		).split(","),
	}),
);

api.use("*", async (c, next) => {
	if (PUBLIC_ROUTES.includes(c.req.path)) return await next();
	return await authMiddleware(c, next);
});

api.openapi(healthRoute, verificarSalud);
api.openapi(mapRoute, obtenerMapa);
api.openapi(listCartelsRoute, listarCarteles);
api.openapi(getCartelBySlugRoute, obtenerCartelPorSlug);
api.openapi(getStateByNameRoute, obtenerEstadoPorNombre);

app.openAPIRegistry.registerComponent(
	"securitySchemes",
	"apiKey",
	SECURITY_SCHEME,
);

const appConRutas = app
	.route("/api", api)
	.doc("/api/doc", OPENAPI_INFO)
	.get("/api/docs", swaggerUI({ url: "/api/doc" }))
	.onError((err, c) => {
		console.error("Error no capturado:", err);
		return c.json({ exito: false, error: "Error interno del servidor" }, 500);
	});

export type AppType = typeof appConRutas;

export default {
	port: parseInt(process.env.PORT || "3001", 10),
	fetch: appConRutas.fetch,
};

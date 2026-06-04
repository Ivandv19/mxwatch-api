import { cors } from "hono/cors";
import type { OpenAPIHono } from "@hono/zod-openapi";
import { env } from "../config/env";

// CORS con orígenes permitidos
export function aplicarCors(app: OpenAPIHono) {
	app.use(
		"/*",
		cors({
			origin: env.CORS_ORIGINS,
		}),
	);
}

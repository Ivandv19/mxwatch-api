import { rateLimiter } from "hono-rate-limiter";
import type { OpenAPIHono } from "@hono/zod-openapi";

// Rate limiting: máximo 100 requests por minuto por IP
export function aplicarRateLimit(app: OpenAPIHono) {
	app.use(
		"*",
		rateLimiter({
			windowMs: 60 * 1000,
			limit: 100,
			standardHeaders: true,
			keyGenerator: (c) =>
				c.req.header("x-forwarded-for") ||
				c.req.header("x-real-ip") ||
				"unknown",
		}),
	);
}

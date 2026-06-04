import { secureHeaders } from "hono/secure-headers";
import type { OpenAPIHono } from "@hono/zod-openapi";

// Headers de seguridad: CSP, HSTS, X-Content-Type-Options, etc.
export function aplicarSecureHeaders(app: OpenAPIHono) {
	app.use("*", secureHeaders());
}

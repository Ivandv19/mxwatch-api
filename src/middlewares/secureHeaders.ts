import type { OpenAPIHono } from "@hono/zod-openapi";
import { secureHeaders } from "hono/secure-headers";

// Headers de seguridad: CSP, HSTS, X-Content-Type-Options, etc.
export function aplicarSecureHeaders(app: OpenAPIHono) {
	app.use("*", secureHeaders());
}

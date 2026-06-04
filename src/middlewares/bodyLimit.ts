import type { OpenAPIHono } from "@hono/zod-openapi";
import { bodyLimit } from "hono/body-limit";

// Límite de tamaño del body (1MB)
export function aplicarBodyLimit(app: OpenAPIHono) {
	app.use("*", bodyLimit({ maxSize: 1024 * 1024 }));
}

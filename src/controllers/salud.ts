import type { Context } from "hono";
import { healthCheck } from "../db";

export async function verificarSalud(c: Context) {
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
}

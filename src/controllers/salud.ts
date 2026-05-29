import type { Context } from "hono";
import { healthCheck } from "../db";

export async function verificarSalud(c: Context) {
	const isHealthy = await healthCheck();
	if (!isHealthy)
		return c.json(
			{ exito: false, error: "Conexión a base de datos fallida" },
			503,
		);
	return c.json(
		{
			exito: true,
			datos: {
				estado: "saludable",
				marca_tiempo: new Date().toISOString(),
			},
		},
		200,
	);
}

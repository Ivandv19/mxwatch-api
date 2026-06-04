import type { Context } from "hono";
import { healthCheck } from "../db";

// Health check de la base de datos
export async function verificarSalud(c: Context) {
	// Verifica conectividad con PostgreSQL
	const isHealthy = await healthCheck();
	if (!isHealthy)
		// Error de conexión
		return c.json(
			{ exito: false, error: "Conexión a base de datos fallida" },
			503,
		);
	// Respuesta exitosa con estado y timestamp
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

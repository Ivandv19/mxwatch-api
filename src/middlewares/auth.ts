import type { Context, Next } from "hono";
import { env } from "../config/env";

// Autenticación por API Key (fail-closed)
export const authMiddleware = async (c: Context, next: Next) => {
	const apiKey = c.req.header("x-api-key");
	const expectedKey = env.API_KEY;

	// API_KEY no configurada en el servidor
	if (!expectedKey) {
		console.error(
			"❌ ERROR DE CONFIGURACIÓN: API_KEY no está definida en las variables de entorno.",
		);
		return c.json(
			{
				exito: false,
				error: "Error interno del servidor",
				detalle:
					"Acceso bloqueado: el servidor no ha sido configurado con una clave de seguridad.",
			},
			500,
		);
	}

	// API Key inválida o ausente
	if (apiKey !== expectedKey) {
		const userAgent = c.req.header("user-agent") || "unknown-agent";
		console.error(
			`🔴 INTENTO DE ACCESO NO AUTORIZADO: Denegado desde ${userAgent}`,
		);
		return c.json(
			{
				exito: false,
				error: "No autorizado",
				detalle:
					'Acceso denegado. Se requiere una API Key válida en el header "x-api-key".',
			},
			401,
		);
	}

	await next();
};

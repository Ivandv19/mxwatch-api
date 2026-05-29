import type { Context, Next } from "hono";

/**
 * Sistema de Autenticación Táctica (fail-closed).
 * Implementa una validación estricta mediante API Key en los headers para
 * asegurar la integridad de la inteligencia de MXWatch.
 */

/**
 * Middleware de Autorización: authMiddleware
 * Actúa como la primera línea de defensa para todos los endpoints sensibles.
 *
 * Requisitos de Acceso:
 * 1. El header 'x-api-key' debe estar presente en el request.
 * 2. El valor debe coincidir exactamente con la variable de entorno API_KEY.
 *
 * Estratégia de Seguridad:
 * - Si la API_KEY no está configurada en el servidor, retorna 500 (Internal Error).
 * - Si la llave es incorrecta o falta, retorna 401 (Unauthorized).
 *
 * @param {Context} c - Contexto de la petición Hono.
 * @param {Next} next - Función para ceder el control al siguiente handler.
 */
export const authMiddleware = async (c: Context, next: Next) => {
	const apiKey = c.req.header("x-api-key");
	const expectedKey = process.env.API_KEY;

	// -----------------------------------------------------------------------------
	// VALIDACIÓN DE CONFIGURACIÓN DEL SERVIDOR
	// -----------------------------------------------------------------------------
	if (!expectedKey) {
		console.error(
			"❌ CONFIGURATION ERROR: API_KEY is missing from environment variables.",
		);
		return c.json(
			{
				success: false,
				error: "Internal Server Error",
				message:
					"Acceso bloqueado: El servidor no ha sido configurado con una clave de seguridad.",
			},
			500,
		);
	}

	// -----------------------------------------------------------------------------
	// VALIDACIÓN DE CREDENCIALES DE ACCESO
	// -----------------------------------------------------------------------------
	if (apiKey !== expectedKey) {
		const userAgent = c.req.header("user-agent") || "unknown-agent";
		console.error(
			`🔴 UNAUTHORIZED ACCESS ATTEMPT: Denied request from ${userAgent}`,
		);

		return c.json(
			{
				success: false,
				error: "Unauthorized",
				message:
					'Acceso denegado. Se requiere una API Key válida en el header "x-api-key".',
			},
			401,
		);
	}

	// ACCESO AUTORIZADO: El flujo continúa al handler de la ruta
	await next();
};

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

/**
 * Punto de entrada central para la Base de Datos (Drizzle ORM).
 * Inicializa la conexión con PostgreSQL y expone el objeto 'db' para consultas.
 */

import { drizzle as drizzlePostgres } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Cadena de conexión obtenida de las variables de entorno (.env)
const connectionString = process.env.DATABASE_URL || "";

// Validación crítica: La API no puede funcionar sin conexión a la BD
if (!connectionString) {
	throw new Error(
		"DATABASE_URL environment variable is not set. La API no puede iniciar sin base de datos.",
	);
}

/**
 * Configuración del cliente Postgres.js.
 * Optimizado para el entorno Dokploy/VPS con gestión de pool de conexiones.
 */
const client = postgres(connectionString, {
	max: 10, // Máximas conexiones simultáneas permitidas
	idle_timeout: 20, // Tiempo (seg) para liberar conexiones inactivas
	connect_timeout: 10, // Tiempo máximo de espera para establecer conexión
	ssl: false, // Deshabilitado para conexiones internas en Dokploy/Docker
});

/**
 * Instancia global de Drizzle ORM.
 * Inyectada con el esquema relacional para habilitar tipado estricto en consultas (Type Safety).
 */
export const db = drizzlePostgres(client, { schema });

/**
 *healthCheck: Utilidad de diagnóstico de infraestructura.
 * Realiza una consulta 'SELECT 1' para verificar la latencia y disponibilidad del motor SQL.
 *
 * @returns {Promise<boolean>} Retorna true si la comunicación es exitosa.
 */
export async function healthCheck(): Promise<boolean> {
	try {
		await client`SELECT 1`;
		return true;
	} catch (error) {
		console.error("CRITICAL: Database Health Check failed:", error);
		return false;
	}
}

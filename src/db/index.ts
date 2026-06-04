/**
 * Punto de entrada central para la Base de Datos (Drizzle ORM).
 */

import { drizzle as drizzlePostgres } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "../config/env";
import * as schema from "./schema";

// Cadena de conexión validada desde env
const connectionString = env.DATABASE_URL;

// La API no puede funcionar sin conexión a la BD
if (!connectionString) {
	throw new Error(
		"DATABASE_URL environment variable is not set. La API no puede iniciar sin base de datos.",
	);
}

// Cliente Postgres.js optimizado para VPS con pool de conexiones
const client = postgres(connectionString, {
	max: 10,
	idle_timeout: 20,
	connect_timeout: 10,
	ssl: false,
});

// Instancia global de Drizzle ORM con tipado estricto
export const db = drizzlePostgres(client, { schema });

// Verifica conectividad con la base de datos
export async function healthCheck(): Promise<boolean> {
	try {
		await client`SELECT 1`;
		return true;
	} catch (error) {
		console.error("CRITICAL: Database Health Check failed:", error);
		return false;
	}
}

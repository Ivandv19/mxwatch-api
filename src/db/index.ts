// db/index.ts
import * as schema from './schema';
import postgres from 'postgres';
import { drizzle as drizzlePostgres } from 'drizzle-orm/postgres-js';

const connectionString = process.env.DATABASE_URL || '';

if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set');
}

// Opciones adicionales para producción
const client = postgres(connectionString, {
    max: 10, // máximo de conexiones en pool
    idle_timeout: 20, // segundos
    connect_timeout: 10,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

export const db = drizzlePostgres(client, { schema });

// Función simple para verificar que la base de datos está respondiendo
export async function healthCheck(): Promise<boolean> {
    try {
        await client`SELECT 1`;
        return true;
    } catch (error) {
        return false;
    }
}
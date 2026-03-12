import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

// Cargar variables de entorno según el entorno
const envFile = process.env.NODE_ENV === 'production' ? '.env' : '.env.local';
config({ path: envFile });

// Validar que DATABASE_URL existe
if (!process.env.DATABASE_URL) {
    throw new Error('❌ DATABASE_URL is not defined in environment variables');
}

export default defineConfig({
    schema: './src/db/schema.ts',
    out: './drizzle',
    dialect: 'postgresql',
    dbCredentials: {
        url: process.env.DATABASE_URL,
    },

    // Opciones adicionales útiles
    verbose: true, // Muestra más información durante las migraciones
    strict: true,  // Modo estricto para evitar errores comunes

    // Configuraciones opcionales para migraciones
    migrations: {
        table: '__drizzle_migrations', // Nombre personalizado para la tabla de migraciones
        schema: 'public', // Esquema por defecto en PostgreSQL
    },

    // Opcional: filtrar tablas si necesitas excluir alguna
    // tablesFilter: ['!__drizzle_migrations'],
});

// También puedes exportar configuración adicional para seed data
export const seedConfig = {
    connectionString: process.env.DATABASE_URL,
    seed: './src/db/seed.ts',
};
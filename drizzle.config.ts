import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

/**
 * Carga de variables de entorno:
 * En producción se priorizan las variables del sistema (Dokploy).
 * En desarrollo se utiliza el archivo .env.local.
 */
const envFile = process.env.NODE_ENV === 'production' ? '.env' : '.env.local';
config({ path: envFile });

// Validación crítica: La URL de la base de datos es obligatoria para cualquier operación de Drizzle
if (!process.env.DATABASE_URL) {
    throw new Error('❌ DATABASE_URL no definida en las variables de entorno. Verifica tu archivo .env o la configuración de Dokploy.');
}

/**
 * Configuración maestra de Drizzle Kit:
 * Define cómo se sincronizan los modelos de TypeScript con la base de datos PostgreSQL.
 */
export default defineConfig({
    // Ruta al archivo donde se definen todas las entidades y tablas
    schema: './src/db/schema.ts',
    
    // Directorio donde se almacenan las migraciones generadas
    out: './drizzle',
    
    // Dialecto de base de datos (PostgreSQL en este caso)
    dialect: 'postgresql',
    
    // Credenciales de conexión
    dbCredentials: {
        url: process.env.DATABASE_URL,
    },

    // Configuración de visualización y seguridad
    verbose: true, // Muestra el detalle de los cambios aplicados en la terminal
    strict: true,  // Activa validaciones estrictas para prevenir pérdida accidental de datos

    // Configuración avanzada de migraciones
    migrations: {
        table: '__drizzle_migrations', // Nombre de la tabla de control interno de Drizzle
        schema: 'public',              // Esquema por defecto en Postgres
    },
});

/**
 * Configuración opcional para seeding:
 * Permite poblar la base de datos con datos iniciales para pruebas o despliegue inicial.
 */
export const seedConfig = {
    connectionString: process.env.DATABASE_URL,
    seed: './src/db/seed.ts',
};
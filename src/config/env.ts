// Variables de entorno validadas con valores por defecto
export const env = {
	DATABASE_URL: process.env.DATABASE_URL || "",
	API_KEY: process.env.API_KEY || "",
	PORT: parseInt(process.env.PORT || "3001", 10),
	CORS_ORIGINS: (
		process.env.CORS_ORIGINS || "http://localhost:3000,http://localhost:3001"
	).split(","),
	API_VERSION: process.env.API_VERSION || "1.0.0",
} as const;

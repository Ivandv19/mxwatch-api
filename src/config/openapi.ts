import { env } from "./env";

export const OPENAPI_INFO = {
	openapi: "3.0.0",
	info: {
		version: env.API_VERSION,
		title: "MXWatch API",
		description: "API de inteligencia táctica.",
	},
};

export const SECURITY_SCHEME = {
	type: "apiKey" as const,
	name: "x-api-key",
	in: "header" as const,
	description: "Introduce tu API Key.",
};

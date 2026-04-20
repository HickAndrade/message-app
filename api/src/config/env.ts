import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

function parseOrigins(origins: string | undefined) {
    if (!origins) {
        return [];
    }

    return origins
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean);
}

const optionalEnvBoolean = z.preprocess((value) => {
    if (value === undefined) {
        return undefined;
    }

    if (value === "true") {
        return true;
    }

    if (value === "false") {
        return false;
    }

    return value;
}, z.boolean().optional());

const envSchema = z.object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    HOST: z.string().trim().min(1).default("0.0.0.0"),
    PORT: z.coerce.number().int().positive().default(4000),
    CORS_ORIGIN: z.string().optional().transform(parseOrigins),
    DATABASE_URL: z.string().trim().min(1, "DATABASE_URL is required"),
    JWT_SECRET: z.string().trim().min(1, "JWT_SECRET is required"),
    AUTH_COOKIE_NAME: z.string().trim().min(1).default("message_app_token"),
    AUTH_COOKIE_SECURE: optionalEnvBoolean,
    AUTH_TOKEN_TTL: z.string().trim().min(1).default("7d"),
    PUSHER_APP_ID: z.string().trim().min(1, "PUSHER_APP_ID is required"),
    PUSHER_APP_KEY: z.string().trim().min(1, "PUSHER_APP_KEY is required"),
    PUSHER_SECRET: z.string().trim().min(1, "PUSHER_SECRET is required"),
    PUSHER_CLUSTER: z.string().trim().min(1).default("sa1")
});

const parsedEnv = envSchema.safeParse({
    NODE_ENV: process.env.NODE_ENV,
    HOST: process.env.HOST,
    PORT: process.env.PORT,
    CORS_ORIGIN: process.env.CORS_ORIGIN,
    DATABASE_URL: process.env.DATABASE_URL,
    JWT_SECRET: process.env.JWT_SECRET,
    AUTH_COOKIE_NAME: process.env.AUTH_COOKIE_NAME,
    AUTH_COOKIE_SECURE: process.env.AUTH_COOKIE_SECURE,
    AUTH_TOKEN_TTL: process.env.AUTH_TOKEN_TTL,
    PUSHER_APP_ID: process.env.PUSHER_APP_ID,
    PUSHER_APP_KEY: process.env.PUSHER_APP_KEY ?? process.env.NEXT_PUBLIC_PUSHER_APP_KEY,
    PUSHER_SECRET: process.env.PUSHER_SECRET,
    PUSHER_CLUSTER: process.env.PUSHER_CLUSTER
});

if (!parsedEnv.success) {
    const details = parsedEnv.error.issues
        .map((issue) => `${issue.path.join(".") || "env"}: ${issue.message}`)
        .join("\n");

    throw new Error(`Invalid environment configuration:\n${details}`);
}

if (
    parsedEnv.data.NODE_ENV === "production" &&
    parsedEnv.data.CORS_ORIGIN.length === 0
) {
    throw new Error(
        "Invalid environment configuration:\nCORS_ORIGIN: at least one origin is required in production"
    );
}

export const env = parsedEnv.data;

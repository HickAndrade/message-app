const TEST_ENV = {
    NODE_ENV: "test",
    HOST: "127.0.0.1",
    PORT: "4001",
    CORS_ORIGIN: "http://localhost:3000",
    DATABASE_URL: "mongodb+srv://test:test@messageapp.example.mongodb.net/message-app-test",
    JWT_SECRET: "test-jwt-secret",
    AUTH_COOKIE_NAME: "message_app_token",
    AUTH_TOKEN_TTL: "7d",
    PUSHER_APP_ID: "test-app-id",
    PUSHER_APP_KEY: "test-app-key",
    PUSHER_SECRET: "test-app-secret",
    PUSHER_CLUSTER: "sa1"
} as const;

export const TEST_AUTH_COOKIE_NAME = TEST_ENV.AUTH_COOKIE_NAME;

export function applyTestEnv(overrides: Partial<Record<keyof typeof TEST_ENV, string>> = {}) {
    Object.assign(process.env, TEST_ENV, overrides);
}

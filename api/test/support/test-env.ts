const TEST_ENV = {
    NODE_ENV: "test",
    HOST: "127.0.0.1",
    PORT: "4001",
    CORS_ORIGIN: "http://localhost:3000",
    DATABASE_URL: "mongodb+srv://test:test@messageapp.example.mongodb.net/message-app-test",
    PUSHER_APP_ID: "test-app-id",
    PUSHER_APP_KEY: "test-app-key",
    PUSHER_SECRET: "test-app-secret",
    PUSHER_CLUSTER: "sa1"
} as const;

export function applyTestEnv(overrides: Partial<Record<keyof typeof TEST_ENV, string>> = {}) {
    Object.assign(process.env, TEST_ENV, overrides);
}

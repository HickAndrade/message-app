import { buildApp } from "./app";
import { env } from "./config/env";

const SHUTDOWN_SIGNALS = ["SIGINT", "SIGTERM"] as const;
const FORCE_SHUTDOWN_TIMEOUT_MS = 10_000;

async function start() {
    const app = buildApp();
    let isShuttingDown = false;

    const shutdown = async (signal: string, exitCode = 0) => {
        if (isShuttingDown) {
            return;
        }

        isShuttingDown = true;
        app.log.info({ signal }, "Shutting down API");

        const forceShutdownTimer = setTimeout(() => {
            app.log.error({ signal }, "Forced shutdown after timeout");
            process.exit(1);
        }, FORCE_SHUTDOWN_TIMEOUT_MS);

        forceShutdownTimer.unref();
        try {
            await app.close();
            clearTimeout(forceShutdownTimer);

             if (exitCode !== 0) {
                process.exitCode = exitCode;
            }
        } catch (error) {
            clearTimeout(forceShutdownTimer);
            app.log.error(error, "Error while shutting down API");
            process.exit(1);
        }
    };

    for (const signal of SHUTDOWN_SIGNALS) {
        process.on(signal, () => {
            void shutdown(signal);
        });
    }

    process.on("uncaughtException", (error) => {
        app.log.error(error, "Uncaught exception");
        void shutdown("uncaughtException", 1);
    });

    process.on("unhandledRejection", (reason) => {
        app.log.error({ err: reason }, "Unhandled rejection");
        void shutdown("unhandledRejection", 1);
    });

    try {
        await app.listen({
            port: env.PORT,
            host: env.HOST
        });
    } catch (error) {
        app.log.error(error);
        process.exit(1);
    }
}

void start();

import type {
    FastifyReply,
    FastifyRequest,
    preHandlerHookHandler
} from "fastify";

type RateLimitBucket = {
    count: number;
    resetAt: number;
};

export type RateLimitPolicy = {
    max: number;
    scope: string;
    windowMs: number;
};

export const RATE_LIMIT_SCOPES = {
    authLogin: "auth.login",
    authRegister: "auth.register",
    conversationsCreate: "conversations.create",
    messagesCreate: "messages.create"
} as const;

export const RATE_LIMIT_POLICIES = {
    authLogin: {
        max: 10,
        scope: RATE_LIMIT_SCOPES.authLogin,
        windowMs: 60_000
    },
    authRegister: {
        max: 5,
        scope: RATE_LIMIT_SCOPES.authRegister,
        windowMs: 60_000
    },
    conversationsCreate: {
        max: 10,
        scope: RATE_LIMIT_SCOPES.conversationsCreate,
        windowMs: 60_000
    },
    messagesCreate: {
        max: 20,
        scope: RATE_LIMIT_SCOPES.messagesCreate,
        windowMs: 10_000
    }
} as const satisfies Record<string, RateLimitPolicy>;

type RateLimitKeyGenerator = (request: FastifyRequest) => string | null | undefined;

function getBucketKey(scope: string, key: string) {
    return `${scope}:${key}`;
}

function sendRateLimitExceeded(reply: FastifyReply, resetAt: number) {
    const retryAfterSeconds = Math.max(1, Math.ceil((resetAt - Date.now()) / 1_000));

    reply
        .header("retry-after", retryAfterSeconds.toString())
        .code(429)
        .send({
            message: "Too many requests"
        });
}

function createRateLimit(
    policy: RateLimitPolicy,
    keyGenerator: RateLimitKeyGenerator
): preHandlerHookHandler {
    const buckets = new Map<string, RateLimitBucket>();

    return async (request, reply) => {
        const key = keyGenerator(request);

        if (!key) {
            return;
        }

        const bucketKey = getBucketKey(policy.scope, key);
        const now = Date.now();
        const existingBucket = buckets.get(bucketKey);

        if (!existingBucket || existingBucket.resetAt <= now) {
            buckets.set(bucketKey, {
                count: 1,
                resetAt: now + policy.windowMs
            });
            return;
        }

        if (existingBucket.count >= policy.max) {
            request.log.warn({
                max: policy.max,
                rateLimitKey: key,
                resetAt: new Date(existingBucket.resetAt),
                scope: policy.scope,
                windowMs: policy.windowMs
            }, "Rate limit exceeded");

            sendRateLimitExceeded(reply, existingBucket.resetAt);
            return;
        }

        existingBucket.count += 1;
    };
}

export function createIpRateLimit(policy: RateLimitPolicy) {
    return createRateLimit(policy, (request) => request.ip);
}

export function createAuthenticatedUserRateLimit(policy: RateLimitPolicy) {
    return createRateLimit(policy, (request) => request.currentUser?.id ?? request.ip);
}

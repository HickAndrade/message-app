import type { FastifyReply, FastifyRequest } from "fastify";
import type { ZodTypeAny } from "zod";

type RequestPart = "body" | "params";

export function validateRequestPart(
    part: RequestPart,
    schema: ZodTypeAny,
    errorMessage = "Validation error"
) {
    return async function (request: FastifyRequest, reply: FastifyReply) {
        const result = schema.safeParse(request[part]);

        if (!result.success) {
            return reply.code(400).send({
                message: errorMessage,
                errors: result.error.flatten().fieldErrors
            });
        }

        request[part] = result.data;
    };
}

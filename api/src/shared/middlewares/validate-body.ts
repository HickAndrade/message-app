import type { FastifyReply, FastifyRequest } from "fastify";
import type { ZodTypeAny } from "zod";

export function validateBody(schema: ZodTypeAny, errorMessage = "Validation error") {
    return async function (request: FastifyRequest, reply: FastifyReply) {
        const result = schema.safeParse(request.body);

        if (!result.success) {
            return reply.code(400).send({
                message: errorMessage,
                errors: result.error.flatten().fieldErrors
            });
        }

        request.body = result.data;
    };
}

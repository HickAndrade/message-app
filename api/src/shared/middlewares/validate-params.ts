import type { ZodTypeAny } from "zod";

import { validateRequestPart } from "./validate-request-part";

export function validateParams(schema: ZodTypeAny, errorMessage = "Validation error") {
    return validateRequestPart("params", schema, errorMessage);
}

import type { ZodTypeAny } from "zod";

import { validateRequestPart } from "./validate-request-part";

export function validateBody(schema: ZodTypeAny, errorMessage = "Validation error") {
    return validateRequestPart("body", schema, errorMessage);
}

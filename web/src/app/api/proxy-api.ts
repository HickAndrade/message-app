import { NextResponse } from "next/server";
import { apiFetch } from "../actions/api-client";

const MUTATING_METHODS = new Set(["DELETE", "PATCH", "POST", "PUT"]);

function validateSameOrigin(request: Request) {
    const origin = request.headers.get("origin");

    if (!origin) {
        return null;
    }

    const expectedOrigin = new URL(request.url).origin;

    if (origin === expectedOrigin) {
        return null;
    }

    return NextResponse.json({
        message: "Forbidden"
    }, {
        status: 403
    });
}

export async function proxyApiResponse(
    path: string,
    init: RequestInit = {},
    request?: Request
) {
    const method = (init.method ?? request?.method ?? "GET").toUpperCase();

    if (request && MUTATING_METHODS.has(method)) {
        const invalidOriginResponse = validateSameOrigin(request);

        if (invalidOriginResponse) {
            return invalidOriginResponse;
        }
    }

    const response = await apiFetch(path, init);
    const headers = new Headers(response.headers);

    const responseHeaders = response.headers as Headers & {
        getSetCookie?: () => string[];
    };
    
    if (typeof responseHeaders.getSetCookie === "function") {
        headers.delete("set-cookie");
        
        for (const cookie of responseHeaders.getSetCookie()) {
            headers.append("set-cookie", cookie);
        }
    }
    
    return new NextResponse(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
    });
}

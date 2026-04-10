import { NextResponse } from "next/server";

import { apiFetch } from "../actions/api-client";

export async function proxyApiResponse(path: string, init: RequestInit = {}) {
    const response = await apiFetch(path, init);
    const body = await response.text();
    const headers = new Headers();
    const contentType = response.headers.get("content-type");
    const responseHeaders = response.headers as Headers & {
        getSetCookie?: () => string[];
    };
    const setCookieHeaders = typeof responseHeaders.getSetCookie === "function"
        ? responseHeaders.getSetCookie()
        : [];

    if (contentType) {
        headers.set("content-type", contentType);
    }

    for (const setCookieHeader of setCookieHeaders) {
        headers.append("set-cookie", setCookieHeader);
    }

    if (setCookieHeaders.length === 0) {
        const setCookieHeader = response.headers.get("set-cookie");

        if (setCookieHeader) {
            headers.append("set-cookie", setCookieHeader);
        }
    }

    return new NextResponse(body, {
        status: response.status,
        headers
    });
}

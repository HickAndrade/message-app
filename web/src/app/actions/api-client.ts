import { headers } from "next/headers";

import { buildApiUrl } from "./api-url";

async function buildHeaders(headersInit?: HeadersInit) {
    const normalizedHeaders = new Headers(headersInit);
    const requestHeaders = await headers();
    const cookie = requestHeaders.get("cookie");

    if (cookie && !normalizedHeaders.has("cookie")) {
        normalizedHeaders.set("cookie", cookie);
    }

    return normalizedHeaders;
}

export async function apiFetch(path: string, init: RequestInit = {}) {
    const requestHeaders = await buildHeaders(init.headers);

    if (init.body && !requestHeaders.has("content-type")) {
        requestHeaders.set("content-type", "application/json");
    }

    return fetch(buildApiUrl(path), {
        ...init,
        cache: "no-store",
        headers: requestHeaders
    });
}

export async function apiJson<T>(path: string, init: RequestInit = {}) {
    try {
        const response = await apiFetch(path, init);

        if (!response.ok || response.status === 204) {
            return null;
        }

        return (await response.json()) as T;
    } catch (_error) {
        return null;
    }
}

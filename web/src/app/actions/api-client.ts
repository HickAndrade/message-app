import getSession from "./getSession";

const DEFAULT_API_URL = "http://localhost:4000";

function normalizeBaseUrl(baseUrl: string) {
    return baseUrl.replace(/\/+$/, "");
}

function normalizePath(path: string) {
    return path.startsWith("/") ? path : `/${path}`;
}

function buildHeaders(headers?: HeadersInit, userEmail?: string | null) {
    const normalizedHeaders = new Headers(headers);

    if (userEmail) {
        normalizedHeaders.set("x-user-email", userEmail);
    }

    return normalizedHeaders;
}

export function getApiBaseUrl() {
    return normalizeBaseUrl(process.env.API_URL ?? DEFAULT_API_URL);
}

export function buildApiUrl(path: string) {
    return `${getApiBaseUrl()}${normalizePath(path)}`;
}

export async function getSessionEmail() {
    const session = await getSession();

    return session?.user?.email ?? null;
}

export async function apiFetch(path: string, init: RequestInit = {}, userEmail?: string | null) {
    const headers = buildHeaders(init.headers, userEmail);

    if (init.body && !headers.has("content-type")) {
        headers.set("content-type", "application/json");
    }

    return fetch(buildApiUrl(path), {
        ...init,
        cache: "no-store",
        headers
    });
}

export async function apiJson<T>(path: string, init: RequestInit = {}, userEmail?: string | null) {
    try {
        const response = await apiFetch(path, init, userEmail);

        if (!response.ok) {
            return null;
        }

        if (response.status === 204) {
            return null;
        }

        return (await response.json()) as T;
    } catch (error) {
        return null;
    }
}

const DEFAULT_API_URL = "http://127.0.0.1:4000";
const DEFAULT_PUBLIC_API_URL = "http://localhost:4000";

function normalizeBaseUrl(baseUrl: string) {
    return baseUrl.replace(/\/+$/, "");
}

function normalizePath(path: string) {
    return path.startsWith("/") ? path : `/${path}`;
}

export function getApiBaseUrl() {
    const apiUrl = process.env.API_URL;

    if (!apiUrl) {
        if (process.env.NODE_ENV === "production") {
            throw new Error("API_URL is required in production");
        }

        return normalizeBaseUrl(DEFAULT_API_URL);
    }

    return normalizeBaseUrl(apiUrl);
}

export function getPublicApiBaseUrl() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    if (!apiUrl) {
        if (process.env.NODE_ENV === "production") {
            throw new Error("NEXT_PUBLIC_API_URL is required in production");
        }

        return normalizeBaseUrl(DEFAULT_PUBLIC_API_URL);
    }

    return normalizeBaseUrl(apiUrl);
}

export function buildApiUrl(path: string) {
    return `${getApiBaseUrl()}${normalizePath(path)}`;
}

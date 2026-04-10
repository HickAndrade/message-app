const DEFAULT_API_URL = "http://127.0.0.1:4000";

function normalizeBaseUrl(baseUrl: string) {
    return baseUrl.replace(/\/+$/, "");
}

function normalizePath(path: string) {
    return path.startsWith("/") ? path : `/${path}`;
}

export function getApiBaseUrl() {
    return normalizeBaseUrl(process.env.API_URL ?? DEFAULT_API_URL);
}

export function buildApiUrl(path: string) {
    return `${getApiBaseUrl()}${normalizePath(path)}`;
}

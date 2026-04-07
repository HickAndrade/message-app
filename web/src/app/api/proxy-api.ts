import { NextResponse } from "next/server";

import { apiFetch } from "../actions/api-client";

export async function proxyApiResponse(path: string, init: RequestInit = {}, userEmail?: string | null) {
    const response = await apiFetch(path, init, userEmail);
    const body = await response.text();
    const headers = new Headers();
    const contentType = response.headers.get("content-type");

    if (contentType) {
        headers.set("content-type", contentType);
    }

    return new NextResponse(body, {
        status: response.status,
        headers
    });
}

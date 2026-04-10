import { NextResponse } from "next/server";
import { apiFetch } from "../actions/api-client";

export async function proxyApiResponse(path: string, init: RequestInit = {}) {
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
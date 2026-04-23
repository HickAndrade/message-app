import { apiFetch } from "@/app/services/api/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const body = await request.text();
        const contentType = request.headers.get("content-type");
        const response = await apiFetch("/pusher/auth", {
            method: "POST",
            body,
            headers: contentType ? { "content-type": contentType } : undefined
        });

        return new NextResponse(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: response.headers
        });
    } catch (_error) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}

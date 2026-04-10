import { proxyApiResponse } from "@/app/api/proxy-api";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const body = await request.text();
        const contentType = request.headers.get("content-type");

        return await proxyApiResponse("/pusher/auth", {
            method: "POST",
            body,
            headers: contentType ? { "content-type": contentType } : undefined
        });
    } catch (_error) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}

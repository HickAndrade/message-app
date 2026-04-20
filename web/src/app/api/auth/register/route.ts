import { proxyApiResponse } from "@/app/api/proxy-api";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const body = await request.text();

        return await proxyApiResponse("/auth/register", {
            method: "POST",
            body
        }, request);
    } catch (_error) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}

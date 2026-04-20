import { proxyApiResponse } from "@/app/api/proxy-api";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        return await proxyApiResponse("/auth/logout", {
            method: "POST"
        }, request);
    } catch (_error) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}

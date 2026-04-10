import { proxyApiResponse } from "@/app/api/proxy-api";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        return await proxyApiResponse("/auth/me", {
            method: "GET"
        });
    } catch (_error) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}

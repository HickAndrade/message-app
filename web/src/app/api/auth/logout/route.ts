import { proxyApiResponse } from "@/app/api/proxy-api";
import { NextResponse } from "next/server";

export async function POST() {
    try {
        return await proxyApiResponse("/auth/logout", {
            method: "POST"
        });
    } catch (_error) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}

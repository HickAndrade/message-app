import { proxyApiResponse } from "@/app/api/proxy-api";
import { NextResponse } from "next/server";


export async function POST(request: Request){
    try {
        const body = await request.text();

        return await proxyApiResponse("/users/settings", {
            method: "POST",
            body
        }, request);

    } catch (error: any) {
        console.log(error, 'ERROR_SETTINGS');
        return new NextResponse('Internal Error', { status: 500 })
    }
}

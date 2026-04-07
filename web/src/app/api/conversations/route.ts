import { getSessionEmail } from "@/app/actions/api-client";
import { proxyApiResponse } from "@/app/api/proxy-api";
import { NextResponse } from "next/server";

export async function POST(request: Request) {

    try {
        const email = await getSessionEmail();
    
        if(!email) {
            return new NextResponse('Não Autorizado', { status: 401 })
        }

        const body = await request.text();

        return await proxyApiResponse("/conversations", {
            method: "POST",
            body
        }, email);

    } catch (error: any) {
        return new NextResponse('Internal Error', { status: 500 })
    }

}

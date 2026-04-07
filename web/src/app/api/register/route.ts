import { proxyApiResponse } from "@/app/api/proxy-api";
import { NextResponse } from 'next/server';

export async function POST(request: Request){
    try {
        const body = await request.text();

        return await proxyApiResponse("/register", {
            method: "POST",
            body
        });

    } catch (error: any) {
        console.log(error, 'REGISTRATION_ERROR');
        return new NextResponse('Internal Error ', { status: 500 });
    }
}

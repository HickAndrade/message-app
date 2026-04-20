import { proxyApiResponse } from "@/app/api/proxy-api";
import { NextResponse } from "next/server";

export async function POST(
    request: Request, 
    { params }: { params: Promise<{ conversationId: string }> }){
    try {
        const { conversationId } = await params;

        return await proxyApiResponse(`/conversations/${conversationId}/seen`, {
            method: "POST"
        }, request);

    } catch (error: any) {
        console.log(error, 'ERROR_MESSAGES_SEEN');
        return new NextResponse('Internal Error', { status: 500 })
    }
}

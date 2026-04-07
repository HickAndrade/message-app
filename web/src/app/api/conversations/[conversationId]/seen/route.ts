import { getSessionEmail } from "@/app/actions/api-client";
import { proxyApiResponse } from "@/app/api/proxy-api";
import { NextResponse } from "next/server";

export async function POST(
    _request: Request, 
    { params }: { params: Promise<{ conversationId: string }> }){
    try {
        const { conversationId } = await params;
        const email = await getSessionEmail();

        if (!email) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        return await proxyApiResponse(`/conversations/${conversationId}/seen`, {
            method: "POST"
        }, email);

    } catch (error: any) {
        console.log(error, 'ERROR_MESSAGES_SEEN');
        return new NextResponse('Internal Error', { status: 500 })
    }
}

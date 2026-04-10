import { proxyApiResponse } from "@/app/api/proxy-api";
import { NextResponse } from "next/server";

export async function DELETE(
    _request: Request, 
    { params }: { params: Promise<{ conversationId: string }> }
    ) {
    try {
        const { conversationId } = await params;

        return await proxyApiResponse(`/conversations/${conversationId}`, {
            method: "DELETE"
        })

    } catch (error: any) {
        console.log(error, 'ERROR_CONVERSATION_DELETE')
        return new NextResponse('Internal Error', { status: 500 });
    }
}

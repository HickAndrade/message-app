import { FullConversationType } from "@/app/types";

import { apiJson } from "./api-client";

const getConversationById = async(conversationId: string): Promise<FullConversationType | null> => {
    try {
        return await apiJson<FullConversationType>(`/conversations/${conversationId}`, {
            method: "GET"
        });

    } catch (_error: any) {
        return null;
    }
}

export default getConversationById;

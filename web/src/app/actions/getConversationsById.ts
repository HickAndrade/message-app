import { FullConversationType } from "@/app/types";

import { apiJson, getSessionEmail } from "./api-client";

const getConversationById = async(conversationId: string): Promise<FullConversationType | null> => {
    try {
        const email = await getSessionEmail();

        if(!email){
            return null
        }

        return await apiJson<FullConversationType>(`/conversations/${conversationId}`, {
            method: "GET"
        }, email);

    } catch (error: any) {
        return null;
    }
}

export default getConversationById;

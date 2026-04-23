import { FullMessageType } from "@/app/types";

import { apiJson } from "../services/api/server";

const getMessages = async(conversationId: string): Promise<FullMessageType[]> =>{
    try {
        const messages = await apiJson<FullMessageType[]>(`/conversations/${conversationId}/messages`, {
            method: "GET"
        });

        return messages ?? [];


    } catch (_error) {
        return [];
    }
}

export default getMessages;

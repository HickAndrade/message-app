import { FullMessageType } from "@/app/types";

import { apiJson, getSessionEmail } from "./api-client";

const getMessages = async(conversationId: string): Promise<FullMessageType[]> =>{
    try {
        const email = await getSessionEmail();

        if(!email) {
            return [];
        }

        const messages = await apiJson<FullMessageType[]>(`/conversations/${conversationId}/messages`, {
            method: "GET"
        }, email);

        return messages ?? [];


    } catch (error) {
        return [];
    }
}

export default getMessages;

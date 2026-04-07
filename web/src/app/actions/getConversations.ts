import { FullConversationType } from "@/app/types";

import { apiJson, getSessionEmail } from "./api-client"

const getConversations = async(): Promise<FullConversationType[]> => {
    const email = await getSessionEmail();

    if(!email){
        return [];
    }

    try {
        const conversations = await apiJson<FullConversationType[]>("/conversations", {
            method: "GET"
        }, email);

        return conversations ?? [];

    } catch (error: any) {
        return [];
    }

}

export default getConversations;

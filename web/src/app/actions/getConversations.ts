import { FullConversationType } from "@/app/types";

import { apiJson } from "./api-client"

const getConversations = async(): Promise<FullConversationType[]> => {
    try {
        const conversations = await apiJson<FullConversationType[]>("/conversations", {
            method: "GET"
        });

        return conversations ?? [];

    } catch (_error: any) {
        return [];
    }

}

export default getConversations;

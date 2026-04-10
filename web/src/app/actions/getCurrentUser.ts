import { User } from "@prisma/client";

import { apiJson } from "./api-client";

const getCurrentUser = async(): Promise<User | null> => {
    try {
        return await apiJson<User>("/auth/me", {
            method: "GET"
        });

    } catch (_error: any) {
        return null;
    }
}

export default getCurrentUser;

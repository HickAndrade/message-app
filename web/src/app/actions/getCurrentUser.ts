import { User } from "@prisma/client";

import { apiJson, getSessionEmail } from "./api-client";

const getCurrentUser = async(): Promise<User | null> => {
    try {
        const email = await getSessionEmail();

        if(!email){
            return null;
        }

        return await apiJson<User>("/users/me", {
            method: "GET"
        }, email);

    } catch (error: any) {
        return null;
    }
}

export default getCurrentUser;

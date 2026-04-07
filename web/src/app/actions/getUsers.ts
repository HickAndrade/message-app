import { User } from "@prisma/client";

import { apiJson, getSessionEmail } from "./api-client";

const getUsers = async (): Promise<User[]> => {
    const email = await getSessionEmail();

    if(!email) {
        return [];
    }

    try {
        const users = await apiJson<User[]>("/users", {
            method: "GET"
        }, email);

        return users ?? [];

    } catch (error: any) {
        return [];
    }
}

export default getUsers;

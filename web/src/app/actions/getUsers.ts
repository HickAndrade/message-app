import { User } from "@prisma/client";

import { apiJson } from "./api-client";

const getUsers = async (): Promise<User[]> => {
    try {
        const users = await apiJson<User[]>("/users", {
            method: "GET"
        });

        return users ?? [];

    } catch (_error: any) {
        return [];
    }
}

export default getUsers;

import type { User } from "@/app/types";

import { apiJson } from "../services/api/server";

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

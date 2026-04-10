import type { User } from "@prisma/client";

import type { CreateUserInput, UpdateUserProfileInput } from "./repositories/users.repository";
import { UsersRepository } from "./repositories/users.repository";

export type PublicUser = Omit<User, "hashedPassword">;

function toPublicUser(user: User): PublicUser {
    const { hashedPassword: _hashedPassword, ...publicUser } = user;
    return publicUser;
}

export class UsersService {
    constructor(private readonly repository: UsersRepository) {}

    async create(data: CreateUserInput) {
        return this.repository.create(data);
    }

    async findByEmail(email: string) {
        return this.repository.findByEmail(email);
    }

    async findById(id: string) {
        return this.repository.findById(id);
    }

    async listUsers(excludeEmail: string) {
        const users = await this.repository.listExceptEmail(excludeEmail);
        return users.map(toPublicUser);
    }

    async updateSettings(userId: string, data: UpdateUserProfileInput) {
        const user = await this.repository.updateProfile(userId, {
            image: data.image?.trim() || undefined,
            name: data.name?.trim() || undefined
        });

        return toPublicUser(user);
    }

    toPublicUser(user: User) {
        return toPublicUser(user);
    }
}

import type { StoredUserRecord, UsersRepository } from "./repositories/users.repository";
import type { CreateUserInput, UpdateUserProfileInput } from "./users.types";

export type StoredUser = StoredUserRecord;
export type PublicUser = Omit<StoredUser, "hashedPassword">;

function toPublicUser(user: StoredUser): PublicUser {
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

    toPublicUser(user: StoredUser) {
        return toPublicUser(user);
    }
}

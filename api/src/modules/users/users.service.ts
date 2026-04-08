import type { CreateUserInput, UpdateUserProfileInput } from "./repositories/users.repository";
import { UsersRepository } from "./repositories/users.repository";

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
        return this.repository.listExceptEmail(excludeEmail);
    }

    async updateSettings(userId: string, data: UpdateUserProfileInput) {
        return this.repository.updateProfile(userId, {
            image: data.image?.trim() || undefined,
            name: data.name?.trim() || undefined
        });
    }
}

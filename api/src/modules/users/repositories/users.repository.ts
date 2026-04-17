import type { PrismaClient, User as PrismaUserRecord } from "@prisma/client";

import type { CreateUserInput, UpdateUserProfileInput } from "../users.types";

export interface UsersRepository {
    create(data: CreateUserInput): Promise<StoredUserRecord>;
    findByEmail(email: string): Promise<StoredUserRecord | null>;
    findById(id: string): Promise<StoredUserRecord | null>;
    listExceptEmail(email: string): Promise<StoredUserRecord[]>;
    updateProfile(userId: string, data: UpdateUserProfileInput): Promise<StoredUserRecord>;
}

export class PrismaUsersRepository implements UsersRepository {
    constructor(private readonly prisma: PrismaClient) {}

    async create(data: CreateUserInput) {
        return this.prisma.user.create({
            data
        });
    }

    async findByEmail(email: string) {
        return this.prisma.user.findUnique({
            where: {
                email
            }
        });
    }

    async findById(id: string) {
        return this.prisma.user.findUnique({
            where: {
                id
            }
        });
    }

    async listExceptEmail(email: string) {
        return this.prisma.user.findMany({
            orderBy: {
                createdAt: "desc"
            },
            where: {
                NOT: {
                    email
                }
            }
        });
    }

    async updateProfile(userId: string, data: UpdateUserProfileInput) {
        return this.prisma.user.update({
            where: {
                id: userId
            },
            data
        });
    }
}

export type StoredUserRecord = PrismaUserRecord;

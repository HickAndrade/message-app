import type { PrismaClient } from "@prisma/client";

export interface CreateUserInput {
    email: string;
    hashedPassword: string;
    name: string;
}

export interface UpdateUserProfileInput {
    image?: string;
    name?: string;
}

export class UsersRepository {
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

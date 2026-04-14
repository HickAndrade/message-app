import type { PrismaClient } from "@prisma/client";

type UserRecord = {
    id: string;
    name: string | null;
    email: string;
    emailVerified: Date | null;
    image: string | null;
    hashedPassword: string | null;
    createdAt: Date;
    updatedAt: Date;
    conversationIds: string[];
    seenMessageIds: string[];
};

export function createPrismaMock() {
    const users: UserRecord[] = [];

    const client = {
        user: {
            async findUnique({ where }: { where: { email?: string; id?: string } }) {
                if (where.email) {
                    return users.find((user) => user.email === where.email) ?? null;
                }

                if (where.id) {
                    return users.find((user) => user.id === where.id) ?? null;
                }

                return null;
            },
            async create({ data }: { data: { email: string; hashedPassword: string; name: string } }) {
                const now = new Date();
                const user: UserRecord = {
                    id: `user-${users.length + 1}`,
                    name: data.name,
                    email: data.email,
                    emailVerified: null,
                    image: null,
                    hashedPassword: data.hashedPassword,
                    createdAt: now,
                    updatedAt: now,
                    conversationIds: [],
                    seenMessageIds: []
                };

                users.push(user);

                return user;
            }
        },
        async $disconnect() {
            return undefined;
        }
    } as unknown as PrismaClient;

    return {
        client,
        users
    };
}

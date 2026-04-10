export interface CreateUserInput {
    email: string;
    hashedPassword: string;
    name: string;
}

export interface UpdateUserProfileInput {
    image?: string;
    name?: string;
}

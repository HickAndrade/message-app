import type { User } from "@prisma/client";
import bcrypt from "bcrypt";

import { HttpError } from "../../shared/errors/http-error";
import type { UsersService } from "../users/users.service";
import type { LoginDTO, RegisterDTO } from "./auth.schemas";

export class AuthService {
    constructor(private readonly usersService: UsersService) {}

    async register(data: RegisterDTO) {
        const email = data.email.trim();
        const name = data.name.trim();

        const existingUser = await this.usersService.findByEmail(email);

        if (existingUser) {
            throw new HttpError(400, "This email already registered.");
        }

        const hashedPassword = await bcrypt.hash(data.password, 12);

        const user = await this.usersService.create({
            email,
            name,
            hashedPassword
        });

        return {
            publicUser: this.usersService.toPublicUser(user),
            user
        };
    }

    async login(data: LoginDTO) {
        const email = data.email.trim();
        const user = await this.usersService.findByEmail(email);

        if (!user || !user.hashedPassword) {
            throw new HttpError(401, "Invalid credentials.");
        }

        const isCorrectPassword = await bcrypt.compare(data.password, user.hashedPassword);

        if (!isCorrectPassword) {
            throw new HttpError(401, "Invalid credentials.");
        }

        return {
            publicUser: this.usersService.toPublicUser(user),
            user
        };
    }

    getCurrentUser(user: User) {
        return this.usersService.toPublicUser(user);
    }
}

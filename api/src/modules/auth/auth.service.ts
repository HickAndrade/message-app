import bcrypt from "bcrypt";

import { HttpError } from "../../shared/errors/http-error";
import type { UsersService } from "../users/users.service";
import type { RegisterDTO } from "./auth.schemas";

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

        return this.usersService.create({
            email,
            name,
            hashedPassword
        });
    }
}

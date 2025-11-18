import { Request, Response } from "express";
import { UserService } from "../services/userService";

export class UserController {
    constructor(private readonly userService: UserService) {}

    async create(req: Request, res: Response) {
        try {
            await this.userService.createUser(req.body);
            res.status(201).json({ message: "User created" });
        } catch (err) {
            res.status(500).json({ message: "Failed to create user" });
        }
    }

    async findAll(req: Request, res: Response) {
        try {
            const users = await this.userService.getAllUsers();
            res.json(users);
        } catch {
            res.status(500).json({ message: "Failed to get users" });
        }
    }

    async findOne(req: Request, res: Response) {
        try {
            const id = Number(req.params.userId);
            const user = await this.userService.getUserById(id);

            if (!user) return res.status(404).json({ message: "User not found" });

            res.json(user);
        } catch {
            res.status(500).json({ message: "Failed to fetch user" });
        }
    }

    async patchUpdate(req: Request, res: Response) {
        try {
            const id = Number(req.params.userId);
            const result = await this.userService.updateUser(id, req.body);

            if (!result) return res.status(404).json({ message: "User not found" });

            res.json(result);
        } catch {
            res.status(500).json({ message: "Failed to update user" });
        }
    }

    async putUpdate(req: Request, res: Response) {
        try {
            const id = Number(req.params.userId);
            const existingUser = await this.userService.getUserById(id);

            if (!existingUser) {
                const createdUser = await this.userService.createUser({ id, ...req.body });
                return res.status(201).json({
                    message: "User created",
                    user: createdUser
                });
            }

            const updatedUser = await this.userService.updateUser(id, req.body);

            return res.json({
                message: "User updated",
                user: updatedUser
            });

        } catch (err) {
            res.status(500).json({ message: "Failed to update or create user", error: err });
        }
    }

    async delete(req: Request, res: Response) {
        try {
            const id = Number(req.params.userId);
            const deleted = await this.userService.deleteUser(id);

            if (!deleted) return res.status(404).json({ message: "User not found" });

            res.json({ message: "User deleted" });
        } catch {
            res.status(500).json({ message: "Failed to delete user" });
        }
    }
}
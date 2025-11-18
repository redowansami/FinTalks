import { Request, Response } from "express";
import { UserService } from "../services/userService";
import { UserRepository } from "../repositories/userRepository";

const userService = new UserService(new UserRepository());

export class UserController {
    static async create(req: Request, res: Response) {
    try {
        const user = await userService.createUser(req.body);
        res.status(201).json({ message : "User created"});
    } catch {
        res.status(500).json({ message: "Failed to create user" });
    }
    }

    static async findAll(req: Request, res: Response) {
    try {
        const users = await userService.getAllUsers();
        res.json(users);
    } catch {
        res.status(500).json({ message: "Failed to get users" });
    }
    }

    static async findOne(req: Request, res: Response) {
    try {
        const id = Number(req.params.userId);
        const user = await userService.getUserById(id);

        if (!user) return res.status(404).json({ message: "User not found" });

        res.json(user);
    } catch {
        res.status(500).json({ message: "Failed to fetch user" });
    }
    }

    static async patchUpdate(req: Request, res: Response) {
        try {
            const id = Number(req.params.userId);
            const updated = await userService.updateUser(id, req.body);
            if (!updated) return res.status(404).json({ message: "User not found" });
            res.json(updated);
        } catch (err) {
            res.status(500).json({ message: "Failed to update user", error: err });
        }
    }

    static async putUpdate(req: Request, res: Response) {
    try {
        const id = Number(req.params.userId);
        const existingUser = await userService.getUserById(id);

        if (!existingUser) {
            const createdUser = await userService.createUser({ id, ...req.body });
            return res.status(201).json({
                message: "User created",
                user: createdUser
            });
        }

        const updatedUser = await userService.updateUser(id, req.body);

        return res.json({
            message: "User updated",
            user: updatedUser
        });

    } catch (err) {
        res.status(500).json({ message: "Failed to update or create user", error: err });
    }
}

    static async delete(req: Request, res: Response) {
    try {
        const id = Number(req.params.userId);
        const deleted = await userService.deleteUser(id);

        if (!deleted) return res.status(404).json({ message: "User not found" });

        res.json({ message: "User deleted" });
    } catch {
        res.status(500).json({ message: "Failed to delete user" });
    }
    }
}
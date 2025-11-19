import { UserRepository } from '../repositories/userRepository';
import { UserService } from '../services/userService';
import { UserController } from '../controllers/userController';

const userRepository = new UserRepository();
const userService = new UserService(userRepository);
export const userController = new UserController(userService);

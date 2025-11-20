import { UserRole } from '../entities/userEntity';

export class CreateUserDTO {
	username: string;
	name: string;
	email: string;
	role?: UserRole;
}

export class UpdateUserDTO {
	username?: string;
	name?: string;
	email?: string;
	role?: UserRole;
}

export class UserResponseDTO {
	id: string;
	username: string;
	name: string;
	email: string;
	joinDate: Date;
	role: UserRole;
}

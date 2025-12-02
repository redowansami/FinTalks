import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	DeleteDateColumn,
} from 'typeorm';
import { LENTGH_CONSTRAINTS } from '../constants/validationConstants';

export enum UserRole {
	ADMIN = 'ADMIN',
	USER = 'USER',
}

@Entity({ name: 'users' })
export class User {
	@PrimaryGeneratedColumn('uuid')
	userId: string;

	@Column({ type: 'varchar', unique: true, length: LENTGH_CONSTRAINTS.USERNAME_MAX })
	username: string;

	@Column({ type: 'varchar', length: LENTGH_CONSTRAINTS.NAME_MAX })
	name: string;

	@Column({ type: 'varchar', unique: true, length: LENTGH_CONSTRAINTS.EMAIL_MAX })
	email: string;

	@CreateDateColumn({ type: 'timestamp' })
	joinDate: Date;

	@Column({
		type: 'enum',
		enum: UserRole,
		default: UserRole.USER,
	})
	role: UserRole;

	@DeleteDateColumn({ type: 'timestamp', nullable: true })
	deletedAt: Date | null;
}

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

	@Column({ type: 'boolean', default: false })
	isEmailConfirmed: boolean;

	@Column({ type: 'text', nullable: true })
	bio: string | null;

	@Column({ type: 'varchar', length: 500, nullable: true })
	profilePictureUrl: string | null;

	@DeleteDateColumn({ type: 'timestamp', nullable: true })
	deletedAt: Date | null;
}

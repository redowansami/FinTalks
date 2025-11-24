import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	DeleteDateColumn,
} from 'typeorm';

export enum UserRole {
	ADMIN = 'ADMIN',
	USER = 'USER',
}

@Entity({ name: 'users' })
export class User {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({ unique: true })
	username: string;

	@Column()
	name: string;

	@Column({ unique: true })
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

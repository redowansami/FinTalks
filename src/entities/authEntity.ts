import { Entity, Column, OneToOne, JoinColumn, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './userEntity';

@Entity()
export class Auth {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	username: string;

	@Column()
	email: string;

	@Column()
	password: string;

	@OneToOne(() => User, {
		onDelete: 'CASCADE',
		onUpdate: 'CASCADE',
	})
	@JoinColumn([
		{ name: 'username', referencedColumnName: 'username' },
		{ name: 'email', referencedColumnName: 'email' },
	])
	user: User;
}

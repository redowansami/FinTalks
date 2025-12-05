import { Entity, Column, OneToOne, JoinColumn, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './userEntity';

@Entity()
export class Auth {
	@PrimaryGeneratedColumn('uuid')
	authId: string;

	@Column({ type: 'varchar' })
	hashedPassword: string;

	@Column({ type: 'timestamp', nullable: true })
	passwordLastModificationTime: Date;

	@OneToOne(() => User, {
		onDelete: 'CASCADE',
	})
	@JoinColumn({ name: 'userId', referencedColumnName: 'userId' })
	userByUserId: User;
}

import { Entity, Column, OneToOne, JoinColumn, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './userEntity';
import { LENTGH_CONSTRAINTS } from '../constants/constants';

@Entity()
export class Auth {
	@PrimaryGeneratedColumn('uuid')
	authId: string;

	@Column({ length: LENTGH_CONSTRAINTS.PASSWORD_MAX })
	password: string;

	@Column({ type: 'timestamp', nullable: true })
	passwordLastModificationTime: Date;

	@OneToOne(() => User, {
		onDelete: 'CASCADE',
	})
	@JoinColumn({ name: 'userId', referencedColumnName: 'userId' })
	user: User;
}

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

	@Column({ type: 'varchar', nullable: true })
	passwordChangeCode: string | null;

	@Column({ type: 'timestamp', nullable: true })
	passwordChangeCodeExpiry: Date | null;

	@OneToOne(() => User, {
		onDelete: 'CASCADE',
	})
	@JoinColumn({ name: 'userId', referencedColumnName: 'userId' })
	userByUserId: User;
}

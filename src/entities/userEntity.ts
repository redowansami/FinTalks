import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    OneToOne,
	Unique,
  DeleteDateColumn,
} from 'typeorm';

export enum UserRole {
	ADMIN = 'ADMIN',
	USER = 'USER',
}

@Entity({ name: 'users' })
@Unique(['username', 'email'])
export class User {
    @PrimaryGeneratedColumn()
    id: number;

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

    @Column({ type: 'timestamp', nullable: true })
    passwordLastModificationTime: Date;

    @DeleteDateColumn({ type: "timestamp", nullable: true })
    deletedAt: Date|null;
}
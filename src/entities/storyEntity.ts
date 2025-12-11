import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	ManyToOne,
	ManyToMany,
	JoinColumn,
	DeleteDateColumn,
} from 'typeorm';
import { User } from './userEntity';
import { Category } from './categoryEntity';
import { LENTGH_CONSTRAINTS } from '../constants/validationConstants';

@Entity('stories')
export class Story {
	@PrimaryGeneratedColumn('uuid')
	storyId: string;

	@Column({ type: 'uuid', nullable: false })
	userId: string;

	@Column({ type: 'varchar', length: LENTGH_CONSTRAINTS.TITLE_MAX })
	title: string;

	@Column({ type: 'varchar', length: LENTGH_CONSTRAINTS.BODY_MAX })
	body: string;

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;

	@DeleteDateColumn({ type: 'timestamp', nullable: true })
	deletedAt: Date | null;

	@Column({ type: 'text', nullable: true })
	summary: string | null;

	@Column({ type: 'smallint', nullable: true })
	reliabilityScore: number | null;

	@Column({ type: 'text', nullable: true })
	predictionComparison: string | null;

	@CreateDateColumn({ nullable: true })
	summaryUpdatedAt: Date | null;

	@ManyToOne(() => User, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'userId' })
	userByUserId: User;

	@ManyToMany(() => Category, (category) => category.stories)
	categories: Category[];
}

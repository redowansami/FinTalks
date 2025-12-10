import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from 'typeorm';
import { Story } from './storyEntity';
import { LENTGH_CONSTRAINTS } from '../constants/validationConstants';

@Entity('categories')
export class Category {
	@PrimaryGeneratedColumn('uuid')
	categoryId: string;

	@Column({ type: 'varchar', length: LENTGH_CONSTRAINTS.NAME_MAX, unique: true })
	name: string;

	@Column({ type: 'varchar', length: LENTGH_CONSTRAINTS.DESCRIPTION_MAX, nullable: true })
	description: string | null;

	@ManyToMany(() => Story, (story) => story.categories)
	@JoinTable({
		name: 'story_category',
		joinColumn: { name: 'categoryId', referencedColumnName: 'categoryId' },
		inverseJoinColumn: { name: 'storyId', referencedColumnName: 'storyId' },
	})
	stories: Story[];
}

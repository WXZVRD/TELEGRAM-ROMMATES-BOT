import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { Account } from '@/module/account/entities/account.entity'
import { Profile } from '@/module/profile/entities/profile.entity'

@Entity('viewed_profiles')
export class ViewedProfile {
	@PrimaryGeneratedColumn()
	id: number

	@ManyToOne(() => Account, { onDelete: 'CASCADE' })
	viewer: Account

	@ManyToOne(() => Profile, { onDelete: 'CASCADE' })
	viewed: Profile

	@Column()
	action: 'liked' | 'skipped'

	@Column()
	date: Date
}

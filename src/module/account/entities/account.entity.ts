import {
	Column,
	Entity,
	JoinColumn,
	OneToOne,
	PrimaryGeneratedColumn
} from 'typeorm'
import { Profile } from '@/module/profile/entities/profile.entity'

@Entity('accounts')
export class Account {
	@PrimaryGeneratedColumn()
	id: number

	@Column({ unique: true, type: 'bigint' })
	telegramId: number

	@Column({ nullable: true })
	username: string

	@Column({ default: true })
	isActive: boolean

	@OneToOne(() => Profile, profile => profile.account, {
		eager: true,
		cascade: true
	})
	@JoinColumn()
	profile: Profile
}

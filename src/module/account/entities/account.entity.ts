import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm'
import { Profile } from '@/module/profile/entities/profile.entity'

@Entity('accounts')
export class Account {
	@PrimaryGeneratedColumn()
	id: number

	@Column({ unique: true })
	telegramId: number

	@Column()
	username: string

	@Column({ default: true })
	isActive: boolean

	@OneToOne(() => Profile, profile => profile.account, { eager: true })
	profile: Profile
}

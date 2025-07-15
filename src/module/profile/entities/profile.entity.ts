import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	OneToOne,
	JoinColumn
} from 'typeorm'
import { Account } from '@/module/account/entities/account.entity'
import { GenderType } from '@/module/profile/types/profile.types'

@Entity('profiles')
export class Profile {
	@PrimaryGeneratedColumn()
	id: number

	@OneToOne(() => Account, account => account.profile)
	account: Account

	@Column()
	name: string

	@Column()
	age: number

	@Column({ type: 'text', nullable: true })
	description: string

	@Column({ type: 'enum', enum: GenderType, nullable: true })
	gender: GenderType

	@Column({ type: 'enum', enum: GenderType, nullable: true })
	preferGender: GenderType

	@Column()
	livingCity: string

	@Column({ nullable: true })
	relocateCity: string

	@Column('text', { array: true, nullable: true })
	photos: string[]

	@Column({ default: true })
	isActive: boolean
}

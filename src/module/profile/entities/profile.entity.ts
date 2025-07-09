import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	OneToOne,
	JoinColumn
} from 'typeorm'
import { Account } from '@/module/account/entities/account.entity'

@Entity('profiles')
export class Profile {
	@PrimaryGeneratedColumn()
	id: number

	@OneToOne(() => Account, account => account.profile)
	@JoinColumn()
	account: Account

	@Column()
	name: string

	@Column()
	age: number

	@Column({ type: 'text', nullable: true })
	description: string

	@Column({ nullable: true })
	gender: string

	@Column({ nullable: true })
	preferGender: string

	@Column()
	livingCity: string

	@Column({ nullable: true })
	relocateCity: string

	@Column()
	purpose: string

	@Column('text', { array: true, nullable: true })
	photos: string[]

	@Column({ default: true })
	isActive: boolean
}

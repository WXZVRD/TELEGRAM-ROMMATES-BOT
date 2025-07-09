import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Account } from '@/module/account/entities/account.entity'
import { Repository } from 'typeorm'

@Injectable()
export class AccountRepository {
	constructor(
		@InjectRepository(Account)
		private readonly repo: Repository<Account>
	) {}

	async findByTelegramId(telegramId: number): Promise<Account | null> {
		return this.repo.findOne({
			where: { telegramId },
			relations: ['profile']
		})
	}

	async create(account: Omit<Account, 'id' | 'profile'>): Promise<Account> {
		return this.repo.create(account)
	}

	async save(account: Account): Promise<Account> {
		return this.repo.save(account)
	}
}

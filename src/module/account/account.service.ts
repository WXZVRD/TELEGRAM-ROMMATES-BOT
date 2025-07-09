import { Injectable, NotFoundException } from '@nestjs/common'
import { AccountRepository } from '@/module/account/account.repository'
import { Account } from '@/module/account/entities/account.entity'
import { User } from 'typegram'

@Injectable()
export class AccountService {
	constructor(private readonly accountRepository: AccountRepository) {}

	async findByTelegramId(telegramId: number): Promise<Account | null> {
		const account: Account =
			await this.accountRepository.findByTelegramId(telegramId)

		if (!account) {
			return null
		}

		return account
	}

	async create(telegramUser: User): Promise<Account> {
		const createdUser = await this.accountRepository.create({
			telegramId: telegramUser.id,
			isActive: true,
			username: telegramUser.username
		})

		return await this.accountRepository.save(createdUser)
	}
}

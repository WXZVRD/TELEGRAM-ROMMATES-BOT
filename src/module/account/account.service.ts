import { Injectable, Logger } from '@nestjs/common'
import { AccountRepository } from '@/module/account/account.repository'
import { Account } from '@/module/account/entities/account.entity'
import { User } from 'typegram'

@Injectable()
export class AccountService {
	private readonly logger = new Logger(AccountService.name)

	constructor(private readonly accountRepository: AccountRepository) {}

	async findByTelegramId(telegramId: number): Promise<Account | null> {
		this.logger.log(`Поиск аккаунта по Telegram ID: ${telegramId}`)

		const account: Account =
			await this.accountRepository.findByTelegramId(telegramId)

		if (!account) {
			this.logger.warn(`Аккаунт с Telegram ID ${telegramId} не найден`)
			return null
		}

		this.logger.log(`Найден аккаунт с ID: ${account.id}`)
		return account
	}

	async create(telegramUser: User): Promise<Account> {
		const safeUsername = telegramUser.username || `tg_${telegramUser.id}`

		this.logger.log(
			`Создание аккаунта для Telegram ID: ${telegramUser.id}, username: ${safeUsername}`
		)

		const createdUser: Account = await this.accountRepository.create({
			telegramId: telegramUser.id,
			isActive: true,
			username: telegramUser.username || null // можно сохранить null в БД
		})

		const savedUser = await this.accountRepository.save(createdUser)
		this.logger.log(`Аккаунт создан и сохранён с ID: ${savedUser.id}`)

		return savedUser
	}

	async saveAccount(account: Account): Promise<Account> {
		this.logger.log(`Сохранение аккаунта ID: ${account.id}`)

		const saved = await this.accountRepository.save(account)
		this.logger.log(`Аккаунт сохранён: ID ${saved.id}`)

		return saved
	}
}

import { Injectable, Logger } from '@nestjs/common'
import { AccountService } from '@/module/account/account.service'
import { BotContext } from '@/module/telegram/types/telegram.context'
import { Account } from '@/module/account/entities/account.entity'
import { Profile } from '@/module/profile/entities/profile.entity'
import { ProfileService } from '@/module/profile/services/profile.service'

@Injectable()
export class UserContextService {
	private readonly logger: Logger = new Logger(UserContextService.name)

	constructor(
		private readonly accountService: AccountService,
		private readonly profileService: ProfileService
	) {}

	async getTelegramId(ctx: BotContext): Promise<number> {
		const telegramId: number = ctx.from?.id
		this.logger.verbose(`📥 Вызван getTelegramId()`)
		this.logger.debug(`✅ Telegram ID: ${telegramId}`)
		return telegramId
	}

	async getAccount(ctx: BotContext): Promise<Account | null> {
		this.logger.verbose(`📥 Вызван getAccount()`)

		if (ctx.session.account) {
			this.logger.log(
				`✅ Аккаунт найден в сессии. Telegram ID: ${ctx.from.id}, Account ID: ${ctx.session.account.id}`
			)
			return ctx.session.account
		}

		this.logger.warn(
			`🔍 Аккаунт не найден в сессии. Telegram ID: ${ctx.from.id}`
		)

		const account: Account = await this.accountService.findByTelegramId(
			ctx.from.id
		)

		if (!account) {
			this.logger.error(
				`❌ Не найден аккаунт в базе. Telegram ID: ${ctx.from.id}`
			)
			return null
		}

		this.logger.log(
			`✅ Аккаунт загружен из базы. Account ID: ${account.id}, Username: ${account.username}, Telegram ID: ${account.telegramId}`
		)

		ctx.session.account = account
		this.logger.log(`💾 Аккаунт сохранён в сессию.`)

		return account
	}

	async getProfile(ctx: BotContext): Promise<Profile> {
		this.logger.verbose(`📥 Вызван getProfile()`)

		if (ctx.session.profile) {
			this.logger.log(
				`✅ Профиль найден в сессии. Telegram ID: ${ctx.from.id}, Profile ID: ${ctx.session.profile.id}`
			)
			return ctx.session.profile
		}

		this.logger.warn(
			`🔍 Профиль не найден в сессии. Загружаем через getAccount(). Telegram ID: ${ctx.from.id}`
		)

		const account: Account = await this.getAccount(ctx)

		if (!account) {
			this.logger.error(
				`❌ Ошибка при получении аккаунта. Telegram ID: ${ctx.from.id}`
			)
			throw new Error('❌ У пользователя нет аккаунта')
		}

		if (!account.profile) {
			this.logger.error(
				`❌ У аккаунта ID ${account.id} отсутствует профиль`
			)
			throw new Error('❌ У пользователя нет профиля')
		}

		ctx.session.profile = account.profile
		this.logger.log(
			`✅ Профиль загружен и сохранён в сессии. Profile ID: ${account.profile.id}`
		)

		return account.profile
	}

	clearSession(ctx: BotContext): void {
		this.logger.verbose(`📥 Вызван clearSession()`)
		this.logger.log(`🧹 Очистка сессии для Telegram ID: ${ctx.from.id}`)
		delete ctx.session.profile
		delete ctx.session.account
		this.logger.log(`✅ Сессия очищена.`)
	}
}

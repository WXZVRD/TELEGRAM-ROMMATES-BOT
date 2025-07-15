import { Action, Ctx, Hears, On, Update } from 'nestjs-telegraf'
import { Injectable, Logger } from '@nestjs/common'
import { Scenes } from 'telegraf'
import { ScenesData } from '@/module/telegram/scenes/scenes.data'
import {
	ActionTitles,
	CallbackActions
} from '@/module/telegram/types/callbackActions.enum'
import { Account } from '@/module/account/entities/account.entity'
import { TelegramProfileRenderer } from '@/module/telegram/ui'
import { MenuManagerService } from '@/module/telegram/modules/menu/menuManager.service'
import { BotContext } from '@/module/telegram/types/telegram.context'
import { ProfileService } from '@/module/profile/services/profile.service'
import { RedisSessionStore } from '@/module/redis/redis.session'
import { Profile } from '@/module/profile/entities/profile.entity'
import { UserContextService } from '@/module/telegram/user.context.service'
import { CallbackQuery } from 'typegram'
import {
	REDIS_KEY_MATCHES_PROFILES,
	REDIS_KEY_PROFILE_ID_SESSION_KEY
} from '@/module/redis/constants'

@Update()
@Injectable()
export class TelegramActions {
	private readonly logger: Logger = new Logger(TelegramActions.name)

	constructor(
		private readonly store: RedisSessionStore<Profile[]>,
		private readonly profileService: ProfileService,
		private readonly menuManagerService: MenuManagerService,
		private readonly userContextService: UserContextService
	) {}

	@Action(CallbackActions.CREATE_PROFILE)
	async onCreateProfile(@Ctx() ctx: Scenes.SceneContext): Promise<void> {
		const telegramId: number = ctx.from?.id
		const username: string = ctx.from?.username || 'unknown'

		this.logger.log(
			`Callback CREATE_PROFILE from @${username} (${telegramId})`
		)

		await ctx.answerCbQuery()
		await ctx.reply('📋 Начинаем создание анкеты...')
		await ctx.scene.enter(ScenesData.CREATE_PROFILE)

		this.logger.log(
			`User @${username} was moved to scene: ${ScenesData.CREATE_PROFILE}`
		)
	}

	@Hears(ActionTitles.FIND_ROOMMATE)
	async findRoommate(@Ctx() ctx: BotContext): Promise<void> {
		const logger: Logger = new Logger('FIND_ROOMMATE')
		logger.log(`Пользователь ${ctx.from.id} инициировал поиск сожителя`)
		await this.menuManagerService.send(ctx, 'FIND_ROOMMATE')
		logger.log(`Отправлено меню FIND_ROOMMATE пользователю ${ctx.from.id}`)

		const account: Account = await this.userContextService.getAccount(ctx)
		logger.log(
			`Получен аккаунт ID: ${account?.id}, профиль ID: ${account.profile?.id}`
		)

		logger.log(
			`Формируется cacheKey: ${REDIS_KEY_MATCHES_PROFILES('MATCHES_PROFILES', ctx.from.id)}`
		)

		let matchesProfiles: Profile[] = await this.store.get(
			REDIS_KEY_MATCHES_PROFILES('MATCHES_PROFILES', ctx.from.id)
		)
		if (!matchesProfiles) {
			logger.log(`Нет кеша для ${ctx.from.id}, загружаю из базы...`)
			matchesProfiles = await this.profileService.findMatchesFor(
				account.profile.id
			)
			logger.log(`Найдено ${matchesProfiles.length} подходящих анкет`)
			await this.store.set(
				REDIS_KEY_MATCHES_PROFILES('MATCHES_PROFILES', ctx.from.id),
				matchesProfiles,
				300
			)
			logger.log(
				`Анкеты сохранены в кеш: ${REDIS_KEY_MATCHES_PROFILES('MATCHES_PROFILES', ctx.from.id)}`
			)
			ctx.session.currentProfileIndex = 0
		} else {
			logger.log(`Кеш найден (${matchesProfiles.length} анкет)`)
		}

		const currentIndex: number = ctx.session.currentProfileIndex || 0
		logger.log(`Текущий индекс профиля в сессии: ${currentIndex}`)

		if (currentIndex >= matchesProfiles.length) {
			logger.log(`Все анкеты просмотрены пользователем ${ctx.from.id}`)
			await ctx.reply('🎉 Все анкеты просмотрены.')
			return
		}

		const matchedOneProfile: Profile = matchesProfiles[currentIndex]
		logger.log(
			`Отправляется анкета ID ${matchedOneProfile.id} пользователю ${ctx.from.id}`
		)
		ctx.session.currentProfileIndex = currentIndex

		await TelegramProfileRenderer.sendProfile(ctx, {
			...matchedOneProfile,
			account: matchedOneProfile.account
		})
	}

	@Hears(ActionTitles.SKIP_PROFILE)
	async skipProfile(@Ctx() ctx: BotContext): Promise<void> {
		const logger: Logger = new Logger('SKIP_PROFILE')
		logger.log(`Пользователь ${ctx.from.id} нажал кнопку "Пропустить"`)

		const cacheKey: string = `${REDIS_KEY_MATCHES_PROFILES('MATCHES_PROFILES', ctx.from.id)}:${ctx.from.id}`
		let matchesProfiles: Profile[] = await this.store.get(
			REDIS_KEY_MATCHES_PROFILES('MATCHES_PROFILES', ctx.from.id)
		)

		if (!matchesProfiles || matchesProfiles.length === 0) {
			logger.warn(`Нет анкет для пропуска у пользователя ${ctx.from.id}`)
			await ctx.reply('🙅‍♂️ Нет доступных анкет.')
			return
		}

		const skippedProfile: Profile = matchesProfiles.shift()
		logger.log(`Пропущена анкета ID: ${skippedProfile?.id}`)

		const account: Account = await this.userContextService.getAccount(ctx)
		logger.log(`Получен аккаунт ID: ${account.id}`)

		await this.profileService.skipProfile(account, skippedProfile?.id)
		logger.log(
			`Действие skip сохранено в базе для профиля ID: ${skippedProfile?.id}`
		)

		await this.store.set(
			REDIS_KEY_MATCHES_PROFILES('MATCHES_PROFILES', ctx.from.id),
			matchesProfiles,
			300
		)
		logger.log(
			`Кеш обновлён после пропуска (осталось ${matchesProfiles.length} анкет)`
		)

		if (matchesProfiles.length === 0) {
			logger.log(
				`Анкеты закончились после пропуска у пользователя ${ctx.from.id}`
			)
			await ctx.reply('🎉 Все анкеты просмотрены.')
			return
		}

		ctx.session.currentProfileIndex = 0
		const nextProfile = matchesProfiles[0]
		logger.log(`Показ следующей анкеты ID: ${nextProfile.id}`)

		await TelegramProfileRenderer.sendProfile(ctx, {
			...account.profile,
			account
		})
	}

	@Hears(ActionTitles.LIKE_PROFILE)
	async likeProfile(@Ctx() ctx: BotContext): Promise<void> {
		const logger: Logger = new Logger('LIKE_PROFILE')
		logger.log(`Пользователь ${ctx.from.id} нажал кнопку "Лайк"`)

		const cacheKey: string = `${REDIS_KEY_MATCHES_PROFILES('MATCHES_PROFILES', ctx.from.id)}:${ctx.from.id}`
		let matchesProfiles: Profile[] = await this.store.get(
			REDIS_KEY_MATCHES_PROFILES('MATCHES_PROFILES', ctx.from.id)
		)

		if (!matchesProfiles || matchesProfiles.length === 0) {
			logger.warn(`Нет анкет для пользователя ${ctx.from.id}`)
			await ctx.reply('🙅‍♂️ Нет доступных анкет.')
			return
		}

		const currentIndex: number = ctx.session.currentProfileIndex || 0
		logger.log(`Текущий индекс лайкаемой анкеты: ${currentIndex}`)

		if (currentIndex >= matchesProfiles.length) {
			logger.log(`Пользователь ${ctx.from.id} просмотрел все анкеты`)
			await ctx.reply('🎉 Все анкеты просмотрены.')
			return
		}

		const likedProfile: Profile = matchesProfiles[currentIndex]
		logger.log(
			`Анкета ID ${likedProfile.id} лайкнута пользователем ${ctx.from.id}`
		)

		const account: Account = await this.userContextService.getAccount(ctx)
		logger.log(
			`Получен аккаунт: ${account.id}, профиль ID: ${account.profile?.id}`
		)

		await this.profileService.likeProfile(account, likedProfile.id)
		logger.log(`Действие like сохранено в базе`)

		await ctx.telegram.sendMessage(
			likedProfile.account.telegramId,
			`❤️ Ваша анкета кому-то понравилась!\n\n👀 Проверьте список взаимных симпатий!`,
			{
				reply_markup: {
					inline_keyboard: [
						[
							{
								text: '👀 Посмотреть',
								callback_data: `LIKED_BY_${account.profile.id}`
							}
						]
					]
				}
			}
		)
		logger.log(
			`Уведомление отправлено пользователю ${likedProfile.account.telegramId}`
		)

		matchesProfiles.splice(currentIndex, 1)
		ctx.session.currentProfileIndex = 0
		await this.store.set(
			REDIS_KEY_MATCHES_PROFILES('MATCHES_PROFILES', ctx.from.id),
			matchesProfiles,
			300
		)
		logger.log(
			`Кеш обновлён после лайка (осталось ${matchesProfiles.length} анкет)`
		)

		if (matchesProfiles.length === 0) {
			logger.log(`Пользователь ${ctx.from.id} просмотрел все анкеты`)
			await ctx.reply('🎉 Все анкеты просмотрены.')
			return
		}

		const nextProfile: Profile = matchesProfiles[0]
		logger.log(`Показывается следующая анкета ID: ${nextProfile.id}`)

		await TelegramProfileRenderer.sendProfile(ctx, {
			...account.profile,
			account
		})
	}

	@On('callback_query')
	async onLikedBy(@Ctx() ctx: BotContext) {
		const logger: Logger = new Logger('LIKED_BY_CALLBACK')
		logger.log(`Обработка callback_query от пользователя ${ctx.from.id}`)

		const cbq: CallbackQuery = ctx.callbackQuery
		if (!cbq || !('data' in cbq)) {
			logger.warn(`callbackQuery не содержит data`)
			return
		}

		const data: string = cbq.data
		logger.log(`Получен callback data: ${data}`)

		if (!data?.startsWith('LIKED_BY_')) {
			logger.log(`Callback не относится к LIKED_BY_`)
			return
		}

		const likerId: number = Number(data.replace('LIKED_BY_', ''))
		logger.log(`Извлечён ID лайкнувшего: ${likerId}`)

		const profile: Profile = await this.profileService.getById(likerId)

		if (!profile?.isActive || !profile) {
			logger.warn(`Профиль ${likerId} неактивен или не найден`)
			await ctx.reply('❌ Пользователь деактивировал анкету.')
			return
		}

		await ctx.answerCbQuery()
		logger.log(
			`Профиль ${likerId} будет показан пользователю ${ctx.from.id}`
		)

		await TelegramProfileRenderer.sendProfile(ctx, {
			...profile,
			account: profile.account
		})
	}

	@Hears(ActionTitles.EDIT_PROFILE)
	async editProfile(@Ctx() ctx: BotContext): Promise<void> {
		await this.menuManagerService.send(ctx, 'EDIT_PROFILE')
	}

	@Hears(ActionTitles.REACREATE_PROFILE)
	async recreateProfile(@Ctx() ctx: BotContext): Promise<void> {
		await ctx.reply('📋 Начинаем пересоздание анкеты...')
		await ctx.scene.enter(ScenesData.EDIT_PROFILE)

		this.logger.log(
			`User @${ctx.from.username} was moved to scene: ${ScenesData.EDIT_PROFILE}`
		)
	}

	@Hears(ActionTitles.BACK_TO_MENU)
	async backToMenu(@Ctx() ctx: BotContext): Promise<void> {
		await this.menuManagerService.send(ctx, 'MAIN_MENU')
	}

	@Hears(ActionTitles.SHOW_PROFILE)
	async showProfile(@Ctx() ctx: BotContext): Promise<void> {
		let profile: Profile = await this.userContextService.getProfile(ctx)

		if (!profile) {
			await ctx.reply('❌ У вас ещё нет анкеты.')
			return
		}

		await TelegramProfileRenderer.sendProfile(ctx, {
			...profile,
			account: profile.account
		})

		await this.menuManagerService.send(ctx, 'PROFILE_MENU')
	}

	@Hears(ActionTitles.DEACTIVATE_PROFILE)
	async deactivateProfile(@Ctx() ctx: BotContext): Promise<void> {
		const logger: Logger = new Logger('DeactivateProfile')
		const telegramId: number = ctx.from?.id

		logger.log(
			`Получен запрос на деактивацию профиля от Telegram ID: ${telegramId}`
		)

		let profileId: number = ctx.session[REDIS_KEY_PROFILE_ID_SESSION_KEY()]

		if (profileId) {
			logger.log(`Профиль найден в сессии: ${profileId}`)
		} else {
			logger.warn(
				'Профиль не найден в сессии, пробую загрузить из базы...'
			)

			const account: Account =
				await this.userContextService.getAccount(ctx)
			profileId = account.profile?.id

			if (profileId) {
				ctx.session[REDIS_KEY_PROFILE_ID_SESSION_KEY()] = profileId
				logger.log(
					`Профиль найден в БД и добавлен в сессию: ${profileId}`
				)
			} else {
				logger.error('Профиль не найден в базе данных')
				await ctx.reply('❌ Профиль не найден.')
				return
			}
		}

		await this.profileService.toggleProfileActive(profileId)
		logger.log(`Профиль ${profileId} успешно деактивирован.`)

		await ctx.reply('✅ Профиль успешно деактивирован.')
	}
}

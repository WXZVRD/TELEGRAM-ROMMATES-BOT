import { Action, Ctx, Hears, SceneEnter, Update } from 'nestjs-telegraf'
import { Injectable, Logger } from '@nestjs/common'
import { Context, Markup, Scenes } from 'telegraf'
import { ScenesData } from '@/module/telegram/scenes/scenes.data'
import {
	ActionTitles,
	CallbackActions
} from '@/module/telegram/types/callbackActions.enum'
import { Account } from '@/module/account/entities/account.entity'
import { Buttons, TelegramProfileRenderer } from '@/module/telegram/ui'
import { AccountService } from '@/module/account/account.service'

@Update()
@Injectable()
export class TelegramActions {
	private readonly logger = new Logger(TelegramActions.name)

	constructor(private readonly accountService: AccountService) {}

	@Action(CallbackActions.CREATE_PROFILE)
	async onCreateProfile(@Ctx() ctx: Scenes.SceneContext): Promise<void> {
		const telegramId = ctx.from?.id
		const username = ctx.from?.username || 'unknown'

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
	async findRoommate(@Ctx() ctx: Context): Promise<void> {
		await ctx.reply(
			'🔍 Поиск сожителя запущен!\n\n' +
				'Сейчас я начну показывать тебе анкеты пользователей, которые ищут соседа по жилью.\n' +
				'Если кто-то понравится — жми ❤️. Если хочешь вернуться назад — нажми 🔙.',
			Markup.keyboard([
				[Buttons.likeProfile(), Buttons.backToMenu()]
			]).resize()
		)
	}

	@Hears(ActionTitles.EDIT_PROFILE)
	async editProfile(@Ctx() ctx: Context): Promise<void> {
		console.log('ActionTitles.EDIT_PROFILE')
		await ctx.reply('😅 ActionTitles.EDIT_PROFILE.')
	}

	@Hears(ActionTitles.BACK_TO_MENU)
	async backToMenu(@Ctx() ctx: Context): Promise<void> {
		await ctx.reply(
			'📋 Главное меню\n\nВыберите, что вы хотите сделать:\n' +
				'— 🔍 Найти сожителя, чтобы посмотреть анкеты\n' +
				'— 📝 Изменить свою анкету, если что-то поменялось\n' +
				'— 👤 Посмотреть свою анкету ещё раз',
			Markup.keyboard([
				[
					Buttons.findRoommate(),
					Buttons.changeProfile(),
					Buttons.showProfile()
				]
			]).resize()
		)

		await ctx.reply('😉 Готово! Что дальше?')
	}

	@Hears(ActionTitles.SHOW_PROFILE)
	async showProfile(@Ctx() ctx: Context): Promise<void> {
		const telegramId: number = ctx.from.id

		let account: Account | null =
			await this.accountService.findByTelegramId(telegramId)

		const renderedProfile = TelegramProfileRenderer.getMediaGroup({
			...account.profile,
			account
		})
		await ctx.replyWithMediaGroup(renderedProfile)

		await ctx.reply(
			'Выберите следующее действие:',
			Markup.keyboard([
				[
					Buttons.findRoommate(),
					Buttons.changeProfile(),
					Buttons.backToMenu()
				]
			]).resize()
		)
	}
}

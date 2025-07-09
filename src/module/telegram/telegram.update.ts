import { Injectable } from '@nestjs/common'
import { Ctx, InjectBot, On, Start, Update } from 'nestjs-telegraf'
import { Context, Markup, Telegraf } from 'telegraf'
import { Buttons, TelegramProfileRenderer, Texts } from '@/module/telegram/ui'
import { TelegramService } from '@/module/telegram/telegram.service'
import { AccountService } from '@/module/account/account.service'
import { Account } from '@/module/account/entities/account.entity'
import { ActionTitles } from '@/module/telegram/types/callbackActions.enum'

@Update()
@Injectable()
export class TelegramUpdate {
	constructor(
		@InjectBot() private readonly bot: Telegraf<any>,
		private readonly telegramService: TelegramService,
		private readonly accountService: AccountService
	) {}

	@Start()
	async onStart(@Ctx() ctx: Context): Promise<void> {
		const telegramId: number = ctx.from.id

		let account: Account | null =
			await this.accountService.findByTelegramId(telegramId)

		await ctx.reply(Texts.welcome)

		if (!account) {
			account = await this.accountService.create(ctx.from)
		}

		if (!account.profile) {
			await ctx.reply(
				Texts.haveNoProfile,
				Markup.inlineKeyboard([Buttons.createProfile()])
			)

			return
		}

		await ctx.reply(
			'Выбери один из предложеных вариантов: ',
			Markup.keyboard([
				Buttons.findRoommate(),
				Buttons.changeProfile(),
				Buttons.showProfile()
			]).resize()
		)
	}

	@On('text')
	async onText(@Ctx() ctx: Context) {
		switch (ctx.message['text']) {
			case ActionTitles.FIND_ROOMMATE:
				console.log('ActionTitles.FIND_ROOMMATE')
				await ctx.reply('😅 ActionTitles.FIND_ROOMMATE.')
				break

			case ActionTitles.EDIT_PROFILE:
				console.log('ActionTitles.EDIT_PROFILE')
				await ctx.reply('😅 ActionTitles.EDIT_PROFILE.')
				break

			case ActionTitles.SHOW_PROFILE:
				const telegramId: number = ctx.from.id

				let account: Account | null =
					await this.accountService.findByTelegramId(telegramId)

				const renderedProfile = TelegramProfileRenderer.getMediaGroup(
					account.profile
				)
				await ctx.replyWithMediaGroup(renderedProfile)

				await ctx.reply(
					'Выберите следующее действие:',
					Markup.keyboard([
						Buttons.findRoommate(),
						Buttons.changeProfile()
					]).resize()
				)

				break

			default:
				await ctx.reply(
					'😅 Не понял. Пожалуйста, выбери вариант с клавиатуры.'
				)
		}
	}
}

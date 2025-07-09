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
}

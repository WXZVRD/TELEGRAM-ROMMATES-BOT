import { Injectable, Logger } from '@nestjs/common'
import { Ctx, InjectBot, Start, Update } from 'nestjs-telegraf'
import { Markup, Telegraf } from 'telegraf'
import { Buttons, Texts } from '@/module/telegram/ui'
import { TelegramService } from '@/module/telegram/telegram.service'
import { AccountService } from '@/module/account/account.service'
import { Account } from '@/module/account/entities/account.entity'
import { MenuManagerService } from '@/module/telegram/modules/menu/menuManager.service'
import {
	BotContext,
	SessionData
} from '@/module/telegram/types/telegram.context'
import { UserContextService } from '@/module/telegram/user.context.service'

@Update()
@Injectable()
export class TelegramUpdate {
	private readonly logger: Logger = new Logger(TelegramUpdate.name)

	constructor(
		@InjectBot() private readonly bot: Telegraf<any>,
		private readonly telegramService: TelegramService,
		private readonly accountService: AccountService,
		private readonly menuManagerService: MenuManagerService,
		private readonly userContextService: UserContextService
	) {}

	@Start()
	async onStart(@Ctx() ctx: BotContext): Promise<void> {
		const telegramId: number = ctx.from.id
		this.logger.log(
			`Start command received from Telegram ID: ${telegramId}`
		)

		let account: Account | null =
			await this.userContextService.getAccount(ctx)

		if (account) {
			this.logger.log(
				`Account found for Telegram ID ${telegramId}: accountId=${account.id}`
			)
		} else {
			this.logger.log(
				`No account found for Telegram ID ${telegramId}, creating one...`
			)
			account = await this.accountService.create(ctx.from)
			this.logger.log(`Account created with ID: ${account.id}`)
		}

		await ctx.reply(Texts.welcome)
		this.logger.log(`Sent welcome message to Telegram ID ${telegramId}`)

		if (!account.profile) {
			this.logger.log(
				`No profile found for accountId=${account.id}, prompting to create one...`
			)
			await ctx.reply(
				Texts.haveNoProfile,
				Markup.inlineKeyboard([Buttons.createProfile()])
			)
			return
		}

		this.logger.log(
			`Profile exists for accountId=${account.id}, showing main menu...`
		)
		await this.menuManagerService.send(ctx, 'MAIN_MENU')
	}
}

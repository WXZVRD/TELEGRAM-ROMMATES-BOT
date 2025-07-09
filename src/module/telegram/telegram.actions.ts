import { Action, Ctx, SceneEnter, Update } from 'nestjs-telegraf'
import { Injectable, Logger } from '@nestjs/common'
import { Scenes } from 'telegraf'
import { ScenesData } from '@/module/telegram/scenes/scenes.data'
import { CallbackActions } from '@/module/telegram/types/callbackActions.enum'

@Update()
@Injectable()
export class TelegramActions {
	private readonly logger = new Logger(TelegramActions.name)

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
}

import { MiddlewareFn } from 'telegraf'
import { BotContext } from '@/module/telegram/types/telegram.context'

export const resetOnStartMiddleware: MiddlewareFn<BotContext> = async (
	ctx: BotContext,
	next
): Promise<void> => {
	if (ctx.message?.['text'] === '/start') {
		console.log('⛔ Принудительный сброс сцены по /start')

		await ctx.scene.leave()
		ctx.session = {} as any
	}

	await next()
}

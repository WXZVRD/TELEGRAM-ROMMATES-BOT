import { Injectable } from '@nestjs/common'
import { Markup } from 'telegraf'
import { MenuStateId } from './menu.types'
import { menuStates } from './data/menu.states'
import { BotContext } from '@/module/telegram/types/telegram.context'

@Injectable()
export class MenuManagerService {
	private stateKey = 'menu_state'

	async send(ctx: BotContext, stateId: MenuStateId) {
		const state = menuStates[stateId]
		if (!state) {
			console.warn(`[MenuManager] State "${stateId}" not found.`)
			return
		}

		console.log(
			`[MenuManager] Sending state: "${stateId}" to user: @${ctx.from?.username ?? 'unknown'} (${ctx.from?.id})`
		)
		ctx.session[this.stateKey] = stateId

		await ctx.reply(
			state.text,
			Markup.keyboard([...state.buttons]).resize()
		)
	}

	async handleInput(ctx: BotContext) {
		const input = ctx.message?.['text']
		const currentStateId = ctx.session[this.stateKey] as MenuStateId
		const state = menuStates[currentStateId]

		console.log(
			`[MenuManager] Received input: "${input}" from user: @${ctx.from?.username ?? 'unknown'} in state: "${currentStateId}"`
		)

		if (state?.next) {
			const nextStateId = await state.next(ctx, input)

			if (nextStateId) {
				console.log(
					`[MenuManager] Transitioning to next state: "${nextStateId}"`
				)
				await this.send(ctx, nextStateId)
			} else {
				console.log(
					`[MenuManager] No transition. Staying in state: "${currentStateId}"`
				)
				await this.send(ctx, currentStateId)
			}
		} else {
			console.log(
				`[MenuManager] No "next" handler. Re-sending state: "${currentStateId}"`
			)
			await this.send(ctx, currentStateId)
		}
	}
}

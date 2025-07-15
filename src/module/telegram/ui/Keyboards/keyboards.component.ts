import { Context, Markup } from 'telegraf'
import { Buttons } from '@/module/telegram/ui'

type keyboardsMenuType = (ctx: Context) => Promise<any>

export const keyboardsMenu: Record<string, keyboardsMenuType> = {
	mainMenu: async (ctx: Context): Promise<any> =>
		await ctx.reply(
			'Выбери один из предложеных вариантов: ',
			Markup.keyboard([
				Buttons.findRoommate(),
				Buttons.changeProfile(),
				Buttons.showProfile()
			]).resize()
		)
}

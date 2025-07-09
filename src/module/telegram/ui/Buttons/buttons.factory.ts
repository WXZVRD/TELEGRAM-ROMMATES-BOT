import { InlineKeyboardButton } from 'typegram'
import { Markup } from 'telegraf'

export const createCallbackButton = (
	title: string,
	action: string
): InlineKeyboardButton.CallbackButton => Markup.button.callback(title, action)

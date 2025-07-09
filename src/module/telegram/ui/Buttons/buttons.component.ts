import { createCallbackButton } from '@/module/telegram/ui/Buttons/buttons.factory'
import { InlineKeyboardButton } from 'typegram'
import {
	ActionTitles,
	CallbackActions
} from '@/module/telegram/types/callbackActions.enum'

export const Buttons = {
	findRoommate: (): InlineKeyboardButton.CallbackButton => {
		return createCallbackButton(
			ActionTitles.FIND_ROOMMATE,
			CallbackActions.FIND_ROOMMATE
		)
	},

	createProfile: (): InlineKeyboardButton.CallbackButton => {
		return createCallbackButton(
			ActionTitles.CREATE_PROFILE,
			CallbackActions.CREATE_PROFILE
		)
	},

	changeProfile: (): InlineKeyboardButton.CallbackButton => {
		return createCallbackButton(
			ActionTitles.EDIT_PROFILE,
			CallbackActions.EDIT_PROFILE
		)
	},

	showProfile: (): InlineKeyboardButton.CallbackButton => {
		return createCallbackButton(
			ActionTitles.SHOW_PROFILE,
			CallbackActions.SHOW_PROFILE
		)
	}
} as const

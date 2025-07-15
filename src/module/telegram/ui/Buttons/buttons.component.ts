import { createCallbackButton } from '@/module/telegram/ui/Buttons/buttons.factory'
import { InlineKeyboardButton } from 'typegram'
import {
	ActionTitles,
	CallbackActions
} from '@/module/telegram/types/callbackActions.enum'

export const Buttons = {
	primary: (
		title: string,
		action: string
	): InlineKeyboardButton.CallbackButton => {
		return createCallbackButton(title, action)
	},

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
	},

	backToMenu: (): InlineKeyboardButton.CallbackButton => {
		return createCallbackButton(
			ActionTitles.BACK_TO_MENU,
			CallbackActions.BACK_TO_MENU
		)
	},

	likeProfile: (): InlineKeyboardButton.CallbackButton => {
		return createCallbackButton(
			ActionTitles.LIKE_PROFILE,
			CallbackActions.LIKE_PROFILE
		)
	},

	skipProfile: (): InlineKeyboardButton.CallbackButton => {
		return createCallbackButton(
			ActionTitles.SKIP_PROFILE,
			CallbackActions.SKIP_PROFILE
		)
	},

	deactivateProfile: (): InlineKeyboardButton.CallbackButton => {
		return createCallbackButton(
			ActionTitles.DEACTIVATE_PROFILE,
			CallbackActions.DEACTIVATE_PROFILE
		)
	},

	recreateProfile: (): InlineKeyboardButton.CallbackButton => {
		return createCallbackButton(
			ActionTitles.REACREATE_PROFILE,
			CallbackActions.REACREATE_PROFILE
		)
	}
} as const

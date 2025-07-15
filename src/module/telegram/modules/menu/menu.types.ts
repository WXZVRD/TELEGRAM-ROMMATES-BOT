import { KeyboardButton } from 'typegram'
import { BotContext } from '@/module/telegram/types/telegram.context'

export enum MenuStates {
	MAIN_MENU = 'MAIN_MENU',
	PROFILE_MENU = 'PROFILE_MENU',
	FIND_ROOMMATE = 'FIND_ROOMMATE',
	EDIT_PROFILE = 'EDIT_PROFILE'
}

export type MenuStateId = keyof typeof MenuStates

export type MenuState = {
	id: MenuStateId
	text: string
	buttons: KeyboardButton[][]
	next?: (ctx: BotContext, input: string) => Promise<MenuStateId | void>
}

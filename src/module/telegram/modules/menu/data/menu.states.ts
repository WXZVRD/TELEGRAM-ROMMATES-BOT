import { MenuTexts } from './menu.texts'
import {
	MenuState,
	MenuStates
} from '@/module/telegram/modules/menu/menu.types'
import { Buttons } from '@/module/telegram/ui'
import { BotContext } from '@/module/telegram/types/telegram.context'

export const menuStates: Record<string, MenuState> = {
	MAIN_MENU: {
		id: MenuStates.MAIN_MENU,
		text: MenuTexts.main,
		buttons: [[Buttons.findRoommate(), Buttons.showProfile()]]
	},
	FIND_ROOMMATE: {
		id: MenuStates.FIND_ROOMMATE,
		text: MenuTexts.find_roommate,
		buttons: [
			[Buttons.likeProfile(), Buttons.skipProfile(), Buttons.backToMenu()]
		]
	},
	PROFILE_MENU: {
		id: MenuStates.PROFILE_MENU,
		text: MenuTexts.profile_menu,
		buttons: [
			[
				Buttons.findRoommate(),
				Buttons.changeProfile(),
				Buttons.backToMenu()
			]
		],
		next: async (ctx: BotContext, input: string) => {
			if (input === '🔙 Назад') return MenuStates.MAIN_MENU
		}
	},
	EDIT_PROFILE: {
		id: MenuStates.EDIT_PROFILE,
		text: MenuTexts.edit_profile,
		buttons: [
			[
				Buttons.deactivateProfile(),
				Buttons.recreateProfile(),
				Buttons.backToMenu()
			]
		]
	}
}

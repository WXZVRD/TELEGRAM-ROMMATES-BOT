import { Scenes } from 'telegraf'
import { WizardContext } from 'telegraf/scenes'
import { GenderType } from '@/module/profile/types/profile.types'
import { BotContext } from '@/module/telegram/types/telegram.context'

export type CreateProfileContext = Scenes.WizardContext &
	BotContext & {
		wizard: WizardContext['wizard']
		scene: {
			state: ProfileState
		}
	}

export type ProfileState = {
	name?: string
	age?: number
	gender?: GenderType
	preferGender?: GenderType
	livingCity?: string
	relocateCity?: string
	photos?: string[]
	description?: string
}

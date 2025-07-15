import { Context as TelegrafContext } from 'telegraf'
import {
	SceneContextScene,
	WizardSession,
	WizardSessionData
} from 'telegraf/scenes'

export interface SessionData extends WizardSession {
	menu_state?: string
	profile?: any
	account?: any
	currentProfileIndex?: number
}

export interface BotContext extends TelegrafContext {
	session: SessionData
	scene: SceneContextScene<BotContext>
}

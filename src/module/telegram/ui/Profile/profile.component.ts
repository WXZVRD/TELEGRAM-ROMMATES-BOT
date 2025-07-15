import { InputMediaPhoto } from 'telegraf/types'
import { Account } from '@/module/account/entities/account.entity'

export type RenderProfileOptions = {
	name: string
	age: number
	gender: string
	preferGender: string
	livingCity: string
	relocateCity: string
	description: string
	photos: string[]
	account: Account
}

export class TelegramProfileRenderer {
	static getText(
		profile: RenderProfileOptions,
		showLink: boolean = false
	): string {
		const lines: string[] = [
			`📋 *Анкета пользователя:* \n`,
			showLink && profile.account.username
				? `🔗 @${profile.account.username || profile.account.telegramId}`
				: null,
			`👤 ${profile.name} ${profile.age}, ${profile.livingCity}`,
			`🚻 Пол: ${profile.gender}`,
			`🔍 Пол сожителя: ${profile.preferGender}`,
			`📍 Ищет в городе: ${profile.relocateCity} \n`,
			`📝 Описание: ${profile.description}`
		]

		return lines.filter(Boolean).join('\n')
	}

	static getMediaGroup(
		profile: RenderProfileOptions,
		showLink: boolean = false
	): InputMediaPhoto[] | null {
		const text: string = TelegramProfileRenderer.getText(profile)

		if (!Array.isArray(profile.photos) || profile.photos.length === 0) {
			return null
		}

		return profile.photos.map((fileId: string, idx: number) => ({
			type: 'photo',
			media: fileId,
			...(idx === 0 && {
				caption: text,
				parse_mode: 'Markdown'
			})
		}))
	}

	static async sendProfile(
		ctx: any,
		profile: RenderProfileOptions,
		showLink: boolean = false
	): Promise<void> {
		const mediaGroup: InputMediaPhoto[] = this.getMediaGroup(
			profile,
			showLink
		)

		if (mediaGroup && mediaGroup.length > 0) {
			await ctx.replyWithMediaGroup(mediaGroup)
		} else {
			const text: string = this.getText(profile, showLink)
			await ctx.reply(text, { parse_mode: 'Markdown' })
		}
	}
}

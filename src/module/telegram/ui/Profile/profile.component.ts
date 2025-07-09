import { InputMediaPhoto } from 'telegraf/types'

type RenderProfileOptions = {
	name: string
	age: number
	gender: string
	preferGender: string
	livingCity: string
	relocateCity: string
	purpose: string
	description: string
	photos: string[]
}

export class TelegramProfileRenderer {
	static getText(profile: RenderProfileOptions): string {
		return [
			`📋 *Анкета пользователя:*`,
			`👤 Имя: ${profile.name}`,
			`📅 Возраст: ${profile.age}`,
			`🚻 Пол: ${profile.gender}`,
			`🔍 Ищет: ${profile.preferGender}`,
			`📍 Город: ${profile.relocateCity}`,
			`🏠 Проживает: ${profile.livingCity}`,
			`🎯 Цель: ${profile.purpose}`,
			`📝 Описание: ${profile.description}`,
			`🖼 Фото: ${profile.photos.length} шт.`
		].join('\n')
	}

	static getMediaGroup(profile: RenderProfileOptions): InputMediaPhoto[] {
		const text = TelegramProfileRenderer.getText(profile)

		return profile.photos.map((fileId, idx) => ({
			type: 'photo',
			media: fileId,
			...(idx === 0 && {
				caption: text,
				parse_mode: 'Markdown'
			})
		}))
	}
}

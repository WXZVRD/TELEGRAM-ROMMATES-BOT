import { Ctx, Scene, Wizard, WizardStep } from 'nestjs-telegraf'
import { ScenesData } from '@/module/telegram/scenes/scenes.data'
import { Injectable } from '@nestjs/common'
import { Markup, Scenes } from 'telegraf'
import { WizardContext } from 'telegraf/scenes'
import { ProfileService } from '@/module/profile/profile.service'
import { AccountService } from '@/module/account/account.service'
import {
	RenderProfileOptions,
	TelegramProfileRenderer
} from '@/module/telegram/ui'

type ProfileState = {
	name?: string
	age?: number
	gender?: string
	preferGender?: string
	livingCity?: string
	relocateCity?: string
	purpose?: string
	photos?: string[]
	description?: string
}

type CreateProfileContext = Scenes.WizardContext & {
	wizard: WizardContext['wizard']
	scene: {
		state: ProfileState
	}
}

@Injectable()
@Wizard(ScenesData.CREATE_PROFILE)
@Scene(ScenesData.CREATE_PROFILE)
export class CreateProfileScene {
	constructor(
		private readonly profileService: ProfileService,
		private readonly accountService: AccountService
	) {}
	private async prompt(ctx: CreateProfileContext, text: string) {
		await ctx.reply(text)
		ctx.wizard.next()
	}

	@WizardStep(0)
	async step0(@Ctx() ctx: CreateProfileContext) {
		console.log(
			`[Wizard][step0] Started by: @${ctx.from?.username ?? 'unknown'}`
		)
		await this.prompt(ctx, '✒️ Как тебя зовут?')
	}

	@WizardStep(1)
	async step1(@Ctx() ctx: CreateProfileContext) {
		const name = ctx.message['text']
		if (!name?.trim()) return ctx.reply('❌ Введите имя текстом.')

		ctx.scene.state.name = name
		await this.prompt(ctx, '📅 Сколько тебе лет?')
	}

	@WizardStep(2)
	async step2(@Ctx() ctx: CreateProfileContext) {
		const age = parseInt(ctx.message['text'])
		if (isNaN(age) || age < 10 || age > 100)
			return ctx.reply('❌ Укажите возраст числом (10–100).')

		ctx.scene.state.age = age
		await this.prompt(ctx, '🚻 Какой у тебя пол?')
	}

	@WizardStep(3)
	async step3(@Ctx() ctx: CreateProfileContext) {
		const gender = ctx.message['text']
		if (!gender?.trim()) return ctx.reply('❌ Укажите свой пол.')

		ctx.scene.state.gender = gender
		await this.prompt(ctx, '🔍 Кого ты ищешь? (парень/девушка/не важно)')
	}

	@WizardStep(4)
	async step4(@Ctx() ctx: CreateProfileContext) {
		const preferGender = ctx.message['text']
		if (!preferGender?.trim()) return ctx.reply('❌ Укажите предпочтение.')

		ctx.scene.state.preferGender = preferGender
		await this.prompt(ctx, '📍 В каком городе вы ищете соседа?')
	}

	@WizardStep(5)
	async step5(@Ctx() ctx: CreateProfileContext) {
		const city = ctx.message['text']
		if (!city?.trim()) return ctx.reply('❌ Введите город.')

		ctx.scene.state.relocateCity = city
		await this.prompt(
			ctx,
			'🎯 Цель проживания (бизнес, просто сожительство и т.д.)?'
		)
	}

	@WizardStep(6)
	async step6(@Ctx() ctx: CreateProfileContext) {
		const purpose = ctx.message['text']
		if (!purpose?.trim()) return ctx.reply('❌ Опишите вашу цель.')

		ctx.scene.state.purpose = purpose
		await ctx.reply(
			'📷 Отправьте до 3-х фотографий по одной. Когда закончите — нажмите "✅ Готово".',
			Markup.keyboard([['✅ Готово']]).resize()
		)
		ctx.wizard.next()
	}

	@WizardStep(7)
	async step7(@Ctx() ctx: CreateProfileContext) {
		const msg = ctx.message
		const state = ctx.scene.state

		state.photos ||= []

		if ('text' in msg && msg.text === '✅ Готово') {
			if (state.photos.length === 0) {
				await ctx.reply('❌ Сначала отправьте хотя бы одно фото.')
				return
			}
			await ctx.reply('✏️ Опишите свои пожелания к соседу:')
			return ctx.wizard.next()
		}

		const photo = msg['photo']
		if (!Array.isArray(photo)) {
			await ctx.reply(
				'❌ Пришлите фото (не как файл) или нажмите "✅ Готово".'
			)
			return
		}

		const fileId = photo.at(-1).file_id
		state.photos.push(fileId)

		if (state.photos.length >= 3) {
			await ctx.reply('✅ Загружено 3 фото. Переходим далее...')
			await ctx.reply('✏️ Опишите свои пожелания:')
			return ctx.wizard.next()
		}

		await ctx.reply(
			`✅ Фото сохранено. Осталось ${3 - state.photos.length}.`,
			Markup.keyboard([['✅ Готово']]).resize()
		)
	}

	@WizardStep(8)
	async step8(@Ctx() ctx: CreateProfileContext) {
		const description = ctx.message['text']
		if (!description?.trim()) return ctx.reply('❌ Опишите ваши пожелания.')

		ctx.scene.state.description = description

		await this.prompt(ctx, '🎯 Где вы сейчас прорживаете?')
	}

	@WizardStep(9)
	async step9(@Ctx() ctx: CreateProfileContext) {
		const city = ctx.message['text']
		if (!city?.trim()) return ctx.reply('❌ Введите город.')

		ctx.scene.state.livingCity = city

		const profile = ctx.scene.state

		await ctx.reply('🎉 Ура! Анкета успешно создана.')

		const telegramId = ctx.from.id
		const account = await this.accountService.findByTelegramId(telegramId)

		const renderData: RenderProfileOptions = {
			...(profile as Required<Omit<RenderProfileOptions, 'account'>>),
			account
		}

		const renderedProfile =
			TelegramProfileRenderer.getMediaGroup(renderData)
		await ctx.replyWithMediaGroup(renderedProfile)

		await this.profileService.create({
			livingCity: profile.livingCity,
			description: profile.description,
			age: profile.age,
			gender: profile.gender,
			relocateCity: profile.relocateCity,
			name: profile.name,
			photos: profile.photos,
			purpose: profile.purpose,
			isActive: true,
			preferGender: profile.preferGender,
			account: account
		})

		await ctx.scene.leave()
	}
}

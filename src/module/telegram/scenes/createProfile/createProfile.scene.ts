import { Ctx, Scene, Wizard, WizardStep } from 'nestjs-telegraf'
import { ScenesData } from '@/module/telegram/scenes/scenes.data'
import { Injectable } from '@nestjs/common'
import { Markup, Scenes } from 'telegraf'
import { WizardContext } from 'telegraf/scenes'
import { ProfileService } from '@/module/profile/profile.service'
import { AccountService } from '@/module/account/account.service'
import {
	Buttons,
	RenderProfileOptions,
	TelegramProfileRenderer
} from '@/module/telegram/ui'
import { GenderType, PurposeEnum } from '@/module/profile/types/profile.types'
import { isValidName } from '@/module/telegram/utils/isValidName'
import { isValidGender } from '@/module/telegram/utils/isValidGender'
import { isValidString } from '@/module/telegram/utils/isValidString'
import { isValidAge } from '@/module/telegram/utils/isValidAge'
import { normalizeInput } from '@/module/telegram/utils/normalizeInput'

type ProfileState = {
	name?: string
	age?: number
	gender?: GenderType
	preferGender?: GenderType
	livingCity?: string
	relocateCity?: string
	purpose?: PurposeEnum
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

	private logStep(ctx: CreateProfileContext, step: string, extra?: any) {
		console.log(
			`📍 Step ${step} | From: @${ctx.from?.username ?? 'unknown'} | ID: ${ctx.from?.id}`
		)
		if (extra) console.log('➡️ Data:', extra)
	}

	@WizardStep(0)
	async step0(@Ctx() ctx: CreateProfileContext) {
		console.log(
			`[Wizard][step0] Started by: @${ctx.from?.username ?? 'unknown'}`
		)

		await ctx.reply('✒️ Как тебя зовут?')

		ctx.wizard.next()
	}

	@WizardStep(1)
	async step1(@Ctx() ctx: CreateProfileContext) {
		const nameInput = ctx.message['text']

		const isNameValid = isValidName(nameInput)

		this.logStep(ctx, '1 - name', nameInput)

		if (!isNameValid) {
			await ctx.reply('❌ Введите правильно имя.')
			return
		}

		ctx.scene.state.name = nameInput
		console.log('✅ Имя сохранено:', nameInput)

		await ctx.reply('📅 Сколько тебе лет?')
		ctx.wizard.next()
	}

	@WizardStep(2)
	async step2(@Ctx() ctx: CreateProfileContext) {
		const ageInput = ctx.message['text']
		const age = parseInt(ageInput)

		this.logStep(ctx, '2 - age input', age)

		if (isValidAge(age)) {
			await ctx.reply('❌ Укажите пожалуйста правильный возраст.')
			return
		}

		ctx.scene.state.age = age
		console.log('✅ Возраст сохранён:', age)

		await ctx.reply(
			'🚻 Какой у тебя пол?',
			Markup.keyboard([
				[
					Buttons.primary(GenderType.MALE, 'male'),
					Buttons.primary(GenderType.FEMALE, 'female')
				]
			]).resize()
		)

		ctx.wizard.next()
	}

	@WizardStep(3)
	async step3(@Ctx() ctx: CreateProfileContext) {
		const genderInput = ctx.message['text'].trim().toLowerCase()
		const normalizedGender = normalizeInput(genderInput)

		const isGenderValid = isValidGender(normalizedGender)
		if (!isGenderValid) {
			await ctx.reply(
				'❌ Укажите свой пол (парень или девушка).',
				Markup.keyboard([
					[
						Buttons.primary(GenderType.MALE, 'male'),
						Buttons.primary(GenderType.FEMALE, 'female')
					]
				]).resize()
			)
			return
		}

		ctx.scene.state.gender = genderInput
		await ctx.reply(
			'🔍 Кого ты ищешь? (парень / девушка / не важно)',
			Markup.keyboard([
				[
					Buttons.primary(GenderType.MALE, 'парень'),
					Buttons.primary(GenderType.FEMALE, 'девушка'),
					Buttons.primary(GenderType.ANY, 'любой')
				]
			]).resize()
		)

		ctx.wizard.next()
	}

	@WizardStep(4)
	async step4(@Ctx() ctx: CreateProfileContext) {
		const genderInput = ctx.message['text']?.toLowerCase()
		const normalizedGender = normalizeInput(genderInput)

		const isValidPreferGender = isValidGender(normalizedGender)

		if (!isValidPreferGender) {
			await ctx.reply(
				'❌ Укажите предпочтение (парень, девушка, не важно).',
				Markup.keyboard([
					[
						Buttons.primary(GenderType.MALE, 'парень'),
						Buttons.primary(GenderType.FEMALE, 'девушка'),
						Buttons.primary(GenderType.ANY, 'любой')
					]
				]).resize()
			)
			return
		}

		ctx.scene.state.preferGender = genderInput
		await ctx.reply(
			'📍 В каком городе вы ищете соседа?',
			Markup.removeKeyboard()
		)

		ctx.wizard.next()
	}

	@WizardStep(5)
	async step5(@Ctx() ctx: CreateProfileContext) {
		const cityInput = ctx.message['text']
		const normalizedCityInput = normalizeInput(cityInput)

		if (!isValidString(normalizedCityInput)) {
			await ctx.reply('❌ Введите город.')
			return
		}

		ctx.scene.state.relocateCity = normalizedCityInput

		await ctx.reply(
			'🎯 Цель поиска (бизнес, просто сожительство и т.д.)?',
			Markup.keyboard([
				[
					Buttons.primary(PurposeEnum.ROOMMATE, 'сожитель'),
					Buttons.primary(
						PurposeEnum.BUSINESS_PARTNER,
						'партнёр по аренде'
					)
				]
			]).resize()
		)

		ctx.wizard.next()
	}

	@WizardStep(6)
	async step6(@Ctx() ctx: CreateProfileContext) {
		const purposeInput = ctx.message['text']
		const normalizedPurpose = normalizeInput(purposeInput)

		this.logStep(ctx, '6 - purpose raw', normalizedPurpose)

		if (!isValidString(normalizedPurpose)) {
			console.log('❌ Не прошла валидация строки')
			await ctx.reply(
				'❌ Опишите вашу цель предложеными нами вариантами.',
				Markup.keyboard([
					[
						Buttons.primary(PurposeEnum.ROOMMATE, 'сожитель'),
						Buttons.primary(
							PurposeEnum.BUSINESS_PARTNER,
							'партнёр по аренде'
						)
					]
				]).resize()
			)
			return
		}

		console.log('🧼 Очищенная цель:', normalizedPurpose)
		if (!['сожитель', 'партнёр по аренде'].includes(normalizedPurpose)) {
			console.log('❌ Цель не входит в список допустимых')
			return ctx.reply(
				'❌ Опишите вашу цель предложеными нами вариантами.',
				Markup.keyboard([
					[
						Buttons.primary(PurposeEnum.ROOMMATE, 'сожитель'),
						Buttons.primary(
							PurposeEnum.BUSINESS_PARTNER,
							'партнёр по аренде'
						)
					]
				]).resize()
			)
		}

		ctx.scene.state.purpose =
			normalizedPurpose === 'сожитель'
				? PurposeEnum.ROOMMATE
				: PurposeEnum.BUSINESS_PARTNER
		console.log('✅ Цель сохранена:', normalizedPurpose)
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
			ctx.wizard.next()
			return
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
			await ctx.reply(
				'✅ Загружено 3 фото. Переходим далее...',
				Markup.removeKeyboard()
			)
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

		if (typeof description !== 'string') {
			await ctx.reply('❌ Опишите ваши пожелания.')
			return
		}

		ctx.scene.state.description = description

		await ctx.reply('🎯 Где вы сейчас прорживаете?')
		ctx.wizard.next()
	}

	@WizardStep(9)
	async step9(@Ctx() ctx: CreateProfileContext) {
		const city = ctx.message['text']
		this.logStep(ctx, '9 - living city', city)
		if (!isValidString(city)) return ctx.reply('❌ Введите город.')

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

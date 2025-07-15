import { Ctx, Scene, Wizard, WizardStep } from 'nestjs-telegraf'
import { ScenesData } from '@/module/telegram/scenes/scenes.data'
import { Injectable } from '@nestjs/common'
import { Markup } from 'telegraf'
import { ProfileService } from '@/module/profile/services/profile.service'
import {
	Buttons,
	RenderProfileOptions,
	TelegramProfileRenderer
} from '@/module/telegram/ui'
import { GenderType } from '@/module/profile/types/profile.types'
import { isValidName } from '@/module/telegram/utils/isValidName'
import { isValidGender } from '@/module/telegram/utils/isValidGender'
import { isValidString } from '@/module/telegram/utils/isValidString'
import { isValidAge } from '@/module/telegram/utils/isValidAge'
import { normalizeInput } from '@/module/telegram/utils/normalizeInput'
import {
	CreateProfileContext,
	ProfileState
} from '@/module/telegram/scenes/scene.type'
import { REDIS_KEY_PROFILE_SESSION_KEY } from '@/module/redis/constants'
import { Account } from '@/module/account/entities/account.entity'
import { MenuManagerService } from '@/module/telegram/modules/menu/menuManager.service'
import { Profile } from '@/module/profile/entities/profile.entity'
import { UserContextService } from '@/module/telegram/user.context.service'
import { InputMediaPhoto } from 'telegraf/types'

@Injectable()
@Wizard(ScenesData.EDIT_PROFILE)
@Scene(ScenesData.EDIT_PROFILE)
export class EditProfileScene {
	constructor(
		private readonly profileService: ProfileService,
		private readonly menuManagerService: MenuManagerService,
		private readonly userContextService: UserContextService
	) {}

	private logStep(
		ctx: CreateProfileContext,
		step: string,
		extra?: any
	): void {
		console.log(
			`📍 Step ${step} | From: @${ctx.from?.username ?? 'unknown'} | ID: ${ctx.from?.id}`
		)
		if (extra) console.log('➡️ Data:', extra)
	}

	@WizardStep(0)
	async step0(@Ctx() ctx: CreateProfileContext): Promise<void> {
		console.log(
			`[Wizard][step0] Started by: @${ctx.from?.username ?? 'unknown'} | id: ${ctx.from?.id}`
		)

		const cachedProfile = ctx.session[REDIS_KEY_PROFILE_SESSION_KEY()]
		if (cachedProfile) {
			console.log(
				'[Wizard][step0] Profile loaded from cache:',
				cachedProfile
			)

			ctx.scene.state = {
				...ctx.scene.state,
				...cachedProfile
			}
		} else {
			console.log('[Wizard][step0] No cached profile, loading from DB...')

			const account: Account =
				await this.userContextService.getAccount(ctx)
			if (!account?.profile) {
				console.warn(
					`[Wizard][step0] No profile found in DB for Telegram ID: ${ctx.from.id}`
				)
				await ctx.reply(
					'❌ Не удалось найти ваш профиль. Попробуйте позже.'
				)
				await ctx.scene.leave()
				return
			}

			const profile = account.profile
			console.log('[Wizard][step0] Profile loaded from DB:', profile)

			ctx.session[REDIS_KEY_PROFILE_SESSION_KEY()] = profile
			ctx.scene.state = {
				...ctx.scene.state,
				...profile
			}
		}

		console.log('[Wizard][step0] Final scene state:', ctx.scene.state)

		await ctx.reply(
			'✒️ Как тебя зовут?',
			Markup.keyboard([
				Buttons.primary(ctx.scene.state.name, '')
			]).resize()
		)
		ctx.wizard.next()
	}

	@WizardStep(1)
	async step1(@Ctx() ctx: CreateProfileContext): Promise<void> {
		const nameInput = ctx.message['text']

		const isNameValid = isValidName(nameInput)

		this.logStep(ctx, '1 - name', nameInput)

		if (!isNameValid) {
			await ctx.reply('❌ Введите правильно имя.')
			return
		}

		ctx.scene.state.name = nameInput
		console.log('✅ Имя сохранено:', nameInput)

		await ctx.reply(
			'📅 Сколько тебе лет?',
			Markup.keyboard([
				Buttons.primary(ctx.scene.state.age.toString(), '')
			]).resize()
		)
		ctx.wizard.next()
	}

	@WizardStep(2)
	async step2(@Ctx() ctx: CreateProfileContext): Promise<void> {
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
	async step3(@Ctx() ctx: CreateProfileContext): Promise<void> {
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
	async step4(@Ctx() ctx: CreateProfileContext): Promise<void> {
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
			Markup.keyboard([
				Buttons.primary(ctx.scene.state.relocateCity, '')
			]).resize()
		)

		ctx.wizard.next()
	}

	@WizardStep(5)
	async step5(@Ctx() ctx: CreateProfileContext): Promise<void> {
		const cityInput = ctx.message['text']

		const normalizedCityInput: string = normalizeInput(cityInput)

		if (!isValidString(normalizedCityInput)) {
			await ctx.reply('❌ Введите город.')
			return
		}

		ctx.scene.state.relocateCity = normalizedCityInput

		await ctx.reply(
			'📷 Отправьте до 3-х фотографий по одной. Когда закончите — нажмите "✅ Готово".',
			Markup.keyboard([['✅ Готово']]).resize()
		)
		ctx.wizard.next()
	}

	@WizardStep(6)
	async step7(@Ctx() ctx: CreateProfileContext): Promise<void> {
		const msg = ctx.message
		const state = ctx.scene.state

		state.photos ||= []

		if ('text' in msg && msg.text === '✅ Готово') {
			if (state.photos.length === 0) {
				await ctx.reply('❌ Сначала отправьте хотя бы одно фото.')
				return
			}
			await ctx.reply(
				'✏️ Опишите свои пожелания к соседу:',
				Markup.keyboard([
					Buttons.primary('Оставить текущее', '')
				]).resize()
			)
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
			await ctx.reply(
				'✏️ Опишите свои пожелания:',
				Markup.keyboard([
					Buttons.primary('Оставить текущее', '')
				]).resize()
			)
			ctx.wizard.next()
			return
		}

		await ctx.reply(
			`✅ Фото сохранено. Осталось ${3 - state.photos.length}.`,
			Markup.keyboard([['✅ Готово']]).resize()
		)
	}

	@WizardStep(7)
	async step8(@Ctx() ctx: CreateProfileContext): Promise<void> {
		const description = ctx.message['text']

		if (description.trim() === 'Оставить текущее') {
			ctx.wizard.next()
			return
		}

		if (typeof description !== 'string') {
			await ctx.reply('❌ Опишите ваши пожелания.')
			return
		}

		ctx.scene.state.description = description

		await ctx.reply(
			'🎯 Где вы сейчас проживаете?',
			Markup.keyboard([
				Buttons.primary(ctx.scene.state.livingCity, '')
			]).resize()
		)
		ctx.wizard.next()
	}

	@WizardStep(8)
	async step9(@Ctx() ctx: CreateProfileContext): Promise<void> {
		const city = ctx.message['text']

		if (city !== 'Оставить текущее') {
			this.logStep(ctx, '9 - living city', city)
			if (!isValidString(city)) {
				await ctx.reply('❌ Введите город.')
				return
			}

			ctx.scene.state.livingCity = city
		}

		const profile: Object & ProfileState = ctx.scene.state

		await ctx.reply('🎉 Ура! Анкета успешно пересоздана.')

		const account: Account = await this.userContextService.getAccount(ctx)

		const renderData: RenderProfileOptions = {
			...(profile as Required<Omit<RenderProfileOptions, 'account'>>),
			account
		}

		await TelegramProfileRenderer.sendProfile(ctx, {
			...account.profile,
			account
		})

		const savedProfile: Profile = await this.profileService.editProfile(
			{
				livingCity: profile.livingCity,
				description: profile.description,
				age: profile.age,
				gender: profile.gender,
				relocateCity: profile.relocateCity,
				name: profile.name,
				photos: profile.photos,
				isActive: account.profile.isActive,
				preferGender: profile.preferGender,
				account: account
			},
			account.profile.id
		)

		delete ctx.session[REDIS_KEY_PROFILE_SESSION_KEY()]
		ctx.session[REDIS_KEY_PROFILE_SESSION_KEY()] = savedProfile

		await this.menuManagerService.send(ctx, 'MAIN_MENU')

		await ctx.scene.leave()
	}
}

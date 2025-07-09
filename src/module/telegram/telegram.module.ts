import { Module } from '@nestjs/common'
import { TelegrafModule } from 'nestjs-telegraf'
import { ConfigService } from '@nestjs/config'
import { TelegramUpdate } from '@/module/telegram/telegram.update'
import { session } from 'telegraf'
import { TelegramService } from '@/module/telegram/telegram.service'
import { AccountModule } from '@/module/account/account.module'
import { CreateProfileScene } from '@/module/telegram/scenes/createProfile/createProfile.scene'
import { TelegramActions } from '@/module/telegram/telegram.actions'
import { ProfileModule } from '@/module/profile/profile.module'

@Module({
	imports: [
		TelegrafModule.forRootAsync({
			inject: [ConfigService],
			useFactory: async (config: ConfigService) => ({
				token: config.get<string>('BOT_API_TOKEN'),
				middlewares: [session()]
			})
		}),
		AccountModule,
		ProfileModule
	],
	providers: [
		TelegramService,
		TelegramUpdate,
		CreateProfileScene,
		TelegramActions
	]
})
export class TelegramModule {}

import { Module } from '@nestjs/common'
import { TelegrafModule } from 'nestjs-telegraf'
import { ConfigService } from '@nestjs/config'
import { TelegramUpdate } from '@/module/telegram/telegram.update'
import { Scenes, session } from 'telegraf'
import { TelegramService } from '@/module/telegram/telegram.service'
import { AccountModule } from '@/module/account/account.module'
import { CreateProfileScene } from '@/module/telegram/scenes/createProfile/createProfile.scene'
import { TelegramActions } from '@/module/telegram/telegram.actions'
import { ProfileModule } from '@/module/profile/profile.module'
import { MenuManagerService } from '@/module/telegram/modules/menu/menuManager.service'
import Redis from 'ioredis'
import { RedisModule } from '@/module/redis/redis.module'
import { RedisSessionStore } from '@/module/redis/redis.session'
import { resetOnStartMiddleware } from '@/module/telegram/middlewares/resetOnStart.middleware'
import { BotContext } from '@/module/telegram/types/telegram.context'
import { EditProfileScene } from '@/module/telegram/scenes/editProfile/editProfile.scene'
import { UserContextService } from '@/module/telegram/user.context.service'

@Module({
	imports: [
		RedisModule,
		AccountModule,
		ProfileModule,
		TelegrafModule.forRootAsync({
			imports: [RedisModule],
			inject: [ConfigService, 'REDIS_CLIENT'],
			useFactory: async (config: ConfigService, redis: Redis) => {
				const stage = new Scenes.Stage<BotContext>([])

				return {
					token: config.get<string>('BOT_API_TOKEN'),
					middlewares: [
						session({
							store: new RedisSessionStore(redis)
						}),
						stage.middleware(),
						resetOnStartMiddleware
					]
				}
			}
		})
	],
	providers: [
		TelegramService,
		TelegramUpdate,
		CreateProfileScene,
		EditProfileScene,
		UserContextService,
		TelegramActions,
		MenuManagerService
	]
})
export class TelegramModule {}

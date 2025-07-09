import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { DatabaseModule } from '@/module/database/database.module'
import { AccountModule } from '@/module/account/account.module'
import { ProfileModule } from '@/module/profile/profile.module'
import { TelegramModule } from '@/module/telegram/telegram.module'
import { RedisModule } from '@/module/redis/redis.module'

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
		DatabaseModule,
		RedisModule,
		AccountModule,
		ProfileModule,
		TelegramModule
	]
})
export class AppModule {}

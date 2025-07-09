import { Module, Global } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { createRedisClient } from '@/module/redis/config/redis.config'

@Global()
@Module({
	providers: [
		{
			provide: 'REDIS_CLIENT',
			inject: [ConfigService],
			useFactory: createRedisClient
		}
	],
	exports: ['REDIS_CLIENT']
})
export class RedisModule {}

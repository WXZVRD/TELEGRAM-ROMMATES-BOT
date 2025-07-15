import { Module, Global } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { createRedisClient } from '@/module/redis/config/redis.config'
import { RedisSessionStore } from '@/module/redis/redis.session'

@Global()
@Module({
	providers: [
		{
			provide: 'REDIS_CLIENT',
			inject: [ConfigService],
			useFactory: createRedisClient
		},
		{
			provide: RedisSessionStore,
			useFactory: redisClient => new RedisSessionStore(redisClient),
			inject: ['REDIS_CLIENT']
		}
	],
	exports: ['REDIS_CLIENT', RedisSessionStore]
})
export class RedisModule {}

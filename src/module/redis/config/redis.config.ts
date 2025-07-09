import { ConfigService } from '@nestjs/config'
import Redis from 'ioredis'

export const createRedisClient = (config: ConfigService): Redis => {
	return new Redis({
		host: config.get<string>('REDIS_HOST'),
		port: parseInt(config.get<string>('REDIS_PORT')),
		password: config.get<string>('REDIS_PASSWORD')
	})
}

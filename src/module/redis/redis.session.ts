import type { Redis } from 'ioredis'

export class RedisSessionStore<T = any> {
	constructor(
		private readonly redis: Redis,
		private readonly ttlSeconds = 3600
	) {}

	async get(key: string): Promise<T | undefined> {
		const data = await this.redis.get(key)
		if (!data) return undefined
		return JSON.parse(data)
	}

	async set(key: string, value: T, ttl: number = 3600): Promise<void> {
		await this.redis.set(key, JSON.stringify(value), 'EX', ttl)
	}

	async delete(key: string): Promise<void> {
		await this.redis.del(key)
	}
}

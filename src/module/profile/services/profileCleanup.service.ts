import { Injectable, Logger } from '@nestjs/common'
import { ViewedRepository } from '@/module/profile/repository/viewed.repository'
import { Cron, CronExpression } from '@nestjs/schedule'

@Injectable()
export class ProfileCleanupService {
	private readonly logger: Logger = new Logger('ProfileCleanupService')

	constructor(private readonly viewedRepo: ViewedRepository) {}

	@Cron(CronExpression.EVERY_5_MINUTES)
	async fullCleanRepo(): Promise<void> {
		this.logger.log('🕛 Очистка viewed_profiles')

		try {
			await this.viewedRepo.delete()
			this.logger.log('✅ viewed_profiles очищена')
		} catch (err) {
			this.logger.error('❌ Ошибка очистки viewed_profiles', err)
		}
	}
}

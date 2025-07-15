import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ViewedProfile } from '@/module/profile/entities/viewed.entity'

@Injectable()
export class ViewedRepository {
	constructor(
		@InjectRepository(ViewedProfile)
		private readonly repo: Repository<ViewedProfile>
	) {}

	async create(profile: Omit<ViewedProfile, 'id'>): Promise<ViewedProfile> {
		console.log(profile)
		return this.repo.create(profile)
	}

	async getById(id: number): Promise<ViewedProfile> {
		return await this.repo.findOne({ where: { id } })
	}

	async findViewedByUser(userId: number): Promise<ViewedProfile[]> {
		return await this.repo.find({
			where: {
				viewer: {
					id: userId
				}
			},
			relations: ['viewed']
		})
	}

	async save(profile: ViewedProfile): Promise<ViewedProfile> {
		return this.repo.save(profile)
	}

	async delete(): Promise<void> {
		await this.repo.delete({})
	}
}

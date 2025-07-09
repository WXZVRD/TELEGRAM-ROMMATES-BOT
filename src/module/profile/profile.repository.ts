import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Profile } from '@/module/profile/entities/profile.entity'

@Injectable()
export class ProfileRepository {
	constructor(
		@InjectRepository(Profile)
		private readonly repo: Repository<Profile>
	) {}

	async create(profile: Omit<Profile, 'id'>): Promise<Profile> {
		console.log(profile)
		return this.repo.create(profile)
	}

	async save(profile: Profile): Promise<Profile> {
		return this.repo.save(profile)
	}
}

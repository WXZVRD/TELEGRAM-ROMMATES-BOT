import { Injectable } from '@nestjs/common'
import { Profile } from '@/module/profile/entities/profile.entity'
import { ProfileRepository } from '@/module/profile/profile.repository'

@Injectable()
export class ProfileService {
	constructor(private readonly profileRepository: ProfileRepository) {}

	async create(profile: Omit<Profile, 'id'>): Promise<Profile> {
		const createdProfile = await this.profileRepository.create({
			...profile
		})

		return await this.profileRepository.save(createdProfile)
	}
}

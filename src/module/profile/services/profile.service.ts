import { Injectable } from '@nestjs/common'
import { Profile } from '@/module/profile/entities/profile.entity'
import { ProfileRepository } from '@/module/profile/repository/profile.repository'
import { ViewedRepository } from '@/module/profile/repository/viewed.repository'
import { Account } from '@/module/account/entities/account.entity'
import { ViewedProfile } from '@/module/profile/entities/viewed.entity'

@Injectable()
export class ProfileService {
	constructor(
		private readonly profileRepository: ProfileRepository,
		private readonly viewedRepository: ViewedRepository
	) {}

	async create(profile: Omit<Profile, 'id'>): Promise<Profile> {
		const createdProfile = await this.profileRepository.create({
			...profile
		})

		return await this.profileRepository.save(createdProfile)
	}

	async getById(id: number): Promise<Profile> {
		return this.profileRepository.getById(id)
	}

	async editProfile(
		newProfile: Omit<Profile, 'id'>,
		profileId: number
	): Promise<Profile> {
		const profile: Profile = await this.profileRepository.getById(profileId)

		const updatedProfile = Object.assign(profile, newProfile)

		return await this.profileRepository.save(updatedProfile)
	}

	async toggleProfileActive(profileId: number): Promise<void> {
		const profile: Profile = await this.profileRepository.getById(profileId)

		if (!profile) {
			throw new Error(`Профиль с id=${profileId} не найден`)
		}

		profile.isActive = !profile.isActive
		await this.profileRepository.save(profile)
	}

	async findMatchesFor(id: number): Promise<Profile[]> {
		const myProfile: Profile = await this.profileRepository.getById(id)

		const viewedProfiles: ViewedProfile[] =
			await this.viewedRepository.findViewedByUser(id)

		const excludeIds: number[] = viewedProfiles.map(v => v.viewed.id)

		return this.profileRepository.findMatchesRelaxed(excludeIds, myProfile)
	}

	async likeProfile(account: Account, otherId: number): Promise<void> {
		const otherProfile: Profile =
			await this.profileRepository.getById(otherId)

		const createdView = await this.viewedRepository.create({
			action: 'liked',
			viewer: account,
			viewed: otherProfile,
			date: new Date()
		})

		await this.viewedRepository.save(createdView)
	}

	async skipProfile(account: Account, otherId: number): Promise<void> {
		const otherProfile: Profile =
			await this.profileRepository.getById(otherId)

		const createdView = await this.viewedRepository.create({
			action: 'skipped',
			viewer: account,
			viewed: otherProfile,
			date: new Date()
		})

		await this.viewedRepository.save(createdView)
	}
}

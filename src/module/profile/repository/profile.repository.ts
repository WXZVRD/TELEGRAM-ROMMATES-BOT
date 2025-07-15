import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { In, Not, Repository, SelectQueryBuilder } from 'typeorm'
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

	async getById(id: number): Promise<Profile> {
		return await this.repo.findOne({
			where: { id },
			relations: ['account']
		})
	}

	async save(profile: Profile): Promise<Profile> {
		return this.repo.save(profile)
	}

	async findMatchesRelaxed(
		excludeIds: number[],
		profile: Profile
	): Promise<Profile[]> {
		const query: SelectQueryBuilder<Profile> = this.repo
			.createQueryBuilder('p')
			.leftJoinAndSelect('p.account', 'account')
			.andWhere('p.isActive = true')
			.addSelect(
				`
      (
        CASE WHEN p.livingCity = :livingCity THEN 2 ELSE 0 END +
        CASE WHEN p.gender = :gender OR p.gender = 'любой' THEN 1 ELSE 0 END +
        CASE WHEN p.preferGender = :preferGender OR p.preferGender = 'любой' THEN 1 ELSE 0 END
      )
    `,
				'score'
			)
			.orderBy('score', 'DESC')
			.setParameters({
				livingCity: profile.livingCity,
				gender: profile.preferGender,
				preferGender: profile.gender
			})

		const idsToExclude: number[] = Array.from(
			new Set([profile.id, ...excludeIds])
		)

		if (idsToExclude.length) {
			query.andWhere('p.id NOT IN (:...idsToExclude)', { idsToExclude })
		}

		return query.getMany()
	}
}

import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Profile } from '@/module/profile/entities/profile.entity'
import { ProfileService } from '@/module/profile/services/profile.service'
import { ProfileRepository } from '@/module/profile/repository/profile.repository'
import { ViewedRepository } from '@/module/profile/repository/viewed.repository'
import { ViewedProfile } from '@/module/profile/entities/viewed.entity'

@Module({
	imports: [TypeOrmModule.forFeature([Profile, ViewedProfile])],
	providers: [ProfileService, ProfileRepository, ViewedRepository],
	controllers: [],
	exports: [ProfileService, ViewedRepository]
})
export class ProfileModule {}

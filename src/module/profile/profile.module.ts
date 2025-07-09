import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Profile } from '@/module/profile/entities/profile.entity'
import { ProfileService } from '@/module/profile/profile.service'
import { ProfileRepository } from '@/module/profile/profile.repository'

@Module({
	imports: [TypeOrmModule.forFeature([Profile])],
	providers: [ProfileService, ProfileRepository],
	controllers: [],
	exports: [ProfileService]
})
export class ProfileModule {}

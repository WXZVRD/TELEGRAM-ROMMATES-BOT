import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Account } from '@/module/account/entities/account.entity'
import { AccountService } from '@/module/account/account.service'
import { AccountRepository } from '@/module/account/account.repository'

@Module({
	imports: [TypeOrmModule.forFeature([Account])],
	providers: [AccountService, AccountRepository],
	controllers: [],
	exports: [AccountService]
})
export class AccountModule {}

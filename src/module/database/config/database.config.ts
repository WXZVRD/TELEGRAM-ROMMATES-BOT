import { TypeOrmModuleOptions } from '@nestjs/typeorm'
import { ConfigService } from '@nestjs/config'

export const getDbConfig = (
	configServiсe: ConfigService
): TypeOrmModuleOptions => ({
	type: 'postgres',
	host: configServiсe.get<string>('POSTGRES_HOST'),
	port: parseInt(configServiсe.get<string>('POSTGRES_PORT') || '5432', 10),
	username: configServiсe.get<string>('POSTGRES_USER'),
	password: configServiсe.get<string>('POSTGRES_PASSWORD'),
	database: configServiсe.get<string>('POSTGRES_DB'),
	autoLoadEntities: true,
	synchronize: true
})

import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const getPostgresConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  const logger = new Logger('PostgresConnection');

  const options: TypeOrmModuleOptions = {
    type: 'postgres',
    host: configService.get('DB_HOST'),
    port: +configService.get('DB_PORT'),
    username: configService.get('DB_USER') ,
    password: configService.get<string>('DB_PASS'),
    database: configService.get('DB_NAME'),
    entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
    synchronize: configService.get('DB_SYNC') === 'true',
    extra: {
      sessionTimeZone: 'America/Bogota',
    },
  };

  logger.log(
    'CONEXION EXITOSA A LA BASE DE DATOS ',
  );
  return options;
};
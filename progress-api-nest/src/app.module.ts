import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BadgesModule } from './badges/badges.module';
import { UsersModule } from './users/users.module';
import { UserProgressModule } from './user-progress/user-progress.module';
import { CoursesModule } from './courses/courses.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getPostgresConfig } from './config/db/db.config';

@Module({
  imports: [
    BadgesModule,
    UsersModule,
    UserProgressModule,
    CoursesModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getPostgresConfig,
      inject: [ConfigService],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

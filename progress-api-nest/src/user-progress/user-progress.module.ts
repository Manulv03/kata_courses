import { Module } from '@nestjs/common';
import { UserProgressService } from './user-progress.service';
import { UserProgressController } from './user-progress.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserProgress } from './entities/user-progress.entity';
import { User } from 'src/users/entities/user.entity';
import { Course } from 'src/courses/entities/course.entity';
import { BadgesModule } from 'src/badges/badges.module';

@Module({
  controllers: [UserProgressController],
  providers: [UserProgressService],
  imports: [
    TypeOrmModule.forFeature([UserProgress, User, Course]),
    BadgesModule,
  ],
})
export class UserProgressModule {}

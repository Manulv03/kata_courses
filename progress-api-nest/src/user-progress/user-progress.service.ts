import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserProgressDto } from './dto/create-user-progress.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { Course } from 'src/courses/entities/course.entity';
import { UserProgress } from './entities/user-progress.entity';
import { Logger } from '@nestjs/common';
import { BadgesService } from 'src/badges/badges.service';

@Injectable()
export class UserProgressService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(UserProgress)
    private readonly userProgressRepository: Repository<UserProgress>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    private readonly badgeService: BadgesService,
  ) {}
  private readonly logger = new Logger(UserProgressService.name);

  async create(createUserProgressDto: CreateUserProgressDto) {
    try {
      const user = await this.userRepository.findOneBy({
        email: createUserProgressDto.userEmail,
      });
      const course = await this.courseRepository.findOneBy({
        id: createUserProgressDto.courseId,
      });
      if (!user) {
        throw new NotFoundException(
          `user with email ${createUserProgressDto.userEmail} not found`,
        );
      }
      if (!course) {
        throw new NotFoundException(
          `course with id ${createUserProgressDto.courseId} not found`,
        );
      }
      const userProgress = this.userProgressRepository.create({
        user,
        course,
        status: 'started',
        startedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      this.logger.log(
        `Created user progress for user ${user.id} and course ${course.id}`,
      );
      await this.userProgressRepository.save(userProgress);

      return userProgress;
    } catch (error) {
      this.logger.error(`Failed to create user progress: ${error.message}`);
      throw error;
    }
  }

  findAll() {
    return `This action returns all userProgress`;
  }

  async findOne(id: number) {
    try {
      const userProgress = await this.userProgressRepository.findOneBy({ id });
      if (!userProgress) {
        throw new NotFoundException(`User progress with id ${id} not found`);
      }

      return { courseId: userProgress.course.id, status: userProgress.status };
    } catch (error) {
      throw error;
    }
  }

  async findByUserEmail(userEmail: string) {
    try {
      const userProgressList = await this.userProgressRepository.find({
        where: { user: { email: userEmail } },
      });
      return userProgressList.map((userProgress) => ({
        userName: userProgress.user.name,
        courseId: userProgress.course.id,
        courseName: userProgress.course.title,
        startedAt: userProgress.startedAt,
        completedAt: userProgress.completedAt,
        status: userProgress.status,
      }));
    } catch (error) {
      throw error;
    }
  }

  async findByUserEmailAndCourseId(userEmail: string, courseId: number) {
    try {
      const userProgress = await this.userProgressRepository.findOne({
        where: { user: { email: userEmail }, course: { id: courseId } },
      });
      if (!userProgress) {
        throw new NotFoundException(
          `User progress with user email ${userEmail} and course id ${courseId} not found`,
        );
      }
    const userProgressInfo = {
      userName: userProgress.user.name,
      courseId: userProgress.course.id,
      courseName: userProgress.course.title,
      startedAt: userProgress.startedAt,
      completedAt: userProgress.completedAt,
      status: userProgress.status,
    };
      return  userProgressInfo;
    } catch (error) {
      throw error;
    }
  }

  async completeCourse(courseId: number, userId: number) {
    try {
      let userProgress = await this.userProgressRepository.findOne({
        where: { user: { id: userId }, course: { id: courseId } },
      });
      if (!userProgress) {
        throw new NotFoundException(`User progress with user id ${userId} and course id ${courseId} not found`);
      }
      
      let isCompleted = userProgress.status === 'completed';
      if (isCompleted) {
        throw new ConflictException(`Course already completed`);
      }
      userProgress.status = 'completed';
      userProgress.completedAt = new Date().toISOString();
      userProgress.updatedAt = new Date().toISOString();

      const badge = {
        code: String(userProgress.user.id),
        title: `Completed ${userProgress.course.title}`,
        description: `user ${userProgress.user.name} has completed the course`,
        image_url: 'https://cdn-icons-png.flaticon.com/512/1534/1534225.png',
      };

      const [badgeCreated, courseCompleted] = await Promise.all([
        await this.badgeService.create(badge),
        await this.userProgressRepository.save(userProgress),
      ]);
      const badgeId = badgeCreated.id;
      const courseCompletedInfo = {
        courseId: courseCompleted.course.id,
        userName: courseCompleted.user.name,
        courseTitle: courseCompleted.course.title,
        status: courseCompleted.status,
      };
      return {
        message: 'Course completed successfully',
        badge: badgeId,
        course: courseCompletedInfo,
      };
    } catch (error) {
      throw error;
    }
  }

  remove(id: number) {
    return `This action removes a #${id} userProgress`;
  }
}

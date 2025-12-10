import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserProgressService } from './user-progress.service';
import { UserProgress } from './entities/user-progress.entity';
import { User } from 'src/users/entities/user.entity';
import { Course } from 'src/courses/entities/course.entity';
import { BadgesService } from 'src/badges/badges.service';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('UserProgressService', () => {
  let service: UserProgressService;
  let userProgressRepo: jest.Mocked<Repository<UserProgress>>;
  let userRepo: jest.Mocked<Repository<User>>;
  let courseRepo: jest.Mocked<Repository<Course>>;
  let badgeService: jest.Mocked<BadgesService>;

  beforeEach(async () => {
    userProgressRepo = {
      findOne: jest.fn(),
      find: jest.fn(),
      save: jest.fn(),
    } as unknown as jest.Mocked<Repository<UserProgress>>;

    userRepo = {
      findOneBy: jest.fn(),
    } as unknown as jest.Mocked<Repository<User>>;

    courseRepo = {
      findOneBy: jest.fn(),
    } as unknown as jest.Mocked<Repository<Course>>;

    badgeService = {
      create: jest.fn(),
    } as unknown as jest.Mocked<BadgesService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserProgressService,
        { provide: getRepositoryToken(User), useValue: userRepo },
        { provide: getRepositoryToken(UserProgress), useValue: userProgressRepo },
        { provide: getRepositoryToken(Course), useValue: courseRepo },
        { provide: BadgesService, useValue: badgeService },
      ],
    }).compile();

    service = module.get<UserProgressService>(UserProgressService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('completeCourse', () => {
    it('marca el curso como completado y crea badge', async () => {
      const baseDate = new Date('2024-01-01T00:00:00Z');
      jest.useFakeTimers().setSystemTime(baseDate);

      const progress: Partial<UserProgress> = {
        id: 1,
        status: 'started',
        user: { id: 1, name: 'Alice' } as User,
        course: { id: 1, title: 'NestJS 101' } as Course,
        startedAt: baseDate.toISOString(),
        updatedAt: baseDate.toISOString(),
      };

      userProgressRepo.findOne.mockResolvedValue(progress as UserProgress);
      badgeService.create.mockResolvedValue({ id: 99 } as any);
      userProgressRepo.save.mockImplementation(async (p) => p as UserProgress);

      const result = await service.completeCourse(1, 1);

      expect(userProgressRepo.findOne).toHaveBeenCalledWith({
        where: { user: { id: 1 }, course: { id: 1 } },
      });
      expect(userProgressRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'completed', completedAt: baseDate.toISOString() }),
      );
      expect(badgeService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          code: '1',
          title: expect.stringContaining('NestJS 101'),
        }),
      );
      expect(result).toMatchObject({
        message: 'Course completed successfully',
        badge: 99,
        course: {
          courseId: 1,
          userName: 'Alice',
          courseTitle: 'NestJS 101',
          status: 'completed',
        },
      });

      jest.useRealTimers();
    });

    it('lanza ConflictException si ya está completado', async () => {
      const progress: Partial<UserProgress> = {
        id: 1,
        status: 'completed',
        user: { id: 1, name: 'Alice' } as User,
        course: { id: 1, title: 'NestJS 101' } as Course,
        startedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      userProgressRepo.findOne.mockResolvedValue(progress as UserProgress);

      await expect(service.completeCourse(1, 1)).rejects.toBeInstanceOf(ConflictException);
      expect(userProgressRepo.save).not.toHaveBeenCalled();
      expect(badgeService.create).not.toHaveBeenCalled();
    });

    it('lanza NotFoundException si no existe el progreso', async () => {
      userProgressRepo.findOne.mockResolvedValue(null);

      await expect(service.completeCourse(1, 1)).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('findByUserEmail', () => {
    it('devuelve el listado mapeado de progreso por email', async () => {
      const now = new Date().toISOString();
      userProgressRepo.find.mockResolvedValue([
        {
          id: 1,
          user: { name: 'Alice', email: 'a@a.com' } as User,
          course: { id: 10, title: 'NestJS 101' } as Course,
          startedAt: now,
          completedAt: null as unknown as string,
          updatedAt: now,
          status: 'started',
        } as unknown as UserProgress,
      ]);

      const result = await service.findByUserEmail('a@a.com');

      expect(userProgressRepo.find).toHaveBeenCalledWith({
        where: { user: { email: 'a@a.com' } },
      });
      expect(result).toEqual([
        {
          userName: 'Alice',
          courseId: 10,
          courseName: 'NestJS 101',
          startedAt: now,
          completedAt: null,
          status: 'started',
        },
      ]);
    });
  });
});

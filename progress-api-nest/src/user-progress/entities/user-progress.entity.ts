import { Course } from 'src/courses/entities/course.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('user_progress')
export class UserProgress {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.userProgress, { eager: true })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: User;

  @ManyToOne(() => Course, (course) => course.userProgress, { eager: true })
  @JoinColumn({ name: 'course_id', referencedColumnName: 'id' })
  course: Course;

  @Column({ name: 'status' })
  status: string;

  @Column({ name: 'started_at' })
  startedAt: string;

  @Column({ name: 'completed_at', nullable: true })
  completedAt: string;

  @Column({ name: 'updated_at' })
  updatedAt: string;
}

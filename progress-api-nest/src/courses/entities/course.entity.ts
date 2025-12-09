import { UserProgress } from 'src/user-progress/entities/user-progress.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'title' })
  title: string;

  @Column({ name: 'description' })
  description: string;

  @Column({ name: 'module' })
  module: string;

  @Column({ name: 'duration_hours' })
  durationHours: number;

  @Column({ name: 'badge_image' })
  badgeImage: string;

  @CreateDateColumn({
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
    name: 'created_at',
  })
  createdAt: string;

  @Column({ name: 'updated_at' })
  updatedAt: string;

  @OneToMany(() => UserProgress, (userProgress) => userProgress.course)
  userProgress: UserProgress[];
}

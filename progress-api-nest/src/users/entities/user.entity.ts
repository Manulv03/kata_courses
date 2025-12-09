import { UserProgress } from 'src/user-progress/entities/user-progress.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true, unique: true, name: 'email', type: 'varchar' })
  email: string;

  @Column({ name: 'password', nullable: true, type: 'varchar' })
  password: string;

  @Column({ name: 'name', nullable: true, type: 'varchar' })
  name: string;

  @Column({ name: 'role', nullable: true })
  role: string;

  @CreateDateColumn({
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
    name: 'created_at',
  })
  createdAt: string;

  @OneToMany(() => UserProgress, (userProgress) => userProgress.user)
  userProgress: UserProgress[];
}

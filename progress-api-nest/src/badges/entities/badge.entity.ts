import { BeforeInsert, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('badges')
export class Badge {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({unique: false})
  code: string;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column({ nullable: true, name: 'image_url', type: 'varchar', default: 'N/A' })
  image_url: string;

  @Column({ nullable: true, name: 'created_at'})
  createAt: string;

  @BeforeInsert()
  setCreateAt() {
    this.createAt = new Date().toISOString();
  }
}

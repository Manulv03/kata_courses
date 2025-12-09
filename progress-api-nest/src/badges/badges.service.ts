import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateBadgeDto } from './dto/create-badge.dto';
import { UpdateBadgeDto } from './dto/update-badge.dto';
import { InjectRepository } from '@nestjs/typeorm';
import {  Repository } from 'typeorm';
import { Badge } from './entities/badge.entity';

@Injectable()
export class BadgesService {
  constructor(
    @InjectRepository(Badge)
    private readonly badgeRepository: Repository<Badge>,
  ) {}

  async create(createBadgeDto: CreateBadgeDto) {
    try {
      let badge = this.badgeRepository.create(createBadgeDto);
      await this.badgeRepository.save(badge);
      return badge;
    } catch (error) {
      throw error;
    }
  }

  async findAll() {
    try {
      const badges = await this.badgeRepository.find();
      return badges;
    } catch (error) {
      throw new InternalServerErrorException('Error fetching badges');
    }
  }

  async findBadgesByUserId(email: string) {
    try {
      const query = await this.badgeRepository
        .createQueryBuilder('bd')
        .leftJoin('users', 'usu', 'CAST(bd.code AS BIGINT) = usu.id')
        .select([
          'bd.code AS code',
          'bd.title AS title',
          'bd.description AS description',
          'usu.id AS userId',
          'usu.name AS userName',
        ])
        .where('usu.email = :email', { email: email })
        .getRawMany();
      if (!query || query.length === 0) {
        throw new NotFoundException(`Badges for user with email ${email} not found`);
      }
      return query;
    } catch (error) {
      throw error;
    }
  }

  update(id: number, updateBadgeDto: UpdateBadgeDto) {
    return `This action updates a #${id} badge`;
  }

  remove(id: number) {
    return `This action removes a #${id} badge`;
  }
}

import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { BadgesService } from './badges.service';
import { CreateBadgeDto } from './dto/create-badge.dto';
import { UpdateBadgeDto } from './dto/update-badge.dto';

@Controller('badges')
export class BadgesController {
  constructor(private readonly badgesService: BadgesService) {}

  @Post()
  create(@Body() createBadgeDto: CreateBadgeDto) {
    return this.badgesService.create(createBadgeDto);
  }

  @Get()
  findAll() {
    return this.badgesService.findAll();
  }

  @Get('user/:email')
  findOne(@Param('email') email: string) {
    return this.badgesService.findBadgesByUserId(email);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBadgeDto: UpdateBadgeDto) {
    return this.badgesService.update(+id, updateBadgeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.badgesService.remove(+id);
  }

  
}

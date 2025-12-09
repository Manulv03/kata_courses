import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { UserProgressService } from './user-progress.service';
import { CreateUserProgressDto } from './dto/create-user-progress.dto';

@Controller('user-progress')
export class UserProgressController {
  constructor(private readonly userProgressService: UserProgressService) {}

  @Post()
  create(@Body() createUserProgressDto: CreateUserProgressDto) {
    return this.userProgressService.create(createUserProgressDto);
  }

  @Get()
  findAll() {
    return this.userProgressService.findAll();
  }

  @Get('user/:email')
  findByUserEmail(@Param('email') email: string) {
    return this.userProgressService.findByUserEmail(email);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userProgressService.findOne(+id);
  }

  @Patch('complete-course/:courseId/:userId')
  completeCourse(@Param('courseId') courseId: string, @Param('userId') userId: string) {
    return this.userProgressService.completeCourse(+courseId, +userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userProgressService.remove(+id);
  }

  @Get('user/:email/:id')
  findByUserEmailAndId(@Param('email') email: string, @Param('id') id: string) {
    return this.userProgressService.findByUserEmailAndCourseId(email, +id);
  }
}

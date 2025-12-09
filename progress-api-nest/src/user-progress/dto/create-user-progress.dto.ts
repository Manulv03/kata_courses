import { IsEmail, IsInt, IsNumber } from 'class-validator';

export class CreateUserProgressDto {
  @IsEmail()
  userEmail: string;
  @IsNumber()
  courseId: number;
}

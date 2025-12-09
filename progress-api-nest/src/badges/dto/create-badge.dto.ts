import { IsString } from 'class-validator';

export class CreateBadgeDto {
  @IsString({ message: 'Code must be a string' })
  code: string;

  @IsString({ message: 'Title must be a string' })
  title: string;

  @IsString({ message: 'Description must be a string'})
  description: string;

  @IsString({ message: 'Image URL must be a string' })
  image_url: string;
}

import { IsNumber, IsEmail, IsString, IsUrl } from 'class-validator';

export class UserResponseDto {
  @IsNumber()
  id: number;

  @IsEmail()
  email: string;

  @IsString()
  first_name: string;

  @IsString()
  last_name: string;

  @IsUrl()
  avatar: string;
}

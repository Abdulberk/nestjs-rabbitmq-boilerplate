import { IsNotEmpty, IsString, IsEmail, IsOptional } from 'class-validator';

export class CreateEntryDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  job: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  avatar: string;

  @IsString()
  @IsOptional()
  avatarHash: string;
}

import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional() @IsString() @MaxLength(120)
  name?: string;

  @IsOptional() @IsString() @MaxLength(40)
  phone?: string;

  @IsOptional() @IsString() @MaxLength(255)
  address?: string;

  @IsOptional() @IsString()
  avatarUrl?: string;
}

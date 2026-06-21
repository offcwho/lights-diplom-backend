import { IsBoolean, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateBannerDto {
  @IsString() @MaxLength(255)
  title: string;

  @IsOptional() @IsString() @MaxLength(255)
  subtitle?: string;

  @IsOptional() @IsString()
  description?: string;

  @IsString()
  imageUrl: string;

  @IsOptional() @IsString() @MaxLength(512)
  action?: string;

  @IsOptional() @IsString() @MaxLength(120)
  buttonLabel?: string;

  @IsOptional() @IsBoolean()
  isActive?: boolean;

  @IsOptional() @IsInt() @Min(0)
  order?: number;
}

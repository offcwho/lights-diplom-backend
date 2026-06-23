import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class SendVerificationDto {
  @IsOptional() @IsString()
  name?: string;

  @IsEmail()
  email: string;

  @IsString() @MinLength(6)
  password: string;
}

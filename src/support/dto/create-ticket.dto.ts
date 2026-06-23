import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateTicketDto {
  @IsString() @MaxLength(120)
  name: string;

  @IsEmail()
  email: string;

  @IsOptional() @IsString() @MaxLength(200)
  subject?: string;

  @IsString() @MaxLength(3000)
  message: string;
}

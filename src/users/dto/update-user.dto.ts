import { IsEnum, IsOptional } from 'class-validator';
import { UserRole } from '../../generated/prisma/enums';
import { UpdateProfileDto } from './update-profile.dto';

export class UpdateUserDto extends UpdateProfileDto {
  @IsOptional() @IsEnum(UserRole)
  role?: UserRole;
}

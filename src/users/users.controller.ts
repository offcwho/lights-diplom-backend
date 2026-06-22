import { Body, Controller, Delete, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole } from '../generated/prisma/enums';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Get('me')
  me(@CurrentUser('id') id: string) {
    return this.usersService.getProfile(id);
  }

  @Patch('me')
  updateMe(@CurrentUser('id') id: number, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(id, dto);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.admin)
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.admin)
  @Patch(':id')
  updateUser(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.updateUser(id, dto);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.admin)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}

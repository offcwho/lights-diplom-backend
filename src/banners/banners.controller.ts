import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { BannersService } from './banners.service';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../generated/prisma/enums';

@ApiTags('banners')
@Controller('banners')
export class BannersController {
  constructor(private readonly service: BannersService) {}

  @Get()
  findActive() {
    return this.service.findActive();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.admin)
  @Get('all')
  findAll() {
    return this.service.findAll();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.admin)
  @Post('all')
  create(@Body() dto: CreateBannerDto) {
    return this.service.create(dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.admin)
  @Patch('all/:id')
  update(@Param('id') id: string, @Body() dto: UpdateBannerDto) {
    return this.service.update(id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.admin)
  @Delete('all/:id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}

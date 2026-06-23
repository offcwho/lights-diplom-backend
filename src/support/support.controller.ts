import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SupportService } from './support.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../generated/prisma/enums';

@ApiTags('support')
@Controller('support')
export class SupportController {
  constructor(private readonly service: SupportService) {}

  @Post()
  create(@Body() dto: CreateTicketDto, @CurrentUser('id') userId?: string) {
    return this.service.create(dto, userId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.admin)
  @Get()
  findAll() {
    return this.service.findAll();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.admin)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.admin)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTicketDto) {
    return this.service.update(id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.admin)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}

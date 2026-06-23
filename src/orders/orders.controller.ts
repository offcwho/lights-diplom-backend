import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../generated/prisma/enums';

@ApiTags('orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly service: OrdersService) { }

  @Post()
  checkout(@CurrentUser('id') userId: string, @Body() dto: CreateOrderDto) {
    return this.service.checkout(userId, dto);
  }

  @Get()
  list(@CurrentUser('id') userId: string) {
    return this.service.list(userId);
  }

  @Get(':id')
  findOne(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.service.findOne(userId, id);
  }

  @Post(':id/pay')
  pay(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.service.pay(userId, id);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.admin)
  @Patch(':id')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateOrderDto) {
    return this.service.updateStatus(id, dto.status);
  }
}

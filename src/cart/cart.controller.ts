import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('cart')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cart')
export class CartController {
  constructor(private readonly service: CartService) { }

  @Get()
  get(@CurrentUser('id') userId: string) {
    return this.service.get(userId);
  }

  @Post('items')
  add(@CurrentUser('id') userId: string, @Body() dto: AddToCartDto) {
    return this.service.add(userId, dto);
  }

  @Patch('items/:id')
  update(@CurrentUser('id') userId: string, @Param('id') id: string, @Body() dto: UpdateCartItemDto) {
    return this.service.updateItem(userId, id, dto.quantity);
  }

  @Delete('items/:id')
  remove(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.service.removeItem(userId, id);
  }

  @Delete()
  clear(@CurrentUser('id') userId: string) {
    return this.service.clear(userId);
  }
}

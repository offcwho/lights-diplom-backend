import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { CartService } from '../cart/cart.service';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cartService: CartService,
  ) {}

  /** Creates an order from the user's current cart, then clears it. */
  async checkout(userId: string, dto: CreateOrderDto) {
    const cart = await this.cartService.get(userId);
    if (!cart.items.length) throw new BadRequestException('Cart is empty');

    const order = await this.prisma.order.create({
      data: {
        userId,
        total: cart.total,
        shippingAddress: dto.shippingAddress,
        phone: dto.phone,
        items: {
          create: cart.items.map((i) => ({
            productId: i.product.id,
            name: i.product.name,
            price: i.product.price,
            quantity: i.quantity,
          })),
        },
      },
      include: { items: true },
    });

    await this.cartService.clear(userId);
    return order;
  }

  list(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { items: true },
    });
  }

  async findOne(userId: string, id: string) {
    const order = await this.prisma.order.findFirst({
      where: { id, userId },
      include: { items: true },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async pay(userId: string, id: string) {
    const order = await this.prisma.order.findFirst({ where: { id, userId } });
    if (!order) throw new NotFoundException('Order not found');
    return this.prisma.order.update({ where: { id }, data: { status: 'paid' as any } });
  }

  async updateStatus(id: string, status: string) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundException('Order not found');
    return this.prisma.order.update({ where: { id }, data: { status: status as any } });
  }
}

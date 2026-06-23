import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { CartService } from '../cart/cart.service';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cartService: CartService,
  ) { }

  /** Creates an order from the user's current cart, then clears it. */
  async checkout(userId: string, dto: CreateOrderDto) {
    const cart = await this.cartService.get(userId);
    if (!cart.items.length) throw new BadRequestException('Cart is empty');

    let total = cart.total;
    let appliedPromoId: string | undefined;

    // Применяем промокод если передан
    if (dto.promoCode) {
      const promo = await this.prisma.promoCode.findFirst({
        where: {
          code: dto.promoCode,
          isActive: true,
          AND: [
            { OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] },
          ],
        },
      });

      // Проверяем лимит использований отдельно (Prisma не умеет сравнивать два поля)
      const withinLimit = !promo?.maxUses || promo.usedCount < promo.maxUses;

      if (promo && withinLimit) {
        const discount = promo.discountType === 'percentage'
          ? total * promo.discountValue / 100
          : Math.min(promo.discountValue, total);
        total = Math.max(0, total - discount);
        appliedPromoId = promo.id;
      }
    }

    const order = await this.prisma.order.create({
      data: {
        userId,
        total,  // <-- теперь со скидкой
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
      include: { items: true, user: true },
    });

    // Увеличиваем счётчик использований
    if (appliedPromoId) {
      await this.prisma.promoCode.update({
        where: { id: appliedPromoId },
        data: { usedCount: { increment: 1 } },
      });
    }

    await this.cartService.clear(userId);
    return order;
  }

  list(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { items: true, user: true },
    });
  }

  async findOne(userId: string, id: string) {
    const order = await this.prisma.order.findFirst({
      where: { id, userId },
      include: { items: true, user: true },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async pay(userId: string, id: string) {
    const order = await this.prisma.order.findFirst({ where: { id, userId } });
    if (!order) throw new NotFoundException('Order not found');
    return this.prisma.order.update({ where: { id }, data: { status: 'paid' as any } });
  }

  async cancel(userId: string, id: string) {
    const order = await this.prisma.order.findFirst({ where: { id, userId } });
    if (!order) throw new NotFoundException('Order not found');
    if (['shipped', 'sent', 'completed'].includes(order.status)) {
      throw new BadRequestException('Cannot cancel order with status: ' + order.status);
    }
    return this.prisma.order.update({ where: { id }, data: { status: 'cancelled' as any } });
  }

  async updateStatus(id: string, status: string) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundException('Order not found');
    return this.prisma.order.update({ where: { id }, data: { status: status as any } });
  }
}

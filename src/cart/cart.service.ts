import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddToCartDto } from './dto/add-to-cart.dto';

const cartInclude = {
  items: { include: { product: { include: { category: true } } }, orderBy: { id: 'asc' as const } },
};

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  private async getOrCreate(userId: string) {
    return this.prisma.cart.upsert({
      where: { userId },
      create: { userId },
      update: {},
      include: cartInclude,
    });
  }

  private withTotals(cart: Awaited<ReturnType<CartService['getOrCreate']>>) {
    const items = cart.items;
    const total = items.reduce((s, i) => s + i.product.price * i.quantity, 0);
    const count = items.reduce((s, i) => s + i.quantity, 0);
    return { id: cart.id, items, count, total };
  }

  async get(userId: string) {
    return this.withTotals(await this.getOrCreate(userId));
  }

  async add(userId: string, dto: AddToCartDto) {
    const cart = await this.getOrCreate(userId);
    const product = await this.prisma.product.findUnique({ where: { id: dto.productId } });
    if (!product) throw new NotFoundException('Product not found');

    await this.prisma.cartItem.upsert({
      where: { cartId_productId: { cartId: cart.id, productId: dto.productId } },
      create: { cartId: cart.id, productId: dto.productId, quantity: dto.quantity },
      update: { quantity: { increment: dto.quantity } },
    });
    return this.get(userId);
  }

  async updateItem(userId: string, itemId: string, quantity: number) {
    const cart = await this.getOrCreate(userId);
    const res = await this.prisma.cartItem.updateMany({
      where: { id: itemId, cartId: cart.id },
      data: { quantity },
    });
    if (res.count === 0) throw new NotFoundException('Cart item not found');
    return this.get(userId);
  }

  async removeItem(userId: string, itemId: string) {
    const cart = await this.getOrCreate(userId);
    await this.prisma.cartItem.deleteMany({ where: { id: itemId, cartId: cart.id } });
    return this.get(userId);
  }

  async clear(userId: string) {
    const cart = await this.getOrCreate(userId);
    await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    return this.get(userId);
  }
}

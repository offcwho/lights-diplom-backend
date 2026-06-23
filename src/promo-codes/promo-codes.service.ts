import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePromoCodeDto } from './dto/create-promo-code.dto';
import { UpdatePromoCodeDto } from './dto/update-promo-code.dto';
import { ApplyPromoCodeDto } from './dto/apply-promo-code.dto';
import { DiscountType } from '../generated/prisma/enums';

@Injectable()
export class PromoCodesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.promoCode.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: string) {
    const promo = await this.prisma.promoCode.findUnique({ where: { id } });
    if (!promo) throw new NotFoundException('Promo code not found');
    return promo;
  }

  create(dto: CreatePromoCodeDto) {
    return this.prisma.promoCode.create({ data: dto as any });
  }

  async update(id: string, dto: UpdatePromoCodeDto) {
    await this.findOne(id);
    return this.prisma.promoCode.update({ where: { id }, data: dto as any });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.promoCode.delete({ where: { id } });
    return { deleted: true };
  }

  async apply(dto: ApplyPromoCodeDto) {
    const promo = await this.prisma.promoCode.findUnique({
      where: { code: dto.code.toUpperCase() },
    });

    if (!promo || !promo.isActive) throw new BadRequestException('Invalid promo code');
    if (promo.expiresAt && promo.expiresAt < new Date()) throw new BadRequestException('Promo code expired');
    if (promo.maxUses !== null && promo.usedCount >= promo.maxUses) throw new BadRequestException('Promo code usage limit reached');
    if (promo.minOrderAmount !== null && dto.orderAmount < promo.minOrderAmount) {
      throw new BadRequestException(`Minimum order amount is ${promo.minOrderAmount}`);
    }

    const discount =
      promo.discountType === DiscountType.percentage
        ? Math.round((dto.orderAmount * promo.discountValue) / 100 * 100) / 100
        : Math.min(promo.discountValue, dto.orderAmount);

    return {
      code: promo.code,
      discountType: promo.discountType,
      discountValue: promo.discountValue,
      discount,
      total: Math.max(0, dto.orderAmount - discount),
    };
  }
}

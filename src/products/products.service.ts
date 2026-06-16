import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductSort, QueryProductsDto } from './dto/query-products.dto';
import { Prisma } from '../generated/prisma/client';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) { }

  async findAll(q: QueryProductsDto) {
    const page = q.page ?? 1;
    const limit = q.limit ?? 12;

    const where: Prisma.ProductWhereInput = {};
    if (q.category) where.category = { slug: q.category };
    if (q.minPrice !== undefined || q.maxPrice !== undefined) {
      where.price = {};
      if (q.minPrice !== undefined) where.price.gte = q.minPrice;
      if (q.maxPrice !== undefined) where.price.lte = q.maxPrice;
    }
    if (q.onSale !== undefined) where.isOnSale = q.onSale;
    if (q.search) where.name = { contains: q.search };

    let orderBy: Prisma.ProductOrderByWithRelationInput;
    switch (q.sort) {
      case ProductSort.PRICE_ASC: orderBy = { price: 'asc' }; break;
      case ProductSort.PRICE_DESC: orderBy = { price: 'desc' }; break;
      case ProductSort.NEWEST: orderBy = { createdAt: 'desc' }; break;
      default: orderBy = { popularity: 'desc' };
    }

    const [items, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where, orderBy, skip: (page - 1) * limit, take: limit,
        include: { category: true },
      }),
      this.prisma.product.count({ where }),
    ]);

    return { items, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async findBySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug }, include: { category: true },
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  create(dto: CreateProductDto) {
    const { categoryId, attributes, ...rest } = dto;
    return this.prisma.product.create({
      data: {
        ...rest,
        ...(attributes !== undefined && { attributes: attributes as unknown as Prisma.InputJsonValue }),
        ...(categoryId ? { category: { connect: { id: categoryId } } } : {}),
      },
    });
  }

  async update(id: string, dto: UpdateProductDto) {
    const { categoryId, attributes, ...rest } = dto;
    return this.prisma.product.update({
      where: { id },
      data: {
        ...rest,
        ...(attributes !== undefined && { attributes: attributes as unknown as Prisma.InputJsonValue }),
        ...(categoryId && { category: { connect: { id: categoryId } } }),
      },
    });
  }
  async remove(id: string) {
    await this.prisma.product.delete({ where: { id } });
    return { deleted: true };
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductSort, QueryProductsDto } from './dto/query-products.dto';
import { Prisma } from '../generated/prisma/client';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: QueryProductsDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 12;

    const where: Prisma.ProductWhereInput = {};
    if (query.category) where.category = { slug: query.category };
    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      where.price = {};
      if (query.minPrice !== undefined) where.price.gte = query.minPrice;
      if (query.maxPrice !== undefined) where.price.lte = query.maxPrice;
    }
    if (query.onSale !== undefined) where.isOnSale = query.onSale;
    if (query.search) where.name = { contains: query.search, mode: 'insensitive' };

    const specWhere: Prisma.ProductSpecWhereInput = {};
    if (query.styles?.length) specWhere.styles = { hasSome: query.styles };
    if (query.rooms?.length) specWhere.rooms = { hasSome: query.rooms };
    if (query.shapes?.length) specWhere.shapes = { hasSome: query.shapes };
    if (query.colorTemps?.length) specWhere.colorTemps = { hasSome: query.colorTemps };
    if (query.lampType) specWhere.lampType = query.lampType;
    if (query.mountingType) specWhere.mountingType = query.mountingType;
    if (query.frameColor) specWhere.frameColor = query.frameColor;
    if (query.minPowerW !== undefined || query.maxPowerW !== undefined) {
      specWhere.powerW = {};
      if (query.minPowerW !== undefined) (specWhere.powerW as Prisma.IntNullableFilter).gte = query.minPowerW;
      if (query.maxPowerW !== undefined) (specWhere.powerW as Prisma.IntNullableFilter).lte = query.maxPowerW;
    }
    if (query.minAreaM2 !== undefined || query.maxAreaM2 !== undefined) {
      specWhere.maxAreaM2 = {};
      if (query.minAreaM2 !== undefined) (specWhere.maxAreaM2 as Prisma.FloatNullableFilter).gte = query.minAreaM2;
      if (query.maxAreaM2 !== undefined) (specWhere.maxAreaM2 as Prisma.FloatNullableFilter).lte = query.maxAreaM2;
    }
    if (Object.keys(specWhere).length) where.spec = specWhere;

    let orderBy: Prisma.ProductOrderByWithRelationInput;
    switch (query.sort) {
      case ProductSort.PRICE_ASC:  orderBy = { price: 'asc' };       break;
      case ProductSort.PRICE_DESC: orderBy = { price: 'desc' };      break;
      case ProductSort.NEWEST:     orderBy = { createdAt: 'desc' };  break;
      default:                     orderBy = { popularity: 'desc' };
    }

    const [items, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where, orderBy, skip: (page - 1) * limit, take: limit,
        include: { category: true, spec: true },
      }),
      this.prisma.product.count({ where }),
    ]);

    return { items, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async findBySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: { category: true, spec: true },
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async getFilters() {
    const specs = await this.prisma.productSpec.findMany({
      select: {
        styles: true, rooms: true, shapes: true, colorTemps: true,
        lampType: true, mountingType: true, frameColor: true,
        frameMaterial: true, shadeMaterials: true, shadeColors: true,
        powerW: true, maxAreaM2: true,
      },
    });

    const unique = <T>(arr: T[]) => [...new Set(arr)].filter(Boolean).sort();
    const flatUnique = (arr: string[][]) => unique(arr.flat());

    const powers = specs.map((s) => s.powerW).filter((v): v is number => v !== null);
    const areas = specs.map((s) => s.maxAreaM2).filter((v): v is number => v !== null);

    return {
      styles:        flatUnique(specs.map((s) => s.styles)),
      rooms:         flatUnique(specs.map((s) => s.rooms)),
      shapes:        flatUnique(specs.map((s) => s.shapes)),
      colorTemps:    flatUnique(specs.map((s) => s.colorTemps)),
      shadeMaterials:flatUnique(specs.map((s) => s.shadeMaterials)),
      shadeColors:   flatUnique(specs.map((s) => s.shadeColors)),
      lampTypes:     unique(specs.map((s) => s.lampType)),
      mountingTypes: unique(specs.map((s) => s.mountingType)),
      frameColors:   unique(specs.map((s) => s.frameColor)),
      frameMaterials:unique(specs.map((s) => s.frameMaterial)),
      powerW: powers.length ? { min: Math.min(...powers), max: Math.max(...powers) } : null,
      maxAreaM2: areas.length ? { min: Math.min(...areas), max: Math.max(...areas) } : null,
    };
  }

  create(dto: CreateProductDto) {
    const { categoryId, spec, ...rest } = dto;
    return this.prisma.product.create({
      data: {
        ...rest,
        ...(categoryId ? { category: { connect: { id: categoryId } } } : {}),
        ...(spec ? { spec: { create: spec } } : {}),
      },
      include: { category: true, spec: true },
    });
  }

  async update(id: string, dto: UpdateProductDto) {
    const { categoryId, spec, ...rest } = dto;
    return this.prisma.product.update({
      where: { id },
      data: {
        ...rest,
        ...(categoryId && { category: { connect: { id: categoryId } } }),
        ...(spec ? { spec: { upsert: { create: spec, update: spec } } } : {}),
      },
      include: { category: true, spec: true },
    });
  }

  async remove(id: string) {
    await this.prisma.product.delete({ where: { id } });
    return { deleted: true };
  }
}

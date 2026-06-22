import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCharacteristicDto } from './dto/create-characteristic.dto';
import { UpdateCharacteristicDto } from './dto/update-characteristic.dto';

@Injectable()
export class CharacteristicsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.characteristics.findMany({ orderBy: { name: 'asc' } });
  }

  async findOne(id: string) {
    const item = await this.prisma.characteristics.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Characteristic not found');
    return item;
  }

  create(dto: CreateCharacteristicDto) {
    return this.prisma.characteristics.create({ data: dto });
  }

  async update(id: string, dto: UpdateCharacteristicDto) {
    await this.findOne(id);
    return this.prisma.characteristics.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.characteristics.delete({ where: { id } });
    return { deleted: true };
  }
}

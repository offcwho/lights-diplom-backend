import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';

@Injectable()
export class SupportService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.supportTicket.findMany({
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
  }

  async findOne(id: string) {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
    if (!ticket) throw new NotFoundException('Ticket not found');
    return ticket;
  }

  create(dto: CreateTicketDto, userId?: string) {
    return this.prisma.supportTicket.create({
      data: { ...dto, ...(userId ? { userId } : {}) },
    });
  }

  async update(id: string, dto: UpdateTicketDto) {
    await this.findOne(id);
    return this.prisma.supportTicket.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.supportTicket.delete({ where: { id } });
    return { deleted: true };
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '../generated/prisma/client';
import { UserCreateInput } from '../generated/prisma/models';

const publicSelect = {
    id: true, email: true, name: true, role: true,
    createdAt: true, updatedAt: true,
} satisfies Prisma.UserSelect;

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    create(data: UserCreateInput) {
        return this.prisma.user.create({ data, select: publicSelect });
    }

    findById(id: string) {
        const user = this.prisma.user.findUnique({ where: { id: id } });
        if (!user) throw new NotFoundException('Пользователь не найден');
        return user;
    }

    findByEmail(email: string) {
        const user = this.prisma.user.findUnique({ where: { email }, select: publicSelect });
        if (!user) throw new NotFoundException('Пользователь не найден');
        return user;
    }

    findByEmailWithPassword(email: string) {
        const user = this.prisma.user.findUnique({ where: { email } });
        if (!user) throw new NotFoundException('Пользователь не найден');
        return user;
    }

    async getProfile(id: string) {
        const user = await this.findById(id);
        if (!user) throw new NotFoundException('User not found');
        return user;
    }

    updateProfile(id: number, dto: UpdateProfileDto) {
        return this.prisma.user.update({ where: { id: String(id) }, data: dto, select: publicSelect });
    }
}

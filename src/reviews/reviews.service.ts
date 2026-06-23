import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UserRole } from '../generated/prisma/enums';

const userSelect = { id: true, name: true, avatarUrl: true };

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  findByProduct(productId: string) {
    return this.prisma.review.findMany({
      where: { productId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: userSelect },
        questions: {
          orderBy: { createdAt: 'asc' },
          include: { user: { select: userSelect } },
        },
      },
    });
  }

  create(userId: string, dto: CreateReviewDto) {
    const { productId, ...rest } = dto;
    return this.prisma.review.create({
      data: { ...rest, userId, productId },
      include: { user: { select: userSelect }, questions: true },
    });
  }

  async remove(userId: string, id: string, role: UserRole) {
    const review = await this.prisma.review.findUnique({ where: { id } });
    if (!review) throw new NotFoundException('Review not found');
    if (review.userId !== userId && role !== UserRole.admin) throw new ForbiddenException();
    await this.prisma.review.delete({ where: { id } });
    return { deleted: true };
  }

  async addQuestion(userId: string, reviewId: string, dto: CreateQuestionDto) {
    const review = await this.prisma.review.findUnique({ where: { id: reviewId } });
    if (!review) throw new NotFoundException('Review not found');
    return this.prisma.reviewQuestion.create({
      data: { ...dto, userId, reviewId },
      include: { user: { select: userSelect } },
    });
  }

  async removeQuestion(userId: string, id: string, role: UserRole) {
    const question = await this.prisma.reviewQuestion.findUnique({ where: { id } });
    if (!question) throw new NotFoundException('Question not found');
    if (question.userId !== userId && role !== UserRole.admin) throw new ForbiddenException();
    await this.prisma.reviewQuestion.delete({ where: { id } });
    return { deleted: true };
  }
}

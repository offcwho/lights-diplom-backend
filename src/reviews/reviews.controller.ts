import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { CreateQuestionDto } from './dto/create-question.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly service: ReviewsService) {}

  @Get()
  findByProduct(@Query('productId') productId: string) {
    return this.service.findByProduct(productId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@CurrentUser('id') userId: string, @Body() dto: CreateReviewDto) {
    return this.service.create(userId, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@CurrentUser('id') userId: string, @CurrentUser('role') role: any, @Param('id') id: string) {
    return this.service.remove(userId, id, role);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':id/questions')
  addQuestion(
    @CurrentUser('id') userId: string,
    @Param('id') reviewId: string,
    @Body() dto: CreateQuestionDto,
  ) {
    return this.service.addQuestion(userId, reviewId, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete('questions/:id')
  removeQuestion(@CurrentUser('id') userId: string, @CurrentUser('role') role: any, @Param('id') id: string) {
    return this.service.removeQuestion(userId, id, role);
  }
}

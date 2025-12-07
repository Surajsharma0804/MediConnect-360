import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ProviderReviewService } from '../services/provider-review.service';
import { CreateReviewDto } from '../dto/create-review.dto';
import { UpdateReviewDto } from '../dto/update-review.dto';

@Controller('providers/:providerId/reviews')
export class ProviderReviewController {
  constructor(private readonly reviewService: ProviderReviewService) {}

  @Get()
  async findAll(
    @Param('providerId') providerId: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.reviewService.findByProvider(
      providerId,
      limit ? parseInt(limit) : 20,
      offset ? parseInt(offset) : 0,
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.reviewService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Request() req,
    @Param('providerId') providerId: string,
    @Body() createDto: CreateReviewDto,
  ) {
    return this.reviewService.create(req.user.userId, providerId, createDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateDto: UpdateReviewDto,
  ) {
    return this.reviewService.update(id, req.user.userId, updateDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Request() req, @Param('id') id: string) {
    await this.reviewService.remove(id, req.user.userId);
    return { message: 'Review deleted successfully' };
  }

  @Post(':id/helpful')
  @UseGuards(JwtAuthGuard)
  async markHelpful(@Request() req, @Param('id') id: string) {
    return this.reviewService.markHelpful(id, req.user.userId);
  }
}

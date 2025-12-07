import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { VitalSignsService } from '../services/vital-signs.service';
import { CreateVitalSignsDto } from '../dto/create-vital-signs.dto';
import { UpdateVitalSignsDto } from '../dto/update-vital-signs.dto';

@Controller('ehr/vitals')
@UseGuards(JwtAuthGuard)
export class VitalSignsController {
  constructor(private readonly vitalSignsService: VitalSignsService) {}

  @Post()
  async create(@Request() req, @Body() createDto: CreateVitalSignsDto) {
    return this.vitalSignsService.create(req.user.userId, createDto);
  }

  @Post('bulk')
  async bulkImport(@Request() req, @Body() vitals: CreateVitalSignsDto[]) {
    return this.vitalSignsService.bulkImport(req.user.userId, vitals);
  }

  @Get()
  async findAll(@Request() req, @Query('limit') limit?: string) {
    return this.vitalSignsService.findAll(
      req.user.userId,
      limit ? parseInt(limit) : 50,
    );
  }

  @Get('latest')
  async getLatest(@Request() req) {
    return this.vitalSignsService.getLatest(req.user.userId);
  }

  @Get('trends')
  async getTrends(
    @Request() req,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.vitalSignsService.getTrends(
      req.user.userId,
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get(':id')
  async findOne(@Request() req, @Param('id') id: string) {
    return this.vitalSignsService.findOne(id, req.user.userId);
  }

  @Put(':id')
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateDto: UpdateVitalSignsDto,
  ) {
    return this.vitalSignsService.update(id, req.user.userId, updateDto);
  }

  @Delete(':id')
  async remove(@Request() req, @Param('id') id: string) {
    await this.vitalSignsService.remove(id, req.user.userId);
    return { message: 'Vital signs deleted successfully' };
  }
}

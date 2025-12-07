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
import { LabResultService } from '../services/lab-result.service';
import { CreateLabResultDto } from '../dto/create-lab-result.dto';
import { UpdateLabResultDto } from '../dto/update-lab-result.dto';

@Controller('ehr/lab-results')
@UseGuards(JwtAuthGuard)
export class LabResultController {
  constructor(private readonly labResultService: LabResultService) {}

  @Post()
  async create(@Request() req, @Body() createDto: CreateLabResultDto) {
    return this.labResultService.create(req.user.userId, createDto);
  }

  @Get()
  async findAll(@Request() req) {
    return this.labResultService.findAll(req.user.userId);
  }

  @Get('abnormal')
  async getAbnormal(@Request() req) {
    return this.labResultService.getAbnormalResults(req.user.userId);
  }

  @Get('trends')
  async getTrends(@Request() req, @Query('testName') testName: string) {
    return this.labResultService.getTrends(req.user.userId, testName);
  }

  @Get(':id')
  async findOne(@Request() req, @Param('id') id: string) {
    return this.labResultService.findOne(id, req.user.userId);
  }

  @Put(':id')
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateDto: UpdateLabResultDto,
  ) {
    return this.labResultService.update(id, req.user.userId, updateDto);
  }

  @Delete(':id')
  async remove(@Request() req, @Param('id') id: string) {
    await this.labResultService.remove(id, req.user.userId);
    return { message: 'Lab result deleted successfully' };
  }
}

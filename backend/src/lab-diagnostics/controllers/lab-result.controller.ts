import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { LabResultService } from '../services/lab-result.service';
import { CreateLabResultDto } from '../dto/create-lab-result.dto';

@Controller('lab-results')
@UseGuards(JwtAuthGuard)
export class LabResultController {
  constructor(private readonly labResultService: LabResultService) {}

  @Post()
  create(@Request() req, @Body() createDto: CreateLabResultDto) {
    return this.labResultService.create(req.user.userId, createDto);
  }

  @Post('bulk')
  bulkCreate(@Request() req, @Body() createDtos: CreateLabResultDto[]) {
    return this.labResultService.bulkCreate(req.user.userId, createDtos);
  }

  @Get()
  findAll(@Request() req) {
    return this.labResultService.findAll(req.user.userId);
  }

  @Get('abnormal')
  getAbnormalResults(@Request() req) {
    return this.labResultService.getAbnormalResults(req.user.userId);
  }

  @Get('critical')
  getCriticalResults(@Request() req) {
    return this.labResultService.getCriticalResults(req.user.userId);
  }

  @Get('statistics')
  getStatistics(@Request() req) {
    return this.labResultService.getStatistics(req.user.userId);
  }

  @Get('trend')
  getTrendAnalysis(
    @Request() req,
    @Query('testName') testName: string,
    @Query('componentName') componentName: string,
  ) {
    return this.labResultService.getTrendAnalysis(
      req.user.userId,
      testName,
      componentName,
    );
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.labResultService.findOne(id, req.user.userId);
  }

  @Post(':id/interpret')
  interpretWithAI(@Request() req, @Param('id') id: string) {
    return this.labResultService.interpretWithAI(id, req.user.userId);
  }

  @Get(':id/compare')
  compareWithPrevious(@Request() req, @Param('id') id: string) {
    return this.labResultService.compareWithPrevious(id, req.user.userId);
  }
}

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ImagingService } from '../services/imaging.service';
import { CreateImagingStudyDto } from '../dto/create-imaging-study.dto';
import { ImagingStatus } from '../../entities/imaging-study.entity';

@Controller('imaging')
@UseGuards(JwtAuthGuard)
export class ImagingController {
  constructor(private readonly imagingService: ImagingService) {}

  @Post()
  create(@Request() req, @Body() createDto: CreateImagingStudyDto) {
    return this.imagingService.create(req.user.userId, createDto);
  }

  @Get()
  findAll(@Request() req) {
    return this.imagingService.findAll(req.user.userId);
  }

  @Get('statistics')
  getStatistics(@Request() req) {
    return this.imagingService.getStatistics(req.user.userId);
  }

  @Get('modality/:modality')
  findByModality(@Request() req, @Param('modality') modality: string) {
    return this.imagingService.findByModality(req.user.userId, modality);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.imagingService.findOne(id, req.user.userId);
  }

  @Patch(':id/status')
  updateStatus(
    @Request() req,
    @Param('id') id: string,
    @Body('status') status: ImagingStatus,
  ) {
    return this.imagingService.updateStatus(id, req.user.userId, status);
  }

  @Post(':id/upload-images')
  @UseInterceptors(FilesInterceptor('images', 10))
  uploadImages(
    @Request() req,
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.imagingService.uploadImages(id, req.user.userId, files);
  }

  @Post(':id/ai-analysis')
  analyzeWithAI(@Request() req, @Param('id') id: string) {
    return this.imagingService.analyzeWithAI(id, req.user.userId);
  }

  @Post(':id/report')
  addReport(
    @Request() req,
    @Param('id') id: string,
    @Body()
    reportDto: {
      findings: string;
      impression: string;
      recommendations: string;
      radiologistName: string;
    },
  ) {
    return this.imagingService.addReport(
      id,
      req.user.userId,
      reportDto.findings,
      reportDto.impression,
      reportDto.recommendations,
      reportDto.radiologistName,
    );
  }
}

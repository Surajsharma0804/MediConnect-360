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
import '../../types/multer';
import { CreateImagingStudyDto } from '../dto/create-imaging-study.dto';
import { UpdateImagingStudyDto } from '../dto/update-imaging-study.dto';

@Controller('lab/imaging')
@UseGuards(JwtAuthGuard)
export class ImagingController {
  constructor(private readonly imagingService: ImagingService) {}

  @Get()
  findAll(@Request() req) {
    return this.imagingService.findAll(req.user.userId);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.imagingService.findOne(id, req.user.userId);
  }

  @Post()
  create(@Request() req, @Body() createDto: CreateImagingStudyDto) {
    return this.imagingService.create(req.user.userId, createDto);
  }

  @Patch(':id')
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateDto: UpdateImagingStudyDto,
  ) {
    return this.imagingService.update(id, req.user.userId, updateDto);
  }

  @Post(':id/schedule')
  schedule(@Request() req, @Param('id') id: string, @Body() scheduleData: any) {
    return this.imagingService.schedule(id, req.user.userId, scheduleData);
  }

  @Post(':id/cancel')
  cancel(@Request() req, @Param('id') id: string, @Body('reason') reason: string) {
    return this.imagingService.cancel(id, req.user.userId, reason);
  }

  @Get(':id/results')
  getResults(@Request() req, @Param('id') id: string) {
    return this.imagingService.getResults(id, req.user.userId);
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

  @Post(':id/analyze')
  analyzeImages(@Request() req, @Param('id') id: string) {
    return this.imagingService.analyzeWithAI(id, req.user.userId);
  }

  @Get(':id/report')
  generateReport(@Request() req, @Param('id') id: string) {
    return this.imagingService.generateReport(id, req.user.userId);
  }

  @Post(':id/share')
  shareStudy(
    @Request() req,
    @Param('id') id: string,
    @Body('recipientEmail') recipientEmail: string,
  ) {
    return this.imagingService.shareStudy(id, req.user.userId, recipientEmail);
  }
}
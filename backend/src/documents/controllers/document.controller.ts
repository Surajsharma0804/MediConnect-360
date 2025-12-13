import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { DocumentService } from '../services/document.service';
import { CreateDocumentDto } from '../dto/create-document.dto';
import { UpdateDocumentDto } from '../dto/update-document.dto';

@Controller('documents')
@UseGuards(JwtAuthGuard)
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Get()
  findAll(
    @Request() req,
    @Query('type') type?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.documentService.findAll(req.user.userId, {
      type,
      status,
      search,
      page,
      limit,
    });
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadDocument(
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
    @Body()
    body: {
      title: string;
      type: string;
      description?: string;
      tags?: string[];
    },
  ) {
    return this.documentService.uploadDocument(req.user.userId, file, body);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.documentService.findOne(id, req.user.userId);
  }

  @Patch(':id')
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateDocumentDto: UpdateDocumentDto,
  ) {
    return this.documentService.update(id, req.user.userId, updateDocumentDto);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.documentService.remove(id, req.user.userId);
  }

  @Get(':id/download')
  download(@Request() req, @Param('id') id: string) {
    return this.documentService.getDownloadUrl(id, req.user.userId);
  }

  @Get(':id/share')
  share(@Request() req, @Param('id') id: string) {
    return this.documentService.generateShareLink(id, req.user.userId);
  }

  @Post(':id/share/revoke')
  revokeShare(@Request() req, @Param('id') id: string) {
    return this.documentService.revokeShareLink(id, req.user.userId);
  }

  @Get(':id/versions')
  getVersions(@Request() req, @Param('id') id: string) {
    return this.documentService.getVersions(id, req.user.userId);
  }

  @Post(':id/versions')
  @UseInterceptors(FileInterceptor('file'))
  createVersion(
    @Request() req,
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.documentService.createVersion(id, req.user.userId, file);
  }

  @Post(':id/ocr')
  extractText(@Request() req, @Param('id') id: string) {
    return this.documentService.extractText(id, req.user.userId);
  }

  @Post(':id/analyze')
  analyzeDocument(@Request() req, @Param('id') id: string) {
    return this.documentService.analyzeWithAI(id, req.user.userId);
  }
}
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
import { DocumentType, DocumentStatus } from '../../entities/medical-document.entity';

@Controller('documents')
@UseGuards(JwtAuthGuard)
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  uploadDocument(
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
    @Body()
    body: {
      title: string;
      description?: string;
      documentType: DocumentType;
      documentDate?: string;
      tags?: string;
      category?: string;
    },
  ) {
    return this.documentService.uploadDocument(req.user.userId, file, {
      ...body,
      documentDate: body.documentDate ? new Date(body.documentDate) : undefined,
      tags: body.tags ? body.tags.split(',') : undefined,
    });
  }

  @Get()
  findAll(
    @Request() req,
    @Query('documentType') documentType?: DocumentType,
    @Query('category') category?: string,
    @Query('tags') tags?: string,
    @Query('status') status?: DocumentStatus,
  ) {
    return this.documentService.findAll(req.user.userId, {
      documentType,
      category,
      tags: tags ? tags.split(',') : undefined,
      status,
    });
  }

  @Get('search')
  search(@Request() req, @Query('q') searchTerm: string) {
    return this.documentService.search(req.user.userId, searchTerm);
  }

  @Get('shared')
  getSharedDocuments(@Request() req) {
    return this.documentService.getSharedDocuments(req.user.userId);
  }

  @Get('categories')
  getCategories(@Request() req) {
    return this.documentService.getCategories(req.user.userId);
  }

  @Get('statistics')
  getStatistics(@Request() req) {
    return this.documentService.getStatistics(req.user.userId);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.documentService.findOne(id, req.user.userId);
  }

  @Patch(':id')
  update(@Request() req, @Param('id') id: string, @Body() body: any) {
    return this.documentService.update(id, req.user.userId, body);
  }

  @Delete(':id')
  delete(@Request() req, @Param('id') id: string) {
    return this.documentService.delete(id, req.user.userId);
  }

  @Post(':id/share')
  shareDocument(
    @Request() req,
    @Param('id') id: string,
    @Body()
    body: {
      providerId?: string;
      userId?: string;
      expiresAt?: string;
    },
  ) {
    return this.documentService.shareDocument(id, req.user.userId, {
      ...body,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : undefined,
    });
  }

  @Delete(':id/share/:shareId')
  unshareDocument(
    @Request() req,
    @Param('id') id: string,
    @Param('shareId') shareId: string,
  ) {
    return this.documentService.unshareDocument(id, req.user.userId, shareId);
  }

  @Post(':id/tag')
  addTag(@Request() req, @Param('id') id: string, @Body('tag') tag: string) {
    return this.documentService.addTag(id, req.user.userId, tag);
  }

  @Delete(':id/tag/:tag')
  removeTag(@Request() req, @Param('id') id: string, @Param('tag') tag: string) {
    return this.documentService.removeTag(id, req.user.userId, tag);
  }

  @Post(':id/version')
  @UseInterceptors(FileInterceptor('file'))
  createVersion(
    @Request() req,
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.documentService.createVersion(id, req.user.userId, file);
  }

  @Get(':id/versions')
  getVersions(@Request() req, @Param('id') id: string) {
    return this.documentService.getVersions(id, req.user.userId);
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import {
  MedicalDocument,
  DocumentType,
  DocumentStatus,
} from '../../entities/medical-document.entity';
import { StorageService } from '../../services/storage.service';
import { NotificationService } from '../../services/notification.service';

@Injectable()
export class DocumentService {
  constructor(
    @InjectRepository(MedicalDocument)
    private documentRepository: Repository<MedicalDocument>,
    private storageService: StorageService,
    private notificationService: NotificationService,
  ) {}

  async uploadDocument(
    userId: string,
    file: Express.Multer.File,
    metadata: {
      title: string;
      type: string;
      description?: string;
      tags?: string[];
    },
  ): Promise<MedicalDocument> {
    // Upload file to storage
    const fileUrl = await this.storageService.uploadFile(
      file.buffer,
      file.originalname,
      file.mimetype,
      `documents/${userId}`,
    );

    // Create document record
    const document = this.documentRepository.create({
      userId,
      title: metadata.title,
      documentType: metadata.type as DocumentType,
      description: metadata.description,
      tags: metadata.tags || [],
      fileUrl,
      fileName: file.originalname,
      fileSize: file.size,
      mimeType: file.mimetype,
      status: DocumentStatus.ACTIVE,
      uploadedAt: new Date(),
    });

    const savedDocument = await this.documentRepository.save(document);

    // Send notification
    await this.notificationService.sendNotification(userId, {
      type: 'document_uploaded',
      title: 'Document Uploaded',
      message: `Your document "${metadata.title}" has been uploaded successfully.`,
      data: { documentId: savedDocument.id },
    });

    return savedDocument;
  }

  async findAll(
    userId: string,
    filters: {
      type?: string;
      status?: string;
      search?: string;
      page?: number;
      limit?: number;
    },
  ): Promise<{
    documents: MedicalDocument[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const { type, status, search, page = 1, limit = 10 } = filters;
    const skip = (page - 1) * limit;

    const queryBuilder = this.documentRepository
      .createQueryBuilder('document')
      .where('document.userId = :userId', { userId });

    if (type) {
      queryBuilder.andWhere('document.documentType = :type', { type });
    }

    if (status) {
      queryBuilder.andWhere('document.status = :status', { status });
    }

    if (search) {
      queryBuilder.andWhere(
        '(document.title ILIKE :search OR document.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    queryBuilder
      .orderBy('document.uploadedAt', 'DESC')
      .skip(skip)
      .take(limit);

    const [documents, total] = await queryBuilder.getManyAndCount();

    return {
      documents,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string, userId: string): Promise<MedicalDocument> {
    const document = await this.documentRepository.findOne({
      where: { id, userId },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    return document;
  }

  async update(
    id: string,
    userId: string,
    updateData: Partial<MedicalDocument>,
  ): Promise<MedicalDocument> {
    const document = await this.findOne(id, userId);

    Object.assign(document, updateData);
    document.updatedAt = new Date();

    return this.documentRepository.save(document);
  }

  async remove(id: string, userId: string): Promise<void> {
    const document = await this.findOne(id, userId);

    // Delete file from storage
    await this.storageService.deleteFile(document.fileUrl);

    // Soft delete document
    document.status = DocumentStatus.DELETED;
    document.deletedAt = new Date();

    await this.documentRepository.save(document);
  }

  async getDownloadUrl(id: string, userId: string): Promise<string> {
    const document = await this.findOne(id, userId);
    return this.storageService.getSignedUrl(document.fileUrl);
  }

  async generateShareLink(id: string, userId: string): Promise<string> {
    const document = await this.findOne(id, userId);

    // Generate temporary share token
    const shareToken = Math.random().toString(36).substring(2, 15);
    document.shareToken = shareToken;
    document.shareExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await this.documentRepository.save(document);

    return `${process.env.API_URL}/documents/shared/${shareToken}`;
  }

  async revokeShareLink(id: string, userId: string): Promise<void> {
    const document = await this.findOne(id, userId);

    document.shareToken = undefined;
    document.shareExpiresAt = undefined;

    await this.documentRepository.save(document);
  }

  async getVersions(id: string, userId: string): Promise<MedicalDocument[]> {
    const document = await this.findOne(id, userId);

    return this.documentRepository.find({
      where: { parentDocumentId: document.id, userId },
      order: { version: 'DESC' },
    });
  }

  async createVersion(
    id: string,
    userId: string,
    file: Express.Multer.File,
  ): Promise<MedicalDocument> {
    const originalDocument = await this.findOne(id, userId);

    // Upload new version
    const fileUrl = await this.storageService.uploadFile(
      file.buffer,
      file.originalname,
      file.mimetype,
      `documents/${userId}/versions`,
    );

    // Get next version number
    const latestVersion = await this.documentRepository.findOne({
      where: { parentDocumentId: id, userId },
      order: { version: 'DESC' },
    });

    const nextVersion = latestVersion ? latestVersion.version + 1 : 2;

    // Create new version
    const newVersion = this.documentRepository.create({
      userId: originalDocument.userId,
      title: originalDocument.title,
      documentType: originalDocument.documentType,
      description: originalDocument.description,
      tags: originalDocument.tags,
      parentDocumentId: id,
      version: nextVersion,
      fileUrl,
      fileName: file.originalname,
      fileSize: file.size,
      mimeType: file.mimetype,
      status: DocumentStatus.ACTIVE,
      uploadedAt: new Date(),
    });

    return this.documentRepository.save(newVersion);
  }

  async extractText(id: string, userId: string): Promise<{ text: string }> {
    const document = await this.findOne(id, userId);

    // TODO: Implement OCR service integration
    // For now, return placeholder
    return {
      text: 'OCR text extraction will be implemented with cloud OCR service',
    };
  }

  async analyzeWithAI(
    id: string,
    userId: string,
  ): Promise<{ analysis: string; insights: string[] }> {
    const document = await this.findOne(id, userId);

    // TODO: Implement AI analysis
    // For now, return placeholder
    return {
      analysis: 'AI document analysis will be implemented',
      insights: ['Document type detected', 'Key information extracted'],
    };
  }
}
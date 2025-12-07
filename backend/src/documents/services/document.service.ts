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
    data: {
      title: string;
      description?: string;
      documentType: DocumentType;
      documentDate?: Date;
      tags?: string[];
      category?: string;
    },
  ): Promise<MedicalDocument> {
    // Upload file to storage
    const fileUrl = await this.storageService.uploadFile(
      file.buffer,
      `documents/${userId}/${Date.now()}-${file.originalname}`,
      file.mimetype,
    );

    // Create document record
    const document = this.documentRepository.create({
      userId,
      ...data,
      fileUrl,
      fileName: file.originalname,
      fileSize: file.size,
      mimeType: file.mimetype,
      status: DocumentStatus.ACTIVE,
      isEncrypted: true,
      documentDate: data.documentDate || new Date(),
    });

    const savedDocument = await this.documentRepository.save(document);

    await this.notificationService.sendPushNotification(userId, {
      title: 'Document Uploaded',
      body: `${data.title} has been uploaded successfully.`,
    });

    return savedDocument;
  }

  async findAll(
    userId: string,
    filters?: {
      documentType?: DocumentType;
      category?: string;
      tags?: string[];
      status?: DocumentStatus;
    },
  ): Promise<MedicalDocument[]> {
    const query = this.documentRepository
      .createQueryBuilder('document')
      .where('document.userId = :userId', { userId });

    if (filters?.documentType) {
      query.andWhere('document.documentType = :documentType', {
        documentType: filters.documentType,
      });
    }

    if (filters?.category) {
      query.andWhere('document.category = :category', {
        category: filters.category,
      });
    }

    if (filters?.status) {
      query.andWhere('document.status = :status', { status: filters.status });
    }

    if (filters?.tags && filters.tags.length > 0) {
      query.andWhere('document.tags && :tags', { tags: filters.tags });
    }

    return query.orderBy('document.createdAt', 'DESC').getMany();
  }

  async findOne(id: string, userId: string): Promise<MedicalDocument> {
    const document = await this.documentRepository.findOne({
      where: { id, userId },
      relations: ['uploadedByProvider'],
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    return document;
  }

  async update(
    id: string,
    userId: string,
    data: Partial<MedicalDocument>,
  ): Promise<MedicalDocument> {
    const document = await this.findOne(id, userId);

    Object.assign(document, data);

    return this.documentRepository.save(document);
  }

  async delete(id: string, userId: string): Promise<void> {
    const document = await this.findOne(id, userId);

    document.status = DocumentStatus.DELETED;

    await this.documentRepository.save(document);
  }

  async search(userId: string, searchTerm: string): Promise<MedicalDocument[]> {
    return this.documentRepository.find({
      where: [
        { userId, title: Like(`%${searchTerm}%`) },
        { userId, description: Like(`%${searchTerm}%`) },
        { userId, ocrText: Like(`%${searchTerm}%`) },
      ],
      order: { createdAt: 'DESC' },
    });
  }

  async shareDocument(
    id: string,
    userId: string,
    shareWith: {
      providerId?: string;
      userId?: string;
      expiresAt?: Date;
    },
  ): Promise<MedicalDocument> {
    const document = await this.findOne(id, userId);

    const sharedWith = document.sharedWith || [];
    sharedWith.push({
      ...shareWith,
      sharedAt: new Date().toISOString(),
      expiresAt: shareWith.expiresAt?.toISOString(),
    });

    document.sharedWith = sharedWith;
    document.isShared = true;

    return this.documentRepository.save(document);
  }

  async unshareDocument(
    id: string,
    userId: string,
    shareId: string,
  ): Promise<MedicalDocument> {
    const document = await this.findOne(id, userId);

    document.sharedWith = document.sharedWith.filter(
      (share) =>
        share.providerId !== shareId && share.userId !== shareId,
    );

    document.isShared = document.sharedWith.length > 0;

    return this.documentRepository.save(document);
  }

  async getSharedDocuments(userId: string): Promise<MedicalDocument[]> {
    return this.documentRepository
      .createQueryBuilder('document')
      .where('document.isShared = :isShared', { isShared: true })
      .andWhere(
        `document.sharedWith @> '[{"userId": "${userId}"}]'::jsonb OR document.sharedWith @> '[{"providerId": "${userId}"}]'::jsonb`,
      )
      .getMany();
  }

  async addTag(id: string, userId: string, tag: string): Promise<MedicalDocument> {
    const document = await this.findOne(id, userId);

    const tags = document.tags || [];
    if (!tags.includes(tag)) {
      tags.push(tag);
    }

    document.tags = tags;

    return this.documentRepository.save(document);
  }

  async removeTag(
    id: string,
    userId: string,
    tag: string,
  ): Promise<MedicalDocument> {
    const document = await this.findOne(id, userId);

    document.tags = (document.tags || []).filter((t) => t !== tag);

    return this.documentRepository.save(document);
  }

  async getCategories(userId: string): Promise<string[]> {
    const documents = await this.documentRepository.find({
      where: { userId },
      select: ['category'],
    });

    const categories = new Set(
      documents.map((d) => d.category).filter((c) => c),
    );

    return Array.from(categories);
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
      `documents/${userId}/${Date.now()}-${file.originalname}`,
      file.mimetype,
    );

    // Create new version
    const newVersion = this.documentRepository.create({
      ...originalDocument,
      id: undefined,
      fileUrl,
      fileName: file.originalname,
      fileSize: file.size,
      mimeType: file.mimetype,
      version: originalDocument.version + 1,
      parentDocumentId: originalDocument.id,
      createdAt: undefined,
      updatedAt: undefined,
    });

    return this.documentRepository.save(newVersion);
  }

  async getVersions(id: string, userId: string): Promise<MedicalDocument[]> {
    const document = await this.findOne(id, userId);

    return this.documentRepository.find({
      where: [
        { id: document.id },
        { parentDocumentId: document.id },
        { parentDocumentId: document.parentDocumentId },
      ],
      order: { version: 'DESC' },
    });
  }

  async getStatistics(userId: string): Promise<any> {
    const documents = await this.documentRepository.find({
      where: { userId, status: DocumentStatus.ACTIVE },
    });

    const stats = {
      total: documents.length,
      byType: {} as Record<string, number>,
      byCategory: {} as Record<string, number>,
      totalSize: documents.reduce((sum, d) => sum + d.fileSize, 0),
      shared: documents.filter((d) => d.isShared).length,
      recentUploads: documents
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, 5),
    };

    documents.forEach((doc) => {
      stats.byType[doc.documentType] =
        (stats.byType[doc.documentType] || 0) + 1;
      if (doc.category) {
        stats.byCategory[doc.category] =
          (stats.byCategory[doc.category] || 0) + 1;
      }
    });

    return stats;
  }
}

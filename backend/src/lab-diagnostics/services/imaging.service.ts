import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ImagingStudy,
  ImagingStatus,
} from '../../entities/imaging-study.entity';
import { CreateImagingStudyDto } from '../dto/create-imaging-study.dto';
import { AIService } from '../../services/ai.service';
import { NotificationService } from '../../services/notification.service';
import { StorageService } from '../../services/storage.service';
import '../../types/multer';

@Injectable()
export class ImagingService {
  constructor(
    @InjectRepository(ImagingStudy)
    private imagingRepository: Repository<ImagingStudy>,
    private aiService: AIService,
    private notificationService: NotificationService,
    private storageService: StorageService,
  ) {}

  async findAll(userId: string): Promise<ImagingStudy[]> {
    return this.imagingRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<ImagingStudy> {
    const study = await this.imagingRepository.findOne({
      where: { id, userId },
    });

    if (!study) {
      throw new NotFoundException('Imaging study not found');
    }

    return study;
  }

  async create(
    userId: string,
    createDto: CreateImagingStudyDto,
  ): Promise<ImagingStudy> {
    const study = this.imagingRepository.create({
      ...createDto,
      userId,
      status: ImagingStatus.SCHEDULED,
      createdAt: new Date(),
    });

    const savedStudy = await this.imagingRepository.save(study);

    // Send notification
    await this.notificationService.sendNotification(userId, {
      type: 'imaging_scheduled',
      title: 'Imaging Study Scheduled',
      message: `Your ${createDto.studyType} has been scheduled.`,
      data: { studyId: savedStudy.id },
    });

    return savedStudy;
  }

  async update(
    id: string,
    userId: string,
    updateDto: Partial<ImagingStudy>,
  ): Promise<ImagingStudy> {
    const study = await this.findOne(id, userId);

    Object.assign(study, updateDto);
    study.updatedAt = new Date();

    return this.imagingRepository.save(study);
  }

  async schedule(
    id: string,
    userId: string,
    scheduleData: {
      scheduledDate: Date;
      location: string;
      instructions?: string;
    },
  ): Promise<ImagingStudy> {
    const study = await this.findOne(id, userId);

    study.scheduledDate = scheduleData.scheduledDate;
    study.location = scheduleData.location;
    study.instructions = scheduleData.instructions || '';
    study.status = ImagingStatus.SCHEDULED;
    study.updatedAt = new Date();

    const updatedStudy = await this.imagingRepository.save(study);

    // Send notification
    await this.notificationService.sendNotification(userId, {
      type: 'imaging_scheduled',
      title: 'Imaging Appointment Scheduled',
      message: `Your imaging appointment is scheduled for ${scheduleData.scheduledDate.toLocaleDateString()}.`,
      data: { studyId: id },
    });

    return updatedStudy;
  }

  async cancel(id: string, userId: string, reason: string): Promise<void> {
    const study = await this.findOne(id, userId);

    study.status = ImagingStatus.CANCELLED;
    study.cancellationReason = reason;
    study.updatedAt = new Date();

    await this.imagingRepository.save(study);

    // Send notification
    await this.notificationService.sendNotification(userId, {
      type: 'imaging_cancelled',
      title: 'Imaging Study Cancelled',
      message: `Your imaging study has been cancelled. Reason: ${reason}`,
      data: { studyId: id },
    });
  }

  async uploadImages(
    id: string,
    userId: string,
    files: Express.Multer.File[],
  ): Promise<ImagingStudy> {
    const study = await this.findOne(id, userId);

    // Upload images to storage
    const imageUrls = await Promise.all(
      files.map(async (file) => {
        return this.storageService.uploadFile(
          file.buffer,
          file.originalname,
          file.mimetype,
          `imaging/${userId}/${id}`,
        );
      }),
    );

    // Update study with image URLs
    study.imageUrls = [...(study.imageUrls || []), ...imageUrls];
    study.status = ImagingStatus.IN_PROGRESS;
    study.updatedAt = new Date();

    return this.imagingRepository.save(study);
  }

  async analyzeWithAI(
    id: string,
    userId: string,
  ): Promise<{ analysis: string; findings: string[]; confidence: number }> {
    const study = await this.findOne(id, userId);

    if (!study.imageUrls || study.imageUrls.length === 0) {
      throw new NotFoundException('No images found for analysis');
    }

    // TODO: Implement AI image analysis
    // For now, return placeholder analysis
    const analysis = {
      analysis: 'AI analysis of medical images will be implemented',
      findings: ['Normal anatomy observed', 'No acute abnormalities detected'],
      confidence: 0.85,
    };

    // Update study with AI analysis
    study.aiAnalysis = analysis;
    study.status = ImagingStatus.COMPLETED;
    study.completedAt = new Date();
    study.updatedAt = new Date();

    await this.imagingRepository.save(study);

    // Send notification
    await this.notificationService.sendNotification(userId, {
      type: 'imaging_completed',
      title: 'Imaging Analysis Complete',
      message: 'Your imaging study analysis is ready for review.',
      data: { studyId: id },
    });

    return analysis;
  }

  async getResults(id: string, userId: string): Promise<any> {
    const study = await this.findOne(id, userId);

    if (study.status !== ImagingStatus.COMPLETED) {
      throw new NotFoundException('Results not yet available');
    }

    return {
      study,
      results: study.results,
      aiAnalysis: study.aiAnalysis,
      radiologistReport: study.radiologistReport,
    };
  }

  async generateReport(id: string, userId: string): Promise<{ reportUrl: string }> {
    const study = await this.findOne(id, userId);

    // TODO: Generate PDF report
    // For now, return placeholder
    return {
      reportUrl: `${process.env.API_URL}/imaging/${id}/report.pdf`,
    };
  }

  async shareStudy(
    id: string,
    userId: string,
    recipientEmail: string,
  ): Promise<{ shareLink: string }> {
    const study = await this.findOne(id, userId);

    // Generate share token
    const shareToken = Math.random().toString(36).substring(2, 15);
    study.shareToken = shareToken;
    study.shareExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await this.imagingRepository.save(study);

    // TODO: Send email to recipient
    const shareLink = `${process.env.API_URL}/imaging/shared/${shareToken}`;

    return { shareLink };
  }
}
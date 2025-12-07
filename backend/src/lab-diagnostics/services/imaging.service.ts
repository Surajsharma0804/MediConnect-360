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

@Injectable()
export class ImagingService {
  constructor(
    @InjectRepository(ImagingStudy)
    private imagingRepository: Repository<ImagingStudy>,
    private aiService: AIService,
    private notificationService: NotificationService,
    private storageService: StorageService,
  ) {}

  async create(
    userId: string,
    createDto: CreateImagingStudyDto,
  ): Promise<ImagingStudy> {
    const study = this.imagingRepository.create({
      ...createDto,
      userId,
      scheduledDate: createDto.scheduledDate
        ? new Date(createDto.scheduledDate)
        : undefined,
    });

    const savedStudy = await this.imagingRepository.save(study);

    await this.notificationService.sendPushNotification(userId, {
      title: 'Imaging Study Ordered',
      body: `Your ${createDto.modality} study has been ordered.`,
    });

    return savedStudy;
  }

  async findAll(userId: string): Promise<ImagingStudy[]> {
    return this.imagingRepository.find({
      where: { userId },
      relations: ['orderedByProvider'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<ImagingStudy> {
    const study = await this.imagingRepository.findOne({
      where: { id, userId },
      relations: ['orderedByProvider'],
    });

    if (!study) {
      throw new NotFoundException('Imaging study not found');
    }

    return study;
  }

  async updateStatus(
    id: string,
    userId: string,
    status: ImagingStatus,
  ): Promise<ImagingStudy> {
    const study = await this.findOne(id, userId);

    study.status = status;

    if (status === ImagingStatus.COMPLETED) {
      study.performedDate = new Date();
    } else if (status === ImagingStatus.RESULTS_READY) {
      study.reportedDate = new Date();
    }

    const updatedStudy = await this.imagingRepository.save(study);

    const statusMessages = {
      [ImagingStatus.SCHEDULED]: 'Your imaging study has been scheduled.',
      [ImagingStatus.IN_PROGRESS]: 'Your imaging study is in progress.',
      [ImagingStatus.COMPLETED]: 'Your imaging study is complete.',
      [ImagingStatus.RESULTS_READY]: 'Your imaging results are ready.',
    };

    if (statusMessages[status]) {
      await this.notificationService.sendPushNotification(userId, {
        title: 'Imaging Update',
        body: statusMessages[status],
      });
    }

    return updatedStudy;
  }

  async uploadImages(
    id: string,
    userId: string,
    files: Express.Multer.File[],
  ): Promise<ImagingStudy> {
    const study = await this.findOne(id, userId);

    const imageUrls: string[] = [];

    for (const file of files) {
      const url = await this.storageService.uploadFile(
        file.buffer,
        `imaging/${userId}/${id}/${file.originalname}`,
        file.mimetype,
      );
      imageUrls.push(url);
    }

    study.imageUrls = [...(study.imageUrls || []), ...imageUrls];

    return this.imagingRepository.save(study);
  }

  async analyzeWithAI(id: string, userId: string): Promise<ImagingStudy> {
    const study = await this.findOne(id, userId);

    if (!study.imageUrls || study.imageUrls.length === 0) {
      throw new NotFoundException('No images available for analysis');
    }

    try {
      const prompt = `Analyze this ${study.modality} imaging study of ${study.bodyPart || 'unknown body part'}. 
      Clinical indication: ${study.clinicalIndication || 'Not provided'}.
      Provide a detailed analysis including:
      1. Key findings
      2. Any abnormalities detected
      3. Confidence level (0-100%)
      4. Suggested follow-up actions
      
      Note: This is an AI-assisted analysis and should be reviewed by a qualified radiologist.`;

      const analysis = await this.aiService.analyzeSymptoms(prompt);

      study.aiAnalysis = {
        findings: [analysis],
        confidence: 75,
        abnormalitiesDetected: analysis.toLowerCase().includes('abnormal'),
        suggestedFollowUp:
          'Consult with radiologist for professional interpretation',
      };

      const updatedStudy = await this.imagingRepository.save(study);

      await this.notificationService.sendPushNotification(userId, {
        title: 'AI Analysis Complete',
        body: 'AI analysis of your imaging study is ready.',
      });

      return updatedStudy;
    } catch {
      throw new Error('Failed to analyze imaging study with AI');
    }
  }

  async addReport(
    id: string,
    userId: string,
    findings: string,
    impression: string,
    recommendations: string,
    radiologistName: string,
  ): Promise<ImagingStudy> {
    const study = await this.findOne(id, userId);

    study.findings = findings;
    study.impression = impression;
    study.recommendations = recommendations;
    study.radiologistName = radiologistName;
    study.status = ImagingStatus.RESULTS_READY;
    study.reportedDate = new Date();

    const updatedStudy = await this.imagingRepository.save(study);

    await this.notificationService.sendPushNotification(userId, {
      title: 'Imaging Report Ready',
      body: 'Your imaging report has been completed by the radiologist.',
    });

    return updatedStudy;
  }

  async findByModality(
    userId: string,
    modality: string,
  ): Promise<ImagingStudy[]> {
    return this.imagingRepository.find({
      where: { userId, modality: modality as any },
      order: { createdAt: 'DESC' },
    });
  }

  async getStatistics(userId: string): Promise<any> {
    const studies = await this.imagingRepository.find({
      where: { userId },
    });

    const stats = {
      total: studies.length,
      completed: studies.filter((s) => s.status === ImagingStatus.COMPLETED)
        .length,
      pending: studies.filter(
        (s) =>
          s.status === ImagingStatus.ORDERED ||
          s.status === ImagingStatus.SCHEDULED,
      ).length,
      byModality: {} as Record<string, number>,
      totalCost: studies.reduce((sum, s) => sum + (Number(s.cost) || 0), 0),
    };

    studies.forEach((study) => {
      stats.byModality[study.modality] =
        (stats.byModality[study.modality] || 0) + 1;
    });

    return stats;
  }
}

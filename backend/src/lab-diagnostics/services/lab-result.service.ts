import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  LabTestResultDetail,
  ResultStatus,
} from '../../entities/lab-test-result-detail.entity';
import { CreateLabResultDto } from '../dto/create-lab-result.dto';
import { AIService } from '../../services/ai.service';
import { NotificationService } from '../../services/notification.service';

@Injectable()
export class LabResultService {
  constructor(
    @InjectRepository(LabTestResultDetail)
    private labResultRepository: Repository<LabTestResultDetail>,
    private aiService: AIService,
    private notificationService: NotificationService,
  ) {}

  async create(
    userId: string,
    createDto: CreateLabResultDto,
  ): Promise<LabTestResultDetail> {
    const result = this.labResultRepository.create({
      ...createDto,
      userId,
      resultDate: createDto.resultDate
        ? new Date(createDto.resultDate)
        : new Date(),
    });

    const savedResult = await this.labResultRepository.save(result);

    // Auto-interpret with AI
    if (result.value && result.referenceRange) {
      await this.interpretWithAI(savedResult.id, userId);
    }

    // Send notification for abnormal/critical results
    if (result.isAbnormal || result.isCritical) {
      this.notificationService.sendPushNotification(userId, {
        title: result.isCritical
          ? 'Critical Lab Result'
          : 'Abnormal Lab Result',
        body: `Your ${result.testName} - ${result.componentName} result is ${result.isCritical ? 'critical' : 'abnormal'}. Please review immediately.`,
      });
    }

    return savedResult;
  }

  async findAll(userId: string): Promise<LabTestResultDetail[]> {
    return this.labResultRepository.find({
      where: { userId },
      relations: ['labTestOrder'],
      order: { resultDate: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<LabTestResultDetail> {
    const result = await this.labResultRepository.findOne({
      where: { id, userId },
      relations: ['labTestOrder'],
    });

    if (!result) {
      throw new NotFoundException('Lab result not found');
    }

    return result;
  }

  async interpretWithAI(
    id: string,
    userId: string,
  ): Promise<LabTestResultDetail> {
    const result = await this.findOne(id, userId);

    try {
      const prompt = `Interpret this lab test result:
      Test: ${result.testName} - ${result.componentName}
      Value: ${result.value} ${result.unit || ''}
      Reference Range: ${result.referenceRange || 'Not provided'}
      Status: ${result.status}
      
      Provide:
      1. What this test measures
      2. Interpretation of the result
      3. Clinical significance
      4. Possible causes if abnormal
      5. Recommended follow-up actions
      
      Keep it patient-friendly and easy to understand.`;

      const interpretation = await this.aiService.analyzeSymptoms(prompt);

      result.aiInterpretation = interpretation;

      return this.labResultRepository.save(result);
    } catch {
      throw new Error('Failed to interpret lab result with AI');
    }
  }

  async getTrendAnalysis(
    userId: string,
    testName: string,
    componentName: string,
  ): Promise<any> {
    const results = await this.labResultRepository.find({
      where: { userId, testName, componentName },
      order: { resultDate: 'ASC' },
    });

    if (results.length < 2) {
      return {
        message: 'Not enough data for trend analysis',
        results: results.length,
      };
    }

    const values = results
      .filter((r) => r.value && !isNaN(parseFloat(r.value)))
      .map((r) => ({
        date: r.resultDate,
        value: parseFloat(r.value),
        status: r.status,
      }));

    if (values.length < 2) {
      return {
        message: 'Not enough numeric data for trend analysis',
        results: values.length,
      };
    }

    const firstValue = values[0].value;
    const lastValue = values[values.length - 1].value;
    const percentageChange = ((lastValue - firstValue) / firstValue) * 100;

    let trend: 'IMPROVING' | 'WORSENING' | 'STABLE' = 'STABLE';
    if (Math.abs(percentageChange) > 10) {
      // Determine if change is good or bad based on test type
      trend = percentageChange > 0 ? 'WORSENING' : 'IMPROVING';
    }

    return {
      testName,
      componentName,
      dataPoints: values.length,
      firstValue: values[0],
      lastValue: values[values.length - 1],
      percentageChange: percentageChange.toFixed(2),
      trend,
      values,
      recommendation: this.getTrendRecommendation(trend, percentageChange),
    };
  }

  private getTrendRecommendation(
    trend: string,
    _percentageChange: number,
  ): string {
    if (trend === 'STABLE') {
      return 'Your values are stable. Continue current treatment plan.';
    } else if (trend === 'IMPROVING') {
      return 'Your values are improving. Keep up the good work!';
    } else {
      return 'Your values show concerning changes. Please consult your healthcare provider.';
    }
  }

  async getAbnormalResults(userId: string): Promise<LabTestResultDetail[]> {
    return this.labResultRepository.find({
      where: { userId, isAbnormal: true },
      order: { resultDate: 'DESC' },
    });
  }

  async getCriticalResults(userId: string): Promise<LabTestResultDetail[]> {
    return this.labResultRepository.find({
      where: { userId, isCritical: true },
      order: { resultDate: 'DESC' },
    });
  }

  async compareWithPrevious(id: string, userId: string): Promise<any> {
    const current = await this.findOne(id, userId);

    const previous = await this.labResultRepository.findOne({
      where: {
        userId,
        testName: current.testName,
        componentName: current.componentName,
      },
      order: { resultDate: 'DESC' },
    });

    if (!previous || previous.id === current.id) {
      return {
        message: 'No previous result found for comparison',
        current,
      };
    }

    const currentValue = parseFloat(current.value);
    const previousValue = parseFloat(previous.value);

    if (isNaN(currentValue) || isNaN(previousValue)) {
      return {
        message: 'Cannot compare non-numeric values',
        current,
        previous,
      };
    }

    const change = currentValue - previousValue;
    const percentageChange = (change / previousValue) * 100;

    return {
      current: {
        date: current.resultDate,
        value: current.value,
        status: current.status,
      },
      previous: {
        date: previous.resultDate,
        value: previous.value,
        status: previous.status,
      },
      change: change.toFixed(2),
      percentageChange: percentageChange.toFixed(2),
      interpretation:
        Math.abs(percentageChange) < 5
          ? 'Minimal change'
          : percentageChange > 0
            ? 'Increased'
            : 'Decreased',
    };
  }

  async getStatistics(userId: string): Promise<any> {
    const results = await this.labResultRepository.find({
      where: { userId },
    });

    const stats = {
      total: results.length,
      normal: results.filter((r) => r.status === ResultStatus.NORMAL).length,
      abnormal: results.filter((r) => r.isAbnormal).length,
      critical: results.filter((r) => r.isCritical).length,
      byTest: {} as Record<string, number>,
      recentAbnormal: results
        .filter((r) => r.isAbnormal)
        .sort((a, b) => b.resultDate.getTime() - a.resultDate.getTime())
        .slice(0, 5),
    };

    results.forEach((result) => {
      const key = `${result.testName} - ${result.componentName}`;
      stats.byTest[key] = (stats.byTest[key] || 0) + 1;
    });

    return stats;
  }

  async bulkCreate(
    userId: string,
    results: CreateLabResultDto[],
  ): Promise<LabTestResultDetail[]> {
    const createdResults: LabTestResultDetail[] = [];

    for (const resultDto of results) {
      const result = await this.create(userId, resultDto);
      createdResults.push(result);
    }

    return createdResults;
  }
}

import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThan, LessThan } from 'typeorm';
import { HealthTracking, TrackingType } from '../../entities/health-tracking.entity';

@Injectable()
export class HealthTrackingService {
  private readonly logger = new Logger(HealthTrackingService.name);

  constructor(
    @InjectRepository(HealthTracking)
    private readonly healthTrackingRepository: Repository<HealthTracking>,
  ) {}

  async create(userId: string, data: any): Promise<HealthTracking> {
    try {
      const tracking = new HealthTracking();
      tracking.userId = userId;
      tracking.trackingType = data.trackingType;
      tracking.trackedAt = data.trackedAt || new Date();
      
      // Assign all other fields
      Object.assign(tracking, data);

      const saved = await this.healthTrackingRepository.save(tracking);
      
      this.logger.log(`Created ${data.trackingType} tracking ${saved.id} for user ${userId}`);
      return saved;
    } catch (error) {
      this.logger.error(`Error creating tracking: ${error.message}`);
      throw new Error('Failed to create tracking entry');
    }
  }

  async findAll(
    userId: string,
    trackingType?: TrackingType,
    startDate?: Date,
    endDate?: Date,
    limit: number = 100,
  ): Promise<HealthTracking[]> {
    try {
      const query: any = { userId };

      if (trackingType) {
        query.trackingType = trackingType;
      }

      if (startDate && endDate) {
        query.trackedAt = Between(startDate, endDate);
      } else if (startDate) {
        query.trackedAt = MoreThan(startDate);
      } else if (endDate) {
        query.trackedAt = LessThan(endDate);
      }

      return await this.healthTrackingRepository.find({
        where: query,
        order: { trackedAt: 'DESC' },
        take: limit,
      });
    } catch (error) {
      this.logger.error(`Error fetching tracking data: ${error.message}`);
      throw new Error('Failed to fetch tracking data');
    }
  }

  async findOne(id: string, userId: string): Promise<HealthTracking> {
    try {
      const tracking = await this.healthTrackingRepository.findOne({
        where: { id, userId },
      });

      if (!tracking) {
        throw new NotFoundException('Tracking entry not found');
      }

      return tracking;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error fetching tracking entry: ${error.message}`);
      throw new Error('Failed to fetch tracking entry');
    }
  }

  async update(id: string, userId: string, data: any): Promise<HealthTracking> {
    try {
      const tracking = await this.findOne(id, userId);
      Object.assign(tracking, data);
      const updated = await this.healthTrackingRepository.save(tracking);
      this.logger.log(`Updated tracking ${id}`);
      return updated;
    } catch (error) {
      this.logger.error(`Error updating tracking: ${error.message}`);
      throw error;
    }
  }

  async delete(id: string, userId: string): Promise<void> {
    try {
      const tracking = await this.findOne(id, userId);
      tracking.deletedAt = new Date();
      await this.healthTrackingRepository.save(tracking);
      this.logger.log(`Deleted tracking ${id}`);
    } catch (error) {
      this.logger.error(`Error deleting tracking: ${error.message}`);
      throw error;
    }
  }

  // Analytics Methods
  async getStats(
    userId: string,
    trackingType: TrackingType,
    startDate: Date,
    endDate: Date,
  ): Promise<any> {
    try {
      const data = await this.findAll(userId, trackingType, startDate, endDate, 1000);

      switch (trackingType) {
        case TrackingType.FITNESS:
          return this.calculateFitnessStats(data);
        case TrackingType.SLEEP:
          return this.calculateSleepStats(data);
        case TrackingType.WEIGHT:
          return this.calculateWeightStats(data);
        case TrackingType.NUTRITION:
          return this.calculateNutritionStats(data);
        case TrackingType.WATER:
          return this.calculateWaterStats(data);
        case TrackingType.MOOD:
          return this.calculateMoodStats(data);
        case TrackingType.PAIN:
          return this.calculatePainStats(data);
        case TrackingType.BLOOD_PRESSURE:
          return this.calculateBPStats(data);
        case TrackingType.BLOOD_GLUCOSE:
          return this.calculateGlucoseStats(data);
        default:
          return { count: data.length, data };
      }
    } catch (error) {
      this.logger.error(`Error calculating stats: ${error.message}`);
      throw new Error('Failed to calculate stats');
    }
  }

  private calculateFitnessStats(data: HealthTracking[]): any {
    const totalSteps = data.reduce((sum, d) => sum + (d.steps || 0), 0);
    const totalDistance = data.reduce((sum, d) => sum + (d.distance || 0), 0);
    const totalCalories = data.reduce((sum, d) => sum + (d.caloriesBurned || 0), 0);
    const totalActiveMinutes = data.reduce((sum, d) => sum + (d.activeMinutes || 0), 0);

    return {
      totalSteps,
      averageSteps: data.length > 0 ? Math.round(totalSteps / data.length) : 0,
      totalDistance: Math.round(totalDistance * 100) / 100,
      totalCalories,
      totalActiveMinutes,
      daysTracked: data.length,
    };
  }

  private calculateSleepStats(data: HealthTracking[]): any {
    const totalSleep = data.reduce((sum, d) => sum + (d.sleepDurationMinutes || 0), 0);
    const avgSleep = data.length > 0 ? totalSleep / data.length : 0;

    return {
      averageSleepHours: Math.round((avgSleep / 60) * 10) / 10,
      totalSleepHours: Math.round((totalSleep / 60) * 10) / 10,
      nightsTracked: data.length,
      averageQuality: this.calculateAverageQuality(data.map(d => d.sleepQuality)),
    };
  }

  private calculateWeightStats(data: HealthTracking[]): any {
    if (data.length === 0) return { noData: true };

    const weights = data.map(d => d.weight).filter(w => w);
    const latest = weights[0];
    const oldest = weights[weights.length - 1];
    const change = latest - oldest;

    return {
      currentWeight: latest,
      startWeight: oldest,
      weightChange: Math.round(change * 100) / 100,
      averageWeight: Math.round((weights.reduce((a, b) => a + b, 0) / weights.length) * 100) / 100,
      entriesCount: data.length,
    };
  }

  private calculateNutritionStats(data: HealthTracking[]): any {
    const totalCalories = data.reduce((sum, d) => sum + (d.caloriesConsumed || 0), 0);
    const totalProtein = data.reduce((sum, d) => sum + (d.proteinGrams || 0), 0);
    const totalCarbs = data.reduce((sum, d) => sum + (d.carbsGrams || 0), 0);
    const totalFat = data.reduce((sum, d) => sum + (d.fatGrams || 0), 0);

    return {
      averageCalories: data.length > 0 ? Math.round(totalCalories / data.length) : 0,
      averageProtein: data.length > 0 ? Math.round(totalProtein / data.length) : 0,
      averageCarbs: data.length > 0 ? Math.round(totalCarbs / data.length) : 0,
      averageFat: data.length > 0 ? Math.round(totalFat / data.length) : 0,
      daysTracked: data.length,
    };
  }

  private calculateWaterStats(data: HealthTracking[]): any {
    const totalWater = data.reduce((sum, d) => sum + (d.waterIntakeMl || 0), 0);
    const avgWater = data.length > 0 ? totalWater / data.length : 0;

    return {
      averageWaterMl: Math.round(avgWater),
      totalWaterLiters: Math.round((totalWater / 1000) * 10) / 10,
      daysTracked: data.length,
    };
  }

  private calculateMoodStats(data: HealthTracking[]): any {
    const moods = data.map(d => d.moodLevel).filter(m => m);
    const avgMood = moods.length > 0 ? moods.reduce((a, b) => a + b, 0) / moods.length : 0;

    return {
      averageMood: Math.round(avgMood * 10) / 10,
      entriesCount: data.length,
      moodDistribution: this.getMoodDistribution(moods),
    };
  }

  private calculatePainStats(data: HealthTracking[]): any {
    const painLevels = data.map(d => d.painLevel).filter(p => p !== null && p !== undefined);
    const avgPain = painLevels.length > 0 ? painLevels.reduce((a, b) => a + b, 0) / painLevels.length : 0;

    return {
      averagePainLevel: Math.round(avgPain * 10) / 10,
      entriesCount: data.length,
      painDistribution: this.getPainDistribution(painLevels),
    };
  }

  private calculateBPStats(data: HealthTracking[]): any {
    const systolic = data.map(d => d.systolicBP).filter(s => s);
    const diastolic = data.map(d => d.diastolicBP).filter(d => d);

    return {
      averageSystolic: systolic.length > 0 ? Math.round(systolic.reduce((a, b) => a + b, 0) / systolic.length) : 0,
      averageDiastolic: diastolic.length > 0 ? Math.round(diastolic.reduce((a, b) => a + b, 0) / diastolic.length) : 0,
      readingsCount: data.length,
    };
  }

  private calculateGlucoseStats(data: HealthTracking[]): any {
    const glucose = data.map(d => d.bloodGlucose).filter(g => g);
    const avgGlucose = glucose.length > 0 ? glucose.reduce((a, b) => a + b, 0) / glucose.length : 0;

    return {
      averageGlucose: Math.round(avgGlucose * 10) / 10,
      readingsCount: data.length,
    };
  }

  private calculateAverageQuality(qualities: any[]): number {
    const validQualities = qualities.filter(q => q);
    if (validQualities.length === 0) return 0;
    return Math.round((validQualities.reduce((a, b) => a + b, 0) / validQualities.length) * 10) / 10;
  }

  private getMoodDistribution(moods: number[]): any {
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    moods.forEach(mood => {
      if (mood >= 1 && mood <= 5) {
        distribution[mood]++;
      }
    });
    return distribution;
  }

  private getPainDistribution(painLevels: number[]): any {
    const distribution = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    painLevels.forEach(level => {
      if (level >= 0 && level <= 5) {
        distribution[level]++;
      }
    });
    return distribution;
  }
}

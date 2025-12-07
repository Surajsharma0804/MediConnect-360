import {
  IsEnum,
  IsOptional,
  IsNumber,
  IsString,
  IsBoolean,
  IsDate,
  IsArray,
  Min,
  Max,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  TrackingType,
  MoodLevel,
  PainLevel,
  SleepQuality,
} from '../../entities/health-tracking.entity';

export class CreateTrackingDto {
  @IsEnum(TrackingType)
  trackingType: TrackingType;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  trackedAt?: Date;

  // Fitness
  @IsNumber()
  @IsOptional()
  @Min(0)
  steps?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  distance?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  caloriesBurned?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  activeMinutes?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  exerciseMinutes?: number;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  exerciseType?: string;

  // Sleep
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  sleepStart?: Date;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  sleepEnd?: Date;

  @IsNumber()
  @IsOptional()
  @Min(0)
  sleepDurationMinutes?: number;

  @IsNumber()
  @IsOptional()
  deepSleepMinutes?: number;

  @IsNumber()
  @IsOptional()
  lightSleepMinutes?: number;

  @IsNumber()
  @IsOptional()
  remSleepMinutes?: number;

  @IsNumber()
  @IsOptional()
  awakeMinutes?: number;

  @IsEnum(SleepQuality)
  @IsOptional()
  sleepQuality?: SleepQuality;

  // Mood
  @IsEnum(MoodLevel)
  @IsOptional()
  moodLevel?: MoodLevel;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  moodFactors?: string[];

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  moodNotes?: string;

  // Pain
  @IsEnum(PainLevel)
  @IsOptional()
  painLevel?: PainLevel;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  painLocation?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  painType?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  painTriggers?: string[];

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  painNotes?: string;

  // Symptom
  @IsString()
  @IsOptional()
  @MaxLength(200)
  symptomName?: string;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(10)
  symptomSeverity?: number;

  @IsOptional()
  symptomDetails?: Record<string, any>;

  // Medication Adherence
  @IsString()
  @IsOptional()
  @MaxLength(200)
  medicationName?: string;

  @IsBoolean()
  @IsOptional()
  medicationTaken?: boolean;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  medicationScheduledTime?: Date;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  medicationActualTime?: Date;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  medicationSkipReason?: string;

  // Weight
  @IsNumber()
  @IsOptional()
  @Min(0)
  weight?: number;

  @IsString()
  @IsOptional()
  @MaxLength(10)
  weightUnit?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  bodyFatPercentage?: number;

  @IsNumber()
  @IsOptional()
  muscleMass?: number;

  @IsNumber()
  @IsOptional()
  bmi?: number;

  // Nutrition
  @IsNumber()
  @IsOptional()
  @Min(0)
  caloriesConsumed?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  proteinGrams?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  carbsGrams?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  fatGrams?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  fiberGrams?: number;

  @IsArray()
  @IsOptional()
  meals?: Array<{
    name: string;
    time: string;
    calories: number;
    description: string;
  }>;

  // Water
  @IsNumber()
  @IsOptional()
  @Min(0)
  waterIntakeMl?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  waterGoalMl?: number;

  // Menstrual
  @IsBoolean()
  @IsOptional()
  isPeriodDay?: boolean;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  flowLevel?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  menstrualSymptoms?: string[];

  @IsBoolean()
  @IsOptional()
  isOvulationDay?: boolean;

  // Blood Pressure
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(300)
  systolicBP?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(200)
  diastolicBP?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(300)
  pulseBPM?: number;

  // Blood Glucose
  @IsNumber()
  @IsOptional()
  @Min(0)
  bloodGlucose?: number;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  glucoseMeasurementType?: string;

  // Heart Rate
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(300)
  heartRate?: number;

  @IsNumber()
  @IsOptional()
  restingHeartRate?: number;

  @IsNumber()
  @IsOptional()
  maxHeartRate?: number;

  // General
  @IsString()
  @IsOptional()
  @MaxLength(2000)
  notes?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsOptional()
  metadata?: Record<string, any>;

  @IsOptional()
  wearableData?: Record<string, any>;
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CarePlan, CarePlanStatus } from '../../entities/care-plan.entity';
import { NotificationService } from '../../services/notification.service';

@Injectable()
export class CarePlanService {
  constructor(
    @InjectRepository(CarePlan)
    private carePlanRepository: Repository<CarePlan>,
    private notificationService: NotificationService,
  ) {}

  async create(userId: string, data: Partial<CarePlan>): Promise<CarePlan> {
    const plan = this.carePlanRepository.create({
      userId,
      ...data,
      status: CarePlanStatus.ACTIVE,
      startDate: data.startDate || new Date(),
      progressPercentage: 0,
    });

    const savedPlan = await this.carePlanRepository.save(plan);

    this.notificationService.sendPushNotification(userId, {
      title: 'Care Plan Created',
      body: `Your care plan "${data.title}" has been created.`,
    });

    return savedPlan;
  }

  async findAll(userId: string): Promise<CarePlan[]> {
    return this.carePlanRepository.find({
      where: { userId },
      relations: ['createdByProvider'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<CarePlan> {
    const plan = await this.carePlanRepository.findOne({
      where: { id, userId },
      relations: ['createdByProvider'],
    });

    if (!plan) {
      throw new NotFoundException('Care plan not found');
    }

    return plan;
  }

  async update(
    id: string,
    userId: string,
    data: Partial<CarePlan>,
  ): Promise<CarePlan> {
    const plan = await this.findOne(id, userId);

    Object.assign(plan, data);

    return this.carePlanRepository.save(plan);
  }

  async delete(id: string, userId: string): Promise<void> {
    const plan = await this.findOne(id, userId);

    plan.status = CarePlanStatus.CANCELLED;

    await this.carePlanRepository.save(plan);
  }

  async addGoal(
    id: string,
    userId: string,
    goal: {
      description: string;
      targetDate?: string;
      progress?: number;
    },
  ): Promise<CarePlan> {
    const plan = await this.findOne(id, userId);

    const newGoal = {
      id: Date.now().toString(),
      ...goal,
      completed: false,
      progress: goal.progress || 0,
    };

    plan.goals = [...(plan.goals || []), newGoal];

    return this.carePlanRepository.save(plan);
  }

  async updateGoal(
    id: string,
    userId: string,
    goalId: string,
    updates: Partial<any>,
  ): Promise<CarePlan> {
    const plan = await this.findOne(id, userId);

    plan.goals = plan.goals.map((g) =>
      g.id === goalId ? { ...g, ...updates } : g,
    );

    // Recalculate progress
    const completedGoals = plan.goals.filter((g) => g.completed).length;
    plan.progressPercentage = Math.round(
      (completedGoals / plan.goals.length) * 100,
    );

    return this.carePlanRepository.save(plan);
  }

  async addTask(
    id: string,
    userId: string,
    task: {
      description: string;
      frequency?: string;
      dueDate?: string;
      assignedTo?: string;
    },
  ): Promise<CarePlan> {
    const plan = await this.findOne(id, userId);

    const newTask = {
      id: Date.now().toString(),
      ...task,
      completed: false,
    };

    plan.tasks = [...(plan.tasks || []), newTask];

    return this.carePlanRepository.save(plan);
  }

  async completeTask(
    id: string,
    userId: string,
    taskId: string,
  ): Promise<CarePlan> {
    const plan = await this.findOne(id, userId);

    plan.tasks = plan.tasks.map((t) =>
      t.id === taskId ? { ...t, completed: true } : t,
    );

    return this.carePlanRepository.save(plan);
  }

  async getProgress(id: string, userId: string): Promise<any> {
    const plan = await this.findOne(id, userId);

    const totalGoals = plan.goals?.length || 0;
    const completedGoals = plan.goals?.filter((g) => g.completed).length || 0;
    const totalTasks = plan.tasks?.length || 0;
    const completedTasks = plan.tasks?.filter((t) => t.completed).length || 0;

    return {
      planId: plan.id,
      title: plan.title,
      status: plan.status,
      overallProgress: plan.progressPercentage,
      goals: {
        total: totalGoals,
        completed: completedGoals,
        percentage: totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0,
      },
      tasks: {
        total: totalTasks,
        completed: completedTasks,
        percentage: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
      },
      startDate: plan.startDate,
      endDate: plan.endDate,
      daysActive: Math.floor(
        (new Date().getTime() - plan.startDate.getTime()) /
          (1000 * 60 * 60 * 24),
      ),
    };
  }

  async reviewPlan(id: string, userId: string): Promise<CarePlan> {
    const plan = await this.findOne(id, userId);

    plan.lastReviewedDate = new Date();

    return this.carePlanRepository.save(plan);
  }
}

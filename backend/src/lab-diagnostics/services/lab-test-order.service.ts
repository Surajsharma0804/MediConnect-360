import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  LabTestOrder,
  LabTestStatus,
} from '../../entities/lab-test-order.entity';
import { CreateLabTestOrderDto } from '../dto/create-lab-test-order.dto';
import { NotificationService } from '../../services/notification.service';

@Injectable()
export class LabTestOrderService {
  constructor(
    @InjectRepository(LabTestOrder)
    private labTestOrderRepository: Repository<LabTestOrder>,
    private notificationService: NotificationService,
  ) {}

  async create(
    userId: string,
    createDto: CreateLabTestOrderDto,
  ): Promise<LabTestOrder> {
    const order = this.labTestOrderRepository.create({
      ...createDto,
      userId,
      scheduledDate: createDto.scheduledDate
        ? new Date(createDto.scheduledDate)
        : undefined,
    });

    const savedOrder = await this.labTestOrderRepository.save(order);

    // Send notification
    this.notificationService.sendPushNotification(userId, {
      title: 'Lab Test Ordered',
      body: `Your ${createDto.testName} has been ordered successfully.`,
    });

    return savedOrder;
  }

  async findAll(userId: string): Promise<LabTestOrder[]> {
    return this.labTestOrderRepository.find({
      where: { userId },
      relations: ['orderedByProvider'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<LabTestOrder> {
    const order = await this.labTestOrderRepository.findOne({
      where: { id, userId },
      relations: ['orderedByProvider'],
    });

    if (!order) {
      throw new NotFoundException('Lab test order not found');
    }

    return order;
  }

  async updateStatus(
    id: string,
    userId: string,
    status: LabTestStatus,
  ): Promise<LabTestOrder> {
    const order = await this.findOne(id, userId);

    order.status = status;

    if (status === LabTestStatus.SAMPLE_COLLECTED) {
      order.collectionDate = new Date();
    } else if (status === LabTestStatus.COMPLETED) {
      order.completedDate = new Date();
    }

    const updatedOrder = await this.labTestOrderRepository.save(order);

    // Send notification for status changes
    const statusMessages = {
      [LabTestStatus.SCHEDULED]: 'Your lab test has been scheduled.',
      [LabTestStatus.SAMPLE_COLLECTED]: 'Your sample has been collected.',
      [LabTestStatus.IN_PROGRESS]: 'Your lab test is being processed.',
      [LabTestStatus.COMPLETED]: 'Your lab test is complete.',
      [LabTestStatus.RESULTS_READY]: 'Your lab results are ready to view.',
    };

    if (statusMessages[status]) {
      this.notificationService.sendPushNotification(userId, {
        title: 'Lab Test Update',
        body: statusMessages[status],
      });
    }

    return updatedOrder;
  }

  async cancel(
    id: string,
    userId: string,
    reason: string,
  ): Promise<LabTestOrder> {
    const order = await this.findOne(id, userId);

    order.status = LabTestStatus.CANCELLED;
    order.cancellationReason = reason;

    return this.labTestOrderRepository.save(order);
  }

  async findHomeKits(userId: string): Promise<LabTestOrder[]> {
    return this.labTestOrderRepository.find({
      where: { userId, isHomeKit: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findUpcoming(userId: string): Promise<LabTestOrder[]> {
    const now = new Date();
    return this.labTestOrderRepository
      .createQueryBuilder('order')
      .where('order.userId = :userId', { userId })
      .andWhere('order.scheduledDate > :now', { now })
      .andWhere('order.status IN (:...statuses)', {
        statuses: [LabTestStatus.ORDERED, LabTestStatus.SCHEDULED],
      })
      .orderBy('order.scheduledDate', 'ASC')
      .getMany();
  }

  async getStatistics(userId: string): Promise<any> {
    const orders = await this.labTestOrderRepository.find({
      where: { userId },
    });

    const stats = {
      total: orders.length,
      completed: orders.filter((o) => o.status === LabTestStatus.COMPLETED)
        .length,
      pending: orders.filter(
        (o) =>
          o.status === LabTestStatus.ORDERED ||
          o.status === LabTestStatus.SCHEDULED,
      ).length,
      homeKits: orders.filter((o) => o.isHomeKit).length,
      byType: {} as Record<string, number>,
      totalCost: orders.reduce(
        (sum, o) => sum + (Number(o.estimatedCost) || 0),
        0,
      ),
    };

    orders.forEach((order) => {
      stats.byType[order.testType] = (stats.byType[order.testType] || 0) + 1;
    });

    return stats;
  }
}

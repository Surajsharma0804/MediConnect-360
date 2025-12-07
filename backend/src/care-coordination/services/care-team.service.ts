import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CareTeamMember,
  CareTeamRole,
  MemberStatus,
} from '../../entities/care-team.entity';
import { NotificationService } from '../../services/notification.service';

@Injectable()
export class CareTeamService {
  constructor(
    @InjectRepository(CareTeamMember)
    private careTeamRepository: Repository<CareTeamMember>,
    private notificationService: NotificationService,
  ) {}

  async addMember(
    userId: string,
    data: {
      providerId?: string;
      role: CareTeamRole;
      specialization?: string;
      notes?: string;
      isPrimary?: boolean;
    },
  ): Promise<CareTeamMember> {
    const member = this.careTeamRepository.create({
      userId,
      ...data,
      status: MemberStatus.ACTIVE,
      addedDate: new Date(),
    });

    const savedMember = await this.careTeamRepository.save(member);

    await this.notificationService.sendPushNotification(userId, {
      title: 'Care Team Updated',
      body: `A new ${data.role} has been added to your care team.`,
    });

    return savedMember;
  }

  async findAll(userId: string): Promise<CareTeamMember[]> {
    return this.careTeamRepository.find({
      where: { userId, status: MemberStatus.ACTIVE },
      relations: ['provider'],
      order: { isPrimary: 'DESC', addedDate: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<CareTeamMember> {
    const member = await this.careTeamRepository.findOne({
      where: { id, userId },
      relations: ['provider'],
    });

    if (!member) {
      throw new NotFoundException('Care team member not found');
    }

    return member;
  }

  async update(
    id: string,
    userId: string,
    data: Partial<CareTeamMember>,
  ): Promise<CareTeamMember> {
    const member = await this.findOne(id, userId);

    Object.assign(member, data);

    return this.careTeamRepository.save(member);
  }

  async remove(id: string, userId: string): Promise<void> {
    const member = await this.findOne(id, userId);

    member.status = MemberStatus.INACTIVE;

    await this.careTeamRepository.save(member);
  }

  async logContact(id: string, userId: string): Promise<CareTeamMember> {
    const member = await this.findOne(id, userId);

    member.lastContactDate = new Date();

    return this.careTeamRepository.save(member);
  }

  async getPrimaryCareProvider(userId: string): Promise<CareTeamMember | null> {
    return this.careTeamRepository.findOne({
      where: {
        userId,
        isPrimary: true,
        status: MemberStatus.ACTIVE,
      },
      relations: ['provider'],
    });
  }

  async getStatistics(userId: string): Promise<any> {
    const members = await this.findAll(userId);

    const stats = {
      totalMembers: members.length,
      byRole: {} as Record<string, number>,
      hasPrimaryCare: members.some((m) => m.isPrimary),
      recentContacts: members
        .filter((m) => m.lastContactDate)
        .sort(
          (a, b) => b.lastContactDate.getTime() - a.lastContactDate.getTime(),
        )
        .slice(0, 5),
    };

    members.forEach((member) => {
      stats.byRole[member.role] = (stats.byRole[member.role] || 0) + 1;
    });

    return stats;
  }
}

import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FamilyMember, AccessLevel } from '../../entities/family-member.entity';

@Injectable()
export class FamilyMemberService {
  private readonly logger = new Logger(FamilyMemberService.name);

  constructor(
    @InjectRepository(FamilyMember)
    private readonly familyMemberRepository: Repository<FamilyMember>,
  ) {}

  async create(userId: string, data: any): Promise<FamilyMember> {
    try {
      // Validate age for minors
      const age = this.calculateAge(data.dateOfBirth);
      if (age < 0 || age > 150) {
        throw new BadRequestException('Invalid date of birth');
      }

      const familyMember = this.familyMemberRepository.create({
        primaryUserId: userId,
        firstName: data.firstName,
        lastName: data.lastName,
        relationship: data.relationship,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender,
        phone: data.phone,
        email: data.email,
        accessLevel: data.accessLevel || AccessLevel.FULL,
        canViewMedicalRecords: data.canViewMedicalRecords ?? true,
        canBookAppointments: data.canBookAppointments ?? true,
        canManagePrescriptions: data.canManagePrescriptions ?? false,
        isEmergencyContact: data.isEmergencyContact ?? false,
        profileImage: data.profileImage,
        notes: data.notes,
        metadata: data.metadata,
      });

      const saved = await this.familyMemberRepository.save(familyMember);
      this.logger.log(`Created family member ${saved.id} for user ${userId}`);
      return saved;
    } catch (error) {
      this.logger.error(`Error creating family member: ${error.message}`);
      throw error;
    }
  }

  async findAll(userId: string): Promise<FamilyMember[]> {
    try {
      return await this.familyMemberRepository.find({
        where: { primaryUserId: userId },
        order: { createdAt: 'DESC' },
      });
    } catch (error) {
      this.logger.error(`Error fetching family members: ${error.message}`);
      throw new Error('Failed to fetch family members');
    }
  }

  async findOne(id: string, userId: string): Promise<FamilyMember> {
    try {
      const member = await this.familyMemberRepository.findOne({
        where: { id, primaryUserId: userId },
      });

      if (!member) {
        throw new NotFoundException('Family member not found');
      }

      return member;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error fetching family member: ${error.message}`);
      throw new Error('Failed to fetch family member');
    }
  }

  async update(id: string, userId: string, data: any): Promise<FamilyMember> {
    try {
      const member = await this.findOne(id, userId);

      if (data.dateOfBirth) {
        const age = this.calculateAge(data.dateOfBirth);
        if (age < 0 || age > 150) {
          throw new BadRequestException('Invalid date of birth');
        }
      }

      Object.assign(member, data);
      const updated = await this.familyMemberRepository.save(member);
      this.logger.log(`Updated family member ${id}`);
      return updated;
    } catch (error) {
      this.logger.error(`Error updating family member: ${error.message}`);
      throw error;
    }
  }

  async delete(id: string, userId: string): Promise<void> {
    try {
      const member = await this.findOne(id, userId);
      member.deletedAt = new Date();
      await this.familyMemberRepository.save(member);
      this.logger.log(`Deleted family member ${id}`);
    } catch (error) {
      this.logger.error(`Error deleting family member: ${error.message}`);
      throw error;
    }
  }

  async grantAccess(
    id: string,
    userId: string,
    accessData: any,
  ): Promise<FamilyMember> {
    try {
      const member = await this.findOne(id, userId);

      member.accessLevel = accessData.accessLevel || member.accessLevel;
      member.canViewMedicalRecords =
        accessData.canViewMedicalRecords ?? member.canViewMedicalRecords;
      member.canBookAppointments =
        accessData.canBookAppointments ?? member.canBookAppointments;
      member.canManagePrescriptions =
        accessData.canManagePrescriptions ?? member.canManagePrescriptions;

      const updated = await this.familyMemberRepository.save(member);
      this.logger.log(`Granted access to family member ${id}`);
      return updated;
    } catch (error) {
      this.logger.error(`Error granting access: ${error.message}`);
      throw error;
    }
  }

  async revokeAccess(id: string, userId: string): Promise<FamilyMember> {
    try {
      const member = await this.findOne(id, userId);

      member.accessLevel = AccessLevel.VIEW_ONLY;
      member.canViewMedicalRecords = false;
      member.canBookAppointments = false;
      member.canManagePrescriptions = false;

      const updated = await this.familyMemberRepository.save(member);
      this.logger.log(`Revoked access for family member ${id}`);
      return updated;
    } catch (error) {
      this.logger.error(`Error revoking access: ${error.message}`);
      throw error;
    }
  }

  async getSharedRecords(id: string, userId: string): Promise<any> {
    try {
      const member = await this.findOne(id, userId);

      if (!member.canViewMedicalRecords) {
        throw new ForbiddenException('This family member cannot view records');
      }

      // Return summary of what records they can access
      return {
        familyMemberId: member.id,
        name: `${member.firstName} ${member.lastName}`,
        accessLevel: member.accessLevel,
        permissions: {
          canViewMedicalRecords: member.canViewMedicalRecords,
          canBookAppointments: member.canBookAppointments,
          canManagePrescriptions: member.canManagePrescriptions,
        },
        contactInfo: {
          phone: member.phone,
          email: member.email,
        },
      };
    } catch (error) {
      this.logger.error(`Error getting shared records: ${error.message}`);
      throw error;
    }
  }

  async getMinors(userId: string): Promise<FamilyMember[]> {
    try {
      const members = await this.findAll(userId);
      return members.filter(
        (member) => this.calculateAge(member.dateOfBirth) < 18,
      );
    } catch (error) {
      this.logger.error(`Error fetching minors: ${error.message}`);
      throw new Error('Failed to fetch minors');
    }
  }

  private calculateAge(dateOfBirth: Date): number {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  }
}

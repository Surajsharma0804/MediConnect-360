import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EPrescription, EPrescriptionStatus } from '../../entities/e-prescription.entity';
import { Prescription } from '../../entities/prescription.entity';
import { Pharmacy } from '../../entities/pharmacy.entity';
import { EmailService } from '../../services/email.service';
import { NotificationService } from '../../services/notification.service';
import { SMSService } from '../../services/sms.service';

@Injectable()
export class EPrescriptionService {
  private readonly logger = new Logger(EPrescriptionService.name);

  constructor(
    @InjectRepository(EPrescription)
    private ePrescriptionRepository: Repository<EPrescription>,
    @InjectRepository(Prescription)
    private prescriptionRepository: Repository<Prescription>,
    @InjectRepository(Pharmacy)
    private pharmacyRepository: Repository<Pharmacy>,
    private emailService: EmailService,
    private notificationService: NotificationService,
    private smsService: SMSService,
  ) {}

  async sendToPharmacy(
    userId: string,
    prescriptionId: string,
    pharmacyId: string,
    deliveryMethod: string,
    deliveryAddress?: string,
  ): Promise<EPrescription> {
    try {
      const prescription = await this.prescriptionRepository.findOne({
        where: { id: prescriptionId, userId },
        relations: ['user'],
      });

      if (!prescription) {
        throw new NotFoundException('Prescription not found');
      }

      const pharmacy = await this.pharmacyRepository.findOne({
        where: { id: pharmacyId, isActive: true },
      });

      if (!pharmacy) {
        throw new NotFoundException('Pharmacy not found');
      }

      if (!pharmacy.acceptsEPrescriptions) {
        throw new BadRequestException('Pharmacy does not accept e-prescriptions');
      }

      const ePrescription = this.ePrescriptionRepository.create({
        userId,
        prescriptionId,
        pharmacyId,
        providerId: prescription.providerId,
        deliveryMethod: deliveryMethod as any,
        deliveryAddress,
        status: EPrescriptionStatus.SENT,
        sentAt: new Date(),
      });

      const saved = await this.ePrescriptionRepository.save(ePrescription);

      // Send notifications
      await this.notifyPrescriptionSent(prescription, pharmacy);

      this.logger.log(`E-prescription sent to pharmacy ${pharmacyId}`);
      return saved;
    } catch (error) {
      this.logger.error(`Error sending e-prescription: ${error.message}`);
      throw error;
    }
  }

  async findByUser(userId: string): Promise<EPrescription[]> {
    try {
      return await this.ePrescriptionRepository.find({
        where: { userId },
        relations: ['prescription', 'pharmacy'],
        order: { createdAt: 'DESC' },
      });
    } catch (error) {
      this.logger.error(`Error finding user e-prescriptions: ${error.message}`);
      throw error;
    }
  }

  async findById(id: string, userId: string): Promise<EPrescription> {
    try {
      const ePrescription = await this.ePrescriptionRepository.findOne({
        where: { id, userId },
        relations: ['prescription', 'pharmacy'],
      });

      if (!ePrescription) {
        throw new NotFoundException('E-prescription not found');
      }

      return ePrescription;
    } catch (error) {
      this.logger.error(`Error finding e-prescription: ${error.message}`);
      throw error;
    }
  }

  async updateStatus(
    id: string,
    status: EPrescriptionStatus,
    metadata?: any,
  ): Promise<EPrescription> {
    try {
      const ePrescription = await this.ePrescriptionRepository.findOne({
        where: { id },
        relations: ['prescription', 'pharmacy', 'user'],
      });

      if (!ePrescription) {
        throw new NotFoundException('E-prescription not found');
      }

      ePrescription.status = status;

      // Update timestamps based on status
      switch (status) {
        case EPrescriptionStatus.RECEIVED:
          ePrescription.receivedAt = new Date();
          break;
        case EPrescriptionStatus.FILLED:
          ePrescription.filledAt = new Date();
          break;
        case EPrescriptionStatus.READY_FOR_PICKUP:
          ePrescription.readyAt = new Date();
          break;
        case EPrescriptionStatus.PICKED_UP:
        case EPrescriptionStatus.DELIVERED:
          ePrescription.completedAt = new Date();
          break;
      }

      if (metadata) {
        ePrescription.metadata = { ...ePrescription.metadata, ...metadata };
      }

      const updated = await this.ePrescriptionRepository.save(ePrescription);

      // Send status update notifications
      await this.notifyStatusUpdate(ePrescription);

      return updated;
    } catch (error) {
      this.logger.error(`Error updating e-prescription status: ${error.message}`);
      throw error;
    }
  }

  async cancel(id: string, userId: string, reason?: string): Promise<EPrescription> {
    try {
      const ePrescription = await this.findById(id, userId);

      if (
        ePrescription.status === EPrescriptionStatus.PICKED_UP ||
        ePrescription.status === EPrescriptionStatus.DELIVERED
      ) {
        throw new BadRequestException('Cannot cancel completed prescription');
      }

      ePrescription.status = EPrescriptionStatus.CANCELLED;
      ePrescription.notes = reason || 'Cancelled by user';

      return await this.ePrescriptionRepository.save(ePrescription);
    } catch (error) {
      this.logger.error(`Error cancelling e-prescription: ${error.message}`);
      throw error;
    }
  }

  async requestRefill(prescriptionId: string, userId: string): Promise<EPrescription> {
    try {
      const prescription = await this.prescriptionRepository.findOne({
        where: { id: prescriptionId, userId },
      });

      if (!prescription) {
        throw new NotFoundException('Prescription not found');
      }

      if (prescription.refillsRemaining <= 0) {
        throw new BadRequestException('No refills remaining');
      }

      // Find the last e-prescription for this prescription
      const lastEPrescription = await this.ePrescriptionRepository.findOne({
        where: { prescriptionId },
        order: { createdAt: 'DESC' },
      });

      if (!lastEPrescription) {
        throw new NotFoundException('No previous e-prescription found');
      }

      // Create new e-prescription for refill
      return await this.sendToPharmacy(
        userId,
        prescriptionId,
        lastEPrescription.pharmacyId,
        lastEPrescription.deliveryMethod,
        lastEPrescription.deliveryAddress,
      );
    } catch (error) {
      this.logger.error(`Error requesting refill: ${error.message}`);
      throw error;
    }
  }

  async transferPharmacy(
    id: string,
    userId: string,
    newPharmacyId: string,
  ): Promise<EPrescription> {
    try {
      const ePrescription = await this.findById(id, userId);

      if (ePrescription.status !== EPrescriptionStatus.PENDING) {
        throw new BadRequestException('Can only transfer pending prescriptions');
      }

      const newPharmacy = await this.pharmacyRepository.findOne({
        where: { id: newPharmacyId, isActive: true },
      });

      if (!newPharmacy) {
        throw new NotFoundException('New pharmacy not found');
      }

      ePrescription.pharmacyId = newPharmacyId;
      ePrescription.status = EPrescriptionStatus.SENT;
      ePrescription.sentAt = new Date();

      return await this.ePrescriptionRepository.save(ePrescription);
    } catch (error) {
      this.logger.error(`Error transferring pharmacy: ${error.message}`);
      throw error;
    }
  }

  async getActiveByPharmacy(pharmacyId: string): Promise<EPrescription[]> {
    try {
      return await this.ePrescriptionRepository.find({
        where: {
          pharmacyId,
          status: EPrescriptionStatus.SENT,
        },
        relations: ['prescription', 'user'],
        order: { sentAt: 'ASC' },
      });
    } catch (error) {
      this.logger.error(`Error finding pharmacy prescriptions: ${error.message}`);
      throw error;
    }
  }

  private async notifyPrescriptionSent(prescription: any, pharmacy: Pharmacy): Promise<void> {
    try {
      // Push notification
      await this.notificationService.sendPushNotification(
        prescription.userId,
        {
          title: 'Prescription Sent',
          body: `Your prescription for ${prescription.medicationName} has been sent to ${pharmacy.name}`,
          icon: '/icons/prescription.png',
          data: {
            type: 'prescription_sent',
            pharmacyName: pharmacy.name,
          },
        },
      );
    } catch (error) {
      this.logger.error(`Error sending notifications: ${error.message}`);
    }
  }

  private async notifyStatusUpdate(ePrescription: any): Promise<void> {
    try {
      let title = '';
      let message = '';
      switch (ePrescription.status) {
        case EPrescriptionStatus.READY_FOR_PICKUP:
          title = 'Prescription Ready';
          message = `Your prescription is ready for pickup at ${ePrescription.pharmacy.name}`;
          break;
        case EPrescriptionStatus.DELIVERED:
          title = 'Prescription Delivered';
          message = 'Your prescription has been delivered';
          break;
        case EPrescriptionStatus.FILLED:
          title = 'Prescription Filled';
          message = 'Your prescription has been filled';
          break;
      }

      if (message) {
        await this.notificationService.sendPushNotification(
          ePrescription.userId,
          {
            title,
            body: message,
            icon: '/icons/prescription.png',
            data: {
              type: 'prescription_status',
              status: ePrescription.status,
            },
          },
        );
      }
    } catch (error) {
      this.logger.error(`Error sending status notification: ${error.message}`);
    }
  }
}

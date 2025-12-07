import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice, InvoiceStatus } from '../../entities/invoice.entity';
import { EmailService } from '../../services/email.service';
import { StorageService } from '../../services/storage.service';

@Injectable()
export class InvoiceService {
  private readonly logger = new Logger(InvoiceService.name);

  constructor(
    @InjectRepository(Invoice)
    private invoiceRepository: Repository<Invoice>,
    private emailService: EmailService,
    private storageService: StorageService,
  ) {}

  async create(
    userId: string,
    invoiceData: Partial<Invoice>,
  ): Promise<Invoice> {
    try {
      const invoiceNumber = this.generateInvoiceNumber();
      const invoice = this.invoiceRepository.create({
        ...invoiceData,
        userId,
        invoiceNumber,
        amountPaid: 0,
        amountDue: invoiceData.totalAmount,
      });

      return await this.invoiceRepository.save(invoice);
    } catch (error) {
      this.logger.error(`Error creating invoice: ${error.message}`);
      throw error;
    }
  }

  async findByUser(userId: string): Promise<Invoice[]> {
    try {
      return await this.invoiceRepository
        .createQueryBuilder('invoice')
        .where('invoice.userId = :userId', { userId })
        .andWhere('invoice.deletedAt IS NULL')
        .orderBy('invoice.issueDate', 'DESC')
        .getMany();
    } catch (error) {
      this.logger.error(`Error finding invoices: ${error.message}`);
      throw error;
    }
  }

  async findById(id: string, userId: string): Promise<Invoice> {
    try {
      const invoice = await this.invoiceRepository
        .createQueryBuilder('invoice')
        .where('invoice.id = :id', { id })
        .andWhere('invoice.userId = :userId', { userId })
        .andWhere('invoice.deletedAt IS NULL')
        .getOne();

      if (!invoice) {
        throw new NotFoundException('Invoice not found');
      }

      return invoice;
    } catch (error) {
      this.logger.error(`Error finding invoice: ${error.message}`);
      throw error;
    }
  }

  async markAsPaid(
    id: string,
    userId: string,
    paymentDetails: any,
  ): Promise<Invoice> {
    try {
      const invoice = await this.findById(id, userId);
      invoice.status = InvoiceStatus.PAID;
      invoice.paidDate = new Date();
      invoice.amountPaid = invoice.totalAmount;
      invoice.amountDue = 0;

      const paymentRecord = {
        date: new Date(),
        amount: invoice.totalAmount,
        method: paymentDetails.method || 'card',
        transactionId: paymentDetails.transactionId,
      };

      invoice.paymentHistory = [
        ...(invoice.paymentHistory || []),
        paymentRecord,
      ];

      return await this.invoiceRepository.save(invoice);
    } catch (error) {
      this.logger.error(`Error marking invoice as paid: ${error.message}`);
      throw error;
    }
  }

  async generateSuperbill(id: string, userId: string): Promise<string> {
    try {
      const invoice = await this.findById(id, userId);

      // Generate superbill PDF (simplified version)
      const superbillData = {
        invoiceNumber: invoice.invoiceNumber,
        patientName: 'Patient Name', // Would come from user data
        serviceDate: invoice.issueDate,
        lineItems: invoice.lineItems,
        totalAmount: invoice.totalAmount,
      };

      // In production, generate actual PDF
      const superbillUrl = `superbills/${userId}/${id}.pdf`;
      invoice.superbillUrl = superbillUrl;
      invoice.isSuperbill = true;

      await this.invoiceRepository.save(invoice);
      return superbillUrl;
    } catch (error) {
      this.logger.error(`Error generating superbill: ${error.message}`);
      throw error;
    }
  }

  private generateInvoiceNumber(): string {
    const year = new Date().getFullYear();
    const timestamp = Date.now().toString(36).toUpperCase();
    return `INV-${year}-${timestamp}`;
  }
}

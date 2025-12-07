import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HsaFsaAccount } from '../../entities/hsa-fsa-account.entity';

@Injectable()
export class HsaFsaService {
  private readonly logger = new Logger(HsaFsaService.name);

  constructor(
    @InjectRepository(HsaFsaAccount)
    private hsaFsaRepository: Repository<HsaFsaAccount>,
  ) {}

  async create(userId: string, accountData: Partial<HsaFsaAccount>): Promise<HsaFsaAccount> {
    try {
      const account = this.hsaFsaRepository.create({
        ...accountData,
        userId,
      });

      return await this.hsaFsaRepository.save(account);
    } catch (error) {
      this.logger.error(`Error creating HSA/FSA account: ${error.message}`);
      throw error;
    }
  }

  async findByUser(userId: string): Promise<HsaFsaAccount[]> {
    try {
      return await this.hsaFsaRepository.find({
        where: { userId },
        order: { createdAt: 'DESC' },
      });
    } catch (error) {
      this.logger.error(`Error finding HSA/FSA accounts: ${error.message}`);
      throw error;
    }
  }

  async findById(id: string, userId: string): Promise<HsaFsaAccount> {
    try {
      const account = await this.hsaFsaRepository.findOne({
        where: { id, userId },
      });

      if (!account) {
        throw new NotFoundException('HSA/FSA account not found');
      }

      return account;
    } catch (error) {
      this.logger.error(`Error finding HSA/FSA account: ${error.message}`);
      throw error;
    }
  }

  async processTransaction(
    id: string,
    userId: string,
    amount: number,
    description: string,
    type: 'contribution' | 'withdrawal' | 'reimbursement',
  ): Promise<HsaFsaAccount> {
    try {
      const account = await this.findById(id, userId);

      if (type === 'contribution') {
        account.currentBalance = Number(account.currentBalance) + amount;
        account.contributedThisYear = Number(account.contributedThisYear) + amount;
      } else {
        account.currentBalance = Number(account.currentBalance) - amount;
      }

      const transaction = {
        date: new Date(),
        description,
        amount,
        type,
        status: 'completed',
      };

      account.transactions = [...(account.transactions || []), transaction];

      return await this.hsaFsaRepository.save(account);
    } catch (error) {
      this.logger.error(`Error processing HSA/FSA transaction: ${error.message}`);
      throw error;
    }
  }

  async getBalance(id: string, userId: string): Promise<{
    currentBalance: number;
    contributedThisYear: number;
    remainingContributionLimit: number;
  }> {
    try {
      const account = await this.findById(id, userId);

      return {
        currentBalance: Number(account.currentBalance),
        contributedThisYear: Number(account.contributedThisYear),
        remainingContributionLimit:
          Number(account.annualContributionLimit) - Number(account.contributedThisYear),
      };
    } catch (error) {
      this.logger.error(`Error getting HSA/FSA balance: ${error.message}`);
      throw error;
    }
  }
}

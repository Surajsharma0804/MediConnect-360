import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import { User } from '../entities/user.entity';

@Injectable()
export class TwoFactorService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Generate 2FA secret and QR code for user
   */
  async generateTwoFactorSecret(userId: string): Promise<{
    secret: string;
    qrCodeUrl: string;
    manualEntryKey: string;
  }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `MediConnect 360 (${user.email})`,
      issuer: 'MediConnect 360',
      length: 32,
    });

    // Store the secret temporarily (not enabled until verified)
    user.twoFactorSecret = secret.base32;
    await this.userRepository.save(user);

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!);

    return {
      secret: secret.base32,
      qrCodeUrl,
      manualEntryKey: secret.base32,
    };
  }

  /**
   * Enable 2FA after user verifies the setup
   */
  async enableTwoFactor(userId: string, token: string): Promise<{ backupCodes: string[] }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user || !user.twoFactorSecret) {
      throw new BadRequestException('2FA setup not initiated');
    }

    // Verify the token
    const isValid = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
      window: 2, // Allow 2 time steps (60 seconds) tolerance
    });

    if (!isValid) {
      throw new UnauthorizedException('Invalid 2FA token');
    }

    // Generate backup codes
    const backupCodes = this.generateBackupCodes();

    // Enable 2FA
    user.isTwoFactorEnabled = true;
    user.twoFactorBackupCodes = backupCodes.map(code => this.hashBackupCode(code));
    await this.userRepository.save(user);

    return { backupCodes };
  }

  /**
   * Disable 2FA
   */
  async disableTwoFactor(userId: string, token: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (!user.isTwoFactorEnabled) {
      throw new BadRequestException('2FA is not enabled');
    }

    // Verify current token or backup code
    const isValidToken = user.twoFactorSecret && speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
      window: 2,
    });

    const isValidBackupCode = this.verifyBackupCode(user, token);

    if (!isValidToken && !isValidBackupCode) {
      throw new UnauthorizedException('Invalid 2FA token or backup code');
    }

    // Disable 2FA
    user.isTwoFactorEnabled = false;
    user.twoFactorSecret = null;
    user.twoFactorBackupCodes = [];
    await this.userRepository.save(user);
  }

  /**
   * Verify 2FA token during login
   */
  async verifyTwoFactorToken(userId: string, token: string): Promise<boolean> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user || !user.isTwoFactorEnabled || !user.twoFactorSecret) {
      return false;
    }

    // Check if it's a backup code
    if (this.verifyBackupCode(user, token)) {
      // Mark backup code as used (remove it)
      const hashedToken = this.hashBackupCode(token);
      user.twoFactorBackupCodes = user.twoFactorBackupCodes.filter(
        code => code !== hashedToken
      );
      await this.userRepository.save(user);
      return true;
    }

    // Verify TOTP token
    return speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
      window: 2,
    });
  }

  /**
   * Generate new backup codes
   */
  async regenerateBackupCodes(userId: string): Promise<{ backupCodes: string[] }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user || !user.isTwoFactorEnabled) {
      throw new BadRequestException('2FA is not enabled');
    }

    const backupCodes = this.generateBackupCodes();
    user.twoFactorBackupCodes = backupCodes.map(code => this.hashBackupCode(code));
    await this.userRepository.save(user);

    return { backupCodes };
  }

  /**
   * Generate backup codes
   */
  private generateBackupCodes(): string[] {
    const codes: string[] = [];
    for (let i = 0; i < 10; i++) {
      // Generate 8-digit backup codes
      const code = Math.random().toString().slice(2, 10);
      codes.push(code);
    }
    return codes;
  }

  /**
   * Hash backup code for storage
   */
  private hashBackupCode(code: string): string {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(code).digest('hex');
  }

  /**
   * Verify backup code
   */
  private verifyBackupCode(user: User, code: string): boolean {
    if (!user.twoFactorBackupCodes || user.twoFactorBackupCodes.length === 0) {
      return false;
    }

    const hashedCode = this.hashBackupCode(code);
    return user.twoFactorBackupCodes.includes(hashedCode);
  }

  /**
   * Check if user has 2FA enabled
   */
  async isTwoFactorEnabled(userId: string): Promise<boolean> {
    const user = await this.userRepository.findOne({ 
      where: { id: userId },
      select: ['isTwoFactorEnabled']
    });
    return user?.isTwoFactorEnabled || false;
  }
}
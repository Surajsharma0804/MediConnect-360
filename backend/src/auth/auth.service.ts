import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';
import { EmailService } from '../services/email.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async register(email: string, password: string, name: string, role?: string) {
    // Check if user exists
    const existingUser = await this.usersRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = this.usersRepository.create({
      email,
      password: hashedPassword,
      name,
      role: role as any,
    });

    await this.usersRepository.save(user);

    // Generate verification token
    const verificationToken = this.jwtService.sign(
      { sub: user.id, type: 'verification' },
      { expiresIn: '24h' },
    );

    // Send verification email
    try {
      await this.emailService.sendVerificationEmail(
        email,
        verificationToken,
        name,
      );
    } catch (error) {
      console.error('Failed to send verification email:', error);
    }

    const { password: _, ...result } = user;
    return {
      user: result,
      message:
        'Registration successful! Please check your email to verify your account.',
    };
  }

  async login(email: string, password: string) {
    const user = await this.usersRepository.findOne({ where: { email } });

    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update last login
    user.lastLogin = new Date();
    await this.usersRepository.save(user);

    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    const { password: _, ...userWithoutPassword } = user;

    return {
      accessToken,
      user: userWithoutPassword,
    };
  }

  async googleLogin(profile: any) {
    let user = await this.usersRepository.findOne({
      where: { googleId: profile.id },
    });

    if (!user) {
      // Check if email exists
      user = await this.usersRepository.findOne({
        where: { email: profile.emails[0].value },
      });

      if (user) {
        // Link Google account
        user.googleId = profile.id;
        user.isVerified = true;
      } else {
        // Create new user
        user = this.usersRepository.create({
          email: profile.emails[0].value,
          name: profile.displayName,
          googleId: profile.id,
          isVerified: true,
          profileImage: profile.photos?.[0]?.value,
        });
      }

      await this.usersRepository.save(user);

      // Send welcome email
      try {
        await this.emailService.sendWelcomeEmail(user.email, user.name);
      } catch (error) {
        console.error('Failed to send welcome email:', error);
      }
    }

    // Update last login
    user.lastLogin = new Date();
    await this.usersRepository.save(user);

    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    const { password: _, ...userWithoutPassword } = user;

    return {
      accessToken,
      user: userWithoutPassword,
    };
  }

  async verifyEmail(token: string) {
    try {
      const payload = this.jwtService.verify(token);

      if (payload.type !== 'verification') {
        throw new UnauthorizedException('Invalid token');
      }

      const user = await this.usersRepository.findOne({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      user.isVerified = true;
      await this.usersRepository.save(user);

      // Send welcome email
      try {
        await this.emailService.sendWelcomeEmail(user.email, user.name);
      } catch (error) {
        console.error('Failed to send welcome email:', error);
      }

      return { message: 'Email verified successfully!' };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  async requestPasswordReset(email: string) {
    const user = await this.usersRepository.findOne({ where: { email } });

    if (!user) {
      // Don't reveal if email exists
      return { message: 'If the email exists, a reset link has been sent.' };
    }

    const resetToken = this.jwtService.sign(
      { sub: user.id, type: 'password-reset' },
      { expiresIn: '1h' },
    );

    try {
      await this.emailService.sendPasswordReset(email, resetToken, user.name);
    } catch (error) {
      console.error('Failed to send password reset email:', error);
    }

    return { message: 'If the email exists, a reset link has been sent.' };
  }

  async resetPassword(token: string, newPassword: string) {
    try {
      const payload = this.jwtService.verify(token);

      if (payload.type !== 'password-reset') {
        throw new UnauthorizedException('Invalid token');
      }

      const user = await this.usersRepository.findOne({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      user.password = await bcrypt.hash(newPassword, 10);
      await this.usersRepository.save(user);

      return { message: 'Password reset successfully!' };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  async githubLogin(profile: any) {
    let user = await this.usersRepository.findOne({
      where: { githubId: profile.githubId },
    });

    if (!user) {
      // Check if email exists
      user = await this.usersRepository.findOne({
        where: { email: profile.email },
      });

      if (user) {
        // Link GitHub account
        user.githubId = profile.githubId;
        user.isVerified = true;
      } else {
        // Create new user
        user = this.usersRepository.create({
          email: profile.email,
          name: profile.name,
          githubId: profile.githubId,
          isVerified: true,
          profileImage: profile.avatar,
        });
      }

      await this.usersRepository.save(user);

      // Send welcome email
      try {
        await this.emailService.sendWelcomeEmail(user.email, user.name);
      } catch (error) {
        console.error('Failed to send welcome email:', error);
      }
    }

    // Update last login
    user.lastLogin = new Date();
    await this.usersRepository.save(user);

    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    const { password: _, ...userWithoutPassword } = user;

    return {
      accessToken,
      user: userWithoutPassword,
    };
  }

  async validateUser(userId: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id: userId } });
  }
}

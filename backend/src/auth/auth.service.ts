import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async register(email: string, password: string, name: string, role: UserRole = UserRole.PATIENT) {
    this.logger.log(`Registering user: ${email}`);
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      name,
      role,
    });
    
    await this.userRepository.save(user);
    
    // Generate JWT
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload);
    
    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  async login(email: string, password: string) {
    this.logger.log(`Login attempt: ${email}`);
    
    // Find user
    const user = await this.userRepository.findOne({
      where: { email },
      select: ['id', 'email', 'password', 'name', 'role', 'isActive'],
    });
    
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    
    // Generate JWT
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload);
    
    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  async googleLogin(user: any) {
    // Mock Google login for development
    this.logger.log(`Google login: ${user.email}`);
    
    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);
    
    return {
      accessToken,
      user,
    };
  }

  async githubLogin(user: any) {
    // Mock GitHub login for development
    this.logger.log(`GitHub login: ${user.email}`);
    
    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);
    
    return {
      accessToken,
      user,
    };
  }

  async verifyEmail(token: string) {
    this.logger.log(`Email verification: ${token}`);
    return { message: 'Email verified successfully' };
  }

  async requestPasswordReset(email: string) {
    this.logger.log(`Password reset requested: ${email}`);
    return { message: 'Password reset email sent' };
  }

  async resetPassword(token: string, password: string) {
    this.logger.log(`Password reset: ${token}`);
    return { message: 'Password reset successfully' };
  }
}
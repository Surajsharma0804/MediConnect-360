import {
  Injectable,
  Logger,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Response } from 'express';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResult {
  user: Partial<User>;
  tokens: AuthTokens;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResult> {
    const { email, password, name, role = UserRole.PATIENT } = registerDto;

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Validate password strength
    this.validatePasswordStrength(password);

    // Hash password with high salt rounds for security
    const saltRounds = 14; // Increased for better security
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user with security defaults
    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      name,
      role,
      isActive: true,
      isEmailVerified: false, // Require email verification
      isTwoFactorEnabled: false,
      loginAttempts: 0,
      lockedUntil: undefined,
      createdAt: new Date(),
      lastLogin: undefined,
    });

    const savedUser = await this.userRepository.save(user);

    // Generate tokens
    const tokens = await this.generateTokens(savedUser);

    this.logger.log(`User registered successfully: ${email}`);

    return {
      user: this.sanitizeUser(savedUser),
      tokens,
    };
  }

  private validatePasswordStrength(password: string): void {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength) {
      throw new BadRequestException('Password must be at least 8 characters long');
    }

    if (!hasUpperCase) {
      throw new BadRequestException('Password must contain at least one uppercase letter');
    }

    if (!hasLowerCase) {
      throw new BadRequestException('Password must contain at least one lowercase letter');
    }

    if (!hasNumbers) {
      throw new BadRequestException('Password must contain at least one number');
    }

    if (!hasSpecialChar) {
      throw new BadRequestException('Password must contain at least one special character');
    }

    // Check for common weak passwords
    const commonPasswords = [
      'password', '123456', 'password123', 'admin', 'qwerty',
      'letmein', 'welcome', 'monkey', '1234567890'
    ];

    if (commonPasswords.includes(password.toLowerCase())) {
      throw new BadRequestException('Password is too common. Please choose a stronger password');
    }
  }

  async login(loginDto: LoginDto): Promise<AuthResult> {
    const { email, password } = loginDto;

    // Find user with password and security fields
    const user = await this.userRepository.findOne({
      where: { email },
      select: [
        'id', 'email', 'password', 'name', 'role', 'isActive', 
        'isEmailVerified', 'isTwoFactorEnabled', 'loginAttempts', 'lockedUntil'
      ],
    });

    if (!user || !user.isActive) {
      // Use generic message to prevent user enumeration
      throw new UnauthorizedException('Authentication failed');
    }

    // Check if account is locked
    if (user.isLocked()) {
      throw new UnauthorizedException('Account temporarily locked due to failed login attempts');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      // Increment failed login attempts
      user.incrementLoginAttempts();
      await this.userRepository.save(user);
      
      this.logger.warn(`Failed login attempt for user: ${email}`);
      throw new UnauthorizedException('Authentication failed');
    }

    // Reset login attempts on successful login
    user.resetLoginAttempts();
    user.lastLogin = new Date();
    await this.userRepository.save(user);

    // Generate tokens
    const tokens = await this.generateTokens(user);

    this.logger.log(`User logged in successfully: ${email}`);

    return {
      user: this.sanitizeUser(user),
      tokens,
    };
  }

  async handleOAuthLogin(oauthUser: any, provider: string): Promise<AuthResult> {
    this.logger.log(`🔍 handleOAuthLogin called with provider: ${provider}`);
    this.logger.log(`🔍 OAuth user data:`, JSON.stringify(oauthUser, null, 2));
    
    const { email, name, picture, id: providerId } = oauthUser;

    if (!email) {
      this.logger.error('❌ No email provided by OAuth provider');
      throw new BadRequestException('Email is required from OAuth provider');
    }

    // Find or create user
    let user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      // Create new user from OAuth
      this.logger.log(`🆕 Creating new user for: ${email}`);
      user = this.userRepository.create({
        email,
        name: name || email.split('@')[0],
        role: UserRole.PATIENT,
        isActive: true,
        isEmailVerified: true, // OAuth emails are pre-verified
        isTwoFactorEnabled: false,
        oauthProvider: provider,
        oauthProviderId: providerId,
        profilePicture: picture,
      });

      user = await this.userRepository.save(user);
      this.logger.log(`✅ New user created via ${provider} OAuth: ${email}`);
    } else {
      // Update existing user with OAuth info if not set
      if (!user.oauthProvider) {
        user.oauthProvider = provider;
        user.oauthProviderId = providerId;
        user.isEmailVerified = true;
        if (picture && !user.profilePicture) {
          user.profilePicture = picture;
        }
        await this.userRepository.save(user);
      }
      this.logger.log(`✅ Existing user logged in via ${provider} OAuth: ${email}`);
    }

    // Generate tokens
    this.logger.log(`🔑 Generating tokens for user: ${user.id}`);
    const tokens = await this.generateTokens(user);
    this.logger.log(`🔑 Tokens generated successfully`);

    return {
      user: this.sanitizeUser(user),
      tokens,
    };
  }

  async loginOAuth(oauthUser: any): Promise<{ accessToken: string; refreshToken: string }> {
    this.logger.log(`🔍 loginOAuth called for user: ${oauthUser?.email}`);
    
    // Use existing handleOAuthLogin logic but return just tokens
    const result = await this.handleOAuthLogin(oauthUser, oauthUser.provider || 'google');
    
    this.logger.log(`🔑 loginOAuth returning tokens for: ${result.user.email}`);
    return result.tokens;
  }

  async refreshTokens(refreshToken: string): Promise<AuthResult> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || 'refresh-secret-key',
      });

      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedException('User not found or inactive');
      }

      // Generate new tokens
      const tokens = await this.generateTokens(user);

      return {
        user: this.sanitizeUser(user),
        tokens,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private async generateTokens(user: User): Promise<AuthTokens> {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      iat: Math.floor(Date.now() / 1000),
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_SECRET || 'super-secret-key',
        expiresIn: '15m', // Short-lived access token
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET || 'refresh-secret-key',
        expiresIn: '7d', // Long-lived refresh token
      }),
    ]);

    return { accessToken, refreshToken };
  }

  setAuthCookies(response: Response, tokens: AuthTokens): void {
    const isProduction = process.env.NODE_ENV === 'production';
    
    const cookieOptions = {
      httpOnly: true,
      secure: true, // Always secure for cross-origin
      sameSite: 'none' as const, // Required for cross-origin cookies
      path: '/',
    };

    this.logger.log(`🍪 Setting cookies with options:`, JSON.stringify(cookieOptions, null, 2));
    this.logger.log(`🍪 Access token length: ${tokens.accessToken.length}`);
    this.logger.log(`🍪 Refresh token length: ${tokens.refreshToken.length}`);

    // Set access token cookie (15 minutes)
    response.cookie('accessToken', tokens.accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    // Set refresh token cookie (7 days)
    response.cookie('refreshToken', tokens.refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    this.logger.log('🍪 Auth cookies set successfully with cross-origin settings');
  }

  clearAuthCookies(response: Response): void {
    const cookieOptions = {
      httpOnly: true,
      secure: true, // Always secure for cross-origin
      sameSite: 'none' as const, // Required for cross-origin cookies
      path: '/',
    };

    response.clearCookie('accessToken', cookieOptions);
    response.clearCookie('refreshToken', cookieOptions);

    this.logger.debug('Auth cookies cleared');
  }

  private sanitizeUser(user: User): Partial<User> {
    const { password, ...sanitizedUser } = user;
    return sanitizedUser;
  }

  async validateUser(userId: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id: userId, isActive: true },
    });
  }
}
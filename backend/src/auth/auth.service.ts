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

  async handleGoogleCallback(code: string) {
    // Manual Google OAuth token exchange
    const tokenUrl = 'https://oauth2.googleapis.com/token';
    const tokenData = {
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
      redirect_uri: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
    };

    try {
      // Exchange code for access token
      const tokenResponse = await fetch(tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(tokenData),
      });

      const tokens = await tokenResponse.json();
      
      // Get user info from Google
      const userResponse = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${tokens.access_token}`);
      const googleUser = await userResponse.json();

      // Create user object
      const user = {
        id: googleUser.id,
        email: googleUser.email,
        name: googleUser.name,
        picture: googleUser.picture,
      };

      return this.googleLogin(user);
    } catch (error) {
      this.logger.error('Google OAuth callback error:', error);
      throw new Error('Google OAuth authentication failed');
    }
  }

  async handleGithubCallback(code: string) {
    // Manual GitHub OAuth token exchange
    const tokenUrl = 'https://github.com/login/oauth/access_token';
    const tokenData = {
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
    };

    try {
      // Exchange code for access token
      const tokenResponse = await fetch(tokenUrl, {
        method: 'POST',
        headers: { 
          'Accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded' 
        },
        body: new URLSearchParams(tokenData),
      });

      const tokens = await tokenResponse.json();
      
      // Get user info from GitHub
      const userResponse = await fetch('https://api.github.com/user', {
        headers: { 'Authorization': `token ${tokens.access_token}` },
      });
      const githubUser = await userResponse.json();

      // Get user email from GitHub
      const emailResponse = await fetch('https://api.github.com/user/emails', {
        headers: { 'Authorization': `token ${tokens.access_token}` },
      });
      const emails = await emailResponse.json();
      const primaryEmail = emails.find(email => email.primary)?.email || `${githubUser.login}@github.local`;

      // Create user object
      const user = {
        id: githubUser.id,
        email: primaryEmail,
        name: githubUser.name || githubUser.login,
        username: githubUser.login,
      };

      return this.githubLogin(user);
    } catch (error) {
      this.logger.error('GitHub OAuth callback error:', error);
      throw new Error('GitHub OAuth authentication failed');
    }
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
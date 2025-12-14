import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  UseGuards,
  Req,
  Res,
  Delete,
} from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { TwoFactorService } from './two-factor.service';
import { AuthGuard } from '@nestjs/passport';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private twoFactorService: TwoFactorService,
  ) {}

  @Get('test')
  async test() {
    return {
      message: 'Auth controller is working!',
      timestamp: new Date().toISOString(),
      routes: ['register', 'login', 'google', 'github'],
      environment: {
        nodeEnv: process.env.NODE_ENV,
        corsOrigin: process.env.CORS_ORIGIN,
        googleConfigured: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
        githubConfigured: !!(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET),
      }
    };
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(
      registerDto.email,
      registerDto.password,
      registerDto.name,
      registerDto.role,
    );
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto.email, loginDto.password);
  }

  @Get('google')
  async googleAuth(@Res() res: Response) {
    // Check if Google OAuth is configured
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      return res.status(503).json({
        error: 'Google OAuth not configured',
        message: 'Google OAuth credentials are missing from environment variables'
      });
    }
    
    // If configured, redirect to Google OAuth
    try {
      // Manual redirect to Google OAuth
      const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${process.env.GOOGLE_CLIENT_ID}&` +
        `redirect_uri=${encodeURIComponent(process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback')}&` +
        `response_type=code&` +
        `scope=email profile`;
      
      return res.redirect(googleAuthUrl);
    } catch (error) {
      return res.status(500).json({
        error: 'OAuth initialization failed',
        message: error.message
      });
    }
  }

  @Get('google/callback')
  async googleAuthCallback(@Query('code') code: string, @Res() res: Response) {
    if (!code) {
      const frontendUrl = process.env.CORS_ORIGIN || 'http://localhost:5173';
      return res.redirect(`${frontendUrl}/login?error=oauth_cancelled`);
    }

    try {
      // Handle Google OAuth callback manually
      const result = await this.authService.handleGoogleCallback(code);
      const frontendUrl = process.env.CORS_ORIGIN || 'http://localhost:5173';

      // Redirect to frontend with token and user data
      const redirectUrl = `${frontendUrl}/auth/callback?token=${result.accessToken}&user=${encodeURIComponent(JSON.stringify(result.user))}`;
      return res.redirect(redirectUrl);
    } catch (error) {
      const frontendUrl = process.env.CORS_ORIGIN || 'http://localhost:5173';
      return res.redirect(`${frontendUrl}/login?error=oauth_failed`);
    }
  }

  @Get('verify-email')
  async verifyEmail(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() body: { email: string }) {
    return this.authService.requestPasswordReset(body.email);
  }

  @Post('reset-password')
  async resetPassword(@Body() body: { token: string; password: string }) {
    return this.authService.resetPassword(body.token, body.password);
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  getProfile(@Req() req) {
    return req.user;
  }

  @Get('github')
  async githubAuth(@Res() res: Response) {
    // Check if GitHub OAuth is configured
    if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
      return res.status(503).json({
        error: 'GitHub OAuth not configured',
        message: 'GitHub OAuth credentials are missing from environment variables'
      });
    }
    
    // If configured, redirect to GitHub OAuth
    try {
      // Manual redirect to GitHub OAuth
      const githubAuthUrl = `https://github.com/login/oauth/authorize?` +
        `client_id=${process.env.GITHUB_CLIENT_ID}&` +
        `redirect_uri=${encodeURIComponent(process.env.GITHUB_CALLBACK_URL || 'http://localhost:5000/api/auth/github/callback')}&` +
        `scope=user:email`;
      
      return res.redirect(githubAuthUrl);
    } catch (error) {
      return res.status(500).json({
        error: 'OAuth initialization failed',
        message: error.message
      });
    }
  }

  @Get('github/callback')
  async githubAuthCallback(@Query('code') code: string, @Res() res: Response) {
    if (!code) {
      const frontendUrl = process.env.CORS_ORIGIN || 'http://localhost:5173';
      return res.redirect(`${frontendUrl}/login?error=oauth_cancelled`);
    }

    try {
      // Handle GitHub OAuth callback manually
      const result = await this.authService.handleGithubCallback(code);
      const frontendUrl = process.env.CORS_ORIGIN || 'http://localhost:5173';

      // Redirect to frontend with token and user data
      const redirectUrl = `${frontendUrl}/auth/callback?token=${result.accessToken}&user=${encodeURIComponent(JSON.stringify(result.user))}`;
      return res.redirect(redirectUrl);
    } catch (error) {
      const frontendUrl = process.env.CORS_ORIGIN || 'http://localhost:5173';
      return res.redirect(`${frontendUrl}/login?error=oauth_failed`);
    }
  }

  // Two-Factor Authentication endpoints
  @Post('2fa/generate')
  @UseGuards(AuthGuard('jwt'))
  async generateTwoFactor(@Req() req) {
    return this.twoFactorService.generateTwoFactorSecret(req.user.id);
  }

  @Post('2fa/enable')
  @UseGuards(AuthGuard('jwt'))
  async enableTwoFactor(@Req() req, @Body() body: { token: string }) {
    return this.twoFactorService.enableTwoFactor(req.user.id, body.token);
  }

  @Delete('2fa/disable')
  @UseGuards(AuthGuard('jwt'))
  async disableTwoFactor(@Req() req, @Body() body: { token: string }) {
    await this.twoFactorService.disableTwoFactor(req.user.id, body.token);
    return { message: '2FA disabled successfully' };
  }

  @Post('2fa/verify')
  async verifyTwoFactor(@Body() body: { userId: string; token: string }) {
    const isValid = await this.twoFactorService.verifyTwoFactorToken(body.userId, body.token);
    return { valid: isValid };
  }

  @Post('2fa/backup-codes/regenerate')
  @UseGuards(AuthGuard('jwt'))
  async regenerateBackupCodes(@Req() req) {
    return this.twoFactorService.regenerateBackupCodes(req.user.id);
  }

  @Get('2fa/status')
  @UseGuards(AuthGuard('jwt'))
  async getTwoFactorStatus(@Req() req) {
    const enabled = await this.twoFactorService.isTwoFactorEnabled(req.user.id);
    return { enabled };
  }
}

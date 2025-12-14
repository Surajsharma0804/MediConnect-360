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
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // Initiates Google OAuth flow
    // This route will only work if GoogleStrategy is properly loaded
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(@Req() req, @Res() res: Response) {
    const result = await this.authService.googleLogin(req.user);
    const frontendUrl = process.env.CORS_ORIGIN || 'http://localhost:5173';

    // Redirect to frontend with token and user data
    const redirectUrl = `${frontendUrl}/auth/callback?token=${result.accessToken}&user=${encodeURIComponent(JSON.stringify(result.user))}`;
    return res.redirect(redirectUrl);
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
  @UseGuards(AuthGuard('github'))
  async githubAuth() {
    // Initiates GitHub OAuth flow
    // This route will only work if GitHubStrategy is properly loaded
  }

  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  async githubAuthCallback(@Req() req, @Res() res: Response) {
    const result = await this.authService.githubLogin(req.user);
    const frontendUrl = process.env.CORS_ORIGIN || 'http://localhost:5173';

    // Redirect to frontend with token and user data
    const redirectUrl = `${frontendUrl}/auth/callback?token=${result.accessToken}&user=${encodeURIComponent(JSON.stringify(result.user))}`;
    return res.redirect(redirectUrl);
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

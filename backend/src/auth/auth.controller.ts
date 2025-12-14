import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
  Logger,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { AuditLogInterceptor } from '../common/interceptors/audit-log.interceptor';
import { SanitizeInterceptor } from '../common/interceptors/sanitize.interceptor';
import type { User } from '../entities/user.entity';

@ApiTags('Authentication')
@Controller({
  path: 'auth',
  version: '1',
})
@UseGuards(ThrottlerGuard)
@UseInterceptors(AuditLogInterceptor, SanitizeInterceptor)
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Get('health')
  @ApiOperation({ summary: 'Auth service health check' })
  @ApiResponse({ status: 200, description: 'Auth service is healthy' })
  async healthCheck() {
    const isProduction = process.env.NODE_ENV === 'production';
    
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: 'v1',
      environment: process.env.NODE_ENV || 'development',
      oauth: {
        google: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
        github: !!(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET),
      },
      security: {
        httpsOnly: isProduction,
        cookiesEnabled: true,
        jwtConfigured: !!process.env.JWT_SECRET,
        refreshTokenConfigured: !!process.env.JWT_REFRESH_SECRET,
      },
      routes: [
        'POST /api/v1/auth/register',
        'POST /api/v1/auth/login',
        'POST /api/v1/auth/logout',
        'GET /api/v1/auth/me',
        'GET /api/v1/auth/google',
        'GET /api/v1/auth/google/callback',
        'GET /api/v1/auth/github',
        'GET /api/v1/auth/github/callback',
        'POST /api/v1/auth/refresh',
      ],
    };
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @Throttle({ default: { limit: 3, ttl: 60000 } }) // 3 attempts per minute
  @ApiOperation({ summary: 'Register new user account' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  @ApiResponse({ status: 429, description: 'Too many registration attempts' })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async register(
    @Body() registerDto: RegisterDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    this.logger.log(`Registration attempt: ${registerDto.email}`);
    const result = await this.authService.register(registerDto);
    
    // Set HttpOnly cookies
    this.authService.setAuthCookies(response, result.tokens);
    
    return {
      user: result.user,
      message: 'Registration successful',
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 attempts per minute
  @ApiOperation({ summary: 'Authenticate user login' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiResponse({ status: 423, description: 'Account locked due to failed attempts' })
  @ApiResponse({ status: 429, description: 'Too many login attempts' })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    this.logger.log(`Login attempt: ${loginDto.email}`);
    const result = await this.authService.login(loginDto);
    
    // Set HttpOnly cookies
    this.authService.setAuthCookies(response, result.tokens);
    
    return {
      user: result.user,
      message: 'Login successful',
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async logout(
    @CurrentUser() user: User,
    @Res({ passthrough: true }) response: Response,
  ) {
    this.logger.log(`Logout: ${user.email}`);
    
    // Clear cookies
    this.authService.clearAuthCookies(response);
    
    return { message: 'Logout successful' };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@CurrentUser() user: User) {
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        isTwoFactorEnabled: user.isTwoFactorEnabled,
      },
    };
  }

  // Google OAuth Routes
  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Initiate Google OAuth login' })
  @ApiResponse({ status: 302, description: 'Redirects to Google OAuth' })
  googleAuth() {
    this.logger.log('🔍 Google OAuth initiation called');
    // Passport handles the redirect - no logic needed here
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Handle Google OAuth callback' })
  @ApiResponse({ status: 302, description: 'Redirects to frontend with auth result' })
  async googleCallback(
    @Req() req: Request,
    @Res({ passthrough: false }) res: Response,
  ) {
    try {
      this.logger.log(`🔍 CONTROLLER METHOD CALLED - Google OAuth callback started`);
      
      const result = await this.authService.handleOAuthLogin(req.user, 'google');
      const { accessToken, refreshToken } = result.tokens;
      
      this.logger.log(`🔍 Setting cross-origin cookies for: ${result.user.email}`);
      
      // Set access token cookie
      res.cookie('access_token', accessToken, {
        httpOnly: true,
        secure: true,          // REQUIRED on HTTPS (Render + Vercel)
        sameSite: 'none',      // REQUIRED for cross-site cookies
        maxAge: 15 * 60 * 1000, // 15 minutes
      });
      
      // Set refresh token cookie
      res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
      
      this.logger.log(`🔍 Cookies set, redirecting to frontend`);
      
      // Redirect to frontend success page
      const frontendUrl = process.env.CORS_ORIGIN || 'https://medi-connect-360.vercel.app';
      return res.redirect(`${frontendUrl}/auth/success`);
    } catch (error) {
      this.logger.error('❌ Google OAuth callback error:', error);
      const frontendUrl = process.env.CORS_ORIGIN || 'https://medi-connect-360.vercel.app';
      return res.redirect(`${frontendUrl}/auth/callback?error=oauth_failed`);
    }
  }

  // GitHub OAuth Routes
  @Get('github')
  @UseGuards(AuthGuard('github'))
  @ApiOperation({ summary: 'Initiate GitHub OAuth login' })
  @ApiResponse({ status: 302, description: 'Redirects to GitHub OAuth' })
  githubAuth() {
    // Passport handles the redirect - no logic needed here
  }

  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  @ApiOperation({ summary: 'Handle GitHub OAuth callback' })
  @ApiResponse({ status: 302, description: 'Redirects to frontend with auth result' })
  async githubCallback(
    @Req() request: Request,
    @Res() response: Response,
  ) {
    try {
      const user = request.user as any;
      this.logger.log(`GitHub OAuth callback: ${user.email}`);
      
      const result = await this.authService.handleOAuthLogin(user, 'github');
      
      // Set HttpOnly cookies
      this.authService.setAuthCookies(response, result.tokens);
      
      // Redirect to frontend success page
      const frontendUrl = process.env.CORS_ORIGIN || 'https://medi-connect-360.vercel.app';
      this.logger.log(`GitHub OAuth: Redirecting to ${frontendUrl}/auth/callback?success=true`);
      return response.redirect(`${frontendUrl}/auth/callback?success=true`);
    } catch (error) {
      this.logger.error('GitHub OAuth callback error:', error);
      const frontendUrl = process.env.CORS_ORIGIN || 'https://medi-connect-360.vercel.app';
      return response.redirect(`${frontendUrl}/auth/callback?error=oauth_failed`);
    }
  }

  // Token refresh endpoint
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = request.cookies?.refresh_token;
    
    if (!refreshToken) {
      this.logger.warn('Refresh token missing from cookies');
      this.authService.clearAuthCookies(response);
      return { message: 'Refresh token required' };
    }

    try {
      const result = await this.authService.refreshTokens(refreshToken);
      
      // Set new HttpOnly cookies
      this.authService.setAuthCookies(response, result.tokens);
      
      return {
        user: result.user,
        message: 'Tokens refreshed successfully',
      };
    } catch (error) {
      this.logger.error('Token refresh failed:', error.message);
      this.authService.clearAuthCookies(response);
      return { message: 'Token refresh failed' };
    }
  }
}
import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly authService: AuthService,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    try {
      // Try normal JWT validation first
      const result = await super.canActivate(context);
      return result as boolean;
    } catch (error) {
      // If access token is expired, try to refresh using refresh token
      const refreshToken = request.cookies?.refresh_token; // Updated to match cookie name
      
      if (!refreshToken) {
        this.logger.warn('No refresh token available for token refresh');
        throw new UnauthorizedException('Authentication required');
      }

      try {
        // Attempt token refresh
        const refreshResult = await this.authService.refreshTokens(refreshToken);
        
        // Set new cookies
        this.authService.setAuthCookies(response, refreshResult.tokens);
        
        // Set user in request for this request
        request.user = refreshResult.user;
        
        this.logger.log('Token refreshed successfully during guard validation');
        return true;
      } catch (refreshError) {
        this.logger.error('Token refresh failed:', refreshError.message);
        
        // Clear invalid cookies
        this.authService.clearAuthCookies(response);
        
        throw new UnauthorizedException('Authentication required');
      }
    }
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    if (err || !user) {
      const request = context.switchToHttp().getRequest<Request>();
      this.logger.warn(`JWT authentication failed for ${request.url}: ${info?.message || err?.message}`);
      throw err || new UnauthorizedException('Authentication required');
    }
    return user;
  }
}
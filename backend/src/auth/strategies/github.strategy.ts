import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';

@Injectable()
export class GitHubStrategy extends PassportStrategy(Strategy, 'github') {
  private readonly logger = new Logger(GitHubStrategy.name);

  constructor() {
    const clientID = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;
    const callbackURL = process.env.GITHUB_CALLBACK_URL || 
      `http://localhost:${process.env.PORT || 5000}/api/v1/auth/github/callback`;

    super({
      clientID: clientID || 'not-configured',
      clientSecret: clientSecret || 'not-configured',
      callbackURL,
      scope: ['user:email'],
    });

    if (!clientID || !clientSecret || clientID.includes('your-')) {
      this.logger.warn('GitHub OAuth not configured - set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET');
    } else {
      this.logger.log('GitHub OAuth strategy initialized');
    }
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: any,
  ): Promise<any> {
    try {
      const { id, username, displayName, emails, photos } = profile;
      
      const user = {
        provider: 'github',
        providerId: id,
        email: emails?.[0]?.value,
        name: displayName || username || 'GitHub User',
        username,
        picture: photos?.[0]?.value,
      };

      done(null, user);
    } catch (error) {
      this.logger.error('GitHub OAuth validation failed:', error);
      done(error, false);
    }
  }
}
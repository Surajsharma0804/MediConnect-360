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
      'https://mediconnect-backend-orkv.onrender.com/api/v1/auth/github/callback';

    if (!clientID || !clientSecret) {
      throw new Error('GitHub OAuth credentials not configured');
    }

    super({
      clientID,
      clientSecret,
      callbackURL,
      scope: ['user:email'],
    });

    this.logger.log('GitHub OAuth strategy initialized');
    this.logger.log(`Callback URL: ${callbackURL}`);
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: any,
  ): Promise<any> {
    try {
      const { id, username, displayName, emails, photos } = profile;
      
      // GitHub might not provide email in profile, use the first available
      const email = emails && emails.length > 0 
        ? emails[0].value 
        : `${username}@github.local`;

      const user = {
        id,
        email,
        name: displayName || username,
        username,
        picture: photos && photos.length > 0 ? photos[0].value : null,
        accessToken,
        refreshToken,
      };

      this.logger.log(`GitHub OAuth validation successful: ${user.email}`);
      done(null, user);
    } catch (error) {
      this.logger.error('GitHub OAuth validation failed:', error);
      done(error, null);
    }
  }
}
import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';

@Injectable()
export class GitHubStrategy extends PassportStrategy(Strategy, 'github') {
  private readonly logger = new Logger(GitHubStrategy.name);

  constructor() {
    super({
      clientID: process.env.GITHUB_CLIENT_ID || 'mock-client-id',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || 'mock-client-secret',
      callbackURL: process.env.GITHUB_CALLBACK_URL || 'http://localhost:5000/auth/github/callback',
      scope: ['user:email'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: any,
  ): Promise<any> {
    this.logger.log(`GitHub OAuth validation for: ${profile.username}`);
    
    const user = {
      id: profile.id,
      email: profile.emails?.[0]?.value || `${profile.username}@github.local`,
      name: profile.displayName || profile.username,
      username: profile.username,
      accessToken,
    };

    done(null, user);
  }
}
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-github2';

@Injectable()
export class GitHubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor() {
    super({
      clientID: process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
      callbackURL:
        process.env.GITHUB_CALLBACK_URL ||
        'http://localhost:5000/api/auth/github/callback',
      scope: ['user:email'],
    });
  }

  validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: any,
  ): any {
    const { id, username, emails, displayName, photos } = profile;

    const user = {
      githubId: id,
      email: emails?.[0]?.value || `${username}@github.user`,
      name: displayName || username,
      username,
      avatar: photos?.[0]?.value,
      provider: 'github',
    };

    done(null, user);
  }
}

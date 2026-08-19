import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  private readonly logger = new Logger(GoogleStrategy.name);

  constructor() {
    const clientID = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const callbackURL = process.env.GOOGLE_CALLBACK_URL || 
      `http://localhost:${process.env.PORT || 5000}/api/v1/auth/google/callback`;

    super({
      clientID: clientID || 'not-configured',
      clientSecret: clientSecret || 'not-configured',
      callbackURL,
      scope: ['email', 'profile'],
    });

    if (!clientID || !clientSecret || clientID.includes('your-')) {
      this.logger.warn('Google OAuth not configured - set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET');
    } else {
      this.logger.log('Google OAuth strategy initialized');
    }
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    try {
      const { id, name, emails, photos } = profile;
      
      const user = {
        provider: 'google',
        providerId: id,
        email: emails?.[0]?.value,
        name: name ? `${name.givenName} ${name.familyName}` : 'Google User',
        firstName: name?.givenName,
        lastName: name?.familyName,
        picture: photos?.[0]?.value,
      };

      done(null, user);
    } catch (error) {
      this.logger.error('Google OAuth validation failed:', error);
      done(error, false);
    }
  }
}
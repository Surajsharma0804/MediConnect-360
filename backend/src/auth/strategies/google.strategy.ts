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
      'https://mediconnect-backend-orkv.onrender.com/api/v1/auth/google/callback';

    if (!clientID || !clientSecret) {
      throw new Error('Google OAuth credentials not configured');
    }

    super({
      clientID,
      clientSecret,
      callbackURL,
      scope: ['email', 'profile'],
    });

    this.logger.log('Google OAuth strategy initialized');
    this.logger.log(`Callback URL: ${callbackURL}`);
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    try {
      const { id, name, emails, photos } = profile;
      
      // Return normalized user object only - no DB calls here
      const user = {
        provider: 'google',
        providerId: id,
        email: emails?.[0]?.value,
        name: name ? `${name.givenName} ${name.familyName}` : 'Google User',
        firstName: name?.givenName,
        lastName: name?.familyName,
        picture: photos?.[0]?.value,
      };

      this.logger.log(`Google OAuth validation successful: ${user.email}`);
      done(null, user);
    } catch (error) {
      this.logger.error('Google OAuth validation failed:', error);
      done(error, false);
    }
  }
}
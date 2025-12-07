import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class VideoService {
  private readonly logger = new Logger(VideoService.name);
  private readonly jitsiDomain: string;

  constructor() {
    this.jitsiDomain = process.env.JITSI_DOMAIN || 'meet.jit.si';
    this.logger.log(
      `Video Service initialized with Jitsi domain: ${this.jitsiDomain}`,
    );
  }

  /**
   * Generate a unique video room URL for appointments
   * FREE - No API key needed!
   */
  generateRoomUrl(
    appointmentId: string,
    _patientName: string,
    _doctorName: string,
  ): string {
    // Create a unique, secure room name
    const roomName = `mediconnect-${appointmentId}-${Date.now()}`;
    const url = `https://${this.jitsiDomain}/${roomName}`;

    this.logger.log(`Generated video room: ${url}`);

    return url;
  }

  /**
   * Generate room with custom configuration
   */
  generateRoomWithConfig(
    appointmentId: string,
    config?: {
      requirePassword?: boolean;
      recordSession?: boolean;
      maxParticipants?: number;
    },
  ): {
    url: string;
    roomName: string;
    password?: string;
  } {
    const roomName = `mediconnect-${appointmentId}-${Date.now()}`;
    const url = `https://${this.jitsiDomain}/${roomName}`;

    // Generate password if required
    const password = config?.requirePassword
      ? this.generatePassword()
      : undefined;

    return {
      url,
      roomName,
      password,
    };
  }

  /**
   * Generate JWT token for Jitsi (if self-hosting with authentication)
   */
  generateJitsiJWT(
    _roomName: string,
    _userName: string,
    _userEmail: string,
  ): string {
    // This would be used if you self-host Jitsi with JWT authentication
    // For public Jitsi, no JWT is needed

    if (!process.env.JITSI_APP_ID || !process.env.JITSI_APP_SECRET) {
      this.logger.warn('Jitsi JWT not configured, using public access');
      return '';
    }

    // JWT generation logic would go here for self-hosted Jitsi
    // For now, return empty string for public Jitsi
    return '';
  }

  /**
   * Get embed configuration for frontend
   */
  getEmbedConfig(roomName: string, userName: string): any {
    return {
      domain: this.jitsiDomain,
      roomName,
      configOverwrite: {
        startWithAudioMuted: true,
        startWithVideoMuted: false,
        enableWelcomePage: false,
        prejoinPageEnabled: true,
        disableDeepLinking: true,
      },
      interfaceConfigOverwrite: {
        TOOLBAR_BUTTONS: [
          'microphone',
          'camera',
          'closedcaptions',
          'desktop',
          'fullscreen',
          'fodeviceselection',
          'hangup',
          'chat',
          'recording',
          'livestreaming',
          'etherpad',
          'sharedvideo',
          'settings',
          'raisehand',
          'videoquality',
          'filmstrip',
          'stats',
          'shortcuts',
          'tileview',
          'download',
          'help',
          'mute-everyone',
        ],
        SHOW_JITSI_WATERMARK: false,
        SHOW_WATERMARK_FOR_GUESTS: false,
      },
      userInfo: {
        displayName: userName,
      },
    };
  }

  private generatePassword(): string {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  }
}

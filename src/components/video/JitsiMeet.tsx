import React, { useEffect, useRef } from 'react';

interface JitsiParticipant {
  id: string;
  displayName?: string;
}

interface JitsiMeetProps {
  roomName: string;
  userName: string;
  onMeetingEnd?: () => void;
  onParticipantJoined?: (participant: JitsiParticipant) => void;
  onParticipantLeft?: (participant: JitsiParticipant) => void;
}

/**
 * Jitsi Meet Video Component
 * FREE - Unlimited video calls, no API key needed!
 */
const JitsiMeet: React.FC<JitsiMeetProps> = ({
  roomName,
  userName,
  onMeetingEnd,
  onParticipantJoined,
  onParticipantLeft,
}) => {
  const jitsiContainerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const jitsiApi = useRef<any>(null);

  useEffect(() => {
    // Load Jitsi Meet API script
    const loadJitsiScript = () => {
      return new Promise<void>((resolve, reject) => {
        if ((window as unknown as Record<string, unknown>).JitsiMeetExternalAPI) {
          resolve();
          return;
        }

        const script = document.createElement('script');
        script.src = 'https://meet.jit.si/external_api.js';
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load Jitsi script'));
        document.body.appendChild(script);
      });
    };

    // Initialize Jitsi Meet
    const initJitsi = async () => {
      try {
        await loadJitsiScript();

        if (!jitsiContainerRef.current) return;

        const domain = import.meta.env.VITE_JITSI_DOMAIN || 'meet.jit.si';

        const options = {
          roomName,
          width: '100%',
          height: '100%',
          parentNode: jitsiContainerRef.current,
          configOverwrite: {
            startWithAudioMuted: false,
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
            SHOW_BRAND_WATERMARK: false,
            SHOW_POWERED_BY: false,
            DEFAULT_BACKGROUND: '#1a1a2e',
          },
          userInfo: {
            displayName: userName,
          },
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const JitsiMeetExternalAPI = (window as any).JitsiMeetExternalAPI;
        jitsiApi.current = new JitsiMeetExternalAPI(domain, options);

        // Event listeners
        jitsiApi.current.addEventListener('videoConferenceJoined', () => {
          // Conference joined
        });

        jitsiApi.current.addEventListener('videoConferenceLeft', () => {
          onMeetingEnd?.();
        });

        jitsiApi.current.addEventListener('participantJoined', (participant: JitsiParticipant) => {
          onParticipantJoined?.(participant);
        });

        jitsiApi.current.addEventListener('participantLeft', (participant: JitsiParticipant) => {
          onParticipantLeft?.(participant);
        });

        jitsiApi.current.addEventListener('readyToClose', () => {
          onMeetingEnd?.();
        });

      } catch {
        // Jitsi initialization error handled silently
      }
    };

    initJitsi();

    // Cleanup
    return () => {
      if (jitsiApi.current) {
        jitsiApi.current.dispose();
      }
    };
  }, [roomName, userName, onMeetingEnd, onParticipantJoined, onParticipantLeft]);

  return (
    <div className="w-full h-full min-h-[600px] bg-slate-900 rounded-lg overflow-hidden">
      <div ref={jitsiContainerRef} className="w-full h-full" />
    </div>
  );
};

export default JitsiMeet;

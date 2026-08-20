import { useState, useRef, useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';

interface VideoConsultationState {
  isConnecting: boolean;
  isConnected: boolean;
  isWaiting: boolean;
  hasPermissions: boolean;
  permissionError: string;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  stream: MediaStream | null;
  connectionQuality: 'excellent' | 'good' | 'fair' | 'poor';
  participantCount: number;
}

interface VideoConsultationActions {
  requestPermissions: () => Promise<boolean>;
  startConsultation: () => Promise<void>;
  endConsultation: () => void;
  toggleVideo: () => void;
  toggleAudio: () => void;
  checkConnectionQuality: () => void;
  switchCamera: () => Promise<void>;
}

interface UseVideoConsultationReturn extends VideoConsultationState, VideoConsultationActions {}

export const useVideoConsultation = (): UseVideoConsultationReturn => {
  const [state, setState] = useState<VideoConsultationState>({
    isConnecting: true,
    isConnected: false,
    isWaiting: false,
    hasPermissions: false,
    permissionError: '',
    isVideoEnabled: true,
    isAudioEnabled: true,
    stream: null,
    connectionQuality: 'excellent',
    participantCount: 1
  });

  const streamRef = useRef<MediaStream | null>(null);
  const connectionCheckInterval = useRef<NodeJS.Timeout | null>(null);
  const currentFacingMode = useRef<'user' | 'environment'>('user');

  // Check if browser supports required features
  const checkBrowserSupport = useCallback(() => {
    const hasGetUserMedia = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    const hasWebRTC = !!(window.RTCPeerConnection || (window as any).webkitRTCPeerConnection);
    
    if (!hasGetUserMedia) {
      throw new Error('Your browser does not support camera access');
    }
    
    if (!hasWebRTC) {
      throw new Error('Your browser does not support video calls');
    }
    
    return true;
  }, []);

  // Request camera and microphone permissions
  const requestPermissions = useCallback(async (): Promise<boolean> => {
    try {
      checkBrowserSupport();

      const constraints: MediaStreamConstraints = {
        video: {
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 },
          frameRate: { ideal: 30, min: 15 },
          facingMode: currentFacingMode.current
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: { ideal: 48000 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // Stop previous stream if exists
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      streamRef.current = stream;
      
      setState(prev => ({
        ...prev,
        hasPermissions: true,
        permissionError: '',
        stream,
        isVideoEnabled: true,
        isAudioEnabled: true
      }));

      return true;

    } catch (error: any) {
      
      let errorMessage = 'Unable to access camera or microphone';
      
      switch (error.name) {
        case 'NotAllowedError':
          errorMessage = 'Camera and microphone access denied. Please allow permissions and try again.';
          break;
        case 'NotFoundError':
          errorMessage = 'No camera or microphone found. Please connect a device and try again.';
          break;
        case 'NotReadableError':
          errorMessage = 'Camera or microphone is already in use by another application.';
          break;
        case 'OverconstrainedError':
          errorMessage = 'Your camera does not meet the minimum requirements for video calls.';
          break;
        case 'SecurityError':
          errorMessage = 'Camera access blocked due to security restrictions.';
          break;
        default:
          errorMessage = error.message || 'An unknown error occurred while accessing your camera.';
      }

      setState(prev => ({
        ...prev,
        hasPermissions: false,
        permissionError: errorMessage,
        stream: null
      }));

      return false;
    }
  }, [checkBrowserSupport]);

  // Start consultation
  const startConsultation = useCallback(async (): Promise<void> => {
    if (!state.hasPermissions) {
      const granted = await requestPermissions();
      if (!granted) return;
    }

    setState(prev => ({ ...prev, isWaiting: true }));
    toast.loading('Connecting to healthcare provider...', { duration: 3000 });

    // Simulate connection process
    setTimeout(() => {
      setState(prev => ({
        ...prev,
        isWaiting: false,
        isConnecting: false,
        isConnected: true,
        participantCount: 2
      }));
      
      toast.success('Connected to Dr. Sarah Johnson');
      
      // Start connection quality monitoring
      checkConnectionQuality();
      connectionCheckInterval.current = setInterval(checkConnectionQuality, 5000);
    }, 3000);
  }, [state.hasPermissions, requestPermissions]);

  // End consultation
  const endConsultation = useCallback(() => {
    // Stop all media tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    // Clear intervals
    if (connectionCheckInterval.current) {
      clearInterval(connectionCheckInterval.current);
      connectionCheckInterval.current = null;
    }

    setState(prev => ({
      ...prev,
      isConnected: false,
      isConnecting: true,
      isWaiting: false,
      hasPermissions: false,
      stream: null,
      participantCount: 1
    }));

    toast.success('Consultation ended');
  }, []);

  // Toggle video
  const toggleVideo = useCallback(() => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setState(prev => ({ ...prev, isVideoEnabled: videoTrack.enabled }));
        toast.success(videoTrack.enabled ? 'Camera turned on' : 'Camera turned off');
      }
    }
  }, []);

  // Toggle audio
  const toggleAudio = useCallback(() => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setState(prev => ({ ...prev, isAudioEnabled: audioTrack.enabled }));
        toast.success(audioTrack.enabled ? 'Microphone turned on' : 'Microphone turned off');
      }
    }
  }, []);

  // Check connection quality
  const checkConnectionQuality = useCallback(() => {
    // Simulate connection quality check
    const qualities: Array<'excellent' | 'good' | 'fair' | 'poor'> = ['excellent', 'good', 'fair', 'poor'];
    const randomQuality = qualities[Math.floor(Math.random() * qualities.length)];
    
    setState(prev => {
      if (prev.connectionQuality !== randomQuality) {
        // Only show toast if quality changed significantly
        if (randomQuality === 'poor') {
          toast.error('Connection quality is poor');
        } else if (randomQuality === 'fair' && prev.connectionQuality === 'excellent') {
          toast('Connection quality decreased', { icon: '⚠️' });
        }
      }
      return { ...prev, connectionQuality: randomQuality };
    });
  }, []);

  // Switch between front and back camera (mobile)
  const switchCamera = useCallback(async (): Promise<void> => {
    if (!streamRef.current) return;

    try {
      // Toggle facing mode
      currentFacingMode.current = currentFacingMode.current === 'user' ? 'environment' : 'user';
      
      // Stop current video track
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.stop();
      }

      // Get new stream with switched camera
      const newConstraints: MediaStreamConstraints = {
        video: {
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 },
          frameRate: { ideal: 30, min: 15 },
          facingMode: currentFacingMode.current
        },
        audio: false // Keep existing audio track
      };

      const newVideoStream = await navigator.mediaDevices.getUserMedia(newConstraints);
      const newVideoTrack = newVideoStream.getVideoTracks()[0];

      // Replace video track in existing stream
      const sender = streamRef.current;
      if (sender) {
        // Remove old video track and add new one
        const audioTrack = streamRef.current.getAudioTracks()[0];
        streamRef.current = new MediaStream([newVideoTrack, audioTrack]);
        
        setState(prev => ({ ...prev, stream: streamRef.current }));
        toast.success('Camera switched');
      }
    } catch (error) {
      console.error('Error switching camera:', error);
      toast.error('Failed to switch camera');
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (connectionCheckInterval.current) {
        clearInterval(connectionCheckInterval.current);
      }
    };
  }, []);

  return {
    // State
    isConnecting: state.isConnecting,
    isConnected: state.isConnected,
    isWaiting: state.isWaiting,
    hasPermissions: state.hasPermissions,
    permissionError: state.permissionError,
    isVideoEnabled: state.isVideoEnabled,
    isAudioEnabled: state.isAudioEnabled,
    stream: state.stream,
    connectionQuality: state.connectionQuality,
    participantCount: state.participantCount,
    
    // Actions
    requestPermissions,
    startConsultation,
    endConsultation,
    toggleVideo,
    toggleAudio,
    checkConnectionQuality,
    switchCamera
  };
};
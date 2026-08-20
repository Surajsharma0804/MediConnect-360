import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Video, VideoOff, Mic, MicOff, Settings, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

interface CameraManagerProps {
  onStreamReady?: (stream: MediaStream) => void;
  onStreamError?: (error: string) => void;
  className?: string;
}

interface MediaDeviceInfo {
  deviceId: string;
  label: string;
  kind: 'videoinput' | 'audioinput';
}

const CameraManager: React.FC<CameraManagerProps> = ({
  onStreamReady,
  onStreamError,
  className = ''
}) => {
  const [, setStream] = useState<MediaStream | null>(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [permissionStatus, setPermissionStatus] = useState<'pending' | 'granted' | 'denied'>('pending');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [showSettings, setShowSettings] = useState(false);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedVideoDevice, setSelectedVideoDevice] = useState<string>('');
  const [selectedAudioDevice, setSelectedAudioDevice] = useState<string>('');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Check if browser supports media devices
  const isMediaSupported = useCallback(() => {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }, []);

  // Get available media devices
  const getMediaDevices = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoInputs = devices
        .filter(device => device.kind === 'videoinput')
        .map(device => ({
          deviceId: device.deviceId,
          label: device.label || `Camera ${device.deviceId.slice(0, 8)}`,
          kind: 'videoinput' as const
        }));
      
      const audioInputs = devices
        .filter(device => device.kind === 'audioinput')
        .map(device => ({
          deviceId: device.deviceId,
          label: device.label || `Microphone ${device.deviceId.slice(0, 8)}`,
          kind: 'audioinput' as const
        }));

      setVideoDevices(videoInputs);
      setAudioDevices(audioInputs);

      // Set default devices if not already selected
      if (!selectedVideoDevice && videoInputs.length > 0) {
        setSelectedVideoDevice(videoInputs[0].deviceId);
      }
      if (!selectedAudioDevice && audioInputs.length > 0) {
        setSelectedAudioDevice(audioInputs[0].deviceId);
      }
    } catch (error) {
      console.error('Error enumerating devices:', error);
    }
  }, [selectedVideoDevice, selectedAudioDevice]);

  // Request camera and microphone permissions
  const requestPermissions = useCallback(async () => {
    if (!isMediaSupported()) {
      const errorMsg = 'Your browser does not support camera and microphone access';
      setError(errorMsg);
      onStreamError?.(errorMsg);
      return false;
    }

    setIsLoading(true);
    setError('');

    try {
      // First, get basic permissions to enumerate devices
      const tempStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      // Stop the temporary stream
      tempStream.getTracks().forEach(track => track.stop());
      
      // Now get the actual devices
      await getMediaDevices();
      
      // Request the actual stream with selected devices
      const constraints: MediaStreamConstraints = {
        video: selectedVideoDevice 
          ? { deviceId: { exact: selectedVideoDevice } }
          : { 
              width: { ideal: 1280 },
              height: { ideal: 720 },
              frameRate: { ideal: 30 }
            },
        audio: selectedAudioDevice
          ? { deviceId: { exact: selectedAudioDevice } }
          : {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true
            }
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // Stop previous stream if exists
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      streamRef.current = mediaStream;
      setStream(mediaStream);
      setPermissionStatus('granted');
      
      // Set video element source
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

      onStreamReady?.(mediaStream);
      toast.success('Camera and microphone access granted');
      return true;

    } catch (error: any) {
      console.error('Error accessing media devices:', error);
      
      let errorMessage = 'Unable to access camera or microphone';
      
      if (error.name === 'NotAllowedError') {
        errorMessage = 'Camera and microphone access denied. Please allow permissions and try again.';
      } else if (error.name === 'NotFoundError') {
        errorMessage = 'No camera or microphone found. Please connect a device and try again.';
      } else if (error.name === 'NotReadableError') {
        errorMessage = 'Camera or microphone is already in use by another application.';
      } else if (error.name === 'OverconstrainedError') {
        errorMessage = 'Selected camera or microphone does not meet the requirements.';
      }

      setError(errorMessage);
      setPermissionStatus('denied');
      onStreamError?.(errorMessage);
      toast.error('Camera/microphone access failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isMediaSupported, getMediaDevices, selectedVideoDevice, selectedAudioDevice, onStreamReady, onStreamError]);

  // Toggle video
  const toggleVideo = useCallback(() => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
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
        setIsAudioEnabled(audioTrack.enabled);
        toast.success(audioTrack.enabled ? 'Microphone turned on' : 'Microphone turned off');
      }
    }
  }, []);

  // Change video device
  const changeVideoDevice = useCallback(async (deviceId: string) => {
    setSelectedVideoDevice(deviceId);
    if (permissionStatus === 'granted') {
      await requestPermissions();
    }
  }, [permissionStatus, requestPermissions]);

  // Change audio device
  const changeAudioDevice = useCallback(async (deviceId: string) => {
    setSelectedAudioDevice(deviceId);
    if (permissionStatus === 'granted') {
      await requestPermissions();
    }
  }, [permissionStatus, requestPermissions]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Initial: auto-request permissions on mount
  useEffect(() => {
    if (isMediaSupported()) {
      requestPermissions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={`relative ${className}`}>
      {/* Video Preview */}
      <div className="relative aspect-video bg-slate-900 rounded-lg overflow-hidden">
        {permissionStatus === 'pending' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
            <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center mb-4">
              <Video className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-white">Camera Access Required</h3>
            <p className="text-slate-300 mb-4 text-center max-w-md">
              We need access to your camera and microphone for video consultations.
            </p>
            <button
              onClick={requestPermissions}
              disabled={isLoading}
              className="btn-primary flex items-center"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Requesting Access...
                </>
              ) : (
                'Grant Camera Access'
              )}
            </button>
          </div>
        )}

        {permissionStatus === 'denied' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
            <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center mb-4">
              <AlertCircle className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-white">Camera Access Denied</h3>
            <p className="text-slate-300 mb-4 text-center max-w-md">
              {error}
            </p>
            <div className="space-y-3 text-center">
              <button
                onClick={requestPermissions}
                disabled={isLoading}
                className="btn-primary flex items-center mx-auto"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Retrying...
                  </>
                ) : (
                  'Try Again'
                )}
              </button>
              <div className="text-xs text-slate-400 text-left max-w-sm space-y-1">
                <p className="font-medium text-slate-300">To enable camera access:</p>
                <p>1. Click the 🔒 lock icon in the address bar</p>
                <p>2. Find &quot;Camera&quot; and &quot;Microphone&quot; settings</p>
                <p>3. Set both to &quot;Allow&quot;</p>
                <p>4. Refresh this page</p>
              </div>
            </div>
          </div>
        )}

        {permissionStatus === 'granted' && (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover transform scale-x-[-1] ${
                !isVideoEnabled ? 'opacity-0' : ''
              }`}
            />
            {!isVideoEnabled && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
                <div className="w-20 h-20 rounded-full bg-slate-700 flex items-center justify-center">
                  <VideoOff className="h-10 w-10 text-slate-400" />
                </div>
              </div>
            )}
            
            {/* Status indicator */}
            <div className="absolute top-4 left-4 flex items-center space-x-2">
              <div className="flex items-center bg-black/50 rounded-full px-3 py-1">
                <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                <span className="text-white text-sm">Live</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Controls */}
      {permissionStatus === 'granted' && (
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleVideo}
              className={`p-3 rounded-full transition-colors ${
                isVideoEnabled 
                  ? 'bg-slate-700 hover:bg-slate-600 text-white' 
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
              title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
            >
              {isVideoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
            </button>
            
            <button
              onClick={toggleAudio}
              className={`p-3 rounded-full transition-colors ${
                isAudioEnabled 
                  ? 'bg-slate-700 hover:bg-slate-600 text-white' 
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
              title={isAudioEnabled ? 'Turn off microphone' : 'Turn on microphone'}
            >
              {isAudioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
            </button>
          </div>

          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-3 rounded-full bg-slate-700 hover:bg-slate-600 text-white transition-colors"
            title="Camera settings"
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Settings Panel */}
      {showSettings && permissionStatus === 'granted' && (
        <div className="mt-4 p-4 bg-slate-800 rounded-lg">
          <h4 className="text-lg font-semibold mb-4 text-white">Camera Settings</h4>
          
          <div className="space-y-4">
            {/* Video Device Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Camera
              </label>
              <select
                value={selectedVideoDevice}
                onChange={(e) => changeVideoDevice(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {videoDevices.map((device) => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Audio Device Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Microphone
              </label>
              <select
                value={selectedAudioDevice}
                onChange={(e) => changeAudioDevice(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {audioDevices.map((device) => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Test Connection */}
            <button
              onClick={requestPermissions}
              disabled={isLoading}
              className="w-full btn-secondary flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Test Connection
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CameraManager;
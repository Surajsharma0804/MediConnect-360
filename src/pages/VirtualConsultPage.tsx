import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Video, Mic, MicOff, VideoOff, Phone, MessageSquare, UserPlus, Share2, Clock, Star, RotateCcw, Wifi, WifiOff } from 'lucide-react';
import CameraManager from '../components/video/CameraManager';
import { useVideoConsultation } from '../hooks/useVideoConsultation';

const VirtualConsultPage: React.FC = () => {
  const {
    isConnecting,
    isConnected,
    isWaiting,
    hasPermissions,
    isVideoEnabled,
    isAudioEnabled,
    connectionQuality,
    participantCount,
    startConsultation,
    endConsultation,
    toggleVideo,
    toggleAudio,
    switchCamera
  } = useVideoConsultation();

  const videoRef = useRef<HTMLVideoElement>(null);
  // Handle stream ready from CameraManager
  const handleStreamReady = (mediaStream: MediaStream) => {
    if (videoRef.current) {
      videoRef.current.srcObject = mediaStream;
    }
  };

  // Handle stream error from CameraManager
  const handleStreamError = (_error: string) => {
    // Error handled by CameraManager UI
  };

  // Get connection quality indicator
  const getConnectionQualityIcon = () => {
    switch (connectionQuality) {
      case 'excellent':
        return <Wifi className="h-4 w-4 text-green-500" />;
      case 'good':
        return <Wifi className="h-4 w-4 text-yellow-500" />;
      case 'fair':
        return <Wifi className="h-4 w-4 text-orange-500" />;
      case 'poor':
        return <WifiOff className="h-4 w-4 text-red-500" />;
      default:
        return <Wifi className="h-4 w-4 text-gray-500" />;
    }
  };
  
  return (
    <div className="min-h-[calc(100vh-4rem)] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-slate-900 dark:text-white">
          Virtual Consultation
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main video area */}
          <div className="lg:col-span-3 glass-panel rounded-xl overflow-hidden">
            <div className="relative aspect-video bg-slate-900 w-full">
              {isConnecting && !isWaiting && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
                  <div className="w-full max-w-md">
                    <CameraManager
                      onStreamReady={handleStreamReady}
                      onStreamError={handleStreamError}
                      className="mb-6"
                    />
                    
                    <div className="text-center">
                      <h2 className="text-xl font-semibold mb-2 text-white">Ready to Connect</h2>
                      <p className="text-slate-300 mb-4">
                        Test your camera and microphone, then start your consultation.
                      </p>
                      
                      <div className="space-y-3">
                        <button
                          onClick={startConsultation}
                          className="btn-primary w-full"
                        >
                          {hasPermissions ? 'Start Consultation' : 'Grant Camera Access & Start'}
                        </button>
                        
                        <Link 
                          to="/camera-test"
                          className="btn-secondary w-full text-center block"
                        >
                          Test Camera & Microphone
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {isWaiting && (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="w-20 h-20 rounded-full border-4 border-blue-600 border-t-transparent mb-4"></div>
                  <h2 className="text-xl font-semibold mb-2">Waiting for Doctor</h2>
                  <p className="text-slate-400 text-center max-w-md">
                    Dr. Sarah Johnson will join your consultation shortly. Please stay on this screen.
                  </p>
                  <div className="mt-4 glass-panel px-4 py-2 rounded-full flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-indigo-400" />
                    <span className="text-sm">Estimated wait time: &lt;5 minutes</span>
                  </div>
                </div>
              )}
              
              {isConnected && (
                <>
                  {/* Doctor's video */}
                  <div className="absolute inset-0 overflow-hidden">
                    <img 
                      src="https://images.pexels.com/photos/5452201/pexels-photo-5452201.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
                      alt="Doctor" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 left-4 glass-panel px-3 py-1 rounded-full flex items-center">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></div>
                      <span className="text-sm font-medium">Dr. Sarah Johnson</span>
                    </div>
                  </div>
                  
                  {/* Patient's video (small overlay) */}
                  <div className="absolute bottom-4 right-4 w-48 h-36 md:w-64 md:h-48 rounded-lg overflow-hidden border-2 border-indigo-500 shadow-lg">
                    <div className={`w-full h-full ${isVideoEnabled ? 'bg-slate-800' : 'bg-slate-900 flex items-center justify-center'}`}>
                      {isVideoEnabled ? (
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          className="w-full h-full object-cover transform scale-x-[-1]"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center">
                          <VideoOff className="h-8 w-8 text-white" />
                        </div>
                      )}
                    </div>
                    
                    {/* Connection quality indicator */}
                    <div className="absolute top-2 left-2 bg-black/50 rounded-full p-1">
                      {getConnectionQualityIcon()}
                    </div>
                  </div>
                </>
              )}
            </div>
            
            {/* Video controls */}
            <div className="p-4 bg-slate-900 flex flex-wrap items-center justify-center md:justify-between gap-4">
              <div className="flex items-center space-x-2">
                <button
                  onClick={toggleAudio}
                  className={`p-3 rounded-full transition-colors ${
                    isAudioEnabled ? 'bg-slate-700 hover:bg-slate-600' : 'bg-red-600 hover:bg-red-700'
                  }`}
                  title={isAudioEnabled ? 'Turn off microphone' : 'Turn on microphone'}
                >
                  {isAudioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                </button>
                
                <button
                  onClick={toggleVideo}
                  className={`p-3 rounded-full transition-colors ${
                    isVideoEnabled ? 'bg-slate-700 hover:bg-slate-600' : 'bg-red-600 hover:bg-red-700'
                  }`}
                  title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
                >
                  {isVideoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                </button>
                
                <button
                  onClick={switchCamera}
                  className="p-3 rounded-full bg-slate-700 hover:bg-slate-600 transition-colors"
                  title="Switch camera"
                >
                  <RotateCcw className="h-5 w-5" />
                </button>
                
                <button
                  className="p-3 rounded-full bg-slate-700 hover:bg-slate-600 transition-colors"
                  title="Chat"
                >
                  <MessageSquare className="h-5 w-5" />
                </button>
                
                <button
                  className="p-3 rounded-full bg-slate-700 hover:bg-slate-600 transition-colors"
                  title="Invite participant"
                >
                  <UserPlus className="h-5 w-5" />
                </button>
                
                <button
                  className="p-3 rounded-full bg-slate-700 hover:bg-slate-600 transition-colors"
                  title="Share screen"
                >
                  <Share2 className="h-5 w-5" />
                </button>
              </div>
              
              <div className="flex items-center space-x-4">
                {/* Connection status */}
                <div className="flex items-center space-x-2 text-sm text-slate-300">
                  {getConnectionQualityIcon()}
                  <span className="capitalize">{connectionQuality}</span>
                  <span>•</span>
                  <span>{participantCount} participant{participantCount > 1 ? 's' : ''}</span>
                </div>
                
                <button
                  onClick={endConsultation}
                  className="px-6 py-3 rounded-full bg-red-600 hover:bg-red-700 text-white font-medium flex items-center transition-colors"
                >
                  <Phone className="h-5 w-5 mr-2" />
                  End Call
                </button>
              </div>
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Appointment info */}
            <div className="glass-panel p-4 rounded-xl">
              <h3 className="text-lg font-semibold mb-3">Appointment Details</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Appointment ID</span>
                  <span className="font-mono">VC-1872394</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Duration</span>
                  <span>30 minutes</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Specialist</span>
                  <span>Cardiology</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Cost</span>
                  <span className="font-medium text-emerald-400">$75.00</span>
                </div>
              </div>
            </div>
            
            {/* Doctor info */}
            {isConnected && (
              <div className="glass-panel p-4 rounded-xl">
                <h3 className="text-lg font-semibold mb-3">Your Provider</h3>
                
                <div className="flex items-center mb-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden mr-3">
                    <img 
                      src="https://images.pexels.com/photos/5452201/pexels-photo-5452201.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
                      alt="Dr. Sarah Johnson" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-medium">Dr. Sarah Johnson</h4>
                    <p className="text-sm text-slate-400">Cardiologist, MD</p>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <div className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center mr-2">
                      <span className="text-xs">🏥</span>
                    </div>
                    <span>Metro Cardiology Center</span>
                  </div>
                  
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-500 mr-2" />
                    <span>4.9/5 (243 reviews)</span>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center mr-2">
                      <span className="text-xs">🔍</span>
                    </div>
                    <span>View full profile</span>
                  </div>
                </div>
              </div>
            )}
            
            {/* Patient notes */}
            <div className="glass-panel p-4 rounded-xl">
              <h3 className="text-lg font-semibold mb-3">My Notes</h3>
              
              <textarea
                className="w-full h-32 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Add notes about your symptoms or questions for your doctor..."
              ></textarea>
              
              <div className="mt-2 text-xs text-slate-500">
                These notes are only visible to you and will not be shared with your provider.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VirtualConsultPage;
import React, { useState, useRef, useEffect } from 'react';
import { Video, Mic, MicOff, VideoOff, Phone, MessageSquare, UserPlus, Share2, Clock, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const VirtualConsultPage: React.FC = () => {
  const [isConnecting, setIsConnecting] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isWaiting, setIsWaiting] = useState(false);
  const [hasPermissions, setHasPermissions] = useState(false);
  const [permissionError, setPermissionError] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  // Request camera and microphone permissions
  const requestPermissions = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      setHasPermissions(true);
      setPermissionError('');
      toast.success('Camera and microphone access granted');
    } catch (error) {
      console.error('Error accessing media devices:', error);
      setPermissionError('Unable to access camera or microphone. Please check your permissions.');
      toast.error('Camera/microphone access denied');
    }
  };

  // Start consultation
  const startConsultation = async () => {
    if (!hasPermissions) {
      await requestPermissions();
    }
    
    if (hasPermissions) {
      setIsWaiting(true);
      toast.loading('Connecting to doctor...', { duration: 3000 });
      
      // Simulate doctor joining after 3 seconds
      setTimeout(() => {
        setIsWaiting(false);
        setIsConnecting(false);
        setIsConnected(true);
        toast.success('Dr. Sarah Johnson has joined the call');
      }, 3000);
    }
  };
  
  const endCall = () => {
    // Stop all media tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    
    setIsConnected(false);
    setIsConnecting(true);
    setIsWaiting(false);
    setHasPermissions(false);
    toast.success('Call ended');
  };
  
  const toggleMic = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMicOn(audioTrack.enabled);
        toast.success(audioTrack.enabled ? 'Microphone on' : 'Microphone off');
      }
    }
  };
  
  const toggleVideo = () => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOn(videoTrack.enabled);
        toast.success(videoTrack.enabled ? 'Camera on' : 'Camera off');
      }
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);
  
  return (
    <div className="min-h-[calc(100vh-4rem)] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          Virtual Consultation
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main video area */}
          <div className="lg:col-span-3 glass-panel rounded-xl overflow-hidden">
            <div className="relative aspect-video bg-slate-900 w-full">
              {isConnecting && !isWaiting && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
                  <div className="mb-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
                      <Video className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  
                  <h2 className="text-xl font-semibold mb-2">Ready to Connect</h2>
                  <p className="text-slate-400 mb-4 text-center max-w-md">
                    Your virtual consultation room is ready. We'll request access to your camera and microphone.
                  </p>
                  
                  {permissionError && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start max-w-md">
                      <AlertCircle className="h-5 w-5 text-red-400 mr-2 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-400">{permissionError}</p>
                    </div>
                  )}
                  
                  <button
                    onClick={startConsultation}
                    className="btn-primary"
                  >
                    {hasPermissions ? 'Start Consultation' : 'Grant Permissions & Start'}
                  </button>
                </div>
              )}
              
              {isWaiting && (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="w-20 h-20 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin mb-4"></div>
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
                    <div className={`w-full h-full ${isVideoOn ? 'bg-slate-800' : 'bg-slate-900 flex items-center justify-center'}`}>
                      {isVideoOn ? (
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          className="w-full h-full object-cover transform scale-x-[-1]"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center">
                          <span className="text-xl font-bold text-white">YOU</span>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
            
            {/* Video controls */}
            <div className="p-4 bg-slate-900 flex flex-wrap items-center justify-center md:justify-between gap-4">
              <div className="flex items-center space-x-2">
                <button
                  onClick={toggleMic}
                  className={`p-3 rounded-full ${
                    isMicOn ? 'bg-slate-700 hover:bg-slate-600' : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {isMicOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                </button>
                
                <button
                  onClick={toggleVideo}
                  className={`p-3 rounded-full ${
                    isVideoOn ? 'bg-slate-700 hover:bg-slate-600' : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {isVideoOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                </button>
                
                <button
                  className="p-3 rounded-full bg-slate-700 hover:bg-slate-600"
                >
                  <MessageSquare className="h-5 w-5" />
                </button>
                
                <button
                  className="p-3 rounded-full bg-slate-700 hover:bg-slate-600"
                >
                  <UserPlus className="h-5 w-5" />
                </button>
                
                <button
                  className="p-3 rounded-full bg-slate-700 hover:bg-slate-600"
                >
                  <Share2 className="h-5 w-5" />
                </button>
              </div>
              
              <button
                onClick={endCall}
                className="px-6 py-3 rounded-full bg-red-600 hover:bg-red-700 text-white font-medium flex items-center"
              >
                <Phone className="h-5 w-5 mr-2" />
                End Call
              </button>
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
                    <div className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center mr-2">
                      <span className="text-xs">⭐</span>
                    </div>
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
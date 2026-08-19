import React from 'react';
import { ArrowLeft, CheckCircle, Camera } from 'lucide-react';
import { Link } from 'react-router-dom';
import CameraManager from '../components/video/CameraManager';

const CameraTestPage: React.FC = () => {
  const handleStreamReady = (_stream: MediaStream) => {
    // Stream ready for video consultation
  };

  const handleStreamError = (_error: string) => {
    // Error handled by CameraManager UI
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link 
            to="/virtual-consult" 
            className="mr-4 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Camera Test
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Test your camera and microphone before starting a consultation
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Camera Test Area */}
          <div className="lg:col-span-2">
            <div className="glass-panel p-6 rounded-xl">
              <div className="flex items-center mb-4">
                <Camera className="h-6 w-6 text-blue-600 mr-2" />
                <h2 className="text-xl font-semibold">Camera & Microphone Test</h2>
              </div>
              
              <CameraManager
                onStreamReady={handleStreamReady}
                onStreamError={handleStreamError}
                className="w-full"
              />
            </div>
          </div>

          {/* Instructions */}
          <div className="lg:col-span-1 space-y-6">
            <div className="glass-panel p-6 rounded-xl">
              <h3 className="text-lg font-semibold mb-4">Test Instructions</h3>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-white text-sm font-bold">1</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Grant Permissions</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Click "Grant Camera Access" and allow your browser to use your camera and microphone.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-white text-sm font-bold">2</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Test Video</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      You should see yourself in the video preview. Use the camera button to turn video on/off.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-white text-sm font-bold">3</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Test Audio</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Speak and check if your microphone is working. Use the microphone button to mute/unmute.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-white text-sm font-bold">4</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Adjust Settings</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Click the settings icon to choose different cameras or microphones if available.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* System Requirements */}
            <div className="glass-panel p-6 rounded-xl">
              <h3 className="text-lg font-semibold mb-4">System Requirements</h3>
              
              <div className="space-y-3">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-sm">Modern web browser (Chrome, Firefox, Safari, Edge)</span>
                </div>
                
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-sm">Camera and microphone connected</span>
                </div>
                
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-sm">Stable internet connection</span>
                </div>
                
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-sm">HTTPS connection (secure)</span>
                </div>
              </div>
            </div>

            {/* Troubleshooting */}
            <div className="glass-panel p-6 rounded-xl">
              <h3 className="text-lg font-semibold mb-4">Troubleshooting</h3>
              
              <div className="space-y-3 text-sm">
                <div>
                  <h4 className="font-medium text-slate-900 dark:text-white">Camera not working?</h4>
                  <p className="text-slate-600 dark:text-slate-400">
                    Check if another app is using your camera, refresh the page, or try a different browser.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium text-slate-900 dark:text-white">Permission denied?</h4>
                  <p className="text-slate-600 dark:text-slate-400">
                    Click the camera icon in your browser's address bar and allow access.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium text-slate-900 dark:text-white">Poor video quality?</h4>
                  <p className="text-slate-600 dark:text-slate-400">
                    Check your internet connection and close other applications using bandwidth.
                  </p>
                </div>
              </div>
            </div>

            {/* Ready Button */}
            <Link 
              to="/virtual-consult"
              className="w-full btn-primary text-center block"
            >
              I'm Ready for My Consultation
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CameraTestPage;
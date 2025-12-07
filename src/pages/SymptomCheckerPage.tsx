import React, { useState } from 'react';
import { Send, User, Activity, ArrowRight, Clipboard, Brain } from 'lucide-react';

const SymptomCheckerPage: React.FC = () => {
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState<{type: 'user' | 'ai'; text: string}[]>([
    {
      type: 'ai',
      text: "Hello! I'm your AI health assistant. Please describe your symptoms, and I'll help assess your condition. Remember, this is not a replacement for professional medical advice."
    }
  ]);
  
  const [bodyPart, setBodyPart] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    // Add user message to chat
    const userMessage = message;
    setChat(prev => [...prev, { type: 'user', text: userMessage }]);
    setMessage('');
    setLoading(true);
    
    try {
      // Call real AI API
      const response = await fetch('http://localhost:5000/api/ai/symptom-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symptoms: userMessage, language: 'en' }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      
      // Detect body part from symptoms
      if (userMessage.toLowerCase().includes('headache') || userMessage.toLowerCase().includes('head')) {
        setBodyPart('head');
      } else if (userMessage.toLowerCase().includes('chest') || userMessage.toLowerCase().includes('heart')) {
        setBodyPart('chest');
      } else if (userMessage.toLowerCase().includes('stomach') || userMessage.toLowerCase().includes('abdomen')) {
        setBodyPart('abdomen');
      }
      
      setChat(prev => [...prev, { type: 'ai', text: data.response }]);
    } catch (error) {
      console.error('AI Error:', error);
      setChat(prev => [...prev, { 
        type: 'ai', 
        text: "I'm sorry, I'm having trouble connecting to the AI service right now. Please try again in a moment." 
      }]);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-[calc(100vh-4rem)] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          AI Symptom Checker
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 3D Body Visualization */}
          <div className="glass-panel p-6 col-span-1 lg:col-span-1 flex flex-col">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Activity className="mr-2 h-5 w-5 text-indigo-400" />
              Health Visualizer
            </h2>
            
            <div className="relative flex-grow flex items-center justify-center py-4">
              <div className="w-64 h-80 relative">
                {/* Simple SVG body outline */}
                <svg viewBox="0 0 100 220" className="w-full h-full">
                  {/* Head */}
                  <circle 
                    cx="50" 
                    cy="30" 
                    r="20" 
                    fill={bodyPart === 'head' ? 'rgba(139, 92, 246, 0.5)' : 'none'} 
                    stroke={bodyPart === 'head' ? '#8b5cf6' : 'currentColor'} 
                    strokeWidth="1.5"
                    className={bodyPart === 'head' ? 'animate-pulse-glow' : ''}
                  />
                  
                  {/* Neck */}
                  <line x1="50" y1="50" x2="50" y2="60" stroke="currentColor" strokeWidth="1.5" />
                  
                  {/* Torso */}
                  <rect 
                    x="30" 
                    y="60" 
                    width="40" 
                    height="60" 
                    rx="5" 
                    fill={bodyPart === 'chest' ? 'rgba(139, 92, 246, 0.5)' : 'none'} 
                    stroke={bodyPart === 'chest' ? '#8b5cf6' : 'currentColor'} 
                    strokeWidth="1.5"
                    className={bodyPart === 'chest' ? 'animate-pulse-glow' : ''}
                  />
                  
                  {/* Abdomen */}
                  <rect 
                    x="30" 
                    y="120" 
                    width="40" 
                    height="30" 
                    rx="5" 
                    fill={bodyPart === 'abdomen' ? 'rgba(139, 92, 246, 0.5)' : 'none'} 
                    stroke={bodyPart === 'abdomen' ? '#8b5cf6' : 'currentColor'} 
                    strokeWidth="1.5"
                    className={bodyPart === 'abdomen' ? 'animate-pulse-glow' : ''}
                  />
                  
                  {/* Arms */}
                  <line x1="30" y1="70" x2="10" y2="90" stroke="currentColor" strokeWidth="1.5" />
                  <line x1="70" y1="70" x2="90" y2="90" stroke="currentColor" strokeWidth="1.5" />
                  <line x1="10" y1="90" x2="10" y2="130" stroke="currentColor" strokeWidth="1.5" />
                  <line x1="90" y1="90" x2="90" y2="130" stroke="currentColor" strokeWidth="1.5" />
                  
                  {/* Legs */}
                  <line x1="40" y1="150" x2="40" y2="200" stroke="currentColor" strokeWidth="1.5" />
                  <line x1="60" y1="150" x2="60" y2="200" stroke="currentColor" strokeWidth="1.5" />
                </svg>
                
                {/* Interactive tooltip */}
                {bodyPart && (
                  <div className="absolute top-0 left-0 w-full text-center mt-2">
                    <div className="glass-panel px-3 py-1 inline-block text-sm">
                      {bodyPart === 'head' && 'Head & Neurological'}
                      {bodyPart === 'chest' && 'Cardiac & Respiratory'}
                      {bodyPart === 'abdomen' && 'Digestive & Abdominal'}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Tap a body region to explore
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => setBodyPart('head')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    bodyPart === 'head' 
                      ? 'bg-indigo-500/20 border border-indigo-500/50' 
                      : 'border border-slate-700 hover:bg-slate-800'
                  }`}
                >
                  Head
                </button>
                <button 
                  onClick={() => setBodyPart('chest')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    bodyPart === 'chest' 
                      ? 'bg-indigo-500/20 border border-indigo-500/50' 
                      : 'border border-slate-700 hover:bg-slate-800'
                  }`}
                >
                  Chest
                </button>
                <button 
                  onClick={() => setBodyPart('abdomen')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    bodyPart === 'abdomen' 
                      ? 'bg-indigo-500/20 border border-indigo-500/50' 
                      : 'border border-slate-700 hover:bg-slate-800'
                  }`}
                >
                  Abdomen
                </button>
                <button 
                  onClick={() => setBodyPart(null)}
                  className="px-3 py-2 rounded-lg text-sm font-medium border border-slate-700 hover:bg-slate-800"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
          
          {/* Chat Interface */}
          <div className="glass-panel p-6 col-span-1 lg:col-span-2 flex flex-col h-[600px]">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center mr-3">
                  <Brain className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="font-semibold">MediConnect AI</h2>
                  <p className="text-xs text-slate-400">Medical Assistant (Beta)</p>
                </div>
              </div>
              
              <div>
                <button className="p-2 text-slate-400 hover:text-white">
                  <Clipboard className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="flex-grow overflow-y-auto space-y-4 mb-4 pr-2 custom-scrollbar">
              {chat.map((item, index) => (
                <div 
                  key={index} 
                  className={`flex ${item.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                      item.type === 'user' 
                        ? 'bg-indigo-600 text-white rounded-tr-none' 
                        : 'glass-panel rounded-tl-none'
                    }`}
                  >
                    {item.type === 'ai' && (
                      <div className="flex items-center mb-1">
                        <Brain className="h-4 w-4 mr-1 text-indigo-400" />
                        <span className="text-xs font-medium text-indigo-400">MediConnect AI</span>
                      </div>
                    )}
                    <div className="text-sm">
                      {item.text}
                    </div>
                  </div>
                </div>
              ))}
              
              {loading && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] glass-panel rounded-2xl rounded-tl-none px-4 py-2">
                    <div className="flex items-center mb-1">
                      <Brain className="h-4 w-4 mr-1 text-indigo-400" />
                      <span className="text-xs font-medium text-indigo-400">MediConnect AI</span>
                    </div>
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '200ms' }}></div>
                      <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '400ms' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <form onSubmit={handleSubmit} className="relative">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your symptoms..."
                className="w-full px-4 py-3 pr-12 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-indigo-400 hover:text-indigo-300"
                disabled={loading}
              >
                <Send className="h-5 w-5" />
              </button>
            </form>
            
            <div className="mt-4 text-xs text-slate-500">
              <p>
                <span className="text-indigo-400">Important:</span> This AI assistant provides general information only and is not a substitute for professional medical advice, diagnosis, or treatment.
              </p>
            </div>
          </div>
        </div>
        
        {/* Common Symptoms */}
        <div className="mt-8 glass-panel p-6">
          <h2 className="text-xl font-semibold mb-4">Common Symptoms</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['Headache', 'Chest Pain', 'Fatigue', 'Nausea', 'Fever', 'Shortness of Breath', 'Dizziness', 'Abdominal Pain'].map((symptom, index) => (
              <button
                key={index}
                onClick={() => setMessage(symptom)}
                className="flex items-center justify-between p-3 border border-slate-700 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <span>{symptom}</span>
                <ArrowRight className="h-4 w-4 text-indigo-400" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SymptomCheckerPage;
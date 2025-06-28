import React, { useState, useEffect, useCallback } from 'react';
import { Cpu, Database, Server, Zap, Lock } from 'lucide-react';
import logoSvg from '../../assets/logo/logo.svg';

interface LoadingProps {
  fullScreen?: boolean;
  onLoadingComplete?: () => void;
  minDisplayTime?: number; // Minimum time to show the loading screen in ms
}

export const Loading: React.FC<LoadingProps> = ({ 
  fullScreen = false, 
  onLoadingComplete,
  minDisplayTime = 3000 // Default minimum display time of 3 seconds
}) => {
  const [loadingStep, setLoadingStep] = useState(0);
  const [loadingPercent, setLoadingPercent] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [startTime] = useState(Date.now());
  
  const completeLoading = useCallback(() => {
    // Calculate how long we've been showing the loading screen
    const elapsedTime = Date.now() - startTime;
    
    // If we haven't shown it for the minimum time yet, wait
    if (elapsedTime < minDisplayTime) {
      const remainingTime = minDisplayTime - elapsedTime;
      setTimeout(() => {
        setIsComplete(true);
        if (onLoadingComplete) {
          onLoadingComplete();
        }
      }, remainingTime);
    } else {
      // We've already shown it long enough, complete now
      setIsComplete(true);
      if (onLoadingComplete) {
        onLoadingComplete();
      }
    }
  }, [minDisplayTime, onLoadingComplete, startTime]);
  
  useEffect(() => {
    if (fullScreen) {
      // Step progression
      const interval = setInterval(() => {
        setLoadingStep(prev => {
          if (prev >= 4) {
            clearInterval(interval);
            return prev;
          }
          return prev + 1;
        });
      }, 600);
      
      // Percent progression
      const percentInterval = setInterval(() => {
        setLoadingPercent(prev => {
          if (prev >= 100) {
            clearInterval(percentInterval);
            return 100;
          }
          // Accelerate loading as we go
          const increment = Math.floor(Math.random() * 10) + (prev > 70 ? 5 : 1);
          const newValue = Math.min(prev + increment, 100);
          
          // If we've reached 100%, trigger completion after a small delay
          if (newValue === 100) {
            setTimeout(completeLoading, 500);
          }
          
          return newValue;
        });
      }, 200);
      
      return () => {
        clearInterval(interval);
        clearInterval(percentInterval);
      };
    }
  }, [fullScreen, completeLoading]);

  if (!fullScreen) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 blur-xl animate-pulse-slow" />
          <img src={logoSvg} alt="Questfy Logo" className="w-16 h-16 relative z-10" />
        </div>
      </div>
    );
  }

  const loadingSteps = [
    { icon: Server, text: "Initializing core systems", color: "text-cyan-400" },
    { icon: Database, text: "Loading neural network data", color: "text-blue-400" },
    { icon: Lock, text: "Establishing secure connection", color: "text-purple-400" },
    { icon: Cpu, text: "Activating AI subsystems", color: "text-indigo-400" },
    { icon: Zap, text: "Finalizing system boot sequence", color: "text-pink-400" },
  ];

  if (isComplete && onLoadingComplete) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-[#020617] flex items-center justify-center z-50">
      {/* Enhanced cyberpunk grid background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a22_1px,transparent_1px),linear-gradient(to_bottom,#0f172a22_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMjAgMEwzNC42NDEgMTBWMzBMMjAgNDBMNS4zNTkgMzBWMTBMMjAgMFoiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzBmMTcyYTIyIiBzdHJva2Utd2lkdGg9IjEiLz48L3N2Zz4=')] opacity-20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_1200px_at_100%_200px,#1e40af15,transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_1200px_at_0%_800px,#0ea5e915,transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_1200px_at_100%_800px,#6366f115,transparent)]" />
      </div>

      {/* Animated scan lines */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,#0f172a66_50%)] bg-[length:100%_4px] animate-scan opacity-30" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_50%,#0f172a44_50%)] bg-[length:4px_100%] animate-scan-horizontal opacity-20" />
      </div>

      {/* Power lines effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-cyan-400 to-transparent animate-pulse-slow" />
        <div className="absolute top-0 left-2/4 w-px h-full bg-gradient-to-b from-transparent via-blue-400 to-transparent animate-pulse-slow" style={{ animationDelay: '1s' }} />
        <div className="absolute top-0 left-3/4 w-px h-full bg-gradient-to-b from-transparent via-purple-400 to-transparent animate-pulse-slow" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative flex flex-col items-center max-w-md w-full px-6">
        {/* Logo with glow effect */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 blur-3xl animate-pulse-slow" />
          <img src={logoSvg} alt="Questfy Logo" className="w-auto h-[15vh] mx-auto relative z-10 drop-shadow-[0_0_15px_rgba(56,189,248,0.3)]" />
        </div>

        {/* Loading text with typewriter effect */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2 animate-pulse">
            {loadingPercent === 100 ? "SYSTEM READY" : "QUESTFY SYSTEM BOOT"}
          </h2>
          <div className="flex items-center gap-1 text-white/70 font-mono">
            <span className="w-2 h-2 bg-cyan-400 rounded-full animate-ping" />
            <span className="w-2 h-2 bg-cyan-400 rounded-full animate-ping" style={{ animationDelay: '0.2s' }} />
            <span className="w-2 h-2 bg-cyan-400 rounded-full animate-ping" style={{ animationDelay: '0.4s' }} />
          </div>
        </div>

        {/* Loading progress */}
        <div className="w-full h-1 bg-[#0a0f1d] rounded-full overflow-hidden mb-2">
          <div 
            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${Math.min(loadingPercent, 100)}%` }}
          />
        </div>
        <div className="w-full flex justify-between text-xs text-cyan-400/70 font-mono mb-6">
          <span>{loadingPercent === 100 ? "COMPLETE" : "INITIALIZING"}</span>
          <span>{Math.min(loadingPercent, 100)}%</span>
        </div>

        {/* Loading status messages */}
        <div className="w-full space-y-3 font-mono text-sm">
          {loadingSteps.map((step, index) => (
            <div 
              key={index} 
              className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${
                index <= loadingStep 
                  ? `${step.color} bg-[#0a0f1d]/80 border border-${step.color.split('-')[1]}-400/30` 
                  : 'text-white/30'
              }`}
            >
              <step.icon className={`w-5 h-5 ${index <= loadingStep ? '' : 'opacity-30'}`} />
              <span>{step.text}</span>
              {index === loadingStep && loadingPercent < 100 && (
                <span className="ml-auto flex items-center gap-1">
                  <span className="w-1 h-1 bg-current rounded-full animate-ping" />
                  <span className="w-1 h-1 bg-current rounded-full animate-ping" style={{ animationDelay: '0.2s' }} />
                  <span className="w-1 h-1 bg-current rounded-full animate-ping" style={{ animationDelay: '0.4s' }} />
                </span>
              )}
              {(index < loadingStep || loadingPercent === 100) && (
                <span className="ml-auto">COMPLETE</span>
              )}
            </div>
          ))}
        </div>

        {/* System details */}
        <div className="mt-8 w-full p-3 bg-[#0a0f1d]/80 border border-cyan-400/20 rounded-lg">
          <div className="text-xs text-white/50 font-mono space-y-1">
            <div className="flex justify-between">
              <span>SYSTEM VERSION</span>
              <span className="text-cyan-400">v2.0.1</span>
            </div>
            <div className="flex justify-between">
              <span>NEURAL NETWORK</span>
              <span className="text-cyan-400">ACTIVE</span>
            </div>
            <div className="flex justify-between">
              <span>ENCRYPTION</span>
              <span className="text-cyan-400">AES-256</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 
import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle, X, Zap, AlertTriangle, Info } from 'lucide-react';

interface NotificationProps {
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
  isVisible: boolean;
  onClose: () => void;
  autoClose?: boolean;
  duration?: number;
}

export const Notification: React.FC<NotificationProps> = ({
  type,
  title,
  message,
  isVisible,
  onClose,
  autoClose = true,
  duration = 4000,
}) => {
  useEffect(() => {
    if (isVisible && autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, autoClose, duration, onClose]);

  if (!isVisible) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-6 h-6 text-green-400" />;
      case 'info':
        return <Info className="w-6 h-6 text-blue-400" />;
      case 'warning':
        return <AlertTriangle className="w-6 h-6 text-yellow-400" />;
      case 'error':
        return <X className="w-6 h-6 text-red-400" />;
      default:
        return <Zap className="w-6 h-6 text-blue-400" />;
    }
  };

  const getGradientColors = () => {
    switch (type) {
      case 'success':
        return 'from-green-500/20 to-emerald-500/20 border-green-400/40';
      case 'info':
        return 'from-blue-500/20 to-cyan-500/20 border-blue-400/40';
      case 'warning':
        return 'from-yellow-500/20 to-orange-500/20 border-yellow-400/40';
      case 'error':
        return 'from-red-500/20 to-pink-500/20 border-red-400/40';
      default:
        return 'from-blue-500/20 to-purple-500/20 border-blue-400/40';
    }
  };

  const notificationContent = (
    <div className="fixed top-[30%] left-[60%] -translate-x-1/2 z-[9999] pointer-events-none" style={{ maxWidth: '90vw' }}>
      {/* Notification Card */}
      <div 
        className={`relative bg-gradient-to-br ${getGradientColors()} backdrop-blur-md border-2 rounded-2xl p-6 w-full max-w-md shadow-2xl animate-notification-enter pointer-events-auto`}
      >
        {/* Pulsing Glow Effect */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-400/20 via-blue-500/20 to-purple-500/20 animate-pulse-glow -z-10" />
        
        {/* Floating Particles */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl">
          <div className="absolute top-2 left-4 w-1 h-1 bg-cyan-400 rounded-full animate-float" style={{ animationDelay: '0s' }} />
          <div className="absolute top-6 right-8 w-1 h-1 bg-blue-400 rounded-full animate-float" style={{ animationDelay: '0.5s' }} />
          <div className="absolute bottom-4 left-8 w-1 h-1 bg-purple-400 rounded-full animate-float" style={{ animationDelay: '1s' }} />
          <div className="absolute bottom-8 right-4 w-1 h-1 bg-cyan-400 rounded-full animate-float" style={{ animationDelay: '1.5s' }} />
        </div>
        
        {/* Content */}
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white/10 backdrop-blur-sm">
                {getIcon()}
              </div>
              <h3 className="text-lg font-semibold text-white">{title}</h3>
            </div>
            <button
              onClick={onClose}
              className="text-white/60 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <p className="text-white/90 leading-relaxed mb-4">{message}</p>
          
          {/* Progress bar with gradient */}
          <div className="w-full bg-white/20 rounded-full h-1 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 animate-progress-bar"
              style={{ animationDuration: `${duration}ms` }}
            />
          </div>
        </div>
      </div>
    </div>
  );

  // Create a portal to render the notification at the root level
  return createPortal(
    notificationContent,
    document.body
  );
};
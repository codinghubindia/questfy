import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { authService, dbService } from '../services/supabase';
import { Loading } from '../components/ui/Loading';
import logoSvg from '../assets/logo/logo.svg';

export const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing email confirmation...');
  const [showLoading, setShowLoading] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Handle the email confirmation
        const result = await authService.handleEmailConfirmation();
        
        if (result.success && result.user) {
          // Check if profile exists, create if it doesn't
          const { data: profile } = await dbService.getProfile(result.user.id);
          
          if (!profile) {
            console.log('Creating profile for confirmed user');
            await dbService.createProfile(
              result.user.id,
              result.user.email || '',
              result.user.user_metadata?.name || 'Agent'
            );
          }
          
          setStatus('success');
          setMessage('Email confirmed successfully! Redirecting to dashboard...');
          setShowLoading(false);
          
          // Redirect to dashboard after a short delay
          setTimeout(() => {
            navigate('/dashboard');
          }, 2000);
        } else {
          setStatus('error');
          setMessage(result.error || 'Failed to confirm email. The link may have expired.');
          setShowLoading(false);
        }
      } catch (error) {
        console.error('Error in auth callback:', error);
        setStatus('error');
        setMessage('An unexpected error occurred during email confirmation.');
        setShowLoading(false);
      }
    };

    handleCallback();
  }, [navigate]);

  if (showLoading) {
    return <Loading fullScreen />;
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader className="w-12 h-12 text-cyan-400 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-12 h-12 text-green-400" />;
      case 'error':
        return <AlertCircle className="w-12 h-12 text-red-400" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'loading':
        return 'from-cyan-500/20 to-blue-500/20 border-cyan-400/30';
      case 'success':
        return 'from-green-500/20 to-emerald-500/20 border-green-400/30';
      case 'error':
        return 'from-red-500/20 to-pink-500/20 border-red-400/30';
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Enhanced cyberpunk grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a22_1px,transparent_1px),linear-gradient(to_bottom,#0f172a22_1px,transparent_1px)] bg-[size:4rem_4rem]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_100%_200px,#1e40af10,transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_0%_800px,#0ea5e910,transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_100%_800px,#6366f110,transparent)]" />
      </div>

      {/* Animated scan lines */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,#0f172a44_50%)] bg-[length:100%_4px] animate-scan" />
      </div>
      
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <img src={logoSvg} alt="Questfy Logo" className="w-24 h-24 mx-auto mb-4" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2">
            Email Confirmation
          </h1>
          <p className="text-white/70 font-mono">Verifying your agent credentials</p>
        </div>

        <Card className={`p-8 bg-[#060a14] backdrop-blur-xl border-2 ${getStatusColor()} text-center`}>
          <div className="mb-6">
            {getStatusIcon()}
          </div>
          
          <h2 className="text-xl font-semibold text-white mb-4">
            {status === 'loading' && 'Confirming Email...'}
            {status === 'success' && 'Email Confirmed!'}
            {status === 'error' && 'Confirmation Failed'}
          </h2>
          
          <p className="text-white/80 mb-6 leading-relaxed">
            {message}
          </p>

          {status === 'error' && (
            <div className="space-y-4">
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-200 text-sm">
                  <strong>Common Issues:</strong>
                </p>
                <ul className="text-red-200 text-sm mt-2 space-y-1 text-left">
                  <li>• Email confirmation link has expired</li>
                  <li>• Link has already been used</li>
                  <li>• Network connectivity issues</li>
                </ul>
              </div>
              
              <div className="flex flex-col gap-3">
                <Button
                  onClick={() => navigate('/signup')}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
                >
                  Try Signing Up Again
                </Button>
                
                <Button
                  onClick={() => navigate('/login')}
                  variant="secondary"
                  className="w-full bg-gradient-to-r from-slate-800/50 to-blue-900/50 border-cyan-400/30"
                >
                  Go to Login
                </Button>
              </div>
            </div>
          )}

          {status === 'success' && (
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <p className="text-green-200 text-sm">
                Your agent profile is now active! You'll be redirected to the command center shortly.
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
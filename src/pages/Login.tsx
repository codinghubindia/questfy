import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Notification } from '../components/ui/Notification';
import { useNotification } from '../hooks/useNotification';
import { useAuth } from '../hooks/useAuth';
import logoSvg from '../assets/logo/logo.svg';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const { notification, isVisible, showNotification, hideNotification } = useNotification();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await signIn(email, password);
    
    if (error) {
      setError(error.message);
      showNotification({
        type: 'error',
        title: 'Authentication Failed',
        message: 'Invalid credentials. Please check your email and password.',
      });
    } else {
      showNotification({
        type: 'success',
        title: 'Authentication Successful',
        message: 'Welcome back, Agent! Redirecting to command center...',
      });
      
      // Delay navigation to show notification
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    }
    
    setLoading(false);
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

      {/* Home Link */}
      <Link 
        to="/" 
        className="fixed top-4 left-4 z-50 flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0f172a]/80 backdrop-blur-md border border-cyan-400/30 text-white/70 hover:text-white hover:bg-[#0f172a] transition-all duration-200 group"
      >
        <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform duration-200" />
        <span className="font-mono text-sm">Return Home</span>
      </Link>
      
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <img src={logoSvg} alt="Questfy Logo" className="w-auto h-[10rem] mx-auto -mb-[3rem]" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2">
            Agent Authentication
          </h1>
          <p className="text-white/70 font-mono">Access your command center</p>
        </div>

        <Card className="p-8 bg-[#060a14] backdrop-blur-xl border-2 border-cyan-400/30 relative group overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-blue-500/10" />
          <div className="relative">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-200 text-sm font-mono">
                  {error}
                </div>
              )}

              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<Mail className="w-5 h-5 text-gray-400" />}
                required
                className="bg-[#0a0f1d] border-cyan-400/30 text-white placeholder-white/50"
              />

              <Input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<Lock className="w-5 h-5 text-gray-400" />}
                required
                className="bg-[#0a0f1d] border-cyan-400/30 text-white placeholder-white/50"
              />

              <Button
                type="submit"
                size="lg"
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 shadow-lg shadow-cyan-500/25 relative group overflow-hidden"
                loading={loading}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/0 via-white/20 to-cyan-400/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <span className="relative z-10">Authenticate Agent</span>
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-white/70 font-mono">
                Need agent credentials?{' '}
                <Link to="/signup" className="text-cyan-400 hover:text-cyan-300 font-medium relative group">
                  Initialize new agent
                  <span className="absolute bottom-0 left-0 w-full h-px bg-cyan-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                </Link>
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Notification */}
      {notification && (
        <Notification
          type={notification.type}
          title={notification.title}
          message={notification.message}
          isVisible={isVisible}
          onClose={hideNotification}
        />
      )}
    </div>
  );
};
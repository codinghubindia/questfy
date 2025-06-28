import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Notification } from '../components/ui/Notification';
import { useNotification } from '../hooks/useNotification';
import { useAuth } from '../hooks/useAuth';
import logoSvg from '../assets/logo/logo.svg';

export const Signup: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [signupComplete, setSignupComplete] = useState(false);
  
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const { notification, isVisible, showNotification, hideNotification } = useNotification();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      showNotification({
        type: 'error',
        title: 'Validation Error',
        message: 'Passwords do not match. Please check and try again.',
      });
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      showNotification({
        type: 'error',
        title: 'Validation Error',
        message: 'Password must be at least 6 characters long.',
      });
      setLoading(false);
      return;
    }

    const { data, error } = await signUp(formData.email, formData.password, formData.name);
    
    if (error) {
      setError(error.message);
      showNotification({
        type: 'error',
        title: 'Registration Failed',
        message: error.message || 'Failed to create agent profile. Please try again.',
      });
    } else if (data?.user) {
      // Check if email confirmation is required
      if (data.user.email_confirmed_at) {
        // User is immediately confirmed (email confirmation disabled)
        showNotification({
          type: 'success',
          title: 'Agent Initialized Successfully',
          message: `Welcome to the system, Agent ${formData.name}! Redirecting to command center...`,
        });
        
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        // Email confirmation required
        setSignupComplete(true);
        showNotification({
          type: 'info',
          title: 'Agent Profile Created',
          message: `Agent ${formData.name} profile created! Please check your email to activate your account.`,
        });
      }
    }
    
    setLoading(false);
  };

  // If signup is complete but email confirmation is pending
  if (signupComplete) {
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
            <div className="relative mb-4">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 blur-3xl animate-pulse-slow" />
              <img src={logoSvg} alt="Questfy Logo" className="w-auto h-[15vh] mx-auto relative z-10 drop-shadow-[0_0_15px_rgba(56,189,248,0.3)]" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2">
              Agent Profile Created
            </h1>
            <p className="text-white/70 font-mono">Awaiting system activation</p>
          </div>

          <Card className="p-8 relative group overflow-hidden" variant="auth" glass>
            <div className="absolute inset-0 bg-gradient-cyberpunk" />
            <div className="relative">
              <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg backdrop-blur-sm">
                <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-3" />
                <p className="text-white/80 mb-2">
                  Welcome, Agent <span className="text-cyan-400 font-medium">{formData.name}</span>!
                </p>
                <p className="text-white/70 text-sm">
                  Your agent profile has been created successfully.
                </p>
              </div>

              <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg backdrop-blur-sm">
                <AlertCircle className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                <p className="text-white/80 text-sm mb-2">
                  <strong>Activation Required</strong>
                </p>
                <p className="text-white/70 text-sm">
                  Please check your email at <span className="text-cyan-400 font-mono">{formData.email}</span> and click the activation link to complete your agent initialization.
                </p>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={() => {
                    setSignupComplete(false);
                    setFormData({ name: '', email: '', password: '', confirmPassword: '' });
                  }}
                  variant="secondary"
                  className="w-full bg-gradient-to-r from-slate-800/50 to-blue-900/50 border-cyan-400/30 relative group overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/0 via-white/10 to-cyan-400/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  <span className="relative z-10">Create Another Agent</span>
                </Button>
                
                <Button
                  asChild
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 relative group overflow-hidden"
                >
                  <Link to="/login">
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/0 via-white/20 to-cyan-400/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    <span className="relative z-10">Access Command Center</span>
                  </Link>
                </Button>
              </div>

              <div className="mt-6 p-3 bg-slate-800/30 rounded-lg backdrop-blur-sm">
                <p className="text-white/60 text-xs font-mono">
                  <strong>Note:</strong> If you don't receive the email within a few minutes, check your spam folder or contact support.
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
  }

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
            Agent Initialization
          </h1>
          <p className="text-white/70 font-mono">Create your agent profile</p>
        </div>

        <Card className="p-8 relative group overflow-hidden" variant="auth" glass>
          <div className="absolute inset-0 bg-gradient-cyberpunk" />
          <div className="relative">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-200 text-sm font-mono">
                  {error}
                </div>
              )}

              <Input
                type="text"
                name="name"
                placeholder="Agent Name"
                value={formData.name}
                onChange={handleChange}
                icon={<User className="w-5 h-5 text-gray-400" />}
                required
                className="bg-[#0a0f1d] border-cyan-400/30 text-white placeholder-white/50"
              />

              <Input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                icon={<Mail className="w-5 h-5 text-gray-400" />}
                required
                className="bg-[#0a0f1d] border-cyan-400/30 text-white placeholder-white/50"
              />

              <Input
                type="password"
                name="password"
                placeholder="Create Password"
                value={formData.password}
                onChange={handleChange}
                icon={<Lock className="w-5 h-5 text-gray-400" />}
                required
                className="bg-[#0a0f1d] border-cyan-400/30 text-white placeholder-white/50"
              />

              <Input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
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
                <span className="relative z-10">Initialize Agent Profile</span>
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-white/70 font-mono">
                Already have credentials?{' '}
                <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-medium relative group">
                  Access Command Center
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
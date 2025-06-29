import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Home, 
  Target,
  TrendingUp, 
  Settings, 
  LogOut,
  Zap,
  Menu,
  X,
  Power
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { dbService } from '../../services/supabase';
import logoSvg from '../../assets/logo/logo.svg';

const navItems = [
  { to: '/dashboard', icon: Home, label: 'Command Center', exact: true },
  { to: '/dashboard/skills', icon: Target, label: 'Skills Matrix' },
  { to: '/dashboard/quests', icon: Zap, label: 'Mission Control' },
  { to: '/dashboard/progress', icon: TrendingUp, label: 'Analytics' },
  { to: '/dashboard/settings', icon: Settings, label: 'System Config' },
];

export const Sidebar: React.FC = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [agentStats, setAgentStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAgentStats = async () => {
      if (!user) return;
      
      try {
        const { data } = await dbService.calculateAgentStatistics(user.id);
        if (data) {
          setAgentStats(data);
        }
      } catch (error) {
        console.error('Error loading agent stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAgentStats();
  }, [user]);

  const handleSignOut = async () => {
    if (isSigningOut) return; // Prevent multiple clicks
    
    setIsSigningOut(true);
    
    try {
      // Clear local state immediately for faster UI response
      localStorage.clear();
      sessionStorage.clear();
      
      // Call signOut (this will handle the redirect)
      await signOut();
      
    } catch (error) {
      console.error('Error during sign out:', error);
      // Force navigation even if there's an error
      window.location.href = '/';
    }
    // Note: Don't set isSigningOut to false here as the component will unmount
  };

  const isActive = (to: string, exact?: boolean) => {
    if (exact) {
      return location.pathname === to;
    }
    return location.pathname.startsWith(to);
  };

  const closeMobile = () => setIsMobileOpen(false);

  // Calculate XP percentage
  const calculateXpPercentage = () => {
    if (!agentStats) return 10;
    
    const currentLevelXp = (agentStats.agentLevel - 1) * 500;
    const nextLevelXp = agentStats.agentLevel * 500;
    const currentXp = agentStats.totalXP;
    
    return ((currentXp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100;
  };

  return (
    <>
      {/* Mobile Menu Button - Fixed positioning */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-12 left-4 z-[60] w-12 h-12 bg-[#0f172a]/80 backdrop-blur-md border border-cyan-400/30 rounded-xl flex items-center justify-center text-white shadow-lg hover:bg-[#0f172a] transition-colors duration-200"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[70]"
          onClick={closeMobile}
        />
      )}

      {/* Sidebar - Fixed on all screens */}
      <aside className={`
        fixed inset-y-0 left-0 z-[70] 
        w-72 h-screen bg-[#0a0f1d]/95 backdrop-blur-md 
        border-r border-cyan-400/20 flex flex-col
        transform transition-transform duration-300 ease-in-out
        pt-8 mt-8
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-blue-500/5" />
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-blue-500" />
          
          {/* Animated scan lines */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-50">
            <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,#0f172a44_50%)] bg-[length:100%_4px] animate-scan" />
          </div>
        </div>
        
        {/* Mobile Close Button */}
        <button
          onClick={closeMobile}
          className="lg:hidden absolute top-4 right-4 z-10 w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-all duration-200"
        >
          <X className="w-5 h-5" />
        </button>


        {/* Agent Status */}
        <div className="mt-1 p-3 bg-[#060a14] border border-cyan-400/20 rounded-xl shadow-inner mb-4 shadow-cyan-500/5">
          {/* Logo */}
          <div className="relative p-6 space-y-4">
            <img src={logoSvg} alt="Questfy Logo" className="w-auto h-[12vh] mx-auto -mb-[3rem] -mt-[3rem]" />
            
            <div className="text-center">
              
              <div className="flex items-center justify-center gap-2 mt-1">
                {agentStats ? (
                  <div className={`px-2 py-0.5 bg-[#060a14] border-2 border-${agentStats.rank.color.split(' ')[1].replace('from-', '')}/40 rounded-md flex items-center gap-1.5 shadow-sm shadow-${agentStats.rank.color.split(' ')[1].replace('from-', '')}/20`}>
                    <div className={`w-1.5 h-1.5 ${agentStats.rank.color.split(' ')[1].replace('from-', 'bg-')} rounded-full animate-pulse`} />
                    <span className={`text-[10px] font-bold bg-gradient-to-r ${agentStats.rank.color} bg-clip-text text-transparent uppercase tracking-wider`}>
                      {agentStats.rank.name}
                    </span>
                  </div>
                ) : (
                  <div className="px-2 py-0.5 bg-[#060a14] border-2 border-cyan-400/30 rounded-md flex items-center gap-1.5 shadow-sm shadow-cyan-500/20">
                    <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
                    <span className="text-[10px] font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent uppercase tracking-wider">Initializing...</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-cyan-400/70 font-mono">AGENT STATUS</span>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
              <span className="text-[10px] text-cyan-400/70 font-mono">ONLINE</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-white/50 font-mono">XP</span>
              {agentStats ? (
                <span className="text-[10px] font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent font-mono">
                  {agentStats.totalXP}/{agentStats.agentLevel * 500}
                </span>
              ) : (
                <span className="text-[10px] text-cyan-400 font-mono">Loading...</span>
              )}
            </div>
            <div className="h-1.5 bg-[#0a0f1d] rounded-full overflow-hidden shadow-inner shadow-black/50">
              <div 
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500 ease-out shadow-lg shadow-cyan-500/30" 
                style={{ width: `${calculateXpPercentage()}%` }}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-white/50 font-mono">RANK</span>
              {agentStats ? (
                <span className="text-[10px] font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent font-mono">LEVEL {agentStats.agentLevel}</span>
              ) : (
                <span className="text-[10px] text-cyan-400 font-mono">Loading...</span>
              )}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-2 relative overflow-y-auto">
          {navItems.map((item) => {
            const active = isActive(item.to, item.exact);
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={closeMobile}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden ${
                  active
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-white border border-cyan-400/30 shadow-lg shadow-cyan-500/20'
                    : 'text-white/70 hover:text-white hover:bg-white/5 hover:border-white/10 border border-transparent'
                }`}
              >
                {active && (
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 to-blue-500/10 animate-pulse" />
                )}
                <item.icon className={`w-5 h-5 relative z-10 ${active ? 'text-cyan-400' : ''}`} />
                <span className="relative z-10 font-medium">{item.label}</span>
                {active && (
                  <div className="absolute right-2 w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Enhanced Sign Out Button */}
        <div className="p-4 mt-auto mb-8 relative">
          <button
            onClick={handleSignOut}
            disabled={isSigningOut}
            className={`
              flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-300 border group relative overflow-hidden
              ${isSigningOut 
                ? 'bg-gradient-to-r from-red-600/30 to-pink-600/30 border-red-400/50 text-red-300' 
                : 'text-white/70 hover:text-white hover:bg-red-500/10 hover:border-red-400/30 border-transparent'
              }
              disabled:cursor-not-allowed
            `}
          >
            {/* Animated background for signing out state */}
            {isSigningOut && (
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-pink-500/20 animate-pulse" />
            )}
            
            {/* Icon with enhanced animation */}
            <div className="relative z-10 flex items-center justify-center w-5 h-5">
              {isSigningOut ? (
                <Power className="w-5 h-5 text-red-400 animate-pulse" />
              ) : (
                <LogOut className="w-5 h-5 group-hover:text-red-400 transition-colors duration-200" />
              )}
            </div>
            
            {/* Text with typing effect when signing out */}
            <span className="relative z-10 font-medium">
              {isSigningOut ? (
                <span className="flex items-center gap-1">
                  <span className="animate-pulse">Disconnecting</span>
                  <span className="flex gap-1">
                    <span className="w-1 h-1 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1 h-1 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1 h-1 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                </span>
              ) : (
                'Disconnect'
              )}
            </span>
            
            {/* Progress bar for signing out */}
            {isSigningOut && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-500/20 rounded-b-xl overflow-hidden">
                <div className="h-full bg-gradient-to-r from-red-500 to-pink-500 animate-progress-bar" style={{ animationDuration: '2s' }} />
              </div>
            )}
          </button>
        </div>
      </aside>
    </>
  );
};
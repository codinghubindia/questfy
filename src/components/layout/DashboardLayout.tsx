import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Zap } from 'lucide-react';

export const DashboardLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#020617] relative overflow-hidden">
      {/* Enhanced cyberpunk grid background with hexagonal pattern */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a22_1px,transparent_1px),linear-gradient(to_bottom,#0f172a22_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMjAgMEwzNC42NDEgMTBWMzBMMjAgNDBMNS4zNTkgMzBWMTBMMjAgMFoiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzBmMTcyYTIyIiBzdHJva2Utd2lkdGg9IjEiLz48L3N2Zz4=')] opacity-20" />
      </div>

      {/* Enhanced radial gradients */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_1200px_at_100%_200px,#1e40af15,transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_1200px_at_0%_800px,#0ea5e915,transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_1200px_at_100%_800px,#6366f115,transparent)]" />
      </div>

      {/* Animated scan lines with enhanced effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,#0f172a66_50%)] bg-[length:100%_4px] animate-scan opacity-30" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_50%,#0f172a44_50%)] bg-[length:4px_100%] animate-scan-horizontal opacity-20" />
      </div>
      
      {/* Enhanced background effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(56,189,248,0.15),transparent_50%)]" />
      </div>
      
      {/* Dynamic glowing orbs with enhanced effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '0s' }} />
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-3/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }} />
      </div>

      {/* Power lines effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-cyan-400 to-transparent animate-pulse-slow" />
        <div className="absolute top-0 left-2/4 w-px h-full bg-gradient-to-b from-transparent via-blue-400 to-transparent animate-pulse-slow" style={{ animationDelay: '1s' }} />
        <div className="absolute top-0 left-3/4 w-px h-full bg-gradient-to-b from-transparent via-purple-400 to-transparent animate-pulse-slow" style={{ animationDelay: '2s' }} />
      </div>
      
      {/* System Status Bar */}
      <div className="fixed top-0 left-0 right-0 h-8 bg-[#020617]/80 border-b border-cyan-400/20 backdrop-blur-sm z-50 px-4 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-cyan-400">
            <img src="/src/assets/logo/logo.svg" alt="Questfy Logo" className="w-4 h-4" />
            <span>SYSTEM ACTIVE</span>
          </div>
          <div className="flex items-center gap-2 text-cyan-400/70">
            <Zap className="w-4 h-4" />
            <span>NEURAL LINK ESTABLISHED</span>
          </div>
        </div>
        <div className="text-cyan-400/70">
          {new Date().toLocaleTimeString()}
        </div>
      </div>
      
      <div className="flex relative z-10">
        {/* Main content wrapper that includes both sidebar and content */}
        <div className="w-full min-h-screen pt-8">
          <Sidebar />
          {/* Main content with enhanced glass effect */}
          <main className="lg:pl-72 min-h-screen w-full">
            <div className="p-4 sm:p-6 lg:p-8 w-full">
              <div className="relative rounded-2xl bg-[#0f172a]/60 backdrop-blur-xl border border-cyan-400/20 shadow-xl shadow-cyan-500/10 overflow-hidden">
                {/* Enhanced content background effects */}
                <div className="absolute inset-0">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-purple-500/10" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(56,189,248,0.15),transparent_50%)]" />
                  {/* Corner accents */}
                  <div className="absolute top-0 left-0 w-16 h-16 border-l-2 border-t-2 border-cyan-400/30 rounded-tl-2xl" />
                  <div className="absolute top-0 right-0 w-16 h-16 border-r-2 border-t-2 border-cyan-400/30 rounded-tr-2xl" />
                  <div className="absolute bottom-0 left-0 w-16 h-16 border-l-2 border-b-2 border-cyan-400/30 rounded-bl-2xl" />
                  <div className="absolute bottom-0 right-0 w-16 h-16 border-r-2 border-b-2 border-cyan-400/30 rounded-br-2xl" />
                </div>
                {/* Content with inner glow */}
                <div className="relative p-6">
                  <div className="relative">
                    <Outlet />
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};
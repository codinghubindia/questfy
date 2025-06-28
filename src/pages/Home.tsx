import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Target, Zap, TrendingUp, Trophy, Cpu, ChevronDown } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

// Import logo and sponsor SVG
import logoSvg from '../assets/logo/logo.svg';
import sponsorSvg from '../assets/sponser/logotext_poweredby_360w_bolt.svg';

const features = [
  {
    icon: Zap,
    title: 'AI-Generated Missions',
    description: 'Get personalized daily challenges powered by advanced AI to match your skill level and learning objectives.',
  },
  {
    icon: Target,
    title: 'Skills Matrix Tracking',
    description: 'Monitor your progress across multiple skills with detailed analytics and comprehensive level progression.',
  },
  {
    icon: TrendingUp,
    title: 'Advanced Analytics',
    description: 'Visualize your learning journey with comprehensive progress tracking, insights, and performance metrics.',
  },
  {
    icon: Trophy,
    title: 'Achievement System',
    description: 'Unlock badges and milestones as you complete missions and level up your skills in the gamified environment.',
  },
];

export const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#030712] relative overflow-hidden">
      {/* Enhanced cyberpunk grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1a103288_1px,transparent_1px),linear-gradient(to_bottom,#1a103288_1px,transparent_1px)] bg-[size:4rem_4rem]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_100%_200px,#2563eb10,transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_0%_800px,#0ea5e910,transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_100%_800px,#6366f110,transparent)]" />
      </div>

      {/* Animated scan lines */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,#0f172a88_50%)] bg-[length:100%_4px] animate-scan" />
      </div>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-4.0.3')] bg-cover bg-center opacity-5" />
        
        {/* Enhanced Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-blue-500/5 to-purple-500/5" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(56,189,248,0.1),transparent_50%)]" />
          
          {/* Floating Elements */}
          <div className="absolute top-20 left-20 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl animate-pulse-glow" />
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-blue-500/5 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-purple-500/5 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '2s' }} />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-8">
            <img src={logoSvg} alt="Questfy Logo" className="w-auto h-[18rem] mx-auto -mb-[6.5rem]" />
          </div>
            
          <p className="text-2xl md:text-3xl text-cyan-400 mb-8 max-w-3xl mx-auto animate-slide-up font-mono">
            Master Real-World Skills, One Mission at a Time
          </p>
            
          <p className="text-xl text-white/60 mb-12 max-w-2xl mx-auto animate-slide-up">
            Transform your learning journey with AI-powered daily missions tailored to your skill level. 
            Build expertise through practical challenges and track your progress in real-time.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
            <Button size="lg" className="text-lg px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 shadow-lg shadow-cyan-500/25 relative group overflow-hidden" asChild>
              <Link to="/signup">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/0 via-white/20 to-cyan-400/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                Initialize Agent
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
              
            <Button variant="secondary" size="lg" className="text-lg px-8 py-4 bg-gradient-to-r from-slate-800/50 to-blue-900/50 border-cyan-400/30 hover:bg-slate-700/50 relative group overflow-hidden" asChild>
              <Link to="/login">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/0 via-white/10 to-cyan-400/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                Agent Login
              </Link>
            </Button>
          </div>

          {/* Sponsor Badge */}
          <a href='https://bolt.new' target='_blank'>
          <img src={sponsorSvg} alt="Advanced Neural Systems" className="h-[3rem] mt-[2rem] w-auto mx-auto" />
          </a>

          {/* Scroll Indicator */}
          <div className="absolute -bottom-[4.5rem] left-[30rem] transform -translate-x-1/2 flex flex-col items-center animate-bounce">
            <p className="text-cyan-400 mb-2 font-mono text-sm">Scroll to Explore</p>
            <ChevronDown className="w-6 h-6 text-cyan-400" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              System Architecture
            </h2>
            <p className="text-xl text-cyan-400 max-w-2xl mx-auto font-mono">
              Our AI-powered platform creates personalized learning experiences that adapt to your progress.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} style={{animationDelay: `${index * 0.1}s`}}>
                <Card 
                  className="p-6 text-center group animate-fade-in bg-gradient-to-br from-slate-900/80 to-blue-950/80 border-2 border-cyan-400/20 hover:border-cyan-400/40 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-cyan-500/20 relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/0 via-white/5 to-cyan-400/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 relative">
                    <feature.icon className="w-6 h-6 text-white" />
                    <div className="absolute inset-0 bg-cyan-400/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-white/70">
                    {feature.description}
                  </p>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Card className="p-12 bg-gradient-to-br from-slate-900/80 to-purple-950/80 border-2 border-purple-400/30 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400/0 via-white/5 to-purple-400/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <div className="flex items-center justify-center gap-3 mb-6">
              <Cpu className="w-8 h-8 text-purple-400" />
              <h2 className="text-3xl md:text-4xl font-bold text-white">
                Ready to Initialize Your Agent?
              </h2>
            </div>
            <p className="text-xl text-white/70 mb-8 font-mono">
              Join thousands of agents who are mastering new skills with AI-powered missions.
            </p>
            <Button 
              size="lg" 
              className="text-lg px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 shadow-lg shadow-purple-500/25 relative group overflow-hidden" 
              asChild
            >
              <Link to="/signup">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400/0 via-white/20 to-purple-400/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                Begin Mission Protocol
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </Card>
        </div>
      </section>
    </div>
  );
};
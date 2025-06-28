import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Target, Zap, TrendingUp, Trophy, Shield, Activity, Star, Award, Cpu, Brain } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { useAuth } from '../../hooks/useAuth';
import { dbService } from '../../services/supabase';
import type { Skill, Quest, QuestCompletion } from '../../types';
import logoSvg from '../../assets/logo/logo.svg';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [completions, setCompletions] = useState<QuestCompletion[]>([]);
  const [agentStats, setAgentStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

      const [skillsResult, questsResult, completionsResult, statsResult] = await Promise.all([
        dbService.getSkills(user.id),
        dbService.getQuests(user.id),
        dbService.getQuestCompletions(user.id),
        dbService.calculateAgentStatistics(user.id),
      ]);

      if (skillsResult.data) setSkills(skillsResult.data);
      if (questsResult.data) setQuests(questsResult.data);
      if (completionsResult.data) setCompletions(completionsResult.data);
      if (statsResult.data) setAgentStats(statsResult.data);
      setLoading(false);
    };

    loadData();
  }, [user]);

  const totalXP = skills.reduce((sum, skill) => sum + skill.current_xp, 0);
  const averageLevel = skills.length > 0 ? skills.reduce((sum, skill) => sum + skill.level, 0) / skills.length : 0;
  const completedQuests = quests.filter(quest => quest.completed).length;
  const totalStreak = skills.reduce((sum, skill) => sum + skill.streak_days, 0);

  // Calculate weekly stats
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  
  const weeklyCompletions = completions.filter(completion => 
    new Date(completion.completed_at) > weekAgo
  ).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Enhanced Welcome Header */}
      <div className="text-center relative mb-12">
        {/* Enhanced background effects */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 via-purple-500/10 to-blue-500/10 rounded-2xl blur-xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(56,189,248,0.1),transparent_50%)]" />
          <div className="absolute inset-0 bg-[conic-gradient(from_0deg_at_50%_50%,rgba(56,189,248,0.05)_0deg,rgba(139,92,246,0.05)_120deg,rgba(14,165,233,0.05)_240deg)]" />
        </div>

        <div className="relative bg-gradient-to-br from-[#060a14]/95 via-[#0a0f1d]/90 to-[#060a14]/95 backdrop-blur-md border border-cyan-400/20 rounded-2xl overflow-hidden shadow-xl shadow-cyan-500/5">
          {/* Animated border effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 via-purple-500/20 to-blue-500/20 animate-border-flow" />
          
          {/* Floating particles with enhanced effects */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-gradient-to-r from-cyan-400/30 to-blue-400/30 rounded-full animate-float"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${i * 0.5}s`,
                  animationDuration: `${3 + Math.random() * 2}s`
                }}
              />
            ))}
          </div>
          
          {/* Enhanced hexagonal pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMjAgMEwzNC42NDEgMTBWMzBMMjAgNDBMNS4zNTkgMzBWMTBMMjAgMFoiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzBmMTcyYTIyIiBzdHJva2Utd2lkdGg9IjEiLz48L3N2Zz4=')] bg-[length:40px_40px] animate-pulse-slow" />
          </div>
          
          {/* Enhanced scan lines */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,#0f172a88_50%)] bg-[length:100%_4px] animate-scan" />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_50%,#0f172a44_50%)] bg-[length:4px_100%] animate-scan-horizontal" />
          </div>
          
          <div className="relative z-10 p-8">
            {/* Enhanced logo with glow effect */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 blur-3xl animate-pulse-slow" />
              <img src={logoSvg} alt="Questfy Logo" className="w-auto h-[15vh] mx-auto -mb-[2rem] relative z-10 drop-shadow-[0_0_15px_rgba(56,189,248,0.3)]" />
            </div>
            
            {agentStats && (
              <div className="text-center space-y-8">
                <div className="relative">
                  <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent animate-gradient-x">
                    Welcome back, {agentStats.agentName}
                  </h2>
                  <div className="mt-3 inline-flex items-center gap-2 px-6 py-2 bg-[#060a14] border border-cyan-400/30 rounded-full relative group overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/0 via-white/5 to-cyan-400/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"/>
                    <span className="text-cyan-400 font-mono text-sm tracking-wider relative z-10">NEURAL LINK ESTABLISHED</span>
                  </div>
                </div>

                {/* Enhanced Stats Display */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-2">
                  {/* Agent Level Card */}
                  <div className="bg-[#060a14]/80 backdrop-blur-sm border border-cyan-400/20 rounded-xl p-5 relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/0 via-white/5 to-cyan-400/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_50%_50%,rgba(56,189,248,0.1),transparent_70%)]" />
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs text-cyan-400/70 font-mono tracking-wider">AGENT LEVEL</span>
                        <Star className="w-5 h-5 text-yellow-400 animate-pulse-slow" />
                      </div>
                      <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-3xl font-bold text-yellow-400">{agentStats.agentLevel}</span>
                        <div className="flex items-center gap-1 text-yellow-400/70">
                          <span className="text-xs font-mono">NEXT</span>
                          <span className="text-sm font-bold">{agentStats.agentLevel + 1}</span>
                        </div>
                      </div>
                      <div className="h-1.5 bg-[#0a0f1d] rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full transition-all duration-500 relative group-hover:shadow-[0_0_10px_rgba(234,179,8,0.3)]"
                          style={{ width: `${(agentStats.totalXP % 500) / 5}%` }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Total XP Card */}
                  <div className="bg-[#060a14]/80 backdrop-blur-sm border border-blue-400/20 rounded-xl p-5 relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400/0 via-white/5 to-blue-400/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_50%_50%,rgba(96,165,250,0.1),transparent_70%)]" />
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs text-blue-400/70 font-mono tracking-wider">TOTAL XP</span>
                        <Award className="w-5 h-5 text-blue-400 animate-pulse-slow" />
                      </div>
                      <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-3xl font-bold text-blue-400">{totalXP}</span>
                        <span className="text-xs text-blue-400/70 font-mono">POINTS</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-[#0a0f1d] rounded-full overflow-hidden">
                          <div className="h-full w-full bg-gradient-to-r from-blue-400/20 to-blue-500/20 rounded-full animate-pulse-slow" />
                        </div>
                        <span className="text-xs text-blue-400/70 font-mono">+{agentStats.xpForNextLevel}</span>
                      </div>
                    </div>
                  </div>

                  {/* Mission Status Card */}
                  <div className="bg-[#060a14]/80 backdrop-blur-sm border border-purple-400/20 rounded-xl p-5 relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-400/0 via-white/5 to-purple-400/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_50%_50%,rgba(167,139,250,0.1),transparent_70%)]" />
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs text-purple-400/70 font-mono tracking-wider">MISSION STATUS</span>
                        <Activity className="w-5 h-5 text-purple-400 animate-pulse-slow" />
                      </div>
                      <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-3xl font-bold text-purple-400">{completedQuests}</span>
                        <span className="text-xs text-purple-400/70 font-mono">COMPLETED</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-purple-400/70 font-mono">THIS WEEK</span>
                        <div className="flex-1 h-1.5 bg-[#0a0f1d] rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-purple-400 to-pink-500 rounded-full transition-all duration-500"
                            style={{ width: `${(weeklyCompletions / 7) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-purple-400 font-mono font-bold">{weeklyCompletions}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enhanced System Status Indicators */}
                <div className="flex items-center justify-center gap-4 text-sm">
                  <div className="px-4 py-2 bg-[#060a14]/80 border border-green-400/20 rounded-full relative group overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-green-400/0 via-white/5 to-green-400/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    <div className="relative z-10 flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      <span className="font-mono text-green-400 tracking-wider">SYSTEM ONLINE</span>
                    </div>
                  </div>
                  <div className="px-4 py-2 bg-[#060a14]/80 border border-cyan-400/20 rounded-full relative group overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/0 via-white/5 to-cyan-400/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    <div className="relative z-10 flex items-center gap-2">
                      <Brain className="w-4 h-4 text-cyan-400" />
                      <span className="font-mono text-cyan-400 tracking-wider">AI READY</span>
                    </div>
                  </div>
                  <div className="px-4 py-2 bg-[#060a14]/80 border border-purple-400/20 rounded-full relative group overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-400/0 via-white/5 to-purple-400/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    <div className="relative z-10 flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-purple-400" />
                      <span className="font-mono text-purple-400 tracking-wider">MISSION CONTROL</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <Card className="p-6 bg-gradient-to-br from-[#060a14]/95 via-[#071527]/90 to-[#060a14]/95 border-2 border-blue-400/30 hover:border-blue-400/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-500/20 group" glass variant="cyan">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-white/70 text-sm font-mono">SKILLS MATRIX</p>
              <p className="text-2xl font-bold text-white">{skills.length}</p>
              <p className="text-blue-400 text-xs font-mono">Avg Level: {averageLevel.toFixed(1)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-[#060a14]/95 via-[#072517]/90 to-[#060a14]/95 border-2 border-green-400/30 hover:border-green-400/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-green-500/20 group" glass variant="green">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-white/70 text-sm font-mono">MISSIONS COMPLETED</p>
              <p className="text-2xl font-bold text-white">{completedQuests}</p>
              <p className="text-green-400 text-xs font-mono">This week: {weeklyCompletions}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-[#060a14]/95 via-[#251707]/90 to-[#060a14]/95 border-2 border-orange-400/30 hover:border-orange-400/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-orange-500/20 group" glass>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-white/70 text-sm font-mono">TOTAL EXPERIENCE</p>
              <p className="text-2xl font-bold text-white">{totalXP}</p>
              {agentStats && (
                <p className="text-orange-400 text-xs font-mono">{agentStats.xpForNextLevel} to next level</p>
              )}
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-[#060a14]/95 via-[#1a0725]/90 to-[#060a14]/95 border-2 border-purple-400/30 hover:border-purple-400/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/20 group" glass variant="purple">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-white/70 text-sm font-mono">ACTIVE STREAKS</p>
              <p className="text-2xl font-bold text-white">{totalStreak}</p>
              <p className="text-purple-400 text-xs font-mono">Total days</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Skills Overview */}
      <div className="grid lg:grid-cols-2 gap-8">
        <Card className="p-6 bg-gradient-to-br from-[#060a14]/95 via-[#071527]/90 to-[#060a14]/95 border-2 border-cyan-400/20 hover:border-cyan-400/30 transition-all duration-300 shadow-lg shadow-cyan-500/5" glass variant="cyan">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Target className="w-6 h-6 text-cyan-400" />
              Skills Matrix
            </h2>
            <Button size="sm" asChild className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 shadow-lg shadow-cyan-500/25">
              <Link to="/dashboard/skills">
                <Plus className="w-4 h-4 mr-2" />
                Register Skill
              </Link>
            </Button>
          </div>

          {skills.length === 0 ? (
            <div className="text-center py-8">
              <Target className="w-12 h-12 text-white/50 mx-auto mb-4" />
              <p className="text-white/70 mb-4 font-mono">No skills registered in system</p>
              <Button asChild className="bg-gradient-to-r from-cyan-500 to-blue-600">
                <Link to="/dashboard/skills">Initialize Skills Database</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {skills.slice(0, 3).map((skill) => (
                <div key={skill.id} className="p-4 rounded-xl bg-[#050810]/90 border border-cyan-400/20 hover:border-cyan-400/30 transition-all duration-300">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-white">{skill.name}</h3>
                      <p className="text-xs text-cyan-300 uppercase tracking-wide font-mono">{skill.category}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-xs rounded-full font-mono">
                        LVL {skill.level}
                      </span>
                      {skill.streak_days > 0 && (
                        <span className="px-2 py-1 bg-orange-500/20 text-orange-400 text-xs rounded-full font-mono">
                          {skill.streak_days}d
                        </span>
                      )}
                    </div>
                  </div>
                  <ProgressBar
                    value={skill.current_xp % 100}
                    max={100}
                    showLabel
                  />
                </div>
              ))}
              {skills.length > 3 && (
                <Link
                  to="/dashboard/skills"
                  className="block text-center text-cyan-400 hover:text-cyan-300 py-2 font-mono transition-colors duration-200"
                >
                  ACCESS ALL {skills.length} SKILLS →
                </Link>
              )}
            </div>
          )}
        </Card>

        {/* Recent Quests */}
        <Card className="p-6 bg-gradient-to-br from-[#060a14]/95 via-[#071527]/90 to-[#060a14]/95 border-2 border-purple-400/20 hover:border-purple-400/30 transition-all duration-300 shadow-lg shadow-purple-500/5" glass variant="purple">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Zap className="w-6 h-6 text-purple-400" />
              Active Missions
            </h2>
            <Button size="sm" asChild className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 shadow-lg shadow-purple-500/25">
              <Link to="/dashboard/quests">
                <Plus className="w-4 h-4 mr-2" />
                New Mission
              </Link>
            </Button>
          </div>

          {quests.length === 0 ? (
            <div className="text-center py-8">
              <Zap className="w-12 h-12 text-white/50 mx-auto mb-4" />
              <p className="text-white/70 mb-4 font-mono">No missions in database</p>
              <Button asChild className="bg-gradient-to-r from-purple-500 to-pink-600">
                <Link to="/dashboard/quests">Deploy First Mission</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {quests.slice(0, 3).map((quest) => (
                <div key={quest.id} className="p-4 rounded-xl bg-[#050810]/90 border border-purple-400/20 hover:border-purple-400/30 transition-all duration-300">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-white mb-1">{quest.title}</h3>
                      <p className="text-white/70 text-sm mb-2 line-clamp-2">{quest.description}</p>
                      <div className="flex items-center gap-2 text-xs flex-wrap">
                        {quest.skills && (
                          <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded font-mono">
                            {quest.skills.name}
                          </span>
                        )}
                        {quest.estimated_time && (
                          <span className="text-white/50 font-mono">
                            {quest.estimated_time}min
                          </span>
                        )}
                        <span className="text-cyan-400 font-mono">
                          +{quest.xp_reward} XP
                        </span>
                      </div>
                    </div>
                    <div className={`w-3 h-3 rounded-full ${quest.completed ? 'bg-green-500' : quest.status === 'accepted' ? 'bg-blue-500' : 'bg-gray-500'}`} />
                  </div>
                </div>
              ))}
              {quests.length > 3 && (
                <Link
                  to="/dashboard/quests"
                  className="block text-center text-purple-400 hover:text-purple-300 py-2 font-mono transition-colors duration-200"
                >
                  ACCESS ALL {quests.length} MISSIONS →
                </Link>
              )}
            </div>
          )}
        </Card>
      </div>

      {/* Recent Achievements */}
      {completions.length > 0 && (
        <Card className="p-6 bg-gradient-to-br from-[#060a14]/95 via-[#072517]/90 to-[#060a14]/95 border-2 border-green-400/20 hover:border-green-400/30 transition-all duration-300 shadow-lg shadow-green-500/5" glass variant="green">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-green-400" />
            Recent Achievements
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {completions.slice(0, 6).map((completion) => (
              <div key={completion.id} className="p-4 rounded-xl bg-[#050810]/90 border border-green-400/20 hover:border-green-400/30 transition-all duration-300 hover:scale-[1.02]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-white text-sm truncate">
                      {completion.quests?.title}
                    </h4>
                    <p className="text-green-300 text-xs font-mono">
                      +{completion.xp_gained} XP • {new Date(completion.completed_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
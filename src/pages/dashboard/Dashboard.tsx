import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Target, Zap, TrendingUp, Trophy, Shield, Activity, Star, Award, Cpu, Brain } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { useAuth } from '../../hooks/useAuth';
import { dbService } from '../../services/supabase';
import type { Skill, Quest, QuestCompletion } from '../../types';

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
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 via-purple-500/10 to-blue-500/10 rounded-2xl blur-xl" />
        <div className="relative bg-gradient-to-br from-[#060a14]/95 via-[#0a0f1d]/90 to-[#060a14]/95 backdrop-blur-md border-2 border-cyan-400/20 rounded-2xl p-8 overflow-hidden shadow-xl shadow-cyan-500/5">
          {/* Floating particles */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-4 left-8 w-2 h-2 bg-cyan-400/30 rounded-full animate-float" style={{ animationDelay: '0s' }} />
            <div className="absolute top-12 right-12 w-1 h-1 bg-purple-400/40 rounded-full animate-float" style={{ animationDelay: '1s' }} />
            <div className="absolute bottom-8 left-16 w-1 h-1 bg-blue-400/30 rounded-full animate-float" style={{ animationDelay: '2s' }} />
            <div className="absolute bottom-4 right-8 w-2 h-2 bg-cyan-400/20 rounded-full animate-float" style={{ animationDelay: '0.5s' }} />
          </div>
          
          {/* Hexagonal pattern background */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMjAgMEwzNC42NDEgMTBWMzBMMjAgNDBMNS4zNTkgMzBWMTBMMjAgMFoiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzBmMTcyYTIyIiBzdHJva2Utd2lkdGg9IjEiLz48L3N2Zz4=')] bg-[length:40px_40px]" />
          </div>
          
          {/* Animated scan line */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,#0f172a88_50%)] bg-[length:100%_4px] animate-scan" />
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center animate-pulse-glow relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-xl blur opacity-0 group-hover:opacity-50 transition-opacity duration-500" />
                <Shield className="w-10 h-10 text-white relative z-10" />
              </div>
              {agentStats && (
                <div className={`px-4 py-2 bg-[#050810] bg-opacity-95 border-2 border-${agentStats.rank.color.split(' ')[1].replace('from-', '')}/40 rounded-full relative group overflow-hidden shadow-md shadow-${agentStats.rank.color.split(' ')[1].replace('from-', '')}/20`}>
                  <div className={`absolute inset-0 bg-gradient-to-r ${agentStats.rank.color} opacity-10 group-hover:opacity-20 -translate-x-full group-hover:translate-x-full transition-all duration-1000`} />
                  <span className={`text-sm font-bold bg-gradient-to-r ${agentStats.rank.color} bg-clip-text text-transparent`}>
                    {agentStats.rank.name}
                  </span>
                </div>
              )}
            </div>
            
            <div className="relative mb-6">
              <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent mb-2 relative z-10">
                Welcome back, Agent {user?.user_metadata?.name || 'Operative'}
              </h1>
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 via-blue-500/20 to-purple-500/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-lg text-white/70 mb-6">
              <div className="flex items-center justify-center gap-2 bg-[#060a14]/80 border border-green-400/20 rounded-xl p-3 relative group overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-green-400/0 via-white/5 to-green-400/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                <span className="font-mono relative z-10">SYSTEM ONLINE</span>
              </div>
              
              <div className="flex items-center justify-center gap-2 bg-[#060a14]/80 border border-cyan-400/20 rounded-xl p-3 relative group overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/0 via-white/5 to-cyan-400/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <Brain className="w-5 h-5 text-cyan-400" />
                <span className="font-mono relative z-10">AI READY</span>
              </div>
              
              <div className="flex items-center justify-center gap-2 bg-[#060a14]/80 border border-purple-400/20 rounded-xl p-3 relative group overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400/0 via-white/5 to-purple-400/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <Cpu className="w-5 h-5 text-purple-400" />
                <span className="font-mono relative z-10">MISSION CONTROL ACTIVE</span>
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-4 text-xl text-white/80 font-mono">
              <div className="flex items-center gap-2">
                <span className="text-cyan-400">Ready for next mission deployment</span>
                <span className="w-2 h-2 bg-cyan-400 rounded-full animate-ping" />
              </div>
              <div className="w-px h-6 bg-white/20" />
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400" />
                <span className="font-bold bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">Level {agentStats ? agentStats.agentLevel : '1'}</span>
              </div>
              <div className="w-px h-6 bg-white/20" />
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-400" />
                <span className="font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">{totalXP} Total XP</span>
              </div>
            </div>
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
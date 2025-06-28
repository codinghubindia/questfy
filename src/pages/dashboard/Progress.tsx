import React, { useState, useEffect } from 'react';
import { TrendingUp, Target, Zap, Calendar, Trophy, Award, Activity, BarChart3 } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { useAuth } from '../../hooks/useAuth';
import { dbService } from '../../services/supabase';
import type { Skill, Quest, QuestCompletion } from '../../types';

export const Progress: React.FC = () => {
  const { user } = useAuth();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [completions, setCompletions] = useState<QuestCompletion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

      const [skillsResult, questsResult, completionsResult] = await Promise.all([
        dbService.getSkills(user.id),
        dbService.getQuests(user.id),
        dbService.getQuestCompletions(user.id),
      ]);

      if (skillsResult.data) setSkills(skillsResult.data);
      if (questsResult.data) setQuests(questsResult.data);
      if (completionsResult.data) setCompletions(completionsResult.data);
      setLoading(false);
    };

    loadData();
  }, [user]);

  const completedQuests = quests.filter(quest => quest.completed);
  const totalExperience = skills.reduce((sum, skill) => sum + skill.current_xp, 0);
  const averageLevel = skills.length > 0 ? skills.reduce((sum, skill) => sum + skill.level, 0) / skills.length : 0;
  const totalStreak = skills.reduce((sum, skill) => sum + skill.streak_days, 0);

  // Calculate weekly stats
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  
  const weeklyCompletions = completions.filter(completion => 
    new Date(completion.completed_at) > weekAgo
  ).length;

  const weeklyXP = completions
    .filter(completion => new Date(completion.completed_at) > weekAgo)
    .reduce((sum, completion) => sum + completion.xp_gained, 0);

  // Calculate monthly stats
  const monthAgo = new Date();
  monthAgo.setMonth(monthAgo.getMonth() - 1);
  
  const monthlyCompletions = completions.filter(completion => 
    new Date(completion.completed_at) > monthAgo
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
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2">
          Analytics Dashboard
        </h1>
        <p className="text-white/70 text-lg">Comprehensive analysis of your learning journey and skill development</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 bg-gradient-to-br from-slate-900/80 to-blue-900/80 border-2 border-blue-400/30 hover:border-blue-400/50 transition-all duration-300">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white/70 text-sm font-mono">SKILLS REGISTERED</p>
              <p className="text-2xl font-bold text-white">{skills.length}</p>
            </div>
          </div>
          <p className="text-white/50 text-xs font-mono">
            Avg Level: {averageLevel.toFixed(1)}
          </p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-slate-900/80 to-green-900/80 border-2 border-green-400/30 hover:border-green-400/50 transition-all duration-300">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white/70 text-sm font-mono">MISSIONS COMPLETED</p>
              <p className="text-2xl font-bold text-white">{completedQuests.length}</p>
            </div>
          </div>
          <p className="text-white/50 text-xs font-mono">
            This week: {weeklyCompletions}
          </p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-slate-900/80 to-orange-900/80 border-2 border-orange-400/30 hover:border-orange-400/50 transition-all duration-300">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white/70 text-sm font-mono">TOTAL EXPERIENCE</p>
              <p className="text-2xl font-bold text-white">{totalExperience}</p>
            </div>
          </div>
          <p className="text-white/50 text-xs font-mono">
            This week: +{weeklyXP} XP
          </p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-slate-900/80 to-purple-900/80 border-2 border-purple-400/30 hover:border-purple-400/50 transition-all duration-300">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Award className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white/70 text-sm font-mono">TOTAL STREAKS</p>
              <p className="text-2xl font-bold text-white">{totalStreak}</p>
            </div>
          </div>
          <p className="text-white/50 text-xs font-mono">
            Days practicing
          </p>
        </Card>
      </div>

      {/* Skills Progress */}
      <Card className="p-6 bg-gradient-to-br from-slate-900/80 to-blue-950/80 border-2 border-cyan-400/20">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-cyan-400" />
          Skills Progress Matrix
        </h2>
        
        {skills.length === 0 ? (
          <div className="text-center py-8">
            <Target className="w-12 h-12 text-white/50 mx-auto mb-4" />
            <p className="text-white/70 font-mono">No skills registered in system</p>
          </div>
        ) : (
          <div className="space-y-6">
            {skills.map((skill) => (
              <div key={skill.id} className="p-4 rounded-xl bg-gradient-to-r from-slate-800/60 to-cyan-900/30 border border-cyan-400/20">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{skill.name}</h3>
                    <p className="text-sm text-cyan-300 uppercase tracking-wide font-mono">{skill.category}</p>
                  </div>
                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <p className="text-white/70 text-sm font-mono">{skill.current_xp} XP</p>
                      {skill.streak_days > 0 && (
                        <p className="text-orange-400 text-xs font-mono">{skill.streak_days} day streak</p>
                      )}
                    </div>
                    <span className="px-3 py-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-sm rounded-full font-mono">
                      LVL {skill.level}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-white/70 font-mono">
                    <span>Progress to Level {skill.level + 1}</span>
                    <span>{skill.current_xp % 100}/100 XP</span>
                  </div>
                  <ProgressBar
                    value={skill.current_xp % 100}
                    max={100}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Recent Activity */}
      <Card className="p-6 bg-gradient-to-br from-slate-900/80 to-green-950/80 border-2 border-green-400/20">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <Activity className="w-6 h-6 text-green-400" />
          Recent Mission Completions
        </h2>
        
        {completions.length === 0 ? (
          <div className="text-center py-8">
            <Zap className="w-12 h-12 text-white/50 mx-auto mb-4" />
            <p className="text-white/70 font-mono">No completed missions in database</p>
          </div>
        ) : (
          <div className="space-y-4">
            {completions.slice(0, 10).map((completion) => (
              <div key={completion.id} className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-slate-800/60 to-green-900/30 border border-green-400/20">
                <div className="flex items-center gap-3">
                  <Trophy className="w-8 h-8 text-yellow-400" />
                  <div>
                    <h3 className="font-semibold text-white">{completion.quests?.title}</h3>
                    <p className="text-green-300 text-sm font-mono">
                      {completion.quests?.skills?.name}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white/70 text-sm font-mono">
                    {new Date(completion.completed_at).toLocaleDateString()}
                  </p>
                  <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded font-mono">
                    +{completion.xp_gained} XP
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
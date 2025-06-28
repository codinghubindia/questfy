import React, { useState, useEffect } from 'react';
import { Zap, Clock, CheckCircle, Plus, Target, AlertCircle, ChevronDown, Bell, Filter, Search } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { QuestCard } from '../../components/ui/QuestCard';
import { Notification } from '../../components/ui/Notification';
import { useNotification } from '../../hooks/useNotification';
import { useAuth } from '../../hooks/useAuth';
import { dbService } from '../../services/supabase';
import { geminiService } from '../../services/gemini';
import type { Quest, Skill } from '../../types';

export const Quests: React.FC = () => {
  const { user } = useAuth();
  const [quests, setQuests] = useState<Quest[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showSkillSelector, setShowSkillSelector] = useState(false);
  const [processingQuest, setProcessingQuest] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'accepted' | 'completed'>('all');
  const { notification, isVisible, showNotification, hideNotification } = useNotification();

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

      const [questsResult, skillsResult] = await Promise.all([
        dbService.getQuests(user.id),
        dbService.getSkills(user.id),
      ]);

      if (questsResult.data) setQuests(questsResult.data);
      if (skillsResult.data) setSkills(skillsResult.data);
      setLoading(false);
    };

    loadData();
  }, [user]);

  const generateQuest = async (skill: Skill) => {
    if (!user) return;

    setGenerating(true);
    setShowSkillSelector(false);

    try {
      // Determine difficulty based on skill level
      let difficulty: 'beginner' | 'intermediate' | 'advanced' = 'beginner';
      if (skill.level >= 5) difficulty = 'intermediate';
      if (skill.level >= 10) difficulty = 'advanced';

      const { data: questData, error } = await geminiService.generateQuest({
        skillName: skill.name,
        skillLevel: skill.level,
        difficulty,
        category: skill.category,
      });

      if (questData && !error) {
        // Determine XP reward based on difficulty
        const xpReward = difficulty === 'beginner' ? 10 : difficulty === 'intermediate' ? 20 : 30;

        const newQuest = {
          user_id: user.id,
          skill_id: skill.id,
          title: questData.title,
          description: questData.description,
          estimated_time: questData.estimated_time,
          is_urgent: false,
          is_important: true,
          completed: false,
          xp_reward: xpReward,
          status: 'pending' as const,
        };

        const { data } = await dbService.createQuest(newQuest);
        if (data) {
          // Add skill info to the quest for display
          const questWithSkill = {
            ...data,
            skills: {
              name: skill.name,
              category: skill.category
            }
          };
          setQuests([questWithSkill, ...quests]);

          // Show notification
          showNotification({
            type: 'success',
            title: 'Mission Generated!',
            message: `New ${difficulty} mission for ${skill.name} is ready. Accept it to begin your challenge!`,
          });
        }
      }
    } catch (error) {
      console.error('Error generating quest:', error);
      showNotification({
        type: 'error',
        title: 'Generation Failed',
        message: 'Failed to generate mission. Please try again.',
      });
    }

    setGenerating(false);
  };

  const acceptQuest = async (questId: string) => {
    setProcessingQuest(questId);
    try {
      await dbService.updateQuest(questId, { status: 'accepted' });
      setQuests(quests.map(q => 
        q.id === questId ? { ...q, status: 'accepted' } : q
      ));
      
      showNotification({
        type: 'success',
        title: 'Mission Accepted!',
        message: 'You have accepted the mission. Complete it to earn XP and level up!',
      });
    } catch (error) {
      console.error('Error accepting quest:', error);
    }
    setProcessingQuest(null);
  };

  const rejectQuest = async (questId: string) => {
    setProcessingQuest(questId);
    try {
      await dbService.updateQuest(questId, { status: 'rejected' });
      setQuests(quests.map(q => 
        q.id === questId ? { ...q, status: 'rejected' } : q
      ));
      
      showNotification({
        type: 'info',
        title: 'Mission Rejected',
        message: 'Mission has been rejected. Generate a new one when you\'re ready!',
      });
    } catch (error) {
      console.error('Error rejecting quest:', error);
    }
    setProcessingQuest(null);
  };

  const completeQuest = async (questId: string) => {
    const quest = quests.find(q => q.id === questId);
    if (!quest) return;

    setProcessingQuest(questId);
    try {
      // Mark quest as completed
      await dbService.completeQuest(questId);
      
      // Update quest in state
      setQuests(quests.map(q => 
        q.id === questId 
          ? { ...q, completed: true, completed_at: new Date().toISOString() }
          : q
      ));

      // Add experience to the skill
      if (quest.skill_id) {
        const skill = skills.find(s => s.id === quest.skill_id);
        if (skill) {
          const newXP = skill.current_xp + quest.xp_reward;
          const newLevel = Math.floor(newXP / 100) + 1;

          await dbService.updateSkill(skill.id, {
            current_xp: newXP,
            level: newLevel,
            last_practiced: new Date().toISOString(),
          });

          // Update skill in state
          setSkills(skills.map(s => 
            s.id === skill.id 
              ? { ...s, current_xp: newXP, level: newLevel }
              : s
          ));

          showNotification({
            type: 'success',
            title: 'Mission Completed!',
            message: `Congratulations! You earned ${quest.xp_reward} XP${newLevel > skill.level ? ` and leveled up to ${newLevel}!` : '!'}`,
          });
        }
      }
    } catch (error) {
      console.error('Error completing quest:', error);
    }
    setProcessingQuest(null);
  };

  // Filter quests based on search and status
  const filteredQuests = quests.filter(quest => {
    const matchesSearch = quest.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quest.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quest.skills?.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'pending' && quest.status === 'pending') ||
                         (filterStatus === 'accepted' && quest.status === 'accepted' && !quest.completed) ||
                         (filterStatus === 'completed' && quest.completed);
    
    return matchesSearch && matchesStatus;
  });

  const getQuestStats = () => {
    const pending = quests.filter(q => q.status === 'pending').length;
    const accepted = quests.filter(q => q.status === 'accepted' && !q.completed).length;
    const completed = quests.filter(q => q.completed).length;
    const rejected = quests.filter(q => q.status === 'rejected').length;
    
    return { pending, accepted, completed, rejected };
  };

  const stats = getQuestStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-full">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2 break-words">
            Mission Control
          </h1>
          <p className="text-white/70 text-sm sm:text-base lg:text-lg">AI-generated challenges to level up your skills</p>
        </div>
        <div className="relative w-full">
          <Button 
            onClick={() => setShowSkillSelector(!showSkillSelector)}
            loading={generating}
            disabled={skills.length === 0}
            className="w-full sm:w-auto bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 shadow-lg shadow-cyan-500/25"
          >
            <Zap className="w-4 h-4 mr-2" />
            Generate Mission
            <ChevronDown className="w-4 h-4 ml-2" />
          </Button>
        </div>

        {/* Skill Selector Panel - Now below the button */}
        {showSkillSelector && skills.length > 0 && (
          <Card className="w-full mt-4 bg-gradient-to-br from-[#060a14]/95 via-[#071527]/90 to-[#060a14]/95 border-2 border-cyan-400/30 shadow-2xl shadow-cyan-500/20" glass variant="cyan">
            <div className="p-4">
              <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                <Target className="w-4 h-4 text-cyan-400" />
                Select Target Skill for Mission Generation
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-80 overflow-y-auto">
                {skills.map((skill) => (
                  <button
                    key={skill.id}
                    onClick={() => generateQuest(skill)}
                    disabled={generating}
                    className="text-left p-3 rounded-lg bg-[#050810]/90 hover:bg-[#050810] border border-white/10 transition-all duration-200 disabled:opacity-50 hover:border-cyan-400/30"
                  >
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-white font-medium truncate">{skill.name}</p>
                        <p className="text-cyan-300 text-sm truncate">{skill.category}</p>
                      </div>
                      <div className="text-right ml-2 flex-shrink-0">
                        <span className="px-2 py-1 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/30 text-cyan-300 text-xs rounded-full">
                          Level {skill.level}
                        </span>
                        <p className="text-white/50 text-xs mt-1">{skill.current_xp} XP</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Mission Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-3 sm:p-4 bg-gradient-to-br from-slate-950/90 to-blue-950/90 border-2 border-blue-400/20">
          <div className="text-center">
            <p className="text-xl sm:text-2xl font-bold text-blue-400">{stats.pending}</p>
            <p className="text-white/70 text-xs sm:text-sm font-mono">PENDING</p>
          </div>
        </Card>
        <Card className="p-3 sm:p-4 bg-gradient-to-br from-slate-950/90 to-orange-950/90 border-2 border-orange-400/20">
          <div className="text-center">
            <p className="text-xl sm:text-2xl font-bold text-orange-400">{stats.accepted}</p>
            <p className="text-white/70 text-xs sm:text-sm font-mono">ACTIVE</p>
          </div>
        </Card>
        <Card className="p-3 sm:p-4 bg-gradient-to-br from-slate-950/90 to-green-950/90 border-2 border-green-400/20">
          <div className="text-center">
            <p className="text-xl sm:text-2xl font-bold text-green-400">{stats.completed}</p>
            <p className="text-white/70 text-xs sm:text-sm font-mono">COMPLETED</p>
          </div>
        </Card>
        <Card className="p-3 sm:p-4 bg-gradient-to-br from-slate-950/90 to-red-950/90 border-2 border-red-400/20">
          <div className="text-center">
            <p className="text-xl sm:text-2xl font-bold text-red-400">{stats.rejected}</p>
            <p className="text-white/70 text-xs sm:text-sm font-mono">REJECTED</p>
          </div>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search missions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<Search className="w-5 h-5 text-gray-400" />}
            className="bg-slate-800/50 border-cyan-400/30 text-white placeholder-white/50"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as any)}
          className="px-4 py-3 rounded-xl border border-cyan-400/30 bg-slate-800/50 text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-sm sm:text-base"
        >
          <option value="all">All Missions</option>
          <option value="pending">Pending</option>
          <option value="accepted">Active</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* No Skills Warning */}
      {skills.length === 0 && (
        <Card className="p-6 sm:p-8 bg-gradient-to-br from-red-500/20 to-pink-500/20 border-2 border-red-500/30">
          <div className="text-center">
            <Target className="w-12 h-12 sm:w-16 sm:h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl sm:text-2xl font-semibold text-white mb-2">Initialize Skills Database</h2>
            <p className="text-white/70 mb-6 text-sm sm:text-base">
              You need to register skills before generating missions.
            </p>
            <Button 
              asChild
              className="w-full sm:w-auto bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700"
            >
              <a href="/dashboard/skills">Initialize Skills</a>
            </Button>
          </div>
        </Card>
      )}

      {/* Quests List */}
      {filteredQuests.length === 0 && skills.length > 0 ? (
        <Card className="p-8 sm:p-12 text-center bg-gradient-to-br from-purple-500/20 to-blue-500/20 border-2 border-purple-500/30">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Zap className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-4">
            {searchTerm || filterStatus !== 'all' ? 'No Missions Found' : 'Mission Database Empty'}
          </h2>
          <p className="text-white/70 mb-8 text-base sm:text-lg">
            {searchTerm || filterStatus !== 'all' 
              ? 'Try adjusting your search or filter criteria.'
              : 'Generate your first AI-powered mission and start building your skills!'
            }
          </p>
          {!searchTerm && filterStatus === 'all' && (
            <Button 
              onClick={() => setShowSkillSelector(true)} 
              loading={generating} 
              size="lg"
              disabled={skills.length === 0}
              className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 shadow-lg shadow-purple-500/25"
            >
              <Zap className="w-5 h-5 mr-2" />
              Generate First Mission
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-4 sm:space-y-6">
          {filteredQuests.map((quest) => (
            <QuestCard
              key={quest.id}
              quest={quest}
              onAccept={acceptQuest}
              onReject={rejectQuest}
              onComplete={completeQuest}
              isProcessing={processingQuest === quest.id}
            />
          ))}
        </div>
      )}

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
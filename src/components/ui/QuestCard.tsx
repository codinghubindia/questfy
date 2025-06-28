import React from 'react';
import { Clock, Target, CheckCircle, Check, X, Zap, Star, AlertTriangle } from 'lucide-react';
import { Card } from './Card';
import { Button } from './Button';
import type { Quest } from '../../types';

interface QuestCardProps {
  quest: Quest;
  onAccept: (questId: string) => void;
  onReject: (questId: string) => void;
  onComplete: (questId: string) => void;
  isProcessing?: boolean;
}

export const QuestCard: React.FC<QuestCardProps> = ({
  quest,
  onAccept,
  onReject,
  onComplete,
  isProcessing = false,
}) => {
  const getUrgencyIcon = () => {
    if (quest.is_urgent && quest.is_important) {
      return <AlertTriangle className="w-4 h-4 text-red-400" />;
    }
    if (quest.is_important) {
      return <Star className="w-4 h-4 text-yellow-400" />;
    }
    return null;
  };

  const getStatusDesign = () => {
    if (quest.completed) {
      return {
        gradient: 'from-[#060a14]/95 via-[#072517]/90 to-[#060a14]/95',
        border: 'border-emerald-400/30',
        glow: 'shadow-emerald-500/15',
        accent: 'from-emerald-400 to-green-500'
      };
    }
    if (quest.status === 'accepted') {
      return {
        gradient: 'from-[#060a14]/95 via-[#071527]/90 to-[#060a14]/95',
        border: 'border-cyan-400/30',
        glow: 'shadow-cyan-500/15',
        accent: 'from-cyan-400 to-blue-500'
      };
    }
    if (quest.status === 'rejected') {
      return {
        gradient: 'from-[#060a14]/95 via-[#170707]/90 to-[#060a14]/95',
        border: 'border-red-400/30',
        glow: 'shadow-red-500/15',
        accent: 'from-red-400 to-pink-500'
      };
    }
    return {
      gradient: 'from-[#060a14]/95 via-[#1a0725]/90 to-[#060a14]/95',
      border: 'border-purple-400/30',
      glow: 'shadow-purple-500/15',
      accent: 'from-purple-400 to-blue-500'
    };
  };

  const statusDesign = getStatusDesign();

  return (
    <div className="relative group">
      {/* Animated background glow */}
      <div className={`absolute -inset-1 bg-gradient-to-r ${statusDesign.accent} rounded-2xl blur opacity-10 group-hover:opacity-25 transition duration-300`} />
      
      <Card 
        className={`relative p-4 sm:p-6 bg-gradient-to-br ${statusDesign.gradient} backdrop-blur-md border-2 ${statusDesign.border} transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl ${statusDesign.glow} w-full max-w-full overflow-hidden`}
        glass
        variant={
          quest.completed ? 'green' : 
          quest.status === 'accepted' ? 'cyan' : 
          quest.status === 'rejected' ? 'default' : 'purple'
        }
      >
        {/* Floating particles effect */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
          <div className="absolute top-4 left-6 w-1 h-1 bg-cyan-400/40 rounded-full animate-float opacity-40" style={{ animationDelay: '0s' }} />
          <div className="absolute top-8 right-8 w-1 h-1 bg-purple-400/40 rounded-full animate-float opacity-40" style={{ animationDelay: '1s' }} />
          <div className="absolute bottom-6 left-12 w-1 h-1 bg-blue-400/40 rounded-full animate-float opacity-40" style={{ animationDelay: '2s' }} />
          <div className="absolute bottom-4 right-6 w-1 h-1 bg-cyan-400/40 rounded-full animate-float opacity-40" style={{ animationDelay: '0.5s' }} />
        </div>

        {/* Hexagonal pattern background */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMjAgMEwzNC42NDEgMTBWMzBMMjAgNDBMNS4zNTkgMzBWMTBMMjAgMFoiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzBmMTcyYTIyIiBzdHJva2Utd2lkdGg9IjEiLz48L3N2Zz4=')] bg-[length:40px_40px]" />
        </div>

        {/* Status indicator line */}
        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${statusDesign.accent} opacity-60`} />
        
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 sm:gap-3 mb-3 flex-wrap">
                <div className={`w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r ${statusDesign.accent} rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg`}>
                  <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white break-words flex-1 leading-tight">{quest.title}</h3>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {getUrgencyIcon()}
                  {quest.completed && (
                    <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              </div>
              
              <p className="text-white/80 mb-4 leading-relaxed text-sm sm:text-base break-words">{quest.description}</p>
              
              <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm flex-wrap">
                {quest.skills && (
                  <div className="flex items-center gap-2 min-w-0 bg-[#050810]/90 backdrop-blur-sm px-3 py-1 rounded-full border border-white/10">
                    <Target className="w-3 h-3 sm:w-4 sm:h-4 text-cyan-400 flex-shrink-0" />
                    <span className="text-cyan-300 font-medium truncate">{quest.skills.name}</span>
                  </div>
                )}
                {quest.estimated_time && (
                  <div className="flex items-center gap-1 text-white/70 bg-[#050810]/90 px-2 py-1 rounded-full border border-white/5">
                    <Clock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span>{quest.estimated_time}min</span>
                  </div>
                )}
                <div className={`px-3 py-1 bg-gradient-to-r ${statusDesign.accent} bg-opacity-20 border border-current text-white rounded-full text-xs font-bold shadow-lg`}>
                  +{quest.xp_reward} XP
                </div>
                {quest.deadline && (
                  <span className="text-white/50 text-xs bg-[#050810]/90 px-2 py-1 rounded-full border border-white/5">
                    Due: {new Date(quest.deadline).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            {quest.status === 'pending' && (
              <div className="flex gap-2 sm:gap-3 flex-wrap w-full sm:w-auto">
                <Button
                  onClick={() => onAccept(quest.id)}
                  disabled={isProcessing}
                  size="sm"
                  className="flex-1 sm:flex-none bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg shadow-green-500/25 border-0"
                >
                  <Check className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="text-xs sm:text-sm font-medium">Accept</span>
                </Button>
                <Button
                  onClick={() => onReject(quest.id)}
                  disabled={isProcessing}
                  size="sm"
                  className="flex-1 sm:flex-none bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-400/40 text-red-300 hover:bg-red-500/30 hover:border-red-400/60 backdrop-blur-sm"
                >
                  <X className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="text-xs sm:text-sm font-medium">Reject</span>
                </Button>
              </div>
            )}

            {quest.status === 'accepted' && !quest.completed && (
              <Button
                onClick={() => onComplete(quest.id)}
                disabled={isProcessing}
                size="sm"
                className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-lg shadow-blue-500/25 border-0"
              >
                <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="text-xs sm:text-sm font-medium">Mark Complete</span>
              </Button>
            )}

            {quest.status === 'rejected' && (
              <div className="flex items-center gap-2 text-red-400 text-xs sm:text-sm font-medium w-full justify-center bg-[#050810]/90 py-2 px-4 rounded-lg border border-red-500/20">
                <X className="w-4 h-4" />
                <span>Mission Rejected</span>
              </div>
            )}

            {quest.completed && (
              <div className="flex items-center gap-2 text-green-400 text-xs sm:text-sm font-medium w-full justify-between sm:justify-start bg-[#050810]/90 py-2 px-4 rounded-lg border border-green-500/20">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-3 h-3 text-white" />
                  </div>
                  <span className="font-medium">Mission Completed</span>
                </div>
                {quest.completed_at && (
                  <span className="text-white/40 text-xs">
                    {new Date(quest.completed_at).toLocaleDateString()}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};
import React, { useState, useEffect } from 'react';
import { User, Mail, Shield, Trash2, Save, Settings as SettingsIcon, Database, Cpu, AlertTriangle, Trophy, Target, Zap, TrendingUp, Star, Award, Activity, UserX } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Notification } from '../../components/ui/Notification';
import { useNotification } from '../../hooks/useNotification';
import { useAuth } from '../../hooks/useAuth';
import { dbService } from '../../services/supabase';
import type { Profile } from '../../types';

export const Settings: React.FC = () => {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [agentStats, setAgentStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });
  const { notification, isVisible, showNotification, hideNotification } = useNotification();

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

      const [profileResult, statsResult] = await Promise.all([
        dbService.getProfile(user.id),
        dbService.calculateAgentStatistics(user.id)
      ]);

      if (profileResult.data) {
        setProfile(profileResult.data);
        setFormData({
          name: profileResult.data.name || '',
          email: profileResult.data.email || '',
        });
      } else {
        // Use auth data if profile doesn't exist
        setFormData({
          name: user.user_metadata?.name || '',
          email: user.email || '',
        });
      }

      if (statsResult.data) {
        setAgentStats(statsResult.data);
      }

      setLoading(false);
    };

    loadData();
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    try {
      const { data } = await dbService.updateProfile(user.id, {
        name: formData.name,
        email: formData.email,
      });
      
      if (data) {
        setProfile(data);
        showNotification({
          type: 'success',
          title: 'Profile Updated',
          message: 'Your agent profile has been successfully updated.',
        });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      showNotification({
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to update profile. Please try again.',
      });
    }
    setSaving(false);
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    
    if (deleteConfirmText !== 'DELETE') {
      showNotification({
        type: 'error',
        title: 'Confirmation Required',
        message: 'Please type "DELETE" to confirm complete account deletion.',
      });
      return;
    }

    setDeleting(true);
    try {
      // Delete all user data AND the authentication user
      const { error } = await dbService.deleteUserAccount(user.id);
      
      if (error) {
        // Check if it's a partial success (data deleted but auth user remains)
        if (error.message?.includes('Data deleted successfully')) {
          showNotification({
            type: 'warning',
            title: 'Partial Deletion Complete',
            message: 'Your data has been deleted, but you may need to contact support to fully remove your account. Signing out...',
          });
        } else {
          throw error;
        }
      } else {
        showNotification({
          type: 'success',
          title: 'Account Completely Terminated',
          message: 'Your agent profile and authentication account have been permanently deleted. Redirecting...',
        });
      }

      // Sign out after a delay regardless of partial or complete success
      setTimeout(async () => {
        await signOut();
        // Force redirect to home page
        window.location.href = '/';
      }, 3000);
    } catch (error) {
      console.error('Error deleting account:', error);
      showNotification({
        type: 'error',
        title: 'Termination Failed',
        message: 'Failed to terminate agent profile. Please contact support for manual deletion.',
      });
    }
    setDeleting(false);
  };

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
          System Configuration
        </h1>
        <p className="text-white/70 text-lg">Manage your account parameters and system preferences</p>
      </div>

      {/* Agent Statistics Dashboard */}
      {agentStats && (
        <Card className="p-6 bg-gradient-to-br from-slate-950/80 to-purple-950/80 border-2 border-purple-400/20">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-white">Agent Performance Matrix</h2>
          </div>

          {/* Agent Rank and Level */}
          <div className="mb-6 p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className={`text-lg font-bold bg-gradient-to-r ${agentStats.rank.color} bg-clip-text text-transparent`}>
                  {agentStats.rank.name}
                </h3>
                <p className="text-white/70 text-sm font-mono">Classification Level {agentStats.agentLevel}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-white">{agentStats.totalXP}</p>
                <p className="text-white/70 text-sm font-mono">Total XP</p>
              </div>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div 
                className={`h-2 bg-gradient-to-r ${agentStats.rank.color} rounded-full transition-all duration-300`}
                style={{ width: `${Math.min(((agentStats.agentLevel * 500 - agentStats.xpForNextLevel) / (agentStats.agentLevel * 500)) * 100, 100)}%` }}
              />
            </div>
            <p className="text-white/60 text-xs mt-1 font-mono">
              {agentStats.xpForNextLevel} XP to Level {agentStats.agentLevel + 1}
            </p>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-blue-400" />
                <span className="text-blue-300 text-sm font-mono">SKILLS</span>
              </div>
              <p className="text-xl font-bold text-white">{agentStats.skillCount}</p>
              <p className="text-white/60 text-xs">Avg Level: {agentStats.averageSkillLevel}</p>
            </div>

            <div className="p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-green-400" />
                <span className="text-green-300 text-sm font-mono">MISSIONS</span>
              </div>
              <p className="text-xl font-bold text-white">{agentStats.completedQuests}/{agentStats.questCount}</p>
              <p className="text-white/60 text-xs">{agentStats.completionRate}% Success Rate</p>
            </div>

            <div className="p-4 bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-orange-400" />
                <span className="text-orange-300 text-sm font-mono">STREAK</span>
              </div>
              <p className="text-xl font-bold text-white">{agentStats.totalStreak}</p>
              <p className="text-white/60 text-xs">Total Days</p>
            </div>

            <div className="p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-purple-400" />
                <span className="text-purple-300 text-sm font-mono">EFFICIENCY</span>
              </div>
              <p className="text-xl font-bold text-white">{agentStats.efficiency}</p>
              <p className="text-white/60 text-xs">XP per Mission</p>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gradient-to-r from-slate-800/60 to-blue-900/30 rounded-lg border border-blue-400/20">
              <h4 className="text-blue-300 font-medium mb-2 flex items-center gap-2">
                <Star className="w-4 h-4" />
                Weekly Performance
              </h4>
              <div className="space-y-1 text-sm font-mono">
                <p className="text-white/70">Missions: <span className="text-blue-400 font-medium">{agentStats.weeklyCompletions}</span></p>
                <p className="text-white/70">XP Gained: <span className="text-blue-400 font-medium">{agentStats.weeklyXP}</span></p>
              </div>
            </div>

            <div className="p-4 bg-gradient-to-r from-slate-800/60 to-green-900/30 rounded-lg border border-green-400/20">
              <h4 className="text-green-300 font-medium mb-2 flex items-center gap-2">
                <Award className="w-4 h-4" />
                Monthly Performance
              </h4>
              <div className="space-y-1 text-sm font-mono">
                <p className="text-white/70">Missions: <span className="text-green-400 font-medium">{agentStats.monthlyCompletions}</span></p>
                <p className="text-white/70">XP Gained: <span className="text-green-400 font-medium">{agentStats.monthlyXP}</span></p>
              </div>
            </div>
          </div>

          {/* Agent Timeline */}
          <div className="mt-6 p-4 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-lg">
            <h4 className="text-cyan-300 font-medium mb-2 flex items-center gap-2">
              <Database className="w-4 h-4" />
              Agent Timeline
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm font-mono">
              <div>
                <p className="text-cyan-200">Deployment: <span className="font-medium text-cyan-400">{new Date(agentStats.joinDate).toLocaleDateString()}</span></p>
              </div>
              <div>
                <p className="text-cyan-200">Skill Categories: <span className="font-medium text-cyan-400">{agentStats.skillCategories}</span></p>
              </div>
              <div>
                <p className="text-cyan-200">Last Activity: <span className="font-medium text-cyan-400">
                  {agentStats.lastActivity ? new Date(agentStats.lastActivity).toLocaleDateString() : 'No activity'}
                </span></p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Profile Settings */}
      <Card className="p-6 bg-gradient-to-br from-slate-950/80 to-blue-950/80 border-2 border-cyan-400/20">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-white">Agent Profile Configuration</h2>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <Input
            label="Agent Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            icon={<User className="w-5 h-5 text-gray-400" />}
            placeholder="Your operational name"
            className="bg-slate-800/50 border-cyan-400/30 text-white placeholder-white/50"
          />
          <Input
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            icon={<Mail className="w-5 h-5 text-gray-400" />}
            placeholder="Your secure communication channel"
            readOnly
            className="bg-slate-800/30 border-gray-500/30 text-white/70 placeholder-white/30"
          />
          
          <div className="flex gap-2">
            <Button 
              type="submit" 
              loading={saving} 
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Configuration
            </Button>
          </div>
        </form>
      </Card>

      {/* Environment Configuration */}
      <Card className="p-6 bg-gradient-to-br from-slate-950/80 to-green-950/80 border-2 border-green-400/20">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
            <Cpu className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-white">System Environment Status</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2 font-mono">
              DATABASE CONNECTION
            </label>
            <div className="p-3 bg-gradient-to-r from-slate-800/60 to-green-900/30 rounded-lg border border-green-400/20">
              <p className="text-white/70 text-sm font-mono">
                Status: <span className={`font-medium ${import.meta.env.VITE_SUPABASE_URL ? 'text-green-400' : 'text-red-400'}`}>
                  {import.meta.env.VITE_SUPABASE_URL ? 'CONNECTED' : 'DISCONNECTED'}
                </span>
              </p>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2 font-mono">
              AI INTEGRATION MODULE
            </label>
            <div className="p-3 bg-gradient-to-r from-slate-800/60 to-blue-900/30 rounded-lg border border-blue-400/20">
              <p className="text-white/70 text-sm font-mono">
                Status: <span className={`font-medium ${import.meta.env.VITE_GEMINI_API_KEY ? 'text-green-400' : 'text-yellow-400'}`}>
                  {import.meta.env.VITE_GEMINI_API_KEY ? 'ACTIVE' : 'FALLBACK MODE'}
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg">
          <p className="text-blue-300 text-sm font-mono">
            <strong>SECURITY NOTE:</strong> Environment variables should be configured in your .env file for optimal security.
            <br />
            Required: <code className="text-blue-200">VITE_SUPABASE_URL</code>, <code className="text-blue-200">VITE_SUPABASE_ANON_KEY</code>
            <br />
            Optional: <code className="text-blue-200">VITE_GEMINI_API_KEY</code> (for AI quest generation)
          </p>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card className="p-6 bg-gradient-to-br from-slate-950/80 to-red-950/80 border-2 border-red-500/30">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center">
            <UserX className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-white">Danger Zone</h2>
        </div>

        <div className="p-4 bg-gradient-to-r from-red-500/10 to-pink-500/10 border border-red-500/20 rounded-lg">
          <h3 className="text-lg font-semibold text-red-300 mb-2 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Complete Account Termination
          </h3>
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/40 rounded-lg">
            <p className="text-red-200 text-sm font-mono mb-2">
              <strong>⚠️ CRITICAL WARNING:</strong> This action will permanently and irreversibly:
            </p>
            <ul className="text-red-200 text-sm font-mono space-y-1 ml-4">
              <li>• Delete ALL agent data (skills, missions, progress)</li>
              <li>• Remove your authentication account</li>
              <li>• Terminate access to all systems</li>
              <li>• Cannot be undone or recovered</li>
            </ul>
          </div>
          
          {!showDeleteConfirm ? (
            <Button
              variant="danger"
              onClick={() => setShowDeleteConfirm(true)}
              className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700"
            >
              <UserX className="w-4 h-4 mr-2" />
              Initiate Complete Termination
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="p-3 bg-red-500/20 border border-red-500/40 rounded-lg">
                <p className="text-red-200 text-sm font-mono mb-2">
                  Type <strong>"DELETE"</strong> to confirm complete account and data deletion:
                </p>
                <Input
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="Type DELETE to confirm"
                  className="bg-red-900/30 border-red-500/50 text-white placeholder-red-300/50"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="danger"
                  onClick={handleDeleteAccount}
                  loading={deleting}
                  disabled={deleteConfirmText !== 'DELETE'}
                  className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700"
                >
                  <UserX className="w-4 h-4 mr-2" />
                  {deleting ? 'Terminating...' : 'Confirm Complete Termination'}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteConfirmText('');
                  }}
                  className="text-white/70 hover:text-white"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

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
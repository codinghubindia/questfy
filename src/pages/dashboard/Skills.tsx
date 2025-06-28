import React, { useState, useEffect } from 'react';
import { Plus, Target, Edit2, Trash2, BookOpen, Shield } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { useAuth } from '../../hooks/useAuth';
import { dbService } from '../../services/supabase';
import type { Skill } from '../../types';

const skillCategories = [
  'Programming',
  'Design',
  'Marketing',
  'Business',
  'Data Science',
  'DevOps',
  'Mobile Development',
  'Web Development',
  'AI/ML',
  'Other'
];

export const Skills: React.FC = () => {
  const { user } = useAuth();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSkill, setNewSkill] = useState({ 
    name: '', 
    description: '', 
    category: 'Programming' 
  });
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);

  useEffect(() => {
    const loadSkills = async () => {
      if (!user) return;

      const { data, error } = await dbService.getSkills(user.id);
      if (data && !error) {
        setSkills(data);
      }
      setLoading(false);
    };

    loadSkills();
  }, [user]);

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newSkill.name.trim()) return;

    const skillData = {
      user_id: user.id,
      name: newSkill.name.trim(),
      description: newSkill.description.trim(),
      category: newSkill.category,
    };

    const { data, error } = await dbService.createSkill(skillData);
    if (data && !error) {
      setSkills([data, ...skills]);
      setNewSkill({ name: '', description: '', category: 'Programming' });
      setShowAddForm(false);
    }
  };

  const handleEditSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSkill) return;

    const { data, error } = await dbService.updateSkill(editingSkill.id, {
      name: editingSkill.name,
      description: editingSkill.description,
      category: editingSkill.category,
    });

    if (data && !error) {
      setSkills(skills.map(skill => 
        skill.id === editingSkill.id ? data : skill
      ));
      setEditingSkill(null);
    }
  };

  const handleDeleteSkill = async (id: string) => {
    if (!confirm('Are you sure you want to delete this skill? This will also delete all associated quests.')) {
      return;
    }

    const { error } = await dbService.deleteSkill(id);
    if (!error) {
      setSkills(skills.filter(skill => skill.id !== id));
    }
  };

  const getXPForNextLevel = (level: number) => level * 100;

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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2">
            Skills Matrix
          </h1>
          <p className="text-white/70 text-lg">Track and develop your expertise across different domains</p>
        </div>
        <Button 
          onClick={() => setShowAddForm(true)} 
          className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 shadow-lg shadow-cyan-500/25"
        >
          <Plus className="w-4 h-4 mr-2" />
          Register Skill
        </Button>
      </div>

      {/* Add Skill Form */}
      {showAddForm && (
        <Card className="p-6 bg-gradient-to-br from-slate-900/80 to-blue-950/80 border-2 border-cyan-400/30">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-cyan-400" />
            Register New Skill
          </h2>
          <form onSubmit={handleAddSkill} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Input
                placeholder="Skill name (e.g., JavaScript Programming)"
                value={newSkill.name}
                onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                required
                className="bg-slate-800/50 border-cyan-400/30 text-white placeholder-white/50"
              />
              <select
                value={newSkill.category}
                onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-cyan-400/30 bg-slate-800/50 text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
              >
                {skillCategories.map(category => (
                  <option key={category} value={category} className="bg-slate-800">{category}</option>
                ))}
              </select>
            </div>
            <Input
              placeholder="Description (optional)"
              value={newSkill.description}
              onChange={(e) => setNewSkill({ ...newSkill, description: e.target.value })}
              className="bg-slate-800/50 border-cyan-400/30 text-white placeholder-white/50"
            />
            <div className="flex gap-2">
              <Button type="submit" className="bg-gradient-to-r from-green-500 to-emerald-600">
                Register Skill
              </Button>
              <Button variant="ghost" onClick={() => setShowAddForm(false)} className="text-white/70 hover:text-white">
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Edit Skill Form */}
      {editingSkill && (
        <Card className="p-6 bg-gradient-to-br from-slate-900/80 to-purple-950/80 border-2 border-purple-400/30">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Edit2 className="w-5 h-5 text-purple-400" />
            Modify Skill Parameters
          </h2>
          <form onSubmit={handleEditSkill} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Input
                placeholder="Skill name"
                value={editingSkill.name}
                onChange={(e) => setEditingSkill({ ...editingSkill, name: e.target.value })}
                required
                className="bg-slate-800/50 border-purple-400/30 text-white placeholder-white/50"
              />
              <select
                value={editingSkill.category}
                onChange={(e) => setEditingSkill({ ...editingSkill, category: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-purple-400/30 bg-slate-800/50 text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                {skillCategories.map(category => (
                  <option key={category} value={category} className="bg-slate-800">{category}</option>
                ))}
              </select>
            </div>
            <Input
              placeholder="Description (optional)"
              value={editingSkill.description || ''}
              onChange={(e) => setEditingSkill({ ...editingSkill, description: e.target.value })}
              className="bg-slate-800/50 border-purple-400/30 text-white placeholder-white/50"
            />
            <div className="flex gap-2">
              <Button type="submit" className="bg-gradient-to-r from-purple-500 to-pink-600">
                Save Changes
              </Button>
              <Button variant="ghost" onClick={() => setEditingSkill(null)} className="text-white/70 hover:text-white">
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Skills Grid */}
      {skills.length === 0 ? (
        <Card className="p-12 text-center bg-gradient-to-br from-slate-900/80 to-blue-950/80 border-2 border-cyan-400/30">
          <div className="w-20 h-20 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Target className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-semibold text-white mb-4">Skills Database Empty</h2>
          <p className="text-white/70 mb-8 text-lg">
            Initialize your skills matrix to begin tracking your development journey.
          </p>
          <Button 
            onClick={() => setShowAddForm(true)} 
            size="lg"
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 shadow-lg shadow-cyan-500/25"
          >
            <Plus className="w-5 h-5 mr-2" />
            Initialize Skills Matrix
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {skills.map((skill) => {
            const nextLevelXP = getXPForNextLevel(skill.level);
            const progressToNext = skill.current_xp % 100;
            
            return (
              <Card key={skill.id} className="p-6 bg-gradient-to-br from-slate-900/80 to-blue-950/80 border-2 border-cyan-400/20 hover:border-cyan-400/40 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-cyan-500/20">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <BookOpen className="w-5 h-5 text-cyan-400" />
                      <span className="text-xs text-cyan-300 uppercase tracking-wide font-mono">
                        {skill.category}
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">{skill.name}</h3>
                    {skill.description && (
                      <p className="text-white/70 text-sm mb-3">{skill.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setEditingSkill(skill)}
                      className="p-2 text-white/50 hover:text-cyan-400 hover:bg-cyan-400/10 rounded-lg transition-all duration-200"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteSkill(skill.id)}
                      className="p-2 text-white/50 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all duration-200"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-white/70 text-sm font-mono">LEVEL</span>
                    <span className="px-3 py-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-sm rounded-full font-mono font-medium">
                      {skill.level}
                    </span>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm text-white/70 mb-1 font-mono">
                      <span>Progress to Level {skill.level + 1}</span>
                      <span>{progressToNext}/100 XP</span>
                    </div>
                    <ProgressBar
                      value={progressToNext}
                      max={100}
                    />
                  </div>

                  <div className="pt-2 border-t border-cyan-400/20">
                    <p className="text-white/70 text-sm font-mono">
                      Total Experience: <span className="text-cyan-400 font-medium">{skill.current_xp} XP</span>
                    </p>
                    {skill.streak_days > 0 && (
                      <p className="text-white/70 text-sm font-mono">
                        Streak: <span className="text-orange-400 font-medium">{skill.streak_days} days</span>
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
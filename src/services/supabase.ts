import { createClient } from '@supabase/supabase-js';

// These will be provided by the user via environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Auth functions
export const authService = {
  async signUp(email: string, password: string, name: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });
    return { data, error };
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  async signOut() {
    try {
      // Quick signOut without waiting for response
      const { error } = await supabase.auth.signOut({ scope: 'local' });
      
      if (error) {
        console.warn('Supabase signOut warning:', error);
      }
      
      return { error: null };
    } catch (error) {
      console.warn('SignOut error (non-critical):', error);
      return { error: null }; // Don't block logout for network issues
    }
  },

  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        // Log session errors as warnings instead of critical errors
        if (error.message?.includes('session') || error.message?.includes('JWT')) {
          console.warn('Session expired or invalid:', error.message);
        } else {
          console.error('Auth error:', error);
        }
        return null;
      }
      
      return user;
    } catch (error) {
      console.warn('Failed to get current user:', error);
      return null;
    }
  },

  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });
  },

  // Delete the actual authentication user
  async deleteUser() {
    try {
      const { error } = await supabase.auth.admin.deleteUser(
        (await supabase.auth.getUser()).data.user?.id || ''
      );
      
      if (error) {
        console.error('Error deleting auth user:', error);
        return { error };
      }
      
      return { error: null };
    } catch (error) {
      console.error('Error deleting auth user:', error);
      return { error };
    }
  },

  // Handle email confirmation callback
  async handleEmailConfirmation() {
    try {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting session:', error);
        return { success: false, error: error.message };
      }
      
      if (data.session) {
        return { success: true, user: data.session.user };
      }
      
      return { success: false, error: 'No active session found' };
    } catch (error) {
      console.error('Error handling email confirmation:', error);
      return { success: false, error: 'Failed to confirm email' };
    }
  }
};

// Database functions
export const dbService = {
  // Profile functions
  async createProfile(userId: string, email: string, name: string) {
    // Get the current session to ensure we're authenticated
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return { data: null, error: new Error('No active session found') };
    }

    const { data, error } = await supabase
      .from('profiles')
      .insert([{
        id: userId,
        email: email,
        name: name,
        total_xp: 0,
        level: 1,
        streak: 0,
        joined_date: new Date().toISOString(),
        last_login: new Date().toISOString()
      }])
      .select()
      .single();
    
    return { data, error };
  },

  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    return { data, error };
  },

  async updateProfile(userId: string, updates: any) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    
    return { data, error };
  },

  async deleteProfile(userId: string) {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);
    
    return { error };
  },

  // Skills
  async getSkills(userId: string) {
    const { data, error } = await supabase
      .from('skills')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    return { data, error };
  },

  async createSkill(skill: any) {
    const { data, error } = await supabase
      .from('skills')
      .insert([{
        user_id: skill.user_id,
        name: skill.name,
        category: skill.category || 'General',
        description: skill.description,
        current_xp: 0,
        level: 1,
        streak_days: 0
      }])
      .select()
      .single();
    
    return { data, error };
  },

  async updateSkill(id: string, updates: any) {
    const { data, error } = await supabase
      .from('skills')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    return { data, error };
  },

  async deleteSkill(id: string) {
    const { error } = await supabase
      .from('skills')
      .delete()
      .eq('id', id);
    
    return { error };
  },

  // Delete all skills for a user (for account deletion)
  async deleteAllUserSkills(userId: string) {
    const { error } = await supabase
      .from('skills')
      .delete()
      .eq('user_id', userId);
    
    return { error };
  },

  // Quests
  async getQuests(userId: string) {
    const { data, error } = await supabase
      .from('quests')
      .select(`
        *,
        skills (
          name,
          category
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    return { data, error };
  },

  async createQuest(quest: any) {
    const { data, error } = await supabase
      .from('quests')
      .insert([{
        ...quest,
        status: quest.status || 'pending'
      }])
      .select()
      .single();
    
    return { data, error };
  },

  async updateQuest(id: string, updates: any) {
    const { data, error } = await supabase
      .from('quests')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    return { data, error };
  },

  async completeQuest(questId: string) {
    const { data, error } = await supabase
      .from('quests')
      .update({ 
        completed: true,
        completed_at: new Date().toISOString()
      })
      .eq('id', questId)
      .select()
      .single();

    if (data && !error) {
      // Also create a quest completion record
      await supabase
        .from('quest_completions')
        .insert([{
          user_id: data.user_id,
          quest_id: questId,
          xp_gained: data.xp_reward || 10
        }]);
    }
    
    return { data, error };
  },

  // Delete all quests for a user (for account deletion)
  async deleteAllUserQuests(userId: string) {
    const { error } = await supabase
      .from('quests')
      .delete()
      .eq('user_id', userId);
    
    return { error };
  },

  // Quest completions
  async getQuestCompletions(userId: string) {
    const { data, error } = await supabase
      .from('quest_completions')
      .select(`
        *,
        quests (
          title,
          description,
          skills (
            name
          )
        )
      `)
      .eq('user_id', userId)
      .order('completed_at', { ascending: false });
    
    return { data, error };
  },

  // Delete all quest completions for a user (for account deletion)
  async deleteAllUserQuestCompletions(userId: string) {
    const { error } = await supabase
      .from('quest_completions')
      .delete()
      .eq('user_id', userId);
    
    return { error };
  },

  // Complete account deletion - includes both data and authentication user
  async deleteUserAccount(userId: string) {
    try {
      // Step 1: Delete all user data in order due to foreign key constraints
      await this.deleteAllUserQuestCompletions(userId);
      await this.deleteAllUserQuests(userId);
      await this.deleteAllUserSkills(userId);
      await this.deleteProfile(userId);
      
      // Step 2: Delete the authentication user
      const { error: authError } = await authService.deleteUser();
      
      if (authError) {
        console.error('Failed to delete auth user:', authError);
        // Even if auth deletion fails, we've cleaned up the data
        // This might happen due to permissions, but the user data is gone
        return { 
          error: new Error(`Data deleted successfully, but failed to remove authentication user: ${authError instanceof Error ? authError.message : 'Unknown error'}`)
        };
      }
      
      return { error: null };
    } catch (error) {
      console.error('Error during account deletion:', error);
      return { error };
    }
  },

  // Advanced agent statistics calculation
  async calculateAgentStatistics(userId: string) {
    try {
      const [skillsResult, questsResult, completionsResult] = await Promise.all([
        this.getSkills(userId),
        this.getQuests(userId),
        this.getQuestCompletions(userId)
      ]);

      const skills = skillsResult.data || [];
      const quests = questsResult.data || [];
      const completions = completionsResult.data || [];

      // Calculate total XP from all skills
      const totalXP = skills.reduce((sum, skill) => sum + skill.current_xp, 0);
      
      // Calculate agent level based on total XP (every 500 XP = 1 level)
      const agentLevel = Math.floor(totalXP / 500) + 1;
      
      // Calculate XP needed for next level
      const xpForNextLevel = (agentLevel * 500) - totalXP;
      
      // Calculate average skill level
      const averageSkillLevel = skills.length > 0 
        ? skills.reduce((sum, skill) => sum + skill.level, 0) / skills.length 
        : 0;
      
      // Calculate total streak (sum of all skill streaks)
      const totalStreak = skills.reduce((sum, skill) => sum + skill.streak_days, 0);
      
      // Calculate completion rate
      const completedQuests = quests.filter(q => q.completed).length;
      const totalQuests = quests.length;
      const completionRate = totalQuests > 0 ? (completedQuests / totalQuests) * 100 : 0;
      
      // Calculate weekly stats
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      const weeklyCompletions = completions.filter(c => 
        new Date(c.completed_at) > weekAgo
      ).length;
      
      const weeklyXP = completions
        .filter(c => new Date(c.completed_at) > weekAgo)
        .reduce((sum, c) => sum + c.xp_gained, 0);
      
      // Calculate monthly stats
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      
      const monthlyCompletions = completions.filter(c => 
        new Date(c.completed_at) > monthAgo
      ).length;
      
      const monthlyXP = completions
        .filter(c => new Date(c.completed_at) > monthAgo)
        .reduce((sum, c) => sum + c.xp_gained, 0);
      
      // Calculate skill diversity (number of different categories)
      const skillCategories = [...new Set(skills.map(s => s.category))];
      
      // Calculate agent rank based on level
      const getRank = (level: number) => {
        if (level >= 50) return { name: 'Elite Agent', color: 'from-yellow-400 to-orange-500' };
        if (level >= 30) return { name: 'Senior Agent', color: 'from-purple-400 to-pink-500' };
        if (level >= 20) return { name: 'Advanced Agent', color: 'from-blue-400 to-cyan-500' };
        if (level >= 10) return { name: 'Experienced Agent', color: 'from-green-400 to-emerald-500' };
        if (level >= 5) return { name: 'Junior Agent', color: 'from-cyan-400 to-blue-500' };
        return { name: 'Rookie Agent', color: 'from-gray-400 to-slate-500' };
      };
      
      const rank = getRank(agentLevel);
      
      // Calculate efficiency score (XP per quest)
      const efficiency = completedQuests > 0 ? totalXP / completedQuests : 0;
      
      return {
        data: {
          totalXP,
          agentLevel,
          xpForNextLevel,
          averageSkillLevel: Math.round(averageSkillLevel * 10) / 10,
          totalStreak,
          completionRate: Math.round(completionRate * 10) / 10,
          weeklyCompletions,
          weeklyXP,
          monthlyCompletions,
          monthlyXP,
          skillCount: skills.length,
          questCount: totalQuests,
          completedQuests,
          skillCategories: skillCategories.length,
          rank,
          efficiency: Math.round(efficiency * 10) / 10,
          joinDate: skills.length > 0 ? skills[skills.length - 1].created_at : new Date().toISOString(),
          lastActivity: completions.length > 0 ? completions[0].completed_at : null
        },
        error: null
      };
    } catch (error) {
      return { data: null, error };
    }
  }
};
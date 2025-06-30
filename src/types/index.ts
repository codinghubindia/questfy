export interface User {
  id: string;
  email: string;
  user_metadata?: {
    name?: string;
  };
  created_at: string;
}

export interface Profile {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  total_xp: number;
  level: number;
  streak: number;
  joined_date: string;
  last_login: string;
}

export interface Skill {
  id: string;
  user_id: string;
  name: string;
  category: string;
  description?: string;
  current_xp: number;
  level: number;
  streak_days: number;
  last_practiced?: string;
  created_at: string;
  updated_at: string;
}

export interface Quest {
  id: string;
  user_id: string;
  skill_id?: string;
  title: string;
  description?: string;
  estimated_outcome?: string;
  prerequisites?: string[];
  success_criteria?: string[];
  is_urgent: boolean;
  is_important: boolean;
  deadline?: string;
  estimated_time?: number;
  completed: boolean;
  xp_reward: number;
  created_at: string;
  completed_at?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  status?: 'pending' | 'accepted' | 'rejected' | 'completed';
  skills?: {
    name: string;
    category: string;
  };
}

export interface QuestCompletion {
  id: string;
  user_id: string;
  quest_id: string;
  completed_at: string;
  xp_gained: number;
  quests?: {
    title: string;
    description: string;
    skills?: {
      name: string;
    };
  };
}

export interface QuestGenerationParams {
  skillName: string;
  skillLevel: number;
  category?: string;
  previousQuests?: Quest[];
  userPreferences?: string[];
}
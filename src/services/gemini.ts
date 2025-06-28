// Gemini Flash 2.0 API integration
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';

interface QuestGenerationRequest {
  skillName: string;
  skillLevel: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category?: string;
  previousQuests?: string[];
}

export const geminiService = {
  async generateQuest(params: QuestGenerationRequest) {
    if (!GEMINI_API_KEY) {
      // Fallback to mock data when API key is not provided
      return this.getMockQuest(params);
    }

    try {
      const prompt = `Generate a practical coding/skill quest for:
      - Skill: ${params.skillName}
      - Level: ${params.skillLevel}
      - Difficulty: ${params.difficulty}
      - Category: ${params.category || 'General'}
      
      The quest should be:
      1. Practical and hands-on
      2. Appropriate for the skill level
      3. Completable in 15-90 minutes
      4. Educational and engaging
      
      Return ONLY a JSON object with this exact structure:
      {
        "title": "Quest title (max 60 chars)",
        "description": "Detailed description of what to do (max 200 chars)",
        "estimated_time": number_in_minutes
      }`;

      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const result = await response.json();
      const questText = result.candidates[0].content.parts[0].text;
      
      // Clean up the response to extract JSON
      const jsonMatch = questText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }
      
      const quest = JSON.parse(jsonMatch[0]);
      
      return {
        data: {
          ...quest,
          difficulty: params.difficulty,
        },
        error: null
      };
    } catch (error) {
      console.error('Gemini API error:', error);
      // Fallback to mock data on error
      return this.getMockQuest(params);
    }
  },

  getMockQuest(params: QuestGenerationRequest) {
    const mockQuests = {
      'JavaScript Programming': [
        {
          title: 'Build a Todo List Component',
          description: 'Create a fully functional todo list using React hooks with add, delete, and toggle functionality.',
          estimated_time: 45,
        },
        {
          title: 'Implement Local Storage',
          description: 'Add persistence to your web app by implementing localStorage to save user data.',
          estimated_time: 30,
        },
        {
          title: 'Create API Integration',
          description: 'Connect to a REST API and handle loading, error, and success states properly.',
          estimated_time: 60,
        },
        {
          title: 'Build a Form Validator',
          description: 'Create a reusable form validation system with custom error messages.',
          estimated_time: 40,
        }
      ],
      'UI/UX Design': [
        {
          title: 'Design a Landing Page',
          description: 'Create a modern, responsive landing page mockup focusing on user conversion.',
          estimated_time: 90,
        },
        {
          title: 'Build a Design System',
          description: 'Create a consistent design system with colors, typography, and component patterns.',
          estimated_time: 120,
        },
        {
          title: 'Create User Flow Diagram',
          description: 'Design a complete user journey for an e-commerce checkout process.',
          estimated_time: 60,
        }
      ],
      'Python Programming': [
        {
          title: 'Build a Web Scraper',
          description: 'Create a Python script to scrape data from a website and save it to CSV.',
          estimated_time: 50,
        },
        {
          title: 'Implement Data Analysis',
          description: 'Analyze a dataset using pandas and create visualizations with matplotlib.',
          estimated_time: 75,
        }
      ]
    };

    const skillQuests = mockQuests[params.skillName as keyof typeof mockQuests] || mockQuests['JavaScript Programming'];
    const randomQuest = skillQuests[Math.floor(Math.random() * skillQuests.length)];

    return {
      data: {
        ...randomQuest,
        difficulty: params.difficulty,
      },
      error: null
    };
  }
};
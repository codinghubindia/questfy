// Gemini Flash 2.0 API integration
const GEMINI_API_KEYS = [
  import.meta.env.VITE_GEMINI_API_KEY,
  import.meta.env.VITE_GEMINI_API_KEY_BACKUP1,
  import.meta.env.VITE_GEMINI_API_KEY_BACKUP2
].filter(Boolean); // Filter out undefined or empty keys

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

interface QuestGenerationRequest {
  skillName: string;
  skillLevel: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category?: string;
  previousQuests?: string[];
}

export const geminiService = {
  async tryWithApiKey(apiKey: string, params: QuestGenerationRequest) {
    try {
      const prompt = this.constructPrompt(params);
      
      const requestBody = {
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.8,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      };

      const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Response Error:', {
          status: response.status,
          statusText: response.statusText,
          errorText
        });
        throw new Error(`API request failed: ${response.status} - ${errorText}`);
      }

      const result = await response.json();

      if (!result.candidates || !result.candidates[0]) {
        console.error('Invalid API response structure:', result);
        throw new Error('Invalid API response structure');
      }

      // Extract the text from the response
      const candidate = result.candidates[0];
      let questText = '';

      // Handle different response structures
      if (candidate.content?.parts?.[0]?.text) {
        questText = candidate.content.parts[0].text;
      } else if (candidate.text) {
        questText = candidate.text;
      } else {
        console.error('Unexpected response structure:', candidate);
        throw new Error('Unexpected response structure');
      }

      
      // Try to find JSON in the response text
      const jsonMatch = questText.match(/\{[\s\S]*?\}/);
      if (!jsonMatch) {
        // If no JSON found, try to parse the entire response as JSON
        try {
          // Clean up the text - remove any markdown formatting if present
          const cleanText = questText.replace(/```json\n|\n```/g, '').trim();
          const quest = JSON.parse(cleanText);
          return {
            success: true,
            data: {
              ...quest,
              difficulty: params.difficulty,
            }
          };
        } catch (parseError) {
          console.error('No JSON found in response:', questText);
          throw new Error('No valid JSON found in response');
        }
      }
      
      try {
        const quest = JSON.parse(jsonMatch[0]);
        return {
          success: true,
          data: {
            ...quest,
            difficulty: params.difficulty,
          }
        };
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError, 'Text:', jsonMatch[0]);
        throw new Error('Failed to parse quest JSON');
      }
    } catch (error) {
      console.error('API call failed:', error);
      return { success: false, error };
    }
  },

  async generateQuest(params: QuestGenerationRequest) {

    if (GEMINI_API_KEYS.length === 0) {
      console.error('No API keys available');
      return this.getMockQuest(params);
    }

    // Try each API key in sequence until one works
    for (const apiKey of GEMINI_API_KEYS) {
      const result = await this.tryWithApiKey(apiKey, params);
      if (result.success) {
        return { data: result.data, error: null };
      }
    }

    // If all API keys fail, fall back to mock data
    return this.getMockQuest(params);
  },

  constructPrompt(params: QuestGenerationRequest): string {
    const difficultyLevels = {
      beginner: "foundational concepts and basic implementations",
      intermediate: "moderate complexity and real-world applications",
      advanced: "complex problems and advanced techniques"
    };

    const skillLevelContext = `Level ${params.skillLevel} (${params.difficulty}) focusing on ${difficultyLevels[params.difficulty]}`;

    return `You are an expert ${params.skillName} mentor. Create a practical quest for a student at ${skillLevelContext}.

Previous quests completed: ${params.previousQuests?.join(", ") || "None"}
Category focus: ${params.category || "General"}

IMPORTANT: Respond with ONLY a valid JSON object. Do not include any other text, markdown formatting, or explanations.

The JSON object must have this exact structure:
{
  "title": "Quest title (max 60 chars)",
  "description": "Clear, actionable instructions with specific requirements (max 200 chars)",
  "estimated_time": number_in_minutes,
  "learning_outcomes": ["List of 2-3 specific skills or concepts learned"],
  "prerequisites": ["List of required knowledge/tools"],
  "success_criteria": ["2-3 specific checkpoints to verify completion"]
}

Requirements for the quest:
1. Must be hands-on and practical
2. Must be completable in 15-90 minutes
3. Must teach valuable real-world skills
4. Must match the skill level (${params.skillLevel}) and difficulty (${params.difficulty})
5. Must build upon previous knowledge
6. Must have clear, measurable outcomes`;
  },

  getMockQuest(params: QuestGenerationRequest) {
    const mockQuests = {
      'JavaScript Programming': [
        {
          title: 'Build a Modern Todo App with React',
          description: 'Create a todo app with React hooks, TypeScript, and local storage. Include filtering, sorting, and categories.',
          estimated_time: 45,
          learning_outcomes: [
            'React hooks and state management',
            'TypeScript type safety',
            'Local storage integration'
          ],
          prerequisites: ['Basic React knowledge', 'JavaScript fundamentals'],
          success_criteria: [
            'All CRUD operations work',
            'Data persists after refresh',
            'TypeScript has no errors'
          ]
        },
        {
          title: 'Real-time Data Dashboard',
          description: 'Build a dashboard that displays real-time data using WebSocket connections and D3.js for visualizations.',
          estimated_time: 60,
          learning_outcomes: [
            'WebSocket implementation',
            'D3.js data visualization',
            'Real-time state management'
          ],
          prerequisites: ['JavaScript async programming', 'Basic D3.js'],
          success_criteria: [
            'Live data updates work',
            'Visualizations render correctly',
            'Error handling implemented'
          ]
        }
      ],
      'Python Programming': [
        {
          title: 'Build an AI-powered News Aggregator',
          description: 'Create a Python script that aggregates news from multiple sources and uses NLP for content categorization.',
          estimated_time: 75,
          learning_outcomes: [
            'API integration',
            'Natural Language Processing',
            'Data aggregation patterns'
          ],
          prerequisites: ['Python basics', 'HTTP requests knowledge'],
          success_criteria: [
            'Multiple sources integrated',
            'NLP categorization works',
            'Error handling in place'
          ]
        }
      ],
      'UI/UX Design': [
        {
          title: 'Design a Dark Mode Implementation',
          description: 'Create a comprehensive dark mode design system with accessibility considerations and smooth transitions.',
          estimated_time: 90,
          learning_outcomes: [
            'Color theory in dark modes',
            'Accessibility standards',
            'CSS custom properties'
          ],
          prerequisites: ['Basic design principles', 'CSS knowledge'],
          success_criteria: [
            'WCAG compliance achieved',
            'Smooth mode transitions',
            'System preference detection'
          ]
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
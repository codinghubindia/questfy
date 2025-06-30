// Gemini Flash 2.0 API integration
const GEMINI_API_KEYS = [
  import.meta.env.VITE_GEMINI_API_KEY,
  import.meta.env.VITE_GEMINI_API_KEY_BACKUP1,
  import.meta.env.VITE_GEMINI_API_KEY_BACKUP2,
  import.meta.env.VITE_GEMINI_API_KEY_BACKUP3,
  import.meta.env.VITE_GEMINI_API_KEY_BACKUP4
].filter(Boolean); // Filter out undefined or empty keys

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

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
          temperature: 0.7,
          topK: 20,
          topP: 0.8,
          maxOutputTokens: 512,
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

      // Check for MAX_TOKENS error
      if (result.candidates?.[0]?.finishReason === 'MAX_TOKENS') {
        console.warn('Gemini API hit token limit, falling back to mock data');
        return { success: false, error: new Error('MAX_TOKENS') };
      }

      if (!result.candidates?.[0]?.content) {
        console.error('Invalid API response structure:', result);
        throw new Error('Invalid API response structure');
      }

      // Extract the text from the response
      const candidate = result.candidates[0];
      let questText = '';

      // Handle the new response structure
      if (candidate.content?.parts?.[0]?.text) {
        questText = candidate.content.parts[0].text;
      } else if (candidate.content?.text) {
        questText = candidate.content.text;
      } else {
        console.warn('Unexpected response structure, falling back to mock data:', candidate);
        return { success: false, error: new Error('Invalid response format') };
      }

      // Clean up the text and try to parse it
      const cleanText = questText.replace(/```json\n|\n```/g, '').trim();
      
      try {
        // First try to parse the entire cleaned text
        const quest = JSON.parse(cleanText);
        return {
          success: true,
          data: {
            ...quest,
            difficulty: params.difficulty,
          }
        };
      } catch (parseError) {
        // If that fails, try to find and parse a JSON object in the text
        const jsonMatch = questText.match(/\{[\s\S]*?\}/);
        if (!jsonMatch) {
          // If no JSON object is found, try to extract key-value pairs from the text
          const extractedData = this.extractQuestData(questText);
          if (extractedData) {
            return {
              success: true,
              data: {
                ...extractedData,
                difficulty: params.difficulty,
              }
            };
          }
          console.warn('No valid data found in response, falling back to mock data:', questText);
          return { success: false, error: new Error('No valid data found') };
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
          console.warn('Failed to parse quest data, falling back to mock data:', jsonMatch[0]);
          return { success: false, error: new Error('Parse error') };
        }
      }
    } catch (error) {
      console.warn('API call failed, falling back to mock data:', error);
      return { success: false, error };
    }
  },

  // Helper function to extract quest data from text if JSON parsing fails
  extractQuestData(text: string) {
    const lines = text.split('\n');
    const data: any = {};
    
    for (const line of lines) {
      if (line.includes(':')) {
        const [key, ...valueParts] = line.split(':');
        const value = valueParts.join(':').trim();
        
        // Convert the key to camelCase
        const cleanKey = key.trim()
          .toLowerCase()
          .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase());
        
        // Handle arrays
        if (value.startsWith('[') && value.endsWith(']')) {
          try {
            data[cleanKey] = JSON.parse(value);
          } catch {
            data[cleanKey] = value.slice(1, -1).split(',').map(item => item.trim());
          }
        }
        // Handle numbers
        else if (!isNaN(Number(value))) {
          data[cleanKey] = Number(value);
        }
        // Handle strings
        else {
          data[cleanKey] = value.replace(/^["']|["']$/g, ''); // Remove quotes if present
        }
      }
    }

    // Validate that we have the minimum required fields
    if (data.title && data.description) {
      return {
        title: data.title,
        description: data.description,
        estimated_time: data.estimatedTime || 30,
        learning_outcomes: data.learningOutcomes || [],
        prerequisites: data.prerequisites || [],
        success_criteria: data.successCriteria || []
      };
    }

    return null;
  },

  async generateQuest(params: QuestGenerationRequest) {
    // If no API keys available, use mock data
    if (GEMINI_API_KEYS.length === 0) {
      console.warn('No API keys available, using mock data');
      return this.getMockQuest(params);
    }

    // Try each API key in sequence until one works
    for (const apiKey of GEMINI_API_KEYS) {
      const result = await this.tryWithApiKey(apiKey, params);
      if (result.success) {
        return { data: result.data, error: null };
      }
    }

    // If all API keys fail or return MAX_TOKENS, fall back to mock data
    console.warn('All API attempts failed or hit token limit, using mock data');
    return this.getMockQuest(params);
  },

  constructPrompt(params: QuestGenerationRequest): string {
    const difficultyLevels = {
      beginner: "foundational concepts and basic implementations",
      intermediate: "moderate complexity and real-world applications",
      advanced: "complex problems and advanced techniques"
    };

    const skillLevelContext = `Level ${params.skillLevel} (${params.difficulty}) focusing on ${difficultyLevels[params.difficulty]}`;

    return `Generate a practical ${params.skillName} quest for level ${params.skillLevel} (${params.difficulty}).

Previous quests: ${params.previousQuests?.join(", ") || "None"}
Category: ${params.category || "General"}

Return ONLY a JSON object with this structure (no other text):
{
  "title": "60 chars max",
  "description": "200 chars max",
  "estimated_time": number,
  "learning_outcomes": ["2-3 items"],
  "prerequisites": ["required items"],
  "success_criteria": ["2-3 items"]
}`;
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
      ],
      'Default': [
        {
          title: 'Build a Portfolio Project',
          description: 'Create a showcase project that demonstrates your skills in this area.',
          estimated_time: 60,
          learning_outcomes: [
            'Project planning',
            'Implementation skills',
            'Documentation'
          ],
          prerequisites: ['Basic knowledge in the field'],
          success_criteria: [
            'Project completed',
            'Documentation written',
            'Code/design reviewed'
          ]
        }
      ]
    };

    const skillQuests = mockQuests[params.skillName as keyof typeof mockQuests] || mockQuests['Default'];
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
import { GoogleGenAI } from "@google/genai";

// Gemini API integration using official Google GenAI library
const GEMINI_API_KEYS = [
  import.meta.env.VITE_GEMINI_API_KEY,
  import.meta.env.VITE_GEMINI_API_KEY_BACKUP1,
  import.meta.env.VITE_GEMINI_API_KEY_BACKUP2,
  import.meta.env.VITE_GEMINI_API_KEY_BACKUP3,
  import.meta.env.VITE_GEMINI_API_KEY_BACKUP4
].filter(Boolean); // Filter out undefined or empty keys

// Try multiple model versions for better compatibility
const GEMINI_MODELS = [
  'gemini-2.5-flash',
  'gemini-1.5-flash',
  'gemini-1.5-pro',
  'gemini-pro'
];

interface QuestGenerationRequest {
  skillName: string;
  skillLevel: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category?: string;
  previousQuests?: string[];
}

export const geminiService = {
  async tryWithApiKey(apiKey: string, params: QuestGenerationRequest, modelIndex: number = 0) {
    try {
      const modelName = GEMINI_MODELS[modelIndex] || GEMINI_MODELS[0];
      const prompt = this.constructPrompt(params);
      
      // Initialize the Google GenAI client
      const genAI = new GoogleGenAI({ apiKey });


      const response = await genAI.models.generateContent({
        model: modelName,
        contents: prompt
      });

      // Check if response is valid
      if (!response || !response.candidates) {
        console.warn('Invalid response from Gemini API, falling back to mock data');
        return { success: false, error: new Error('Invalid response') };
      }

      const candidate = response.candidates?.[0];
      if (!candidate) {
        console.error('No candidates in response:', response);
        return { success: false, error: new Error('No response candidates') };
      }
      
      // Check finish reason
      if (candidate.finishReason === 'MAX_TOKENS') {
        console.warn('Gemini API hit token limit, falling back to mock data');
        return { success: false, error: new Error('MAX_TOKENS') };
      }
      
      if (candidate.finishReason === 'SAFETY') {
        console.warn('Response blocked for safety reasons, falling back to mock data');
        return { success: false, error: new Error('SAFETY_BLOCKED') };
      }
      
      if (candidate.finishReason === 'RECITATION') {
        console.warn('Response blocked for recitation reasons, falling back to mock data');
        return { success: false, error: new Error('RECITATION_BLOCKED') };
      }

      // Get the response text
      const questText = response.text;
      if (!questText) {
        console.warn('Empty response text, falling back to mock data');
        return { success: false, error: new Error('Empty response') };
      }

      // Clean up the text and try to parse it
      let cleanText = questText.trim();
      
      // Remove markdown code blocks
      cleanText = cleanText.replace(/```json\n?|\n?```/g, '');
      
      // Remove any leading/trailing whitespace
      cleanText = cleanText.trim();
      
      try {
        // First, try to fix common JSON syntax errors
        const fixedJson = this.fixJsonSyntax(cleanText);
        
        // Parse the JSON response
        const quest = JSON.parse(fixedJson);
        
        // Validate required fields
        if (!quest.title || !quest.description || typeof quest.estimated_time !== 'number') {
          console.warn('Missing or invalid required fields in API response, trying fallback extraction:', quest);
          throw new Error('Invalid quest structure');
        }
        
        // Ensure arrays are properly formatted
        const processedQuest = {
          title: quest.title,
          description: quest.description,
          estimated_time: quest.estimated_time,
          learning_outcomes: Array.isArray(quest.learning_outcomes) ? quest.learning_outcomes : [],
          prerequisites: Array.isArray(quest.prerequisites) ? quest.prerequisites : [],
          success_criteria: Array.isArray(quest.success_criteria) ? quest.success_criteria : []
        };
        
        return {
          success: true,
          data: {
            ...processedQuest,
            difficulty: params.difficulty,
          }
        };
      } catch (parseError) {
        console.warn('JSON parsing failed, trying fallback extraction method:', parseError instanceof Error ? parseError.message : String(parseError));
        
        // If JSON parsing fails, try to extract data using fallback method
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
        
        console.warn('All parsing methods failed, falling back to mock data. Raw text:', questText);
        return { success: false, error: new Error('Parse error') };
      }
    } catch (error: any) {
      console.warn(`API call failed with model ${GEMINI_MODELS[modelIndex]}, error:`, error.message);
      return { success: false, error };
    }
  },

  // Helper function to fix common JSON syntax errors
  fixJsonSyntax(jsonText: string): string {
    let fixed = jsonText;
    
    try {
      // Remove any trailing commas before closing brackets/braces
      fixed = fixed.replace(/,(\s*[}\]])/g, '$1');
      
      // Fix malformed quotes in property names
      fixed = fixed.replace(/(\w+)(\s*):/g, '"$1"$2:');
      
      // Fix single quotes to double quotes
      fixed = fixed.replace(/'/g, '"');
      
      // Fix missing quotes around string values (basic patterns)
      fixed = fixed.replace(/:\s*([^"\[\{][^,\}\]]*[^,\}\]\s])\s*([,\}\]])/g, ': "$1"$2');
      
      // Fix incomplete arrays or objects by finding unmatched brackets
      const openBraces = (fixed.match(/{/g) || []).length;
      const closeBraces = (fixed.match(/}/g) || []).length;
      const openBrackets = (fixed.match(/\[/g) || []).length;
      const closeBrackets = (fixed.match(/]/g) || []).length;
      
      // Add missing closing braces
      for (let i = closeBraces; i < openBraces; i++) {
        fixed += '}';
      }
      
      // Add missing closing brackets
      for (let i = closeBrackets; i < openBrackets; i++) {
        fixed += ']';
      }
      
      // Try to fix specific patterns found in the logs
      fixed = fixed.replace(/"\s*haplotype\.prerequisites"\s*:/g, '"prerequisites":');
      fixed = fixed.replace(/"\s*"\s*,/g, '",');
      
      return fixed;
    } catch (error) {
      console.warn('Failed to fix JSON syntax, returning original:', error);
      return jsonText;
    }
  },

  // Helper function to extract quest data from text if JSON parsing fails
  extractQuestData(text: string) {
    try {
      // First, try to extract a JSON block from the text
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const jsonText = jsonMatch[0];
        try {
          const fixedJson = this.fixJsonSyntax(jsonText);
          const parsed = JSON.parse(fixedJson);
          
          if (parsed.title && parsed.description) {
            return {
              title: parsed.title,
              description: parsed.description,
              estimated_time: parsed.estimated_time || 30,
              learning_outcomes: Array.isArray(parsed.learning_outcomes) ? parsed.learning_outcomes : [],
              prerequisites: Array.isArray(parsed.prerequisites) ? parsed.prerequisites : [],
              success_criteria: Array.isArray(parsed.success_criteria) ? parsed.success_criteria : []
            };
          }
        } catch (e) {
          console.warn('Failed to parse extracted JSON block, trying line-by-line extraction');
        }
      }
      
      // Fallback to line-by-line extraction
      const lines = text.split('\n');
      const data: any = {};
      
      for (const line of lines) {
        const trimmedLine = line.trim();
        
        // Skip empty lines and code block markers
        if (!trimmedLine || trimmedLine.startsWith('```')) continue;
        
        // Look for key-value pairs
        const colonIndex = trimmedLine.indexOf(':');
        if (colonIndex > 0) {
          let key = trimmedLine.substring(0, colonIndex).trim();
          let value = trimmedLine.substring(colonIndex + 1).trim();
          
          // Clean up key - remove quotes and special characters
          key = key.replace(/^["']|["']$/g, '').replace(/[^a-zA-Z0-9_]/g, '');
          
          // Clean up value - remove quotes, commas
          value = value.replace(/^["']|["']$|,$/g, '').trim();
          
          if (key && value) {
            // Convert key to standard format
            const standardKey = this.normalizeKey(key);
            
            if (standardKey) {
              // Handle different value types
              if (value.startsWith('[')) {
                // Try to parse as array
                try {
                  data[standardKey] = JSON.parse(value);
                } catch {
                  // Fallback: split by comma
                  data[standardKey] = value.slice(1, -1).split(',').map(item => item.trim().replace(/^["']|["']$/g, ''));
                }
              } else if (!isNaN(Number(value))) {
                data[standardKey] = Number(value);
              } else {
                data[standardKey] = value;
              }
            }
          }
        }
      }

      // Validate and return standardized data
      if (data.title && data.description) {
        return {
          title: data.title,
          description: data.description,
          estimated_time: data.estimated_time || data.estimatedTime || 30,
          learning_outcomes: data.learning_outcomes || data.learningOutcomes || [],
          prerequisites: data.prerequisites || [],
          success_criteria: data.success_criteria || data.successCriteria || []
        };
      }
    } catch (error) {
      console.warn('Error in extractQuestData:', error);
    }

    return null;
  },

  // Helper function to normalize property keys
  normalizeKey(key: string): string | null {
    const keyLower = key.toLowerCase().replace(/[^a-zA-Z0-9]/g, '');
    
    const keyMappings: { [key: string]: string } = {
      'title': 'title',
      'description': 'description',
      'estimatedtime': 'estimated_time',
      'estimated_time': 'estimated_time',
      'learningoutcomes': 'learning_outcomes',
      'learning_outcomes': 'learning_outcomes',
      'prerequisites': 'prerequisites',
      'successcriteria': 'success_criteria',
      'success_criteria': 'success_criteria'
    };
    
    return keyMappings[keyLower] || null;
  },

  async generateQuest(params: QuestGenerationRequest) {
    // If no API keys available, use mock data
    if (GEMINI_API_KEYS.length === 0) {
      console.warn('No API keys available, using mock data');
      return this.getMockQuest(params);
    }

    // Try each model and API key combination until one works
    for (let modelIndex = 0; modelIndex < GEMINI_MODELS.length; modelIndex++) {
      for (const apiKey of GEMINI_API_KEYS) {
        const result = await this.tryWithApiKey(apiKey, params, modelIndex);
        if (result.success) {
          return { data: result.data, error: null };
        }
      }
    }

    // If all API keys and models fail, fall back to mock data
    console.warn('All API attempts failed across all models, using mock data');
    return this.getMockQuest(params);
  },

  constructPrompt(params: QuestGenerationRequest): string {
    const difficultyLevels = {
      beginner: "foundational concepts and basic implementations",
      intermediate: "moderate complexity and real-world applications",
      advanced: "complex problems and advanced techniques"
    };

    const skillLevelContext = `Level ${params.skillLevel} (${params.difficulty}) focusing on ${difficultyLevels[params.difficulty]}`;

    return `You are a helpful assistant that generates educational quests in valid JSON format only. Always respond with properly formatted JSON that matches the requested schema exactly.

Generate a practical ${params.skillName} quest for level ${params.skillLevel} (${params.difficulty}).

Context:
- Previous quests: ${params.previousQuests?.join(", ") || "None"}
- Category: ${params.category || "General"}
- Target skill level: ${skillLevelContext}

Requirements:
- Title: Maximum 60 characters, engaging and specific
- Description: Maximum 200 characters, clear and actionable
- Estimated time: Realistic completion time in minutes
- Learning outcomes: 2-3 specific skills the user will gain
- Prerequisites: Essential knowledge/tools needed
- Success criteria: 2-3 measurable completion indicators

Generate ONLY a JSON object with this exact structure (no other text):
{
  "title": "string (max 60 chars)",
  "description": "string (max 200 chars)",
  "estimated_time": number,
  "learning_outcomes": ["string", "string", "string"],
  "prerequisites": ["string", "string"],
  "success_criteria": ["string", "string", "string"]
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
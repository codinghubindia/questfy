import { Handler } from '@netlify/functions';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';

export const handler: Handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // Get the API key from the request headers
    const apiKey = event.headers['x-api-key'];
    if (!apiKey) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'API key is required' }),
      };
    }

    // Forward the request to Gemini API
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: event.body, // Forward the request body as-is
    });

    // Get the response data
    const data = await response.json();

    // Return the response
    return {
      statusCode: response.status,
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
        // Add CORS headers
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, X-API-KEY',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
    };
  } catch (error) {
    console.error('Proxy error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
}; 
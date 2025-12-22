const axios = require('axios');

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const { url } = event.queryStringParameters || {};

  if (!url) {
    return { 
      statusCode: 400, 
      headers, 
      body: JSON.stringify({ error: 'Missing URL parameter' }) 
    };
  }

  // Validate URL format
  try {
    new URL(url);
  } catch {
    return { 
      statusCode: 400, 
      headers, 
      body: JSON.stringify({ error: 'Invalid URL format' }) 
    };
  }

  // Rotate User Agents to mimic real browsers
  const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15'
  ];
  const randomAgent = userAgents[Math.floor(Math.random() * userAgents.length)];

  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': randomAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Referer': 'https://www.google.com/',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      },
      timeout: 8000,
      maxRedirects: 5
    });

    return { 
      statusCode: 200, 
      headers: {
        ...headers,
        'Content-Type': 'text/html; charset=utf-8'
      }, 
      body: response.data 
    };
  } catch (error) {
    const status = error.response?.status || 500;
    const message = error.response?.statusText || error.message;
    
    return { 
      statusCode: status, 
      headers, 
      body: JSON.stringify({ error: `Failed to fetch: ${message}` }) 
    };
  }
};

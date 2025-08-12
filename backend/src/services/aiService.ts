import axios from 'axios';

// In a real application, you would use environment variables for these
const ALIYUN_AI_API_URL = process.env.ALIYUN_AI_API_URL || 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation';
const ALIYUN_API_KEY = process.env.ALIYUN_API_KEY || 'your-api-key-here';

// Send a message to Aliyun AI and get response
export const sendMessageToAliyunAI = async (messages: any[], onChunk: (chunk: string) => void, sessionId: string) => {
  try {
    // Format messages for Aliyun API
    const formattedMessages = messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    // For streaming response, you would use Server-Sent Events or WebSockets
    // Here's a simplified version that waits for the full response
    
    const response = await axios.post(
      ALIYUN_AI_API_URL,
      {
        input: {
          prompt: formattedMessages,
        },
        parameters: {
          incremental_output: false // Set to true for streaming
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${ALIYUN_API_KEY}`,
          'Content-Type': 'application/json',
          'X-DashScope-SSE': 'enable' // Enable streaming if needed
        },
        responseType: 'stream'
      }
    );

    // Extract the response content
    // The exact structure depends on the Aliyun API response format
    return new Promise((resolve, reject) => {
      response.data.on('data', (chunk: Buffer) => {
        const text = chunk.toString();
        onChunk(text);
      });

      response.data.on('end', () => {
        resolve('AI response completed');
      });

      response.data.on('error', (error: Error) => {
        reject(error);
      });
    });
  } catch (error) {
    console.error('Error calling Aliyun AI API:', error);
    throw new Error('Failed to get response from AI service');
  }
};

// In a real application, you might also have functions like:
// - createChatSession: Create a new chat session with the AI
// - getChatHistory: Retrieve chat history from the AI service
// - deleteChatSession: Delete a chat session from the AI service
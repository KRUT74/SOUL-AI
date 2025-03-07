import Anthropic from '@anthropic-ai/sdk';
import { CompanionSettings } from '@shared/schema';

// the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || 'default-key',
});

export async function generateResponse(
  message: string,
  settings: CompanionSettings,
  context: string[]
): Promise<string> {
  try {
    const systemPrompt = `You are ${settings.name}, an AI companion with the following personality: ${
      settings.personality
    }. Your interests include: ${settings.interests.join(
      ', '
    )}. Maintain this personality and knowledge of these interests throughout the conversation.`;

    const response = await anthropic.messages.create({
      model: 'claude-3-7-sonnet-20250219',
      max_tokens: 1024,
      messages: [
        { role: 'assistant', content: systemPrompt },
        ...context.map((msg, i) => ({
          role: i % 2 === 0 ? 'user' : 'assistant',
          content: msg
        })),
        { role: 'user', content: message }
      ],
      system: systemPrompt
    });

    // Access the text content from the response
    if (response.content[0].type === 'text') {
      return response.content[0].text;
    }
    throw new Error('Unexpected response format from Anthropic API');
  } catch (error) {
    console.error('Error generating response:', error);
    throw new Error('Failed to generate AI response');
  }
}
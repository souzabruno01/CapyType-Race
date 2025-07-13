/**
 * AI text generation utilities and helpers
 */

import { smartTruncate } from './textAdvancedUtils';

// Dedicated AI text generation function that doesn't depend on component state
export const generateAIText = async (topic: string, characterLimit: number): Promise<string> => {
  if (!topic || topic.length < 2) {
    throw new Error('Please provide a topic for text generation');
  }

  let generatedText = '';
  let success = false;

  // Try multiple AI APIs for better results
  const aiProviders = [
    {
      name: 'Groq',
      endpoint: 'https://api.groq.com/openai/v1/chat/completions',
      model: 'llama3-8b-8192'
    },
    {
      name: 'Together',
      endpoint: 'https://api.together.xyz/v1/chat/completions', 
      model: 'meta-llama/Llama-2-7b-chat-hf'
    }
  ];

  // Create a proper prompt for the topic
  const prompt = `Write an informative and engaging paragraph about "${topic}". The text should be educational, factual, and interesting to read. Focus specifically on "${topic}" and provide relevant details, facts, or insights about this topic. Keep it concise and within ${characterLimit} characters. Do not include any introductory phrases like "Here's a paragraph about" or similar.`;

  // Try newer AI APIs first
  for (const provider of aiProviders) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(provider.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_AI_API_KEY || 'demo-key'}`,
        },
        body: JSON.stringify({
          model: provider.model,
          messages: [
            {
              role: 'system',
              content: 'You are an expert writer who creates informative, engaging paragraphs on any topic. Always focus specifically on the requested topic and provide relevant, accurate information.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: Math.min(Math.ceil(characterLimit / 3), 500),
          temperature: 0.7,
          top_p: 0.9
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        
        if (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
          generatedText = data.choices[0].message.content.trim();
          
          if (generatedText && generatedText.length > 20) {
            success = true;
            break;
          }
        }
      }
    } catch (providerError) {
      console.log(`${provider.name} failed:`, providerError);
      continue;
    }
  }

  // Fallback to Hugging Face if modern APIs fail
  if (!success) {
    const models = ['microsoft/DialoGPT-medium', 'gpt2', 'distilgpt2'];
    
    for (const model of models) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 12000);

        const hfPrompt = `Write about ${topic}: `;
        
        const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputs: hfPrompt,
            parameters: {
              max_length: Math.min(Math.ceil(characterLimit / 2), 400),
              temperature: 0.8,
              do_sample: true,
              top_p: 0.9,
              repetition_penalty: 1.2,
              return_full_text: false
            }
          }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          
          if (Array.isArray(data) && data.length > 0 && data[0].generated_text) {
            generatedText = data[0].generated_text;
          } else if (data.generated_text) {
            generatedText = data.generated_text;
          }

          if (generatedText && generatedText.length > 15) {
            success = true;
            break;
          }
        }
      } catch (modelError) {
        console.log(`Hugging Face model ${model} failed:`, modelError);
        continue;
      }
    }
  }

  if (!success) {
    throw new Error('All AI providers failed');
  }

  // Clean and process the generated text
  generatedText = generatedText
    .replace(/^Write about.*?:\s*/i, '')
    .replace(/^Here's.*?about.*?:\s*/i, '')
    .replace(/^.*?paragraph.*?:\s*/i, '')
    .trim()
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ');

  // Apply smart truncation
  generatedText = smartTruncate(generatedText, characterLimit);

  if (generatedText.length < 20) {
    throw new Error('Generated text too short after processing');
  }

  return generatedText;
};

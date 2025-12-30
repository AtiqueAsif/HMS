export type ChatMessage = { role: 'user' | 'system' | 'assistant'; content: string };

export class OpenRouter {
  private apiKey: string;
  private defaultHeaders: Record<string, string>;

  constructor(opts: { apiKey: string; defaultHeaders?: Record<string, string> }) {
    this.apiKey = opts.apiKey;
    this.defaultHeaders = opts.defaultHeaders || {};
  }

  // Function to clean up AI response text
  private cleanAIResponse(text: string): string {
    if (!text) return text;
    
    // Remove markdown formatting characters
    return text
      .replace(/\*\*/g, '')  // Remove bold markers
      .replace(/\*/g, '')     // Remove italic markers
      .replace(/__/g, '')     // Remove underline markers
      .replace(/#/g, '')      // Remove hash symbols
      .replace(/```[a-z]*\n?/g, '')  // Remove code block markers
      .replace(/```/g, '')    // Remove remaining code block markers
      .replace(/~~/g, '')     // Remove strikethrough markers
      .replace(/\|/g, '')     // Remove table markers
      .replace(/\\n/g, '\n') // Fix escaped newlines
      .trim();                // Trim whitespace
  }

  // Function to format text with proper line breaks
  private formatAIResponse(text: string): string {
    if (!text) return text;
    
    // Clean the text first
    const cleanedText = this.cleanAIResponse(text);
    
    // Convert newlines to HTML line breaks for proper display
    return cleanedText.replace(/\n/g, '<br>');
  }

  chat = {
    send: async (payload: { model: string; messages: ChatMessage[]; stream?: boolean }) => {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
          ...this.defaultHeaders,
        },
        body: JSON.stringify({
          model: payload.model,
          messages: payload.messages,
          stream: !!payload.stream,
        }),
      });
      
      const response = await res.json();
      
      // Clean up the AI response if it contains content
      if (response && response.choices && response.choices[0] && response.choices[0].message && response.choices[0].message.content) {
        response.choices[0].message.content = this.cleanAIResponse(response.choices[0].message.content);
      }
      
      return response;
    },
  };
}


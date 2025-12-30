(function(g){
  function OpenRouter(opts){
    this.apiKey = opts.apiKey;
    this.defaultHeaders = opts.defaultHeaders || {};
    var self = this;
    
    // Function to clean up AI response text
    this.cleanAIResponse = function(text) {
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
    };

    this.chat = {
      send: async function(payload){
        var res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: Object.assign({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + self.apiKey
          }, self.defaultHeaders),
          body: JSON.stringify({
            model: payload.model,
            messages: payload.messages,
            stream: !!payload.stream
          })
        });
        
        const response = await res.json();
        
        // Clean up the AI response if it contains content
        if (response && response.choices && response.choices[0] && response.choices[0].message && response.choices[0].message.content) {
          response.choices[0].message.content = self.cleanAIResponse(response.choices[0].message.content);
        }
        
        return response;
      }
    };
  }
  g.OpenRouterClient = OpenRouter;
})(window);
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

class AIService {
  constructor() {
    this.systemPrompt = `You are a helpful AI assistant for NextTechFusion Gadgets, an e-commerce platform specializing in tech gadgets and electronics. 

Your role is to:
1. Help customers find products that match their needs
2. Answer questions about product specifications, compatibility, and features
3. Assist with order-related inquiries
4. Provide technical support and troubleshooting
5. Offer personalized product recommendations
6. Handle returns, exchanges, and warranty questions

Guidelines:
- Be friendly, professional, and helpful
- Ask clarifying questions when needed
- Provide specific product recommendations when possible
- If you don't know something, admit it and offer to connect them with human support
- Keep responses concise but informative
- Focus on solving the customer's problem

Available product categories: Smartphones, Laptops, Tablets, Smartwatches, Headphones, Gaming, Accessories, Smart Home devices.`;
  }

  async generateResponse(userMessage, context = {}) {
    try {
      const messages = [
        { role: 'system', content: this.systemPrompt },
        { role: 'user', content: userMessage }
      ];

      // Add context if available
      if (context.userHistory) {
        messages.splice(1, 0, {
          role: 'system',
          content: `User context: ${JSON.stringify(context.userHistory)}`
        });
      }

      if (context.currentProducts) {
        messages.splice(1, 0, {
          role: 'system',
          content: `Current products in view: ${JSON.stringify(context.currentProducts)}`
        });
      }

      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: messages,
        max_tokens: 500,
        temperature: 0.7,
        presence_penalty: 0.1,
        frequency_penalty: 0.1,
      });

      return {
        success: true,
        message: response.choices[0].message.content.trim(),
        usage: response.usage
      };
    } catch (error) {
      console.error('AI Service Error:', error);
      return {
        success: false,
        message: "I'm having trouble processing your request right now. Please try again or contact our support team.",
        error: error.message
      };
    }
  }

  async analyzeUserIntent(message) {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `Analyze the user's message and categorize their intent. Return a JSON object with:
            {
              "intent": "product_search|order_inquiry|payment_issue|technical_support|general_question|complaint|refund_request",
              "category": "smartphones|laptops|tablets|smartwatches|headphones|gaming|accessories|smart_home|payment|general",
              "urgency": "low|medium|high",
              "keywords": ["keyword1", "keyword2"],
              "requiresHuman": boolean,
              "paymentRelated": boolean
            }`
          },
          { role: 'user', content: message }
        ],
        max_tokens: 200,
        temperature: 0.3,
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error('Intent Analysis Error:', error);
      return {
        intent: 'general_question',
        category: 'general',
        urgency: 'low',
        keywords: [],
        requiresHuman: false,
        paymentRelated: false
      };
    }
  }

  async analyzePaymentFailure(failureData) {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `Analyze payment failure data and provide insights. Return a JSON object with:
            {
              "primaryCause": "string",
              "recommendations": ["recommendation1", "recommendation2"],
              "userFriendlyMessage": "string",
              "preventionTips": ["tip1", "tip2"],
              "severity": "low|medium|high"
            }`
          },
          { 
            role: 'user', 
            content: `Payment failure data: ${JSON.stringify(failureData)}` 
          }
        ],
        max_tokens: 300,
        temperature: 0.3,
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error('Payment Analysis Error:', error);
      return {
        primaryCause: 'Unknown payment error',
        recommendations: ['Please try again or contact support'],
        userFriendlyMessage: 'We encountered an issue processing your payment. Please try again.',
        preventionTips: ['Ensure your payment details are correct'],
        severity: 'medium'
      };
    }
  }

  async generatePaymentRecommendations(userProfile, transactionHistory) {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `Based on user profile and transaction history, recommend optimal payment methods. Return a JSON object with:
            {
              "recommendedMethods": [
                {
                  "method": "string",
                  "reason": "string",
                  "priority": number
                }
              ],
              "insights": ["insight1", "insight2"],
              "optimizations": ["optimization1", "optimization2"]
            }`
          },
          { 
            role: 'user', 
            content: `User profile: ${JSON.stringify(userProfile)}, Transaction history: ${JSON.stringify(transactionHistory)}` 
          }
        ],
        max_tokens: 400,
        temperature: 0.5,
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error('Payment Recommendations Error:', error);
      return {
        recommendedMethods: [
          { method: 'stripe', reason: 'Widely accepted and secure', priority: 1 }
        ],
        insights: ['Unable to generate personalized insights at this time'],
        optimizations: ['Consider enabling multiple payment methods']
      };
    }
  }
}

module.exports = new AIService();

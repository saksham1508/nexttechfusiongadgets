const OpenAI = require('openai');
const { generateWithGemini } = require('./geminiClient');

// Create OpenAI client only if API key is present
let openai = null;
(async () => {
  try {
    if (process.env.OPENAI_API_KEY) {
      const fetch = (await import('node-fetch')).default; // ESM import
      openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, fetch });
      console.log('🔗 OpenAI client initialized');
    } else {
      console.warn('⚠️  OPENAI_API_KEY not set — AI service will use fallback logic');
    }
  } catch (e) {
    console.warn('⚠️  Failed to initialize OpenAI client, using fallback logic:', e.message);
    openai = null;
  }
})();

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

  // Fallback lightweight intent detection (no OpenAI required)
  simpleIntent(message) {
    const m = message.toLowerCase();
    const contains = (...words) => words.some(w => m.includes(w));

    if (contains('refund', 'return', 'exchange')) {
      return { intent: 'refund_request', category: 'general', urgency: 'medium', keywords: ['refund'], requiresHuman: false, paymentRelated: false };
    }
    if (contains('payment', 'card', 'upi', 'stripe', 'razorpay', 'paypal')) {
      return { intent: 'payment_issue', category: 'payment', urgency: contains('failed','declined','error') ? 'high' : 'medium', keywords: ['payment'], requiresHuman: false, paymentRelated: true };
    }
    if (contains('order', 'track', 'shipping', 'delivery')) {
      return { intent: 'order_inquiry', category: 'general', urgency: 'low', keywords: ['order'], requiresHuman: false, paymentRelated: false };
    }
    if (contains('iphone','android','laptop','macbook','tablet','watch','earbuds','headphone','airpods')) {
      return { intent: 'product_search', category: contains('iphone','macbook','airpods') ? 'smartphones' : 'general', urgency: 'low', keywords: ['product'], requiresHuman: false, paymentRelated: false };
    }
    if (contains('not working','issue','problem','bug','error')) {
      return { intent: 'technical_support', category: 'general', urgency: 'medium', keywords: ['support'], requiresHuman: false, paymentRelated: false };
    }
    return { intent: 'general_question', category: 'general', urgency: 'low', keywords: [], requiresHuman: false, paymentRelated: false };
  }

  async generateResponse(userMessage, context = {}) {
    // Prefer Gemini in production when key is present
    if (process.env.NODE_ENV === 'production' && process.env.GEMINI_API_KEY) {
      try {
        const contextBits = [];
        if (context.userHistory) contextBits.push(`User context: ${JSON.stringify(context.userHistory)}`);
        if (context.currentProducts) contextBits.push(`Current products: ${JSON.stringify(context.currentProducts)}`);
        const prompt = `${this.systemPrompt}\n${contextBits.join('\n')}\nUser: ${userMessage}`;
        const message = await generateWithGemini({ text: prompt });
        return { success: true, message };
      } catch (err) {
        console.warn('Gemini failed, falling back to OpenAI/fallback:', err.message);
        // continue to OpenAI/fallback below
      }
    }

    // Fallback response without OpenAI
    if (!openai) {
      const parts = [];
      if (context.currentProducts?.length) {
        parts.push(`I see ${context.currentProducts.length} related products available.`);
      }
      if (context.userHistory?.recentOrders?.length) {
        parts.push(`I also found ${context.userHistory.recentOrders.length} recent orders in your account.`);
      }
      const base = `Thanks for your message. I can help with product recommendations, orders, and support. ${parts.join(' ')}`.trim();
      return { success: true, message: base };
    }

    try {
      const messages = [
        { role: 'system', content: this.systemPrompt },
        { role: 'user', content: userMessage }
      ];

      if (context.userHistory) {
        messages.splice(1, 0, { role: 'system', content: `User context: ${JSON.stringify(context.userHistory)}` });
      }
      if (context.currentProducts) {
        messages.splice(1, 0, { role: 'system', content: `Current products in view: ${JSON.stringify(context.currentProducts)}` });
      }

      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages,
        max_tokens: 500,
        temperature: 0.7,
        presence_penalty: 0.1,
        frequency_penalty: 0.1
      });

      return { success: true, message: response.choices[0].message.content.trim(), usage: response.usage };
    } catch (error) {
      console.error('AI Service Error:', error);
      const parts = [];
      if (context && context.currentProducts && context.currentProducts.length) {
        parts.push(`I see ${context.currentProducts.length} related products available.`);
      }
      if (context && context.userHistory && context.userHistory.recentOrders && context.userHistory.recentOrders.length) {
        parts.push(`I also found ${context.userHistory.recentOrders.length} recent orders in your account.`);
      }
      const base = `Thanks for your message. I can help with product recommendations, orders, and support. ${parts.join(' ')}`.trim();
      return { success: true, message: base, fallback: true, error: error.message };
    }
  }

  async analyzeUserIntent(message) {
    // Use fallback if no OpenAI
    if (!openai) {
      return this.simpleIntent(message);
    }

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: `Analyze the user's message and return a JSON object with: { "intent": "product_search|order_inquiry|payment_issue|technical_support|general_question|complaint|refund_request", "category": "smartphones|laptops|tablets|smartwatches|headphones|gaming|accessories|smart_home|payment|general", "urgency": "low|medium|high", "keywords": ["keyword1"], "requiresHuman": boolean, "paymentRelated": boolean }` },
          { role: 'user', content: message }
        ],
        max_tokens: 200,
        temperature: 0.3
      });
      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error('Intent Analysis Error:', error);
      return this.simpleIntent(message);
    }
  }

  async analyzePaymentFailure(failureData) {
    if (!openai) {
      return {
        primaryCause: 'Unknown payment error',
        recommendations: ['Retry after checking network and card details'],
        userFriendlyMessage: 'We encountered an issue processing your payment. Please try again.',
        preventionTips: ['Ensure your payment details are correct'],
        severity: 'medium'
      };
    }

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: `Analyze payment failure data and provide insights as JSON { primaryCause, recommendations[], userFriendlyMessage, preventionTips[], severity }` },
          { role: 'user', content: `Payment failure data: ${JSON.stringify(failureData)}` }
        ],
        max_tokens: 300,
        temperature: 0.3
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
    if (!openai) {
      return {
        recommendedMethods: [{ method: 'stripe', reason: 'Widely accepted and secure', priority: 1 }],
        insights: ['Using default recommendations without AI'],
        optimizations: ['Enable multiple payment methods for higher success rate']
      };
    }

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: `Based on user profile and transaction history, recommend optimal payment methods. Return JSON { recommendedMethods[], insights[], optimizations[] }` },
          { role: 'user', content: `User profile: ${JSON.stringify(userProfile)}, Transaction history: ${JSON.stringify(transactionHistory)}` }
        ],
        max_tokens: 400,
        temperature: 0.5
      });
      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error('Payment Recommendations Error:', error);
      return {
        recommendedMethods: [{ method: 'stripe', reason: 'Widely accepted and secure', priority: 1 }],
        insights: ['Unable to generate personalized insights at this time'],
        optimizations: ['Consider enabling multiple payment methods']
      };
    }
  }


}


module.exports = new AIService();
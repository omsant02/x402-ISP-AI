import 'dotenv/config';
import express from 'express';
import { paymentMiddleware } from 'x402-express';
import OpenAI from 'openai';

const app = express();
const PORT = process.env.PORT || 4021;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.use(express.json());

// Payment middleware
app.use(paymentMiddleware(
  process.env.SELLER_ADDRESS,
  {
    "POST /get-strategy": {
      price: "$0.001",
      network: "base-sepolia",
    },
  },
  {
    url: "https://x402.org/facilitator",
  }
));

// PAID endpoint - Simple Initial Investment Strategy
app.post('/get-strategy', async (req, res) => {
  console.log('✅ Payment verified! Generating strategy...\n');
  
  const { amount, timeHorizon, riskTolerance } = req.body;

  console.log('📊 Parameters:');
  console.log(`   Amount: $${amount}`);
  console.log(`   Time: ${timeHorizon}`);
  console.log(`   Risk: ${riskTolerance}\n`);

  // Simple AI prompt
  const prompt = `You are a DeFi expert. A user wants to invest $${amount} for ${timeHorizon} with ${riskTolerance} risk.

Allocate this amount across:
- Aave (safe, 4-6% APY)
- Compound (safe, 4-5% APY)
- Uniswap (risky, 10-15% APY)

Respond ONLY with JSON:
{
  "aave": <percentage>,
  "compound": <percentage>,
  "uniswap": <percentage>
}

Percentages must sum to 100.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Respond only with valid JSON." },
        { role: "user", content: prompt }
      ],
      temperature: 0.5,
    });

    let response = completion.choices[0].message.content;
    response = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    const strategy = JSON.parse(response);

    console.log('✅ Strategy:', strategy);

    res.json({
      success: true,
      strategy: strategy,
      breakdown: {
        aave: `$${(amount * strategy.aave / 100).toFixed(2)}`,
        compound: `$${(amount * strategy.compound / 100).toFixed(2)}`,
        uniswap: `$${(amount * strategy.uniswap / 100).toFixed(2)}`
      }
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({ error: 'Failed to generate strategy' });
  }
});

app.listen(PORT, () => {
  console.log(`🤖 Expert AI Agent: http://localhost:${PORT}`);
  console.log(`💵 Cost: 0.001 USDC per strategy\n`);
});
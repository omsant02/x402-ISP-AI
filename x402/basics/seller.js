import 'dotenv/config';
import express from 'express';
import { paymentMiddleware } from 'x402-express';

const app = express();
const PORT = process.env.PORT || 4021;

// Add payment middleware (from official docs)
app.use(paymentMiddleware(
  process.env.SELLER_ADDRESS,  // Your receiving wallet
  {
    // Protected route: /generate-story
    "GET /generate-story": {
      price: "$0.001",  // Price in USDC
      network: "base-sepolia",  // Test network
    },
  },
  {
    url: "https://x402.org/facilitator",  // Official testnet facilitator
  }
));

// The actual protected endpoint
app.get('/get-strategy', (req, res) => {
    const promt = req.body.prompt;
  console.log('✅ Payment verified! Generating story...');
  
  // Mock AI response (replace with OpenAI later)
  const story = {
    title: "The Blockchain Adventure",
    content: "Once upon a time, in a decentralized world, a smart contract named Alice discovered the true meaning of trustlessness...",
    author: "x402 AI",
    timestamp: new Date().toISOString()
  };ß
  
  res.json({
    success: true,
    data: story,
    message: "Story generated successfully! Payment received."
  });
});

// // Health check endpoint (free, no payment required)
// app.get('/health', (req, res) => {
//   res.json({ status: 'ok', message: 'Server is running' });
// });

app.listen(PORT, () => {
  console.log(`🚀 Seller API running on http://localhost:${PORT}`);
  console.log(`💰 Receiving payments at: ${process.env.SELLER_ADDRESS}`);
  console.log(`\nTry accessing: http://localhost:${PORT}/generate-story`);
  console.log(`This will return 402 Payment Required\n`);
});
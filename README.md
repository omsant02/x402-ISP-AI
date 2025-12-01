# 🚀 x402-ISP-AI: AI-Powered Investment Plans with Decentralized Payments

**Built for ETHIndia Villa 2025**

Save for your goals with AI-optimized investment strategies. Tell our AI what you're saving for, and it automatically consults expert AI advisors - **paying them directly via blockchain** - to create your personalized DeFi investment plan.

**Powered by x402:** Your AI agent autonomously purchases expert financial strategies using crypto micropayments. No subscriptions, no API keys, just instant pay-per-use AI services.


<img width="1278" height="573" alt="image" src="https://github.com/user-attachments/assets/58feae4c-f269-4624-ba8b-9b5e0a510e7c" />



---

## 💡 What Makes This Special

**Traditional approach:**
- Subscribe to investment advisor ($99/month)
- Trust centralized recommendations
- Manual portfolio management

**Our approach:**
- 💬 Chat: "I want to save 0.12 ETH for a car in 12 months"
- 🤖 AI calculates your monthly investment (0.01 ETH)
- 💸 **AI pays Expert AI 0.001 USDC via x402** for strategy
- ✅ Funds automatically allocated to Aave, Compound, Uniswap
- 🔍 Everything verifiable on-chain

**The x402 Magic:** Your Protocol AI doesn't need your permission to consult experts. It simply pays for the service it needs (0.001 USDC per strategy) and gets back professional investment advice instantly. This is the future of AI services - **autonomous, pay-per-use, decentralized**.

---

## 🎯 User Experience

1. **You:** "I want to save for a toy worth 0.12 ETH in 12 months with low risk"
2. **Protocol AI:** *Calculates you need 0.01 ETH/month, pays Expert AI for strategy*
3. **Expert AI:** *Analyzes and returns: 50% Aave, 50% Compound, 0% Uniswap (low risk)*
4. **You:** Approve the 0.01 ETH deposit
5. **Smart Contract:** Automatically distributes across DeFi protocols
6. **Result:** Your investment is working, optimized by AI, all on-chain

**Behind the scenes:** AI agents are discovering services, negotiating prices, and transacting value - all enabled by x402's payment protocol.

---

## 🏗️ Architecture
```
USER
  ↓ (wants to save 0.12 ETH)
  ↓
PROTOCOL AI AGENT (Free)
  ↓ (calculates: 0.01 ETH/month)
  ↓
  ├─→ EXPERT AI AGENT (x402 Payment: 0.001 USDC) 💰
  │   ├─ Analyzes: amount, timeline, risk tolerance
  │   └─ Returns: DeFi allocation strategy
  ↓
SMART CONTRACT (SIPProtocol.sol)
  ↓ (receives 0.01 ETH, stores plan)
  ↓
  ├─→ MockAave (50% = 0.005 ETH)
  ├─→ MockCompound (50% = 0.005 ETH)
  └─→ MockUniswap (0% = 0.000 ETH)
```
**Contracts Deployed**
```
USER_ADDRESS=0xDBA0c4FC9C9c215396852fcA118213092CEa5674
BUYER_ADDRESS=0x5000BCC077911724C7A880a78c17F768caB5b7a2
SELLER_ADDRESS=0xDEbf4BFD4575a55aa261a9eA6a32000d47E10a9A

SIP_PROTOCOL_ADDRESS=0xa718997243459453804a00bfd06F571820Bc85A5
MOCK_AAVE_ADDRESS=0x68839DB8a89434c2E16bD103BE0Aae6dddf24a90
MOCK_COMPOUND_ADDRESS=0x6Bb3A3d3df74E6B28F3ebd7341AA6C3b70306aAB
MOCK_UNISWAP_ADDRESS=0x7cDBf5C2657fF228FB494bc447b4BA8FFCD46293
```


**Flow:**
- Protocol AI Agent acts as **buyer** (pays Expert AI)
- Expert AI Agent acts as **seller** (receives payment via x402)
- Payment happens automatically using x402 protocol
- All transactions verifiable on Base Sepolia

---

## 🛠️ Tech Stack

### **Smart Contracts**
- Solidity ^0.8.20
- Base Sepolia testnet
- Mock DeFi protocols (Aave, Compound, Uniswap)

### **AI Agents**
- Node.js + Express
- OpenAI GPT-4 (Expert AI strategy generation)
- x402-express (seller/payment receiver)
- x402-axios (buyer/payment sender)

### **Payment Infrastructure**
- x402 protocol for AI-to-AI payments
- USDC micropayments (0.001 USDC per strategy)
- ETH-based user investments

---

## 📁 Project Structure
```
x402-ISP-AI/
├── contracts/                  # Smart contracts
│   ├── SIPProtocol.sol        # Main SIP logic
│   ├── MockAave.sol           # Mock Aave
│   ├── MockCompound.sol       # Mock Compound
│   └── MockUniswap.sol        # Mock Uniswap
│
└── x402/                       # AI Agents
    ├── 1-expert-agent.js      # Expert AI (seller)
    ├── 2-interactive-demo.js  # Protocol AI (buyer) - CLI demo
    ├── protocol-logic.js      # Shared logic
    └── protocol-agent.js      # Automated version
```

---

## 🚀 Quick Start

### **Prerequisites**

1. Node.js v18+
2. Base Sepolia testnet access
3. OpenAI API key

### **Environment Setup**
```bash
# Clone repo
git clone https://github.com/omsant02/x402-ISP-AI.git
cd x402-ISP-AI/x402

# Install dependencies
npm install

# Configure .env (see .env.example)
SELLER_ADDRESS=0x...           # Expert AI receives payments here
BUYER_PRIVATE_KEY=0x...        # Protocol AI pays from here
USER_PRIVATE_KEY=0x...         # End user deposits from here

SIP_PROTOCOL_ADDRESS=0x...     # Deployed SIP contract
MOCK_AAVE_ADDRESS=0x...
MOCK_COMPOUND_ADDRESS=0x...
MOCK_UNISWAP_ADDRESS=0x...

OPENAI_API_KEY=sk-...
RPC_URL=https://sepolia.base.org
```

### **Fund Wallets**

- **User Wallet:** 0.02 ETH (0.01 for SIP + gas)
- **Buyer Wallet:** 0.001 USDC (for Expert AI payment)

Get testnet funds: [Alchemy Base Sepolia Faucet](https://www.alchemy.com/faucets/base-sepolia)

---

## 🧪 Testing

### **Terminal 1: Start Expert AI Agent (Seller)**
```bash
node 1-expert-agent.js
```

Expected output:
```
🤖 Expert AI Agent: http://localhost:4021
💵 Cost: 0.001 USDC per strategy
```

### **Terminal 2: Run Interactive Demo (Buyer)**
```bash
node 2-interactive-demo.js
```

Follow the prompts:
```
What would you like to save for? > toy
How much does it cost? (in ETH) > 0.12
In how many months? > 12
Risk tolerance? (low/moderate/high) > moderate
```

The system will:
1. Calculate monthly deposit (0.01 ETH)
2. Pay Expert AI 0.001 USDC via x402
3. Receive strategy from Expert AI
4. Execute first deposit on-chain
5. Allocate funds to mock protocols

All transactions are **real** and verifiable on [Base Sepolia Explorer](https://sepolia.basescan.org/).

---

## 📊 How x402 Works

### **Payment Flow**
```
1. Protocol AI calls Expert AI API
   → Gets HTTP 402 Payment Required

2. x402-axios (buyer side) intercepts 402
   → Creates payment proof
   → Signs with private key
   → Executes USDC transfer on-chain

3. Retries request with X-PAYMENT header
   → Contains cryptographic payment proof

4. x402-express (seller side) verifies
   → Checks signature validity
   → Confirms on-chain transaction via facilitator
   → Allows request through ✅

5. Expert AI processes request
   → Returns investment strategy
```

**Key Point:** Payment happens **automatically** - no manual approvals needed in code. The x402 libraries handle the entire payment flow.

---

## 🎓 Key Learnings

### **Why x402 Matters**

Traditional APIs require:
- API keys
- Subscription management
- Rate limiting
- Authentication infrastructure

With x402:
- ✅ Pay-per-use (true micropayments)
- ✅ No API keys needed
- ✅ No user accounts
- ✅ Perfect for AI agent economies
- ✅ Enables AI-to-AI commerce

### **Technical Highlights**

1. **Automatic Payment**: x402 libraries handle payment flow transparently
2. **On-Chain Verification**: Every payment is a real blockchain transaction
3. **AI Adaptation**: Expert AI adjusts strategy based on risk tolerance
4. **Smart Contract Integration**: Seamless DeFi protocol interaction

---

## 🔗 Live Demo Transaction

Example successful transaction: [View on BaseScan](https://sepolia.basescan.org/tx/0x5926f19184af79194074f8f4e349820c97500ed3aaa75804f5dc632de574bf61)

**What happened:**
- User deposited 0.01 ETH
- Smart contract allocated:
  - 50% → MockAave (0.005 ETH)
  - 50% → MockCompound (0.005 ETH)
  - 0% → MockUniswap (low risk strategy)

---

## 🔮 Future Enhancements

- [ ] Chainlink Automation for monthly deposits
- [ ] Periodic rebalancing (Expert AI called every 3 days)
- [ ] Real Aave/Compound/Uniswap integration
- [ ] Multi-strategy support
- [ ] Frontend UI (currently CLI)
- [ ] Starknet implementation

---

## 🏆 ETHIndia Villa 2025

**Built by:** [Om Santoshwar](https://github.com/omsant02) , [Ayush Ranjan](https://github.com/ayush-ranjan-official) , [Thirumurugan Sivalingam](https://github.com/Thirumurugan7) , [Adithya](https://github.com/Adithya2310)

**Tracks:**
- x402 Protocol Integration
- AI Agents
- DeFi Innovation

**Sponsor Technologies:**
- Base (deployment network)
- OpenAI (AI strategy generation)
- x402 (payment protocol)

---

## 📄 License

MIT

---

**Made with ❤️ for the future of autonomous AI economies**

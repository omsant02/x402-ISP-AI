import 'dotenv/config';
import { withPaymentInterceptor } from 'x402-axios';
import axios from 'axios';
import { createWalletClient, http, parseEther, createPublicClient } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { baseSepolia } from 'viem/chains';

const SIP_PROTOCOL_ABI = [
  {
    "inputs": [
      {"name": "totalAmount", "type": "uint256"},
      {"name": "monthlyAmount", "type": "uint256"},
      {"name": "duration", "type": "uint256"},
      {"name": "aavePercent", "type": "uint8"},
      {"name": "compoundPercent", "type": "uint8"},
      {"name": "uniswapPercent", "type": "uint8"}
    ],
    "name": "createSIPPlan",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{"name": "user", "type": "address"}],
    "name": "getPlan",
    "outputs": [
      {
        "components": [
          {"name": "user", "type": "address"},
          {"name": "totalAmount", "type": "uint256"},
          {"name": "monthlyAmount", "type": "uint256"},
          {"name": "duration", "type": "uint256"},
          {
            "name": "strategy",
            "type": "tuple",
            "components": [
              {"name": "aavePercent", "type": "uint8"},
              {"name": "compoundPercent", "type": "uint8"},
              {"name": "uniswapPercent", "type": "uint8"}
            ]
          },
          {"name": "deposited", "type": "uint256"},
          {"name": "createdAt", "type": "uint256"},
          {"name": "active", "type": "bool"}
        ],
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

const MOCK_PROTOCOL_ABI = [
  {
    "inputs": [{"name": "user", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
];

export class ProtocolLogic {
  constructor() {
    this.buyerAccount = privateKeyToAccount(process.env.BUYER_PRIVATE_KEY);
    this.userAccount = privateKeyToAccount(process.env.USER_PRIVATE_KEY);
    
    this.buyerClient = createWalletClient({
      account: this.buyerAccount,
      chain: baseSepolia,
      transport: http(process.env.RPC_URL),
    });

    this.userClient = createWalletClient({
      account: this.userAccount,
      chain: baseSepolia,
      transport: http(process.env.RPC_URL),
    });

    this.publicClient = createPublicClient({
      chain: baseSepolia,
      transport: http(process.env.RPC_URL),
    });

    this.api = withPaymentInterceptor(
      axios.create({ baseURL: process.env.EXPERT_AGENT_URL }),
      this.buyerAccount
    );
  }

  calculateMonthlyAmount(totalAmount, months) {
    return totalAmount / months;
  }

  async callExpertAI(totalAmount, timeHorizon, riskTolerance) {
    const response = await this.api.post('/get-strategy', {
      amount: totalAmount * 1000, // Convert to USD equivalent
      timeHorizon: `${timeHorizon} months`,
      riskTolerance: riskTolerance
    });

    return response.data.strategy;
  }

  async createSIPOnChain(totalAmount, monthlyAmount, duration, strategy) {
    const totalAmountWei = parseEther(totalAmount.toString());
    const monthlyAmountWei = parseEther(monthlyAmount.toString());

    const hash = await this.userClient.writeContract({
      address: process.env.SIP_PROTOCOL_ADDRESS,
      abi: SIP_PROTOCOL_ABI,
      functionName: 'createSIPPlan',
      args: [
        totalAmountWei,
        monthlyAmountWei,
        BigInt(duration),
        strategy.aave,
        strategy.compound,
        strategy.uniswap
      ],
      value: totalAmountWei,
    });

    await this.publicClient.waitForTransactionReceipt({ hash });
    return hash;
  }

  async getProtocolBalances() {
    const aaveBalance = await this.publicClient.readContract({
      address: process.env.MOCK_AAVE_ADDRESS,
      abi: MOCK_PROTOCOL_ABI,
      functionName: 'balanceOf',
      args: [process.env.SIP_PROTOCOL_ADDRESS],
    });

    const compoundBalance = await this.publicClient.readContract({
      address: process.env.MOCK_COMPOUND_ADDRESS,
      abi: MOCK_PROTOCOL_ABI,
      functionName: 'balanceOf',
      args: [process.env.SIP_PROTOCOL_ADDRESS],
    });

    const uniswapBalance = await this.publicClient.readContract({
      address: process.env.MOCK_UNISWAP_ADDRESS,
      abi: MOCK_PROTOCOL_ABI,
      functionName: 'balanceOf',
      args: [process.env.SIP_PROTOCOL_ADDRESS],
    });

    return {
      aave: Number(aaveBalance) / 1e18,
      compound: Number(compoundBalance) / 1e18,
      uniswap: Number(uniswapBalance) / 1e18
    };
  }
}
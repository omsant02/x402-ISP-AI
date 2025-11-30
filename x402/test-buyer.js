import 'dotenv/config';
import { withPaymentInterceptor } from 'x402-axios';
import axios from 'axios';
import { privateKeyToAccount } from 'viem/accounts';

const account = privateKeyToAccount(process.env.BUYER_PRIVATE_KEY);
const api = withPaymentInterceptor(
  axios.create({ baseURL: 'http://localhost:4021' }),
  account
);

async function testMultipleScenarios() {
  
  // Scenario 1: Conservative investor
  console.log('📊 TEST 1: Conservative Investor (Low Risk)\n');
  const response1 = await api.post('/get-strategy', {
    amount: 833,
    timeHorizon: "12 months",
    riskTolerance: "low"
  });
  console.log('Strategy:', response1.data.strategy);
  console.log('Breakdown:', response1.data.breakdown);
  console.log('\n---\n');

  // Scenario 2: Aggressive investor
  console.log('📊 TEST 2: Aggressive Investor (High Risk)\n');
  const response2 = await api.post('/get-strategy', {
    amount: 833,
    timeHorizon: "12 months",
    riskTolerance: "high"
  });
  console.log('Strategy:', response2.data.strategy);
  console.log('Breakdown:', response2.data.breakdown);
  console.log('\n---\n');

  // Scenario 3: Short timeline
  console.log('📊 TEST 3: Short Timeline (3 months)\n');
  const response3 = await api.post('/get-strategy', {
    amount: 833,
    timeHorizon: "3 months",
    riskTolerance: "moderate"
  });
  console.log('Strategy:', response3.data.strategy);
  console.log('Breakdown:', response3.data.breakdown);
  console.log('\n---\n');
}

testMultipleScenarios().catch(console.error);
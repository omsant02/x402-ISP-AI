import 'dotenv/config';
import { withPaymentInterceptor, decodeXPaymentResponse } from 'x402-axios';
import axios from 'axios';
import { createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { baseSepolia } from 'viem/chains';

const BASE_URL = 'http://localhost:4021';

async function main() {
  console.log('🔐 Setting up buyer wallet...\n');

  // Create wallet account (from official docs)
  const account = privateKeyToAccount(process.env.BUYER_PRIVATE_KEY);
  console.log(`Buyer address: ${account.address}`);

  // Create Axios instance with payment interceptor
  const api = withPaymentInterceptor(
    axios.create({
      baseURL: BASE_URL,
    }),
    account
  );

  console.log('\n💸 Attempting to access paid endpoint...\n');

  try {
    // Make paid request
    const response = await api.get('/generate-story');
    
    console.log('✅ SUCCESS! Received response:\n');
    console.log(JSON.stringify(response.data, null, 2));

    // Decode payment response
    const paymentResponse = decodeXPaymentResponse(
      response.headers['x-payment-response']
    );
    console.log('\n💳 Payment Details:');
    console.log(paymentResponse);

  } catch (error) {
    if (error.response?.status === 402) {
      console.error('❌ Payment Required (402)');
      console.error('Payment instructions:', error.response.data);
    } else {
      console.error('❌ Error:', error.message);
      if (error.response) {
        console.error('Response:', error.response.data);
      }
    }
  }
}

main();
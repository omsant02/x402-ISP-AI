import 'dotenv/config';
import readline from 'readline';
import { ProtocolLogic } from './protocol-logic.js';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getExplorerLink(txHash) {
  return `https://sepolia.basescan.org/tx/${txHash}`;
}

function getAddressLink(address) {
  return `https://sepolia.basescan.org/address/${address}`;
}

async function main() {
  console.clear();
  console.log('🤖 Welcome to x402-ISP-AI Protocol!');
  console.log('   DeFi SIP Powered by AI Agents & x402 Payment Protocol\n');
  console.log('='.repeat(60));
  console.log('\n');

  const protocol = new ProtocolLogic();

  // Step 1: Ask about goal
  console.log('💬 Hi! I\'m your AI investment assistant.');
  console.log('   I can help you create a savings plan for your goals.\n');
  
  const goal = await ask('   What would you like to save for?\n   > ');
  console.log('');

  // Step 2: Ask TOTAL goal amount
  console.log(`💬 Great! How much does the ${goal} cost? (in ETH)`);
  const totalGoal = parseFloat(await ask('   > '));
  console.log('');

  // Step 3: Ask duration
  console.log('💬 Perfect! In how many months do you want to reach this goal?');
  const duration = parseInt(await ask('   > '));
  console.log('');

  // AI CALCULATES monthly deposit
  const monthlyDeposit = totalGoal / duration;

  console.log('💬 Let me calculate your savings plan...\n');
  await sleep(1000);

  console.log(`   📊 Based on your goal:\n`);
  console.log(`   💰 You need to save: ${totalGoal} ETH`);
  console.log(`   📅 Timeline: ${duration} months`);
  console.log(`   📈 Monthly SIP: ${monthlyDeposit.toFixed(5)} ETH\n`);
  await sleep(1000);

  // Step 4: Ask risk tolerance
  console.log('💬 What\'s your risk tolerance for investing? (low/moderate/high)');
  const riskTolerance = await ask('   > ');
  console.log('');

  // Show complete plan
  console.log('💬 Excellent! Here\'s your complete savings plan:\n');
  await sleep(1000);

  console.log('   📋 SIP Plan Summary:');
  console.log(`   - Goal: ${goal}`);
  console.log(`   - Target Amount: ${totalGoal} ETH`);
  console.log(`   - Duration: ${duration} months`);
  console.log(`   - Monthly Deposit: ${monthlyDeposit.toFixed(5)} ETH`);
  console.log(`   - Risk Tolerance: ${riskTolerance}\n`);
  
  console.log(`   💡 Today we'll invest your FIRST monthly deposit of ${monthlyDeposit.toFixed(5)} ETH\n`);
  await sleep(1500);

  // Call Expert AI
  console.log('   🤖 Consulting with our Expert AI for optimal strategy...');
  console.log('   💸 (Paying Expert AI 0.001 USDC via x402...)\n');
  
  try {
    // Call Expert AI with MONTHLY deposit amount
    const strategy = await protocol.callExpertAI(monthlyDeposit, duration, riskTolerance);
    
    await sleep(1000);
    console.log('✅ Expert AI Strategy Received!\n');
    console.log(`   For your ${monthlyDeposit.toFixed(5)} ETH monthly deposit:\n`);
    console.log(`   - Aave (Safe Lending): ${strategy.aave}% → ${(monthlyDeposit * strategy.aave / 100).toFixed(5)} ETH`);
    console.log(`   - Compound (Safe Lending): ${strategy.compound}% → ${(monthlyDeposit * strategy.compound / 100).toFixed(5)} ETH`);
    console.log(`   - Uniswap (LP - Higher Yield): ${strategy.uniswap}% → ${(monthlyDeposit * strategy.uniswap / 100).toFixed(5)} ETH\n`);
    
    await sleep(1000);
    console.log('   Expected Portfolio APY: ~7.2%\n');
    console.log(`   🎯 Projected Final Amount: ~${(totalGoal * 1.072).toFixed(5)} ETH (with returns)\n`);

    // Ask for confirmation
    const proceed = await ask('💬 Do you want to proceed with this investment strategy? (yes/no)\n   > ');
    console.log('');

    if (proceed.toLowerCase() !== 'yes') {
      console.log('💬 No problem! Feel free to come back anytime. 👋\n');
      rl.close();
      return;
    }

    // Show what's about to happen
    console.log(`💬 Perfect! Here's what will happen next:\n`);
    console.log(`   1. You'll deposit ${monthlyDeposit.toFixed(5)} ETH (Month 1 of ${duration})`);
    console.log(`   2. Smart contract will allocate funds to DeFi protocols`);
    console.log(`   3. Remaining ${duration - 1} deposits will be automated monthly\n`);
    
    console.log(`   📍 Your Wallet: ${process.env.USER_ADDRESS.slice(0, 10)}...${process.env.USER_ADDRESS.slice(-8)}`);
    console.log(`   🔗 View: ${getAddressLink(process.env.USER_ADDRESS)}\n`);
    
    const confirm = await ask('   Ready to start your SIP? (yes/no)\n   > ');
    console.log('');

    if (confirm.toLowerCase() !== 'yes') {
      console.log('💬 Okay, maybe next time! 👋\n');
      rl.close();
      return;
    }

    // Create SIP
    console.log('   🔄 Creating SIP plan on blockchain...');
    console.log('   📡 Sending transaction...\n');
    
    const txHash = await protocol.createSIPOnChain(
      monthlyDeposit,  // First deposit amount (send this NOW)
      monthlyDeposit,  // Monthly amount
      duration,        // Duration
      strategy         // Strategy from Expert AI
    );
    
    await sleep(1000);
    console.log('✅ Transaction Confirmed!\n');
    console.log('   📝 Transaction Details:');
    console.log(`   Hash: ${txHash}`);
    console.log(`   🔗 View: ${getExplorerLink(txHash)}\n`);
    
    await sleep(1000);

    console.log('   🔍 Verifying fund allocation...\n');
    await sleep(1500);

    // Get balances
    const balances = await protocol.getProtocolBalances();
    
    console.log('✅ Month 1 Deposit Successfully Allocated!\n');
    console.log(`   💰 MockAave: ${balances.aave.toFixed(5)} ETH (${strategy.aave}%)`);
    console.log(`      🔗 ${getAddressLink(process.env.MOCK_AAVE_ADDRESS)}\n`);
    
    console.log(`   💰 MockCompound: ${balances.compound.toFixed(5)} ETH (${strategy.compound}%)`);
    console.log(`      🔗 ${getAddressLink(process.env.MOCK_COMPOUND_ADDRESS)}\n`);
    
    console.log(`   💰 MockUniswap: ${balances.uniswap.toFixed(5)} ETH (${strategy.uniswap}%)`);
    console.log(`      🔗 ${getAddressLink(process.env.MOCK_UNISWAP_ADDRESS)}\n`);

    const total = balances.aave + balances.compound + balances.uniswap;
    console.log(`   📊 Total Invested (Month 1/${duration}): ${total.toFixed(5)} ETH ✅\n`);

    console.log('='.repeat(60));
    console.log('🎉 Congratulations! Your SIP is Active!\n');
    
    console.log('📋 Investment Summary:');
    console.log(`   ✅ Goal: ${goal} (${totalGoal} ETH)`);
    console.log(`   ✅ Strategy: AI-optimized for ${riskTolerance} risk`);
    console.log(`   ✅ First deposit: ${monthlyDeposit.toFixed(5)} ETH ✅`);
    console.log(`   ✅ Remaining: ${duration - 1} monthly deposits of ${monthlyDeposit.toFixed(5)} ETH`);
    console.log(`   ✅ Expert AI fee: 0.001 USDC (paid via x402)\n`);
    
    console.log('🔗 Important Links:');
    console.log(`   📝 Transaction: ${getExplorerLink(txHash)}`);
    console.log(`   👤 Your Wallet: ${getAddressLink(process.env.USER_ADDRESS)}`);
    console.log(`   🏦 SIP Contract: ${getAddressLink(process.env.SIP_PROTOCOL_ADDRESS)}\n`);
    
    console.log('📅 What Happens Next:');
    console.log(`   - Month 2-${duration}: Automated deposits via Chainlink`);
    console.log('   - Every 3 days: Expert AI rebalances portfolio if needed');
    console.log('   - Real-time tracking: Monitor on BaseScan\n');
    
    console.log('💡 Pro Tip: Your investment starts earning immediately! 🚀\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.log('\n🔍 Troubleshooting:');
    console.log('   1. Is Expert Agent running? (npm run expert)');
    console.log(`   2. User wallet balance: ${getAddressLink(process.env.USER_ADDRESS)}`);
    console.log(`   3. Buyer USDC balance: ${getAddressLink(process.env.BUYER_ADDRESS)}`);
    console.log('   4. Check console for detailed error\n');
  }

  rl.close();
}

main();
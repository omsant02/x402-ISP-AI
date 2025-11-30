import 'dotenv/config';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function checkBalances() {
  console.log('💰 Checking balances before test...\n');

  // Check buyer USDC
  const { stdout: buyerUsdc } = await execAsync(
    `cast call ${process.env.USDC_ADDRESS} "balanceOf(address)(uint256)" ${process.env.BUYER_ADDRESS} --rpc-url ${process.env.RPC_URL}`
  );
  console.log(`Buyer USDC: ${parseInt(buyerUsdc.trim()) / 1e6} USDC`);

  // Check user ETH
  const { stdout: userEth } = await execAsync(
    `cast balance ${process.env.USER_ADDRESS} --rpc-url ${process.env.RPC_URL}`
  );
  console.log(`User ETH: ${parseInt(userEth.trim()) / 1e18} ETH\n`);

  if (parseInt(buyerUsdc.trim()) < 1000) {
    console.error('❌ Buyer needs at least 0.001 USDC!');
    process.exit(1);
  }

  if (parseInt(userEth.trim()) < parseFloat('0.02') * 1e18) {
    console.error('❌ User needs at least 0.02 ETH (0.01 for SIP + 0.01 for gas)!');
    process.exit(1);
  }

  console.log('✅ Balances look good!\n');
}

async function main() {
  console.log('🧪 Full Flow Test\n');
  console.log('='.repeat(60));

  // Check balances
  await checkBalances();

  console.log('Starting protocol agent...\n');
  
  // Run protocol agent
  const { stdout, stderr } = await execAsync('node protocol-agent/protocol-agent.js');
  console.log(stdout);
  if (stderr) console.error(stderr);
}

main().catch(console.error);
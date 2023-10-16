import { ethers } from 'hardhat';
import { bytecode } from '../artifacts/contracts/LSP6KeyManager/LSP6KeyManagerSingleton.sol/LSP6KeyManagerSingleton.json';

async function main() {
  const provider = new ethers.providers.JsonRpcProvider('https://rpc.testnet.lukso.network');

  const wallet = new ethers.Wallet(
    '52447ba5741cab649bbd2c61b098eaf392bc016ab7c4a726758843dcdb4f491f',
    provider,
  );

  const rawTransaction = {
    nonce: await wallet.getTransactionCount(),
    gasPrice: ethers.utils.parseUnits('20', 'gwei'), // Gas price in Gwei
    gasLimit: ethers.utils.hexlify(20_000_000), // Gas limit
    to: '', // Empty for contract creation
    value: 0, // Value in Wei
    data: bytecode, // Contract bytecode prefixed with 0x
    chainId: 4201, // Mainnet
  };

  const signedTransaction = await wallet.signTransaction(rawTransaction);

  const txResponse = await provider.sendTransaction(signedTransaction);
  console.log('Transaction hash:', txResponse.hash);

  // Wait for the transaction to be mined
  const receipt = await txResponse.wait();
  console.log('Contract deployed at:', receipt.contractAddress);
}

main();

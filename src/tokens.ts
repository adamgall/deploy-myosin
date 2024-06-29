import { Airdrop, Config, SafeFirstPass, Token } from "./interfaces";
import {
  createDeployModuleTransaction,
  generateSaltNonce,
  getTokenModuleInitializer,
} from "./transactions";

const gatherSafesAllocations = (node: SafeFirstPass): Airdrop[] => {
  const allocations: Airdrop[] = [
    {
      address: node.firstPass.predictedAddress,
      amount: node.allocation,
    },
  ];

  if (node.children && node.children.length > 0) {
    for (const child of node.children) {
      allocations.push(...gatherSafesAllocations(child));
    }
  }

  return allocations;
};

export const createTokenTransactions = async (
  config: Config,
  safes: SafeFirstPass,
  airdrops: Airdrop[],
  token: Token
) => {
  const saltNonce = generateSaltNonce();

  const safeAllocations = gatherSafesAllocations(safes);
  const allAllocations = [...safeAllocations, ...airdrops];

  const totalAllocations = allAllocations.reduce((p, c) => p + c.amount, 0n);

  if (totalAllocations !== token.supply) {
    throw new Error("total airdrop amount doesn't equal total supply");
  }

  const transactions = [];

  const tokenModuleInitializer = getTokenModuleInitializer(
    token.name,
    token.symbol,
    allAllocations.map((a) => a.address),
    allAllocations.map((a) => a.amount)
  );

  transactions.push(
    createDeployModuleTransaction(
      config.contractAddresses.zodiac.moduleProxyFactoryAddress,
      config.contractAddresses.zodiac.votesErc20MasterCopyAddress,
      tokenModuleInitializer,
      saltNonce
    )
  );

  return transactions;
};

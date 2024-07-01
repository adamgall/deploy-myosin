import {
  encodeAbiParameters,
  encodeFunctionData,
  parseAbiParameters,
} from "viem";
import { VotesErc20Abi } from "./abis";
import {
  Airdrop,
  Config,
  DataProcessed,
  SafeWithDerivedData,
} from "./interfaces";
import {
  createDeployModuleTransaction,
  generateSaltNonce,
} from "./transactions";

const gatherSafesAllocations = (node: SafeWithDerivedData): Airdrop[] => {
  const allocations: Airdrop[] = [
    {
      address: node.derivedData.predictedAddress,
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
  data: DataProcessed
) => {
  const saltNonce = generateSaltNonce();

  const safeAllocations = gatherSafesAllocations(data.safes);
  const allAllocations = [...safeAllocations, ...data.airdrop];

  const totalAllocations = allAllocations.reduce((p, c) => p + c.amount, 0n);

  if (totalAllocations !== data.token.totalSupply) {
    throw new Error("total airdrop amount doesn't equal total supply");
  }

  const transactions = [];

  const tokenModuleInitializer = encodeFunctionData({
    abi: VotesErc20Abi,
    functionName: "setUp",
    args: [
      encodeAbiParameters(
        parseAbiParameters("string, string, address[], uint256[]"),
        [
          data.token.name,
          data.token.symbol,
          allAllocations.map((a) => a.address),
          allAllocations.map((a) => a.amount),
        ]
      ),
    ],
  });

  transactions.push(
    createDeployModuleTransaction(
      config.contractAddresses.moduleProxyFactoryAddress,
      config.contractAddresses.votesErc20MasterCopyAddress,
      tokenModuleInitializer,
      saltNonce
    )
  );

  return transactions;
};

import {
  encodeFunctionData,
  getContract,
  parseEther,
  zeroAddress,
  zeroHash,
} from "viem";
import {
  Airdrop,
  Config,
  Data,
  DataProcessed,
  Safe,
  SafeWithDerivedData,
  Token,
} from "./interfaces";
import { generateSaltNonce, getPredictedSafeAddress } from "./transactions";
import { GnosisSafeL2Abi, GnosisSafeProxyFactoryAbi } from "./abis";

const calculateSafeData = async (config: Config, node: Safe) => {
  const saltNonce = generateSaltNonce();

  const initializationData = encodeFunctionData({
    abi: GnosisSafeL2Abi,
    functionName: "setup",
    args: [
      [...node.owners, config.contractAddresses.multiSendCallOnlyAddress],
      1n,
      zeroAddress,
      zeroHash,
      config.contractAddresses.compatibilityFallbackHandlerAddress,
      zeroAddress,
      0n,
      zeroAddress,
    ],
  });

  const predictedAddress = getPredictedSafeAddress(
    await getContract({
      abi: GnosisSafeProxyFactoryAbi,
      address: config.contractAddresses.gnosisSafeProxyFactoryAddress,
      client: config.publicClient,
    }).read.proxyCreationCode(),
    config.contractAddresses.gnosisSafeProxyFactoryAddress,
    config.contractAddresses.gnosisSafeL2SingletonAddress,
    initializationData,
    saltNonce
  );

  const safeFirstPass: SafeWithDerivedData = {
    name: node.name,
    owners: node.owners,
    threshold: node.threshold,
    allocation: parseEther(node.allocation.toString()),
    derivedData: {
      saltNonce,
      initializationData,
      predictedAddress,
    },
  };

  return safeFirstPass;
};

const doSafesFirstPass = async (
  config: Config,
  node: Safe
): Promise<SafeWithDerivedData> => {
  const children = node.children
    ? await Promise.all(
        node.children.map((child) => doSafesFirstPass(config, child))
      )
    : undefined;

  const newNode = await calculateSafeData(config, node);
  if (children !== undefined) {
    return { ...newNode, children };
  } else {
    return { ...newNode };
  }
};

const doAirdropsFirstPass = (airdrops: Airdrop[]): Airdrop[] => {
  return airdrops.map((a) => ({
    address: a.address,
    amount: parseEther(a.amount.toString()),
  }));
};

const doTokenFirstPass = (token: Token): Token => {
  return {
    ...token,
    totalSupply: parseEther(token.totalSupply.toString()),
  };
};

export const processData = async (
  config: Config,
  data: Data
): Promise<DataProcessed> => {
  const safesFirstPass = await doSafesFirstPass(config, data.safes);
  const airdropsFirstPass = doAirdropsFirstPass(data.airdrop);
  const tokenFirstPass = doTokenFirstPass(data.token);

  return {
    token: tokenFirstPass,
    airdrop: airdropsFirstPass,
    safes: safesFirstPass,
    freezeConfig: data.freezeConfig,
  };
};

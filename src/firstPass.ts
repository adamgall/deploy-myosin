import { getContract, parseEther } from "viem";
import { Airdrop, Config, Safe, SafeFirstPass, Token } from "./interfaces";
import {
  generateSaltNonce,
  getGnosisSafeInitializer,
  getPredictedSafeAddress,
  salt,
} from "./transactions";
import { GnosisSafeProxyFactoryAbi } from "./abis";

const calculateFirstPass = async (config: Config, node: Safe) => {
  const saltNonce = generateSaltNonce();

  const initializationData = getGnosisSafeInitializer(
    node.owners,
    config.contractAddresses.safe.multiSendCallOnlyAddress,
    config.contractAddresses.safe.compatibilityFallbackHandlerAddress
  );

  const predictedAddress = getPredictedSafeAddress(
    await getContract({
      abi: GnosisSafeProxyFactoryAbi,
      address: config.contractAddresses.safe.gnosisSafeProxyFactoryAddress,
      client: config.walletClient,
    }).read.proxyCreationCode(),
    config.contractAddresses.safe.gnosisSafeProxyFactoryAddress,
    config.contractAddresses.safe.gnosisSafeL2SingletonAddress,
    salt(initializationData, saltNonce)
  );

  const safeFirstPass: SafeFirstPass = {
    name: node.name,
    owners: node.owners,
    threshold: node.threshold,
    allocation: parseEther(node.allocation.toString()),
    firstPass: {
      saltNonce,
      initializationData,
      predictedAddress,
    },
  };

  return safeFirstPass;
};

export const doSafesFirstPass = async (
  config: Config,
  node: Safe
): Promise<SafeFirstPass> => {
  const children = node.children
    ? await Promise.all(
        node.children.map((child) => doSafesFirstPass(config, child))
      )
    : undefined;

  const newNode = await calculateFirstPass(config, node);
  if (children !== undefined) {
    return { ...newNode, children };
  } else {
    return { ...newNode };
  }
};

export const doAirdropsFirstPass = (airdrops: Airdrop[]) => {
  return airdrops.map((a) => ({
    address: a.address,
    amount: parseEther(a.amount.toString()),
  }));
};

export const doTokenFirstPass = (token: Token): Token => {
  return {
    ...token,
    supply: parseEther(token.supply.toString()),
  };
};

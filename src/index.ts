import {
  createDeployModuleTransaction,
  createDeploySafeTransaction,
  createEnableModuleTransaction,
  createRemoveOwnerTransaction,
  createSafeExecTransaction,
  createSetGuardTransaction,
  createUpdateDaoNameTransaction,
  encodeMultiSend,
  generateSaltNonce,
  getFractalModuleInitializer,
  getGnosisSafeInitializer,
  getMultisigFreezeGuardInitializer,
  getMultisigFreezeVotingInitializer,
  getPredictedModuleAddress,
  getPredictedSafeAddress,
  multiSendFunctionData,
  salt,
} from "./transactions";
import { getValidatedConfig } from "./configValidation";
import { Config, Safe } from "./interfaces";

import data from "./data";
import { Address, getContract, zeroAddress } from "viem";
import { GnosisSafeProxyFactoryAbi, MultiSendCallOnlyAbi } from "./abis";

const getMultiSendsFromSafe = (
  config: Config,
  node: Safe,
  nodeAddress: Address,
  parentAddress: Address,
  saltNonce: bigint
) => {
  const transactions = [];

  if (parentAddress !== zeroAddress) {
    const fractalModuleInitializer = getFractalModuleInitializer(
      parentAddress,
      nodeAddress
    );

    transactions.push(
      createDeployModuleTransaction(
        config.contractAddresses.zodiac.moduleProxyFactoryAddress,
        config.contractAddresses.zodiac.fractalModuleMasterCopyAddress,
        fractalModuleInitializer,
        saltNonce
      )
    );

    const predictedFractalModuleAddress = getPredictedModuleAddress(
      config.contractAddresses.zodiac.fractalModuleMasterCopyAddress,
      config.contractAddresses.zodiac.moduleProxyFactoryAddress,
      fractalModuleInitializer,
      saltNonce
    );

    transactions.push(
      createEnableModuleTransaction(nodeAddress, predictedFractalModuleAddress)
    );

    const multisigFreezeVotingInitializer = getMultisigFreezeVotingInitializer(
      parentAddress,
      0n, // TODO
      0, // TODO
      0 // TODO
    );

    transactions.push(
      createDeployModuleTransaction(
        config.contractAddresses.zodiac.moduleProxyFactoryAddress,
        config.contractAddresses.zodiac.multisigFreezeVotingMasterCopyAddress,
        multisigFreezeVotingInitializer,
        saltNonce
      )
    );

    const predictedMultisigFreezeVotingAddress = getPredictedModuleAddress(
      config.contractAddresses.zodiac.multisigFreezeVotingMasterCopyAddress,
      config.contractAddresses.zodiac.moduleProxyFactoryAddress,
      multisigFreezeVotingInitializer,
      saltNonce
    );

    const multisigFreezeGuardInitializer = getMultisigFreezeGuardInitializer(
      nodeAddress,
      parentAddress,
      predictedMultisigFreezeVotingAddress,
      0, // TODO
      0 // TODO
    );

    transactions.push(
      createDeployModuleTransaction(
        config.contractAddresses.zodiac.moduleProxyFactoryAddress,
        config.contractAddresses.zodiac.multisigFreezeGuardMasterCopyAddress,
        multisigFreezeGuardInitializer,
        saltNonce
      )
    );

    const predictedMultisigFreezeGuardAddress = getPredictedModuleAddress(
      config.contractAddresses.zodiac.multisigFreezeGuardMasterCopyAddress,
      config.contractAddresses.zodiac.moduleProxyFactoryAddress,
      multisigFreezeGuardInitializer,
      saltNonce
    );

    transactions.push(
      createSetGuardTransaction(
        nodeAddress,
        predictedMultisigFreezeGuardAddress
      )
    );
  }

  transactions.push(
    createUpdateDaoNameTransaction(
      config.contractAddresses.fractal.fractalRegistryAddress,
      node.name
    )
  );

  transactions.push(
    createRemoveOwnerTransaction(
      nodeAddress,
      config.contractAddresses.safe.multiSendCallOnlyAddress,
      node.owners,
      node.threshold
    )
  );

  return transactions;
};

const processNode = async (
  config: Config,
  node: Safe,
  parentAddress: Address
) => {
  const saltNonce = generateSaltNonce();

  const gnosisSafeInitializer = getGnosisSafeInitializer(
    node.owners,
    config.contractAddresses.safe.multiSendCallOnlyAddress,
    config.contractAddresses.safe.compatibilityFallbackHandlerAddress
  );

  const predictedNodeAddress = getPredictedSafeAddress(
    await getContract({
      abi: GnosisSafeProxyFactoryAbi,
      address: config.contractAddresses.safe.gnosisSafeProxyFactoryAddress,
      client: config.publicClient,
    }).read.proxyCreationCode(),
    config.contractAddresses.safe.gnosisSafeProxyFactoryAddress,
    config.contractAddresses.safe.gnosisSafeL2SingletonAddress,
    salt(gnosisSafeInitializer, saltNonce)
  );

  const deploySafeTransaction = createDeploySafeTransaction(
    config.contractAddresses.safe.gnosisSafeProxyFactoryAddress,
    config.contractAddresses.safe.gnosisSafeL2SingletonAddress,
    gnosisSafeInitializer,
    saltNonce
  );

  const multiSendsFromSafe = getMultiSendsFromSafe(
    config,
    node,
    predictedNodeAddress,
    parentAddress,
    saltNonce
  );

  const multiSendData = multiSendFunctionData(multiSendsFromSafe);

  const processSafeTransaction = createSafeExecTransaction(
    predictedNodeAddress,
    config.contractAddresses.safe.multiSendCallOnlyAddress,
    multiSendData
  );

  const allNodeTransactions = [deploySafeTransaction, processSafeTransaction];

  return {
    predictedNodeAddress,
    saltNonce,
    allNodeTransactions,
  };
};

const traverse = async (
  config: Config,
  node: Safe,
  parentAddress: Address,
  transactions: {
    operation: number;
    to: `0x${string}`;
    value: bigint;
    data: `0x${string}`;
  }[]
) => {
  const newNode = await processNode(config, node, parentAddress);
  let accumulatedTransactions = [
    ...transactions,
    ...newNode.allNodeTransactions,
  ];

  if (node.children && node.children.length > 0) {
    for (const child of node.children) {
      accumulatedTransactions = await traverse(
        config,
        child,
        newNode.predictedNodeAddress,
        accumulatedTransactions
      );
    }
  }

  return accumulatedTransactions;
};

const processSafeStructure = async (config: Config, safes: Safe[]) => {
  let allTransactions: {
    operation: number;
    to: `0x${string}`;
    value: bigint;
    data: `0x${string}`;
  }[] = [];

  for (const safe of safes) {
    const safeTransactions = await traverse(config, safe, zeroAddress, []);
    allTransactions = [...allTransactions, ...safeTransactions];
  }

  return allTransactions;
};

(async () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (BigInt.prototype as any).toJSON = function () {
    return this.toString();
  };

  const config = await getValidatedConfig();

  const multisendTransactions = await processSafeStructure(config, data.safes);

  const multiSendCallOnlyContract = getContract({
    abi: MultiSendCallOnlyAbi,
    address: config.contractAddresses.safe.multiSendCallOnlyAddress,
    client: config.walletClient,
  });

  const transaction = await multiSendCallOnlyContract.simulate.multiSend([
    encodeMultiSend(multisendTransactions),
  ]);

  console.log({ transaction });

  console.log();
})();

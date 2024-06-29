import { Address, zeroAddress } from "viem";
import { Config, SafeFirstPass } from "./interfaces";
import {
  createDeclareSubDaoTransaction,
  createDeployModuleTransaction,
  createDeploySafeTransaction,
  createEnableModuleTransaction,
  createRemoveOwnerTransaction,
  createSafeExecTransaction,
  createSetGuardTransaction,
  createUpdateDaoNameTransaction,
  getFractalModuleInitializer,
  getMultisigFreezeGuardInitializer,
  getMultisigFreezeVotingInitializer,
  getPredictedModuleAddress,
  multiSendFunctionData,
} from "./transactions";

const getMultiSendsFromSafe = (
  config: Config,
  node: SafeFirstPass,
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

  if (node.children !== undefined) {
    node.children.forEach((child) => {
      transactions.push(
        createDeclareSubDaoTransaction(
          config.contractAddresses.fractal.fractalRegistryAddress,
          child.firstPass.predictedAddress
        )
      );
    });
  }

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
  node: SafeFirstPass,
  parentAddress: Address
) => {
  const deploySafeTransaction = createDeploySafeTransaction(
    config.contractAddresses.safe.gnosisSafeProxyFactoryAddress,
    config.contractAddresses.safe.gnosisSafeL2SingletonAddress,
    node.firstPass.initializationData,
    node.firstPass.saltNonce
  );

  const multiSendsFromSafe = getMultiSendsFromSafe(
    config,
    node,
    node.firstPass.predictedAddress,
    parentAddress,
    node.firstPass.saltNonce
  );

  const multiSendData = multiSendFunctionData(multiSendsFromSafe);

  const processSafeTransaction = createSafeExecTransaction(
    node.firstPass.predictedAddress,
    config.contractAddresses.safe.multiSendCallOnlyAddress,
    multiSendData
  );

  const allNodeTransactions = [deploySafeTransaction, processSafeTransaction];

  return {
    allNodeTransactions,
  };
};

export const createSafesTransactions = async (
  config: Config,
  node: SafeFirstPass,
  parentAddress?: Address,
  transactions?: {
    operation: number;
    to: `0x${string}`;
    value: bigint;
    data: `0x${string}`;
  }[]
) => {
  const newNode = await processNode(config, node, parentAddress ?? zeroAddress);
  let accumulatedTransactions = [
    ...(transactions ?? []),
    ...newNode.allNodeTransactions,
  ];

  if (node.children && node.children.length > 0) {
    for (const child of node.children) {
      accumulatedTransactions = await createSafesTransactions(
        config,
        child,
        node.firstPass.predictedAddress,
        accumulatedTransactions
      );
    }
  }

  return accumulatedTransactions;
};

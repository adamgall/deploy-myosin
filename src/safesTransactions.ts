import {
  Address,
  encodeAbiParameters,
  encodeFunctionData,
  parseAbiParameters,
  zeroAddress,
} from "viem";
import { Config, SafeProcessed } from "./interfaces";
import {
  createDeclareSubDaoTransaction,
  createDeployModuleTransaction,
  createDeploySafeTransaction,
  createEnableModuleTransaction,
  createRemoveOwnerTransaction,
  createSafeExecTransaction,
  createSetGuardTransaction,
  createUpdateDaoNameTransaction,
  encodeMultiSend,
  getPredictedModuleAddress,
} from "./transactions";
import {
  FractalModuleAbi,
  MultiSendCallOnlyAbi,
  MultisigFreezeGuardAbi,
  MultisigFreezeVotingAbi,
} from "./abis";

const getMultiSendsFromSafe = (
  config: Config,
  node: SafeProcessed,
  nodeAddress: Address,
  parentAddress: Address,
  saltNonce: bigint
) => {
  const transactions = [];

  if (parentAddress !== zeroAddress) {
    const fractalModuleInitializer = encodeFunctionData({
      abi: FractalModuleAbi,
      functionName: "setUp",
      args: [
        encodeAbiParameters(
          parseAbiParameters("address, address, address, address[]"),
          [
            parentAddress, // address _owner
            nodeAddress, // address _avatar
            nodeAddress, // address _target
            [], // address[] _controllers
          ]
        ),
      ],
    });

    transactions.push(
      createDeployModuleTransaction(
        config.contractAddresses.moduleProxyFactoryAddress,
        config.contractAddresses.fractalModuleMasterCopyAddress,
        fractalModuleInitializer,
        saltNonce
      )
    );

    const predictedFractalModuleAddress = getPredictedModuleAddress(
      config.contractAddresses.fractalModuleMasterCopyAddress,
      config.contractAddresses.moduleProxyFactoryAddress,
      fractalModuleInitializer,
      saltNonce
    );

    transactions.push(
      createEnableModuleTransaction(nodeAddress, predictedFractalModuleAddress)
    );

    const multisigFreezeVotingInitializer = encodeFunctionData({
      abi: MultisigFreezeVotingAbi,
      functionName: "setUp",
      args: [
        encodeAbiParameters(
          parseAbiParameters("address, uint256, uint32, uint32, address"),
          [
            parentAddress,
            0n, // TODO freezeVotesThreshold,
            0, // TODO freezeProposalPeriod,
            0, // TODO freezePeriod,
            parentAddress,
          ]
        ),
      ],
    });

    transactions.push(
      createDeployModuleTransaction(
        config.contractAddresses.moduleProxyFactoryAddress,
        config.contractAddresses.multisigFreezeVotingMasterCopyAddress,
        multisigFreezeVotingInitializer,
        saltNonce
      )
    );

    const predictedMultisigFreezeVotingAddress = getPredictedModuleAddress(
      config.contractAddresses.multisigFreezeVotingMasterCopyAddress,
      config.contractAddresses.moduleProxyFactoryAddress,
      multisigFreezeVotingInitializer,
      saltNonce
    );

    const multisigFreezeGuardInitializer = encodeFunctionData({
      abi: MultisigFreezeGuardAbi,
      functionName: "setUp",
      args: [
        encodeAbiParameters(
          parseAbiParameters("uint32, uint32, address, address, address"),
          [
            0, // TODO timelockPeriod,
            0, // TODO executionPeriod,
            parentAddress,
            predictedMultisigFreezeVotingAddress,
            nodeAddress,
          ]
        ),
      ],
    });

    transactions.push(
      createDeployModuleTransaction(
        config.contractAddresses.moduleProxyFactoryAddress,
        config.contractAddresses.multisigFreezeGuardMasterCopyAddress,
        multisigFreezeGuardInitializer,
        saltNonce
      )
    );

    const predictedMultisigFreezeGuardAddress = getPredictedModuleAddress(
      config.contractAddresses.multisigFreezeGuardMasterCopyAddress,
      config.contractAddresses.moduleProxyFactoryAddress,
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
      config.contractAddresses.fractalRegistryAddress,
      node.name
    )
  );

  if (node.children !== undefined) {
    node.children.forEach((child) => {
      transactions.push(
        createDeclareSubDaoTransaction(
          config.contractAddresses.fractalRegistryAddress,
          child.firstPass.predictedAddress
        )
      );
    });
  }

  transactions.push(
    createRemoveOwnerTransaction(
      nodeAddress,
      config.contractAddresses.multiSendCallOnlyAddress,
      node.owners,
      node.threshold
    )
  );

  return transactions;
};

const processNode = async (
  config: Config,
  node: SafeProcessed,
  parentAddress: Address
) => {
  const deploySafeTransaction = createDeploySafeTransaction(
    config.contractAddresses.gnosisSafeProxyFactoryAddress,
    config.contractAddresses.gnosisSafeL2SingletonAddress,
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

  const multiSendData = encodeFunctionData({
    abi: MultiSendCallOnlyAbi,
    functionName: "multiSend",
    args: [encodeMultiSend(multiSendsFromSafe)],
  });

  const processSafeTransaction = createSafeExecTransaction(
    node.firstPass.predictedAddress,
    config.contractAddresses.multiSendCallOnlyAddress,
    multiSendData
  );

  const allNodeTransactions = [deploySafeTransaction, processSafeTransaction];

  return {
    allNodeTransactions,
  };
};

export const createSafesTransactions = async (
  config: Config,
  node: SafeProcessed,
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

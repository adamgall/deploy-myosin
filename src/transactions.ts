import {
  Address,
  Hex,
  bytesToBigInt,
  encodeFunctionData,
  encodePacked,
  getContractAddress,
  hexToBigInt,
  keccak256,
  toBytes,
  zeroAddress,
} from "viem";
import {
  FractalRegistryAbi,
  GnosisSafeL2Abi,
  GnosisSafeProxyFactoryAbi,
  ModuleProxyFactoryAbi,
} from "./abis";
import { randomBytes } from "crypto";

const salt = (initializer: Hex, saltNonce: bigint) => {
  return keccak256(
    encodePacked(["bytes", "uint256"], [keccak256(initializer), saltNonce])
  );
};

export const generateSaltNonce = () => {
  return bytesToBigInt(randomBytes(32));
};

export const encodeMultiSend = (
  txs: { to: Address; value: bigint; data: Hex; operation: number }[]
): Hex => {
  return `0x${txs
    .map((tx) =>
      encodePacked(
        ["uint8", "address", "uint256", "uint256", "bytes"],
        [
          tx.operation,
          tx.to,
          tx.value,
          BigInt(toBytes(tx.data).length),
          tx.data,
        ]
      ).slice(2)
    )
    .join("")}`;
};

export const getPredictedSafeAddress = (
  gnosisSafeProxyCreationCode: Hex,
  gnosisSafeProxyFactoryContractAddress: Address,
  gnosisSafeL2SingletonAddress: Address,
  gnosisSafeInitilizationData: Hex,
  saltNonce: bigint
) => {
  return getContractAddress({
    bytecode: encodePacked(
      ["bytes", "uint256"],
      [gnosisSafeProxyCreationCode, hexToBigInt(gnosisSafeL2SingletonAddress)]
    ),
    from: gnosisSafeProxyFactoryContractAddress,
    opcode: "CREATE2",
    salt: salt(gnosisSafeInitilizationData, saltNonce),
  });
};

export const getPredictedModuleAddress = (
  moduleMasterCopyAddress: Address,
  moduleProxyFactoryAddress: Address,
  moduleInitializerData: Hex,
  saltNonce: bigint
) => {
  return getContractAddress({
    bytecode: `0x602d8060093d393df3363d3d373d3d3d363d73${moduleMasterCopyAddress.slice(
      2
    )}5af43d82803e903d91602b57fd5bf3`,
    from: moduleProxyFactoryAddress,
    opcode: "CREATE2",
    salt: salt(moduleInitializerData, saltNonce),
  });
};

export const createDeploySafeTransaction = (
  gnosisSafeProxyFactoryAddress: Address,
  gnosisSafeL2SingletonAddress: Address,
  gnosisSafeInitializer: Hex,
  saltNonce: bigint
) => {
  return {
    operation: 0,
    to: gnosisSafeProxyFactoryAddress,
    value: 0n,
    data: encodeFunctionData({
      abi: GnosisSafeProxyFactoryAbi,
      functionName: "createProxyWithNonce",
      args: [
        gnosisSafeL2SingletonAddress, // address _singleton
        gnosisSafeInitializer, // bytes initializer
        saltNonce, // uint256 saltNonce
      ],
    }),
  };
};

export const createDeployModuleTransaction = (
  moduleProxyFactoryAddress: Address,
  moduleMasterCopyAddress: Address,
  moduleInitializer: Hex,
  saltNonce: bigint
) => {
  return {
    operation: 0,
    to: moduleProxyFactoryAddress,
    value: 0n,
    data: encodeFunctionData({
      abi: ModuleProxyFactoryAbi,
      functionName: "deployModule",
      args: [
        moduleMasterCopyAddress, // address masterCopy
        moduleInitializer, // bytes initializer
        saltNonce, // uint256 saltNonce
      ],
    }),
  };
};

export const createSafeExecTransaction = (
  safeAddress: Address,
  target: Address,
  data: Hex
) => {
  return {
    operation: 0,
    to: safeAddress,
    value: 0n,
    data: encodeFunctionData({
      abi: GnosisSafeL2Abi,
      functionName: "execTransaction",
      args: [
        target, // address to
        0n, // uint256 value
        data, // bytes data
        1, // uint8 operation
        0n, // uint256 safeTxGas
        0n, // uint256 baseGas
        0n, // uint256 gasPrice
        zeroAddress, // address gasToken
        zeroAddress, // address refundReceiver
        `0x000000000000000000000000${target.slice(
          2
        )}000000000000000000000000000000000000000000000000000000000000000001`, // bytes signatures
      ],
    }),
  };
};

export const createEnableModuleTransaction = (
  safeAddress: Address,
  predictedModuleAddress: Address
) => {
  return {
    operation: 0,
    to: safeAddress,
    value: 0n,
    data: encodeFunctionData({
      abi: GnosisSafeL2Abi,
      functionName: "enableModule",
      args: [
        predictedModuleAddress, // address module
      ],
    }),
  };
};

export const createSetGuardTransaction = (
  safeAddress: Address,
  guardAddress: Address
) => {
  return {
    operation: 0,
    to: safeAddress,
    value: 0n,
    data: encodeFunctionData({
      abi: GnosisSafeL2Abi,
      functionName: "setGuard",
      args: [guardAddress],
    }),
  };
};

export const createRemoveOwnerTransaction = (
  safeAddress: Address,
  ownerToRemove: Address,
  otherOwners: Address[],
  threshold: bigint
) => {
  return {
    operation: 0,
    to: safeAddress,
    value: 0n,
    data: encodeFunctionData({
      abi: GnosisSafeL2Abi,
      functionName: "removeOwner",
      args: [
        otherOwners[otherOwners.length - 1], // address prevOwner
        ownerToRemove, // address owner
        threshold, // uint256 _threshold
      ],
    }),
  };
};

export const createUpdateDaoNameTransaction = (
  fractalRegistryAddress: Address,
  daoName: string
) => {
  return {
    operation: 0,
    to: fractalRegistryAddress,
    value: 0n,
    data: encodeFunctionData({
      abi: FractalRegistryAbi,
      functionName: "updateDAOName",
      args: [
        daoName, // string _name
      ],
    }),
  };
};

export const createDeclareSubDaoTransaction = (
  fractalRegistryAddress: Address,
  subDaoAddress: Address
) => {
  return {
    operation: 0,
    to: fractalRegistryAddress,
    value: 0n,
    data: encodeFunctionData({
      abi: FractalRegistryAbi,
      functionName: "declareSubDAO",
      args: [
        subDaoAddress, // address _subDAOAddress
      ],
    }),
  };
};

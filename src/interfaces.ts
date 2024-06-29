import {
  Account,
  Address,
  Chain,
  Hex,
  PublicClient,
  Transport,
  WalletClient,
} from "viem";

export const twoAddress = "0x0000000000000000000000000000000000000002";
export const threeAddress = "0x0000000000000000000000000000000000000003";
export const fourAddress = "0x0000000000000000000000000000000000000004";

export interface Safe {
  name: string;
  owners: Address[];
  threshold: bigint;
  allocation: bigint;
  children?: Safe[];
}

export interface SafeProcessed extends Safe {
  children?: SafeProcessed[];
  firstPass: {
    saltNonce: bigint;
    initializationData: Hex;
    predictedAddress: Address;
  };
}

export interface Token {
  name: string;
  symbol: string;
  supply: bigint;
}

export interface Airdrop {
  address: Address;
  amount: bigint;
}

export interface Data {
  token: Token;
  airdrop: Airdrop[];
  safes: Safe;
}

export interface DataProcessed extends Data {
  safes: SafeProcessed;
}

export interface Config {
  publicClient: PublicClient<Transport, Chain>;
  walletClient: WalletClient<Transport, Chain, Account> | undefined;
  contractAddresses: {
    fractalRegistryAddress: Address;
    multiSendCallOnlyAddress: Address;
    gnosisSafeL2SingletonAddress: Address;
    gnosisSafeProxyFactoryAddress: Address;
    compatibilityFallbackHandlerAddress: Address;
    multisigFreezeVotingMasterCopyAddress: Address;
    multisigFreezeGuardMasterCopyAddress: Address;
    moduleProxyFactoryAddress: Address;
    fractalModuleMasterCopyAddress: Address;
    votesErc20MasterCopyAddress: Address;
  };
}

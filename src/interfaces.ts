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

export interface SafeWithDerivedData extends Safe {
  children?: SafeWithDerivedData[];
  derivedData: {
    saltNonce: bigint;
    initializationData: Hex;
    predictedAddress: Address;
  };
}

export interface Token {
  name: string;
  symbol: string;
  totalSupply: bigint;
}

export interface Airdrop {
  address: Address;
  amount: bigint;
}

export interface FreezeConfig {
  freezeVotesThreshold: bigint;
  freezeProposalPeriod: number;
  freezePeriod: number;
  timelockPeriod: number;
  executionPeriod: number;
}

export interface Data {
  token: Token;
  airdrop: Airdrop[];
  safes: Safe;

  // All Safes (other than top) will have same Freeze configuration
  freezeConfig: FreezeConfig;
}

export interface DataProcessed extends Data {
  safes: SafeWithDerivedData;
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

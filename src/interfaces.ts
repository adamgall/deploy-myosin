import { Address, Chain, PublicClient, WalletClient } from "viem";

export const twoAddress = "0x0000000000000000000000000000000000000002";

export interface Safe {
  name: string;
  owners: Address[];
  threshold: bigint;
  allocation: bigint;
  children?: Safe[];
}

export interface Token {
  name: string;
  symbol: string;
  supply: bigint;
  decimals: 18;
}

export interface Airdrop {
  address: Address;
  amount: bigint;
}

export interface Data {
  token: Token;
  airdrop: Airdrop[];
  safes: Safe[];
}

export interface Config {
  publicClient: PublicClient;
  walletClient: WalletClient;
  network: {
    chain: Chain;
  };
  contractAddresses: {
    fractal: {
      fractalRegistryAddress: Address;
    };
    safe: {
      multiSendAddress: Address;
      multiSendCallOnlyAddress: Address;
      gnosisSafeL2SingletonAddress: Address;
      gnosisSafeProxyFactoryAddress: Address;
      compatibilityFallbackHandlerAddress: Address;
    };
    zodiac: {
      multisigFreezeVotingMasterCopyAddress: Address;
      multisigFreezeGuardMasterCopyAddress: Address;
      moduleProxyFactoryAddress: Address;
      fractalModuleMasterCopyAddress: Address;
    };
  };
}

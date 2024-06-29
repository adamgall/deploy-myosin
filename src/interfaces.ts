import {
  Account,
  Address,
  Chain,
  Hex,
  HttpTransport,
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

export interface SafeFirstPass {
  name: string;
  owners: Address[];
  threshold: bigint;
  allocation: bigint;
  firstPass: {
    saltNonce: bigint;
    initializationData: Hex;
    predictedAddress: Address;
  };
  children?: SafeFirstPass[];
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

export interface Config {
  walletClient: WalletClient<HttpTransport, Chain, Account>;
  network: {
    chain: Chain;
  };
  contractAddresses: {
    fractal: {
      fractalRegistryAddress: Address;
    };
    safe: {
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
      votesErc20MasterCopyAddress: Address;
    };
  };
}

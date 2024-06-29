import { Chain, Hex, createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";

export const getPublicClient = (chain: Chain) => {
  return createPublicClient({
    chain,
    transport: http(),
  });
};

export const getWalletClient = (chain: Chain, privateKey: Hex | undefined) => {
  if (privateKey === undefined) {
    return undefined;
  }

  return createWalletClient({
    chain,
    transport: http(),
    account: privateKeyToAccount(privateKey),
  });
};

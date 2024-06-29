import { Chain, Hex, createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";

export const getPublicClient = (chain: Chain) => {
  return createPublicClient({
    chain,
    transport: http(),
  });
};

export const getWalletClient = (chain: Chain, privateKey: Hex) => {
  return createWalletClient({
    chain,
    transport: http(),
    account: privateKeyToAccount(privateKey),
  });
};

import { Chain, Hex, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";

export const getWalletClient = (chain: Chain, privateKey: Hex) => {
  return createWalletClient({
    chain,
    transport: http(),
    account: privateKeyToAccount(privateKey),
  });
};

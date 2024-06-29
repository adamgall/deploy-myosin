import { getConfigRaw } from "./configParsing";
import { getPublicClient, getWalletClient } from "./clients";
import { Config } from "./interfaces";

export const getValidatedConfig = async () => {
  const configRaw = getConfigRaw();

  const publicClient = getPublicClient(configRaw.chain);
  const walletClient = getWalletClient(configRaw.chain, configRaw.privateKey);

  const config: Config = {
    publicClient,
    walletClient,
    contractAddresses: {
      fractalRegistryAddress: configRaw.fractalRegistryAddress,
      multiSendCallOnlyAddress: configRaw.multiSendCallOnlyAddress,
      gnosisSafeL2SingletonAddress: configRaw.gnosisSafeL2SingletonAddress,
      gnosisSafeProxyFactoryAddress: configRaw.gnosisSafeProxyFactoryAddress,
      compatibilityFallbackHandlerAddress:
        configRaw.compatibilityFallbackHandlerAddress,
      multisigFreezeVotingMasterCopyAddress:
        configRaw.multisigFreezeVotingMasterCopyAddress,
      multisigFreezeGuardMasterCopyAddress:
        configRaw.multisigFreezeGuardMasterCopyAddress,
      moduleProxyFactoryAddress: configRaw.moduleProxyFactoryAddress,
      fractalModuleMasterCopyAddress: configRaw.fractalModuleMasterCopyAddress,
      votesErc20MasterCopyAddress: configRaw.votesErc20MasterCopyAddress,
    },
  };

  return config;
};

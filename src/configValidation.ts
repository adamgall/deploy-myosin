import { getConfigRaw } from "./configParsing";
import { Config } from "./interfaces";
import { Chain, createPublicClient, http } from "viem";

const getPublicClient = (chain: Chain) => {
  return createPublicClient({
    chain,
    transport: http(),
  });
};

export const getValidatedConfig = async () => {
  const configRaw = getConfigRaw();

  const publicClient = getPublicClient(configRaw.chain);

  const config: Config = {
    publicClient,
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

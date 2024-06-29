import { getConfigRaw } from "./configParsing";
import { getPublicClient, getWalletClient } from "./clients";
import { Config } from "./interfaces";

// const checkMultisigThreshold = (
//   childSafeMultisigThreshold: bigint,
//   childSafeMultisigOwners: Address[]
// ) => {
//   if (childSafeMultisigThreshold > BigInt(childSafeMultisigOwners.length)) {
//     console.error(
//       "CHILD_SAFE_MULTISIG_THRESHOLD cannot be greater than the number of CHILD_SAFE_MULTISIG_OWNERS!"
//     );
//     process.exit(1);
//   }
// };

export const getValidatedConfig = async () => {
  const configRaw = getConfigRaw();

  const publicClient = getPublicClient(configRaw.chain);
  const walletClient = getWalletClient(configRaw.chain, configRaw.privateKey);

  // checkMultisigThreshold(
  //   configRaw.childSafeMultisigThreshold,
  //   configRaw.childSafeMultisigOwners
  // );

  const config: Config = {
    publicClient,
    walletClient,
    network: {
      chain: configRaw.chain,
    },
    contractAddresses: {
      fractal: {
        fractalRegistryAddress: configRaw.fractalRegistryAddress,
      },
      safe: {
        multiSendAddress: configRaw.multiSendAddress,
        multiSendCallOnlyAddress: configRaw.multiSendCallOnlyAddress,
        gnosisSafeL2SingletonAddress: configRaw.gnosisSafeL2SingletonAddress,
        gnosisSafeProxyFactoryAddress: configRaw.gnosisSafeProxyFactoryAddress,
        compatibilityFallbackHandlerAddress:
          configRaw.compatibilityFallbackHandlerAddress,
      },
      zodiac: {
        multisigFreezeVotingMasterCopyAddress:
          configRaw.multisigFreezeVotingMasterCopyAddress,
        multisigFreezeGuardMasterCopyAddress:
          configRaw.multisigFreezeGuardMasterCopyAddress,
        moduleProxyFactoryAddress: configRaw.moduleProxyFactoryAddress,
        fractalModuleMasterCopyAddress:
          configRaw.fractalModuleMasterCopyAddress,
      },
    },
  };

  console.log("User provided environment variables:");
  console.table([{ property: "Chain", value: config.network.chain.name }]);
  console.log("");

  console.log(
    `Network specific (${config.network.chain.name}) contract addresses:`
  );
  console.table([
    {
      property: "FractalModule Master Copy address",
      value: config.contractAddresses.zodiac.fractalModuleMasterCopyAddress,
    },
    {
      property: "FractalRegistry address",
      value: config.contractAddresses.fractal.fractalRegistryAddress,
    },
    {
      property: "MultiSend address",
      value: config.contractAddresses.safe.multiSendAddress,
    },
    {
      property: "MultiSendCallOnly address",
      value: config.contractAddresses.safe.multiSendCallOnlyAddress,
    },
    {
      property: "ModuleProxyFactory address",
      value: config.contractAddresses.zodiac.moduleProxyFactoryAddress,
    },
    {
      property: "GnosisSafeL2 Singleton address",
      value: config.contractAddresses.safe.gnosisSafeL2SingletonAddress,
    },
    {
      property: "GnosisSafeProxyFactory address",
      value: config.contractAddresses.safe.gnosisSafeProxyFactoryAddress,
    },
    {
      property: "CompatibilityFallbackHandler address",
      value: config.contractAddresses.safe.compatibilityFallbackHandlerAddress,
    },
  ]);
  console.log("");

  return config;
};

import "dotenv/config";
import { Chain, getAddress, isHex } from "viem";
import { sepolia, base } from "viem/chains";

enum SingletonAddressNames {
  GnosisSafeProxyFactory,
  GnosisSafeL2Singleton,
  ModuleProxyFactory,
  FractalModuleMasterCopy,
  MultiSendCallOnly,
  CompatibilityFallbackHandler,
  FractalRegistry,
  MultisigFreezeVoting,
  MultisigFreezeGuard,
  VotesErc20,
}

const getSingletonAddress = (chain: Chain, name: SingletonAddressNames) => {
  switch (chain) {
    case base: {
      switch (name) {
        case SingletonAddressNames.GnosisSafeProxyFactory: {
          return getAddress("0xC22834581EbC8527d974F8a1c97E1bEA4EF910BC");
        }
        case SingletonAddressNames.GnosisSafeL2Singleton: {
          return getAddress("0xfb1bffc9d739b8d520daf37df666da4c687191ea");
        }
        case SingletonAddressNames.ModuleProxyFactory: {
          return getAddress("0x000000000000aDdB49795b0f9bA5BC298cDda236");
        }
        case SingletonAddressNames.FractalModuleMasterCopy: {
          return getAddress("0x87326A981fc56823e26599Ff4D0A4eceAFfF3be0");
        }
        case SingletonAddressNames.MultiSendCallOnly: {
          return getAddress("0xA1dabEF33b3B82c7814B6D82A79e50F4AC44102B");
        }
        case SingletonAddressNames.CompatibilityFallbackHandler: {
          return getAddress("0x017062a1dE2FE6b99BE3d9d37841FeD19F573804");
        }
        case SingletonAddressNames.FractalRegistry: {
          return getAddress("0x023BDAEFeDDDdd5B43aF125CAA8007a99A886Fd3");
        }
        case SingletonAddressNames.MultisigFreezeVoting: {
          return getAddress("0xFe376AAD5bB1c3Ce27fb27Ece130F7B0ba8D9642");
        }
        case SingletonAddressNames.MultisigFreezeGuard: {
          return getAddress("0xcd6c149b3C0FE7284005869fa15080e85887c8F1");
        }
        case SingletonAddressNames.VotesErc20: {
          return getAddress("0x7bE7B12DA74d48E541131DB1626Ee651A2105c45");
        }
        default: {
          console.error(`Address ${name} not set!`);
          process.exit(1);
        }
      }
      break;
    }
    case sepolia: {
      switch (name) {
        case SingletonAddressNames.GnosisSafeProxyFactory: {
          return getAddress("0xc22834581ebc8527d974f8a1c97e1bea4ef910bc");
        }
        case SingletonAddressNames.GnosisSafeL2Singleton: {
          return getAddress("0xfb1bffc9d739b8d520daf37df666da4c687191ea");
        }
        case SingletonAddressNames.ModuleProxyFactory: {
          return getAddress("0x000000000000aDdB49795b0f9bA5BC298cDda236");
        }
        case SingletonAddressNames.FractalModuleMasterCopy: {
          return getAddress("0x1b26345a4a41d9f588e1b161b6e8f21d27547184");
        }
        case SingletonAddressNames.MultiSendCallOnly: {
          return getAddress("0xA1dabEF33b3B82c7814B6D82A79e50F4AC44102B");
        }
        case SingletonAddressNames.CompatibilityFallbackHandler: {
          return getAddress("0x017062a1dE2FE6b99BE3d9d37841FeD19F573804");
        }
        case SingletonAddressNames.FractalRegistry: {
          return getAddress("0x4791FF2a6E84F012402c0679C12Cb1d9260450A6");
        }
        case SingletonAddressNames.MultisigFreezeVoting: {
          return getAddress("0x10Aff1BEB279C6b0077eee0DB2f0Cc9Cedd4c507");
        }
        case SingletonAddressNames.MultisigFreezeGuard: {
          return getAddress("0x4B3c155C9bB21F482E894B4321Ac4d2DCF4A6746");
        }
        case SingletonAddressNames.VotesErc20: {
          return getAddress("0x51c852BdF6ed00bAca4225EE940b426a56853ec9");
        }
        default: {
          console.error(`Address ${name} not set!`);
          process.exit(1);
        }
      }
      break;
    }
    default: {
      console.error(`Chain ${chain.name} not supported!`);
      process.exit(1);
    }
  }
};

const getEnvVar = (name: string) => {
  const envVar = process.env[name];

  if (envVar === undefined) {
    console.error(`${name} environment variable is missing!`);
    process.exit(1);
  }

  return envVar.trim();
};

const getChain = (name: string) => {
  const envVar = getEnvVar(name);

  const value =
    envVar === "base" ? base : envVar === "sepolia" ? sepolia : undefined;

  if (value === undefined) {
    console.error(`${name} environment variable is malformed!`);
    process.exit(1);
  }

  return value;
};

const getPrivateKey = () => {
  const envVar = process.env["PRIVATE_KEY"];

  if (envVar === undefined) {
    return undefined;
  }

  const trimmed = envVar.trim();

  if (!isHex(trimmed)) {
    return undefined;
  }

  return trimmed;
};

export const getConfigRaw = () => {
  const chain = getChain("CHAIN");
  const privateKey = getPrivateKey();

  const gnosisSafeProxyFactoryAddress = getSingletonAddress(
    chain,
    SingletonAddressNames.GnosisSafeProxyFactory
  );
  const gnosisSafeL2SingletonAddress = getSingletonAddress(
    chain,
    SingletonAddressNames.GnosisSafeL2Singleton
  );
  const moduleProxyFactoryAddress = getSingletonAddress(
    chain,
    SingletonAddressNames.ModuleProxyFactory
  );
  const fractalModuleMasterCopyAddress = getSingletonAddress(
    chain,
    SingletonAddressNames.FractalModuleMasterCopy
  );
  const multiSendCallOnlyAddress = getSingletonAddress(
    chain,
    SingletonAddressNames.MultiSendCallOnly
  );
  const compatibilityFallbackHandlerAddress = getSingletonAddress(
    chain,
    SingletonAddressNames.CompatibilityFallbackHandler
  );
  const fractalRegistryAddress = getSingletonAddress(
    chain,
    SingletonAddressNames.FractalRegistry
  );
  const multisigFreezeVotingMasterCopyAddress = getSingletonAddress(
    chain,
    SingletonAddressNames.MultisigFreezeVoting
  );
  const multisigFreezeGuardMasterCopyAddress = getSingletonAddress(
    chain,
    SingletonAddressNames.MultisigFreezeGuard
  );
  const votesErc20MasterCopyAddress = getSingletonAddress(
    chain,
    SingletonAddressNames.VotesErc20
  );

  return {
    chain,
    privateKey,
    fractalRegistryAddress,
    multiSendCallOnlyAddress,
    gnosisSafeL2SingletonAddress,
    gnosisSafeProxyFactoryAddress,
    compatibilityFallbackHandlerAddress,
    moduleProxyFactoryAddress,
    fractalModuleMasterCopyAddress,
    multisigFreezeVotingMasterCopyAddress,
    multisigFreezeGuardMasterCopyAddress,
    votesErc20MasterCopyAddress,
  };
};

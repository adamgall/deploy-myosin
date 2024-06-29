import { encodeMultiSend } from "./transactions";
import { getValidatedConfig } from "./configValidation";
import data from "./data";
import { getContract } from "viem";
import { MultiSendCallOnlyAbi } from "./abis";
import { createSafesTransactions } from "./processSafes";
import { doSafesFirstPass } from "./firstPass";

(async () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (BigInt.prototype as any).toJSON = function () {
    return this.toString();
  };

  const config = await getValidatedConfig();

  const safesFirstPass = await doSafesFirstPass(config, data.safes);

  const setupSafesTransactions = await createSafesTransactions(
    config,
    safesFirstPass
  );

  const multiSendCallOnlyContract = getContract({
    abi: MultiSendCallOnlyAbi,
    address: config.contractAddresses.safe.multiSendCallOnlyAddress,
    client: config.walletClient,
  });

  const transaction = await multiSendCallOnlyContract.simulate.multiSend([
    encodeMultiSend(setupSafesTransactions),
  ]);

  console.log({ transaction });
})();

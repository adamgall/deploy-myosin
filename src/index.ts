import { encodeMultiSend } from "./transactions";
import { getValidatedConfig } from "./configValidation";
import data from "./data";
import { getContract } from "viem";
import { MultiSendCallOnlyAbi } from "./abis";
import { createSafesTransactions } from "./safesTransactions";
import { processData } from "./processInput";
import { createTokenTransactions } from "./tokenTransactions";

(async () => {
  const config = await getValidatedConfig();
  const processedData = await processData(config, data);

  const allMultiSendTransactions = [
    ...(await createTokenTransactions(config, processedData)),
    ...(await createSafesTransactions(
      config,
      processedData.freezeConfig,
      processedData.safes
    )),
  ];

  const encodedMultiSendTransactions = encodeMultiSend(
    allMultiSendTransactions
  );

  console.log("Encoded MultiSend Transactions");
  console.log(encodedMultiSendTransactions);

  if (config.walletClient === undefined) {
    const multiSendCallOnlyContract = getContract({
      abi: MultiSendCallOnlyAbi,
      address: config.contractAddresses.multiSendCallOnlyAddress,
      client: config.publicClient,
    });

    const transaction = await multiSendCallOnlyContract.simulate.multiSend([
      encodedMultiSendTransactions,
    ]);

    console.log("Simulation result");
    console.log(transaction);
  } else {
    const multiSendCallOnlyContract = getContract({
      abi: MultiSendCallOnlyAbi,
      address: config.contractAddresses.multiSendCallOnlyAddress,
      client: config.walletClient,
    });

    const transaction = await multiSendCallOnlyContract.write.multiSend([
      encodedMultiSendTransactions,
    ]);

    console.log(`Transaction hash: ${transaction}`);
  }
})();

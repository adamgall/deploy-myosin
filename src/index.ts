import { encodeMultiSend } from "./transactions";
import { getValidatedConfig } from "./configValidation";
import data from "./data";
import { createSafesTransactions } from "./safesTransactions";
import { processData } from "./processInput";
import { createTokenTransactions } from "./tokenTransactions";

(async () => {
  const config = await getValidatedConfig();
  const processedData = await processData(config, data);

  const encodedMultiSendTransactions1 = encodeMultiSend(
    await createTokenTransactions(config, processedData)
  );

  console.log("Encoded MultiSend Transactions 1");
  console.log(encodedMultiSendTransactions1);
  console.log("");

  const encodedMultiSendTransactions2 = encodeMultiSend(
    await createSafesTransactions(
      config,
      processedData.freezeConfig,
      processedData.safes
    )
  );

  console.log("Encoded MultiSend Transactions 2");
  console.log(encodedMultiSendTransactions2);
  console.log("");
})();

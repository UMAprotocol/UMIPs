## Title

Change in UMA Market Cap Rank Calculation

## Summary

This calculation is intended to track the change in the market cap rank of UMA. The recommended method to query the change in UMA market cap rank is to use the script method below, but this document will also detail the market cap change calculation so that it could be reproduced if the script is either not available or returns incorrect results.

## Intended Ancillary Data

```
Metric:Change in UMA market cap rank,
Method:"https://github.com/UMAprotocol/UMIPs/blob/master/Implementations/uma-market-cap-rank.md",
Interval:latest timestamp that is at or before the price request timestamp,
StartingRank:<START_MARKET_CAP_RANK>,
Rounding:0
```

***Note 1:** <START_MARKET_CAP_RANK> should be filled in upon contract deployment based on the starting market cap rank used for the change in UMA market cap calculation.*

## Implementation

Change in UMA market cap rank is determined by calculating the difference between the market cap rank of UMA at the latest timestamp that is at or before the price request timestamp and the <START_MARKET_CAP_RANK> parameter set upon contract deployment. The source used as a reference for the calculation is Cryptorank but could be extended to use other API sources in the future.

## Manual method

1. Use the below URL to query the Cryptorank UMA market cap ranking. The query response sorts the results by market cap rank. Take a note of the index number for the element in the response where `symbol` is equal to `UMA`. Add 1 to this value and ensure that it corresponds to the latest timestamp that is at or before the price request timestamp. Please note, a Launch, Grow, or Business API plan is required. 

```
cryptorank_api_key = "YOUR_CRYPTORANK_API_KEY"
timestamp = "ISO_8601_timestamp" // uses ISO 8601 format

Query url:
https://api.cryptorank.io/v1/currencies/historical?time={timestamp}&limit=2000&api_key={cryptorank_api_key}&sort=rank
```

2. Apply the UMA `StartingRank` from the ancillary data and subtract the result from step 1. This value represents the change in UMA market cap rank.

## Script method

1. Save the below script as a Javascript file (e.g. uma-market-cap-rank.js).

```
/* Uses Axios for requests */
const axios = require("axios");

/* Set the starting rank to perform the change in ranking calculation */
const starting_rank = UMA_STARTING_RANK;

/* Set Cryptorank API */
const cryptorank_api_key = "YOUR_CRYPTORANK_API_KEY";

/* Set Cryptorank params */
const cryptorank_limit = "300"; // needs to be greater than the expected market cap rank
const cryptorank_time = "ISO_8601_timestamp"; // uses ISO 8601 format

// Collect cryptorank rank
async function collectCryptorankRank(api_key, limit, time) {

  const cryptorankArray = 
  (
    await axios.get(
      `https://api.cryptorank.io/v1/currencies/historical?api_key=${api_key}&limit=${limit}&time=${time}&sort=rank`
    )
  ).data.data;
  
  const reformattedArray = cryptorankArray.map(obj => {
    let rObj = {}
    rObj = obj.symbol
    return rObj
  })

  const rank = reformattedArray.findIndex(umarank => umarank === 'UMA') + 1;
  return rank;
}

 // Calculate UMA market cap rank
 async function calculateUmaRank() {
    const umaRank = await collectCryptorankRank(cryptorank_api_key, cryptorank_limit, cryptorank_time);
    
    return umaRank;
  }

// This function will take in the ranking and return the change in rank.
function calculateRankChange(umaAverageRank) {
    let current_rank = parseInt(umaAverageRank);

    if ( starting_rank - current_rank > 0 ) {
      return Math.abs(starting_rank - current_rank);
  } else if (starting_rank - current_rank <= 0) {
      return 0;
  }   
}

/**
 * Script runner
 */
 async function main() {
    // Output UMA market cap rank to console
    const umaRank = await calculateUmaRank();

    console.log("UMA starting rank: ", starting_rank);
    console.log("UMA current rank: ", umaRank);

    console.log("UMA Market Cap Rank increased by", calculateRankChange(umaRank));
}

// Run script
main();
```

2. Set the `starting_rank` variable as the `StartingRank` value from the ancillary data of the deployed contract.

3. Add your API keys to the `cryptorank_api_key` variable.

4. Install current versions of yarn and node.

5. Add axios as a dependency.

```
yarn add axios
```

6. Run script (will depend on the name of your javascript file)
```
node uma-market-cap-rank.js
```

7. The returned value represents the change in the market cap rank of UMA.

## Intended Application

It is intended to deploy the documented KPI options on the Ethereum network using [LSP contract](https://github.com/UMAprotocol/protocol/blob/master/packages/core/contracts/financial-templates/long-short-pair/LongShortPair.sol) with `General_KPI` price identifier approved in [UMIP-117](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-117.md). The contracts would use [Linear LSP FPL](https://github.com/UMAprotocol/protocol/blob/master/packages/core/contracts/financial-templates/common/financial-product-libraries/long-short-pair-libraries/LinearLongShortPairFinancialProductLibrary.sol) with the `lowerBound` set to 0 and `upperBound` set to 8.

The change in market cap rank calculation is the `StartingRank` less the market cap rank of UMA at the latest timestamp that is at or before the price request timestamp. As an illustration, based on the intended ancillary data above, the `upperBound` would be set to 8 implying the following payouts:
* If the market cap rank at expiration is greater than the `StartingRank`, the resolved price should be 0. For example, if the market cap rank at expiration is 170 and the `StartingRank` is 150, the returned value should be 0. Long KPI option holders would receive 0/8=0% of `collateralPerPair` for each token;
* If the change in market cap rank value is between 1 and 8, the resolved price should be the change in market cap value. For example, if the `StartingRank` is 150 and the market cap rank at expiration is 146, the returned value should be 4. Long KPI option holders would receive 4/8=50% of `collateralPerPair` for each token;
* If the change in market cap rank value is greater than 8, the resolved price should be 8. For example, if the `StartingRank` is 150 and the market cap rank at expiration is 140 (150-140=10), the returned value should be 8. Long KPI option holders would receive 8/8=100% of `collateralPerPair` for each token;

`collateralPerPair` above is the total locked collateral per KPI options token and it would be set by the deployer considering the available LP incentivization budget and intended KPI option token distribution amount.
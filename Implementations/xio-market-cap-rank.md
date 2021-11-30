## Title

XIO Market Cap Calculation

## Summary

This calculation is intended to track the market cap rank of XIO compared to other cryptocurrency projects. The recommended method to query the XIO market cap is to use the script method below, but this document will also detail the market cap calculation so that it could be reproduced if the script is either not available or returns incorrect results.

## Intended Ancillary Data

```
Metric:XIO market cap rank measured against other cryptocurrency projects,
Method:"https://github.com/UMAprotocol/UMIPs/blob/master/Implementations/xio-market-cap-rank.md",
Interval:latest timestamp that is at or before the price request timestamp,
Rounding:0
```

## Implementation

XIO market cap is determined by comparing the market cap of XIO against other cryptocurrency projects. The sources used as a reference for the calculation are Coinmarketcap and Cryptorank but could be extended to use other API sources in the future.

## Manual method

1. Use the below URL to query the Coinmarketcap XIO market cap ranking. Take a note of the `cmc_rank` parameter value that corresponds to the latest timestamp that is at or before the price request timestamp. Please note, a Standard, Professional, or Enterprise API plan is required.

```
cmc_api_key = "YOUR_CMC_API_KEY"

Query url:
https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/historical?CMC_PRO_API_KEY={cmc_api_key}&date=1672603200&convert=XIO,USD
```
2. Use the below URL to query the Cryptorank XIO market cap ranking. The query response sorts the results by market cap rank. Take a note of the index number for the element in the response where `symbol` is equal to `XIO`. Add 1 to this value and ensure that it corresponds to the latest timestamp that is at or before the price request timestamp. Please note, a Launch, Grow, or Business API plan is required. 

```
cryptorank_api_key = "YOUR_CRYPTORANK_API_KEY"

Query url:
https://api.cryptorank.io/v1/currencies/historical?time=2023-01-01T20:00:00Z&limit=2000&api_key={cryptorank_api_key}&sort=rank
```
3. Add the result from steps 1 and 2 and divide by 2. Round the result to 0 decimal places. This value represents the market cap rank of XIO.

## Script method

1. Save the below script as a Javascript file (e.g. xio-market-cap-rank.js).

```
/* Uses Axios for requests */
const axios = require("axios");

/* Set CMC and Cryptorank APIs */
const cmc_api_key = "YOUR_CMC_API_KEY";
const cryptorank_api_key = "YOUR_CRYPTORANK_API_KEY";

/* Set CMC params */
const cmc_date = "1637624697"; // uses UNIX format
const cmc_convert = "XIO,USD";

/* Set Cryptorank params */
const cryptorank_limit = "1500"; // needs to be greater than the expected market cap rank
const cryptorank_time = "2021-11-28T21:08:19.826Z"; // uses ISO 8601 format

// Collect cmc rank
async function collectCmcRank(api_key, date, convert) {
  const rank = 
  (
    await axios.get(
      `https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/historical?CMC_PRO_API_KEY=${api_key}&date=${date}&convert=${convert}`
      // test with sandbox using https://sandbox-api.coinmarketcap.com/v1/cryptocurrency/listings/historical
    )
  ).data.data[0].cmc_rank;
  console.log('CMC API: ' + rank); // Output CMC rank to console
  return rank;
}

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

  const rank = reformattedArray.findIndex(xiorank => xiorank === 'XIO') + 1;
  console.log('Cryptorank API: ' + rank); // Output Cryptorank rank to console
  return rank;
}

 // Calculate average of array of ranks
 function calculateRankAverage(ranks) {
  // Return reduced sum / length of ranks array
  return ranks.reduce((a, b) => a + b) / ranks.length;
}

 // Calculate XIO market cap rank
 async function calculateXioRank() {
    const xioRank = calculateRankAverage([
      await collectCmcRank(cmc_api_key, cmc_date, cmc_convert),
      await collectCryptorankRank(cryptorank_api_key, cryptorank_limit, cryptorank_time),
    ]);
    return Math.round(xioRank);
  }

/**
 * Script runner
 */
 async function main() {
  // Output XIO market cap rank to console
    console.log("XIO Rank: " + (await calculateXioRank()));
}

// Run script
main();
```

2. Add your API keys to the `cmc_api_key` and `cryptorank_api_key` variables.

3. Install current versions of yarn and node.

4. Add axios as a dependency.

```
yarn add axios
```

5. Run script (will depend on the name of your javascript file)
```
node xio-market-cap-rank.js
```

6. The returned XIO Rank value represents the market cap rank of XIO.

## Post processing

The below parameters will be used to return a value between 0 and 100,000 to the submitted price request:
- current_rank = the returned XIO market cap rank
- highest_possible_rank = 100
- lowest_possible_rank = 1,000

1. If the returned current_rank value is below 100, the resolved price should be capped at 100,000.
2. If the returned current_rank is above 1,000, the resolved price should be 0.
3. If the returned current_rank value is above 100 and below 1,000, the resolved price should be calculated using the below formula:

( 1 - ( current_rank / lowest_possible_rank - highest_possible_rank / lowest_possible_rank )) * 10,000

## Intended Application

It is intended to deploy the documented KPI options using [LSP contract](https://github.com/UMAprotocol/protocol/blob/master/packages/core/contracts/financial-templates/long-short-pair/LongShortPair.sol) with `General_KPI` price identifier approved in [UMIP-117](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-117.md). The contract would use [Linear LSP FPL](https://github.com/UMAprotocol/protocol/blob/master/packages/core/contracts/financial-templates/common/financial-product-libraries/long-short-pair-libraries/LinearLongShortPairFinancialProductLibrary.sol) with the `lowerBound` set to 0 and `upperBound` set to 100,000.

`collateralPerPair` parameter for the LSP contract would be set to 100,000 so that with the intended 100 option token distribution maximum absolute payout to the recipients would be 10,000,000 XIO.

As an illustration, a `current_rank` value of 200 would result in a calculation of 90,000 as shown with ( 1 - ( 200 / 100 - 1,000 / 100 )) * 10,000. At settlement, the `expiryPercentLong` would be calculated using `(expiryPrice - lowerBound) / (upperBound - lowerBound)`. With an `expiryPrice` of 90,000, `expiryPercentLong` would be calculated as (90,000 - 0) / (100,000 - 0) = 0.90. Therefore, 90% of collateral would be allocated to long tokens and 10% would be allocated to short tokens. With a `collateralPerPair` set to 100,000, 90,000 XIO would be allocated to each long token and 10,000 XIO would be allocated to each short token.
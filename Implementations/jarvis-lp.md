## Title

Jarvis LP TVL Calculation

## Summary

This calculation is intended to track the TVL in USD of liquidity provider (LP) tokens staked in the [Jarvis WETH-JRT Sushiswap pool on Polygon](https://polygonscan.com/address/0xa769c6786c3717945438d4c4feb8494a1a6ca443).

## Intended Ancillary Data

```
Metric:LP TVL provided to Jarvis WETH-JRT pool on Polygon,
TVLCurrency:usd,
Method:"https://github.com/UMAprotocol/UMIPs/blob/master/Implementations/jarvis-lp.md",
jarvisLPContract:0xa769c6786C3717945438d4C4feb8494a1a6Ca443,
Interval:daily,
Aggregation:Average end of day (midnight UTC) LP TVL since <START_TIMESTAMP>,
Rounding:0
```

***Note 1:** `TVLCurrency` represents the quote currency in which the TVL should be measured. This parameter can be set to any quote currency supported by CoinGecko (see full supported list in https://api.coingecko.com/api/v3/simple/supported_vs_currencies).*

***Note 2:** `jarvisLPContract` above is specific to Polygon network*

***Note 3:** <START_TIMESTAMP> should be filled in upon contract deployment based on expected expiration and desired averaging period.*

## Implementation

1. Identify all daily evaluation timestamps at the end of the day (midnight UTC) that fall in between the start timestamp (passed within the `Aggregation` parameter from the ancillary data) and the request timestamp.
2. Identify the LP contract on Polygon passed as `jarvisLPContract` parameter in the ancillary data.
3. Identify the LP contract reserve currencies by calling `token0()` and `token1()` methods on the LP contract from step 2.
4. Get total LP reserves by calling `getReserves()` method on the LP contract at the latest available block at or before each evaluation timestamp identified in Step 1. This should return `token0` and `token1` balances as index 0 `_reserve0` and index 1 `_reserve1` respectively.
5. For both LP reserve tokens from Step 2, get the latest available pricing at or before each of the evaluation timestamps from CoinGecko:
    * Based on CoinGecko [API documentation](https://www.coingecko.com/api/documentations/v3#/contract/get_coins__id__contract__contract_address__market_chart_range) construct price API request with following parameters:
      * `id`: CoinGecko platform id - the chain of the LP contract from Step 2 in https://api.coingecko.com/api/v3/asset_platforms endpoint ("polygon-pos" is used for the Jarvis LP calculation);
      * `contract_address`: reserve token address from Step 3;
      * `vs_currency`: TVL measurement currency based on the passed `TVLCurrency` parameter in the ancillary data (e.g. "usd");
      * `from`: start timestamp (passed within the `Aggregation` parameter from the ancillary data);
      * `to`: request timestamp;
    * Note that some tokens might not be supported by CoinGecko on all chains  - in such case consult supported currency/platform list at https://api.coingecko.com/api/v3/coins/list?include_platform=true and replace to supported `id`  and `contract_address` for the same reserve token.
    * Example API request for JRT token pricing information: https://api.coingecko.com/api/v3/coins/polygon-pos/contract/0x596ebe76e2db4470966ea395b0d063ac6197a8c5/market_chart/range?vs_currency=usd&from=1642226400&to=1642917600
    * Example API request for WETH token pricing information: https://api.coingecko.com/api/v3/coins/polygon-pos/contract/0x7ceb23fd6bc0add59e62ac25578270cff1b9f619/market_chart/range?vs_currency=usd&from=1642226400&to=1642917600
    * Locate the `prices` key value from CoinGecko API response - it should contain a list of [ timestamp, price ] values. Choose the price at the latest timestamp before the evaluation timestamp (CoinGecko timestamps are in milliseconds);
    * Voters should verify that obtained price results agree with broad market consensus.
6. Scale down LP reserve balances from Step 4 with their respective decimals (call `decimals()` method on the token contracts from Step 3).
7. Multiply each LP reserve token balance from Step 6 with its price from Step 5 for each evaluation timestamp.
8. Sum both LP reserve balance values from Step 7 to get the total value of the pool in terms of `TVLCurrency` at the latest available block at or before each evaluation timestamp.
9. Calculate the average from the daily values in Step 8 to obtain the LP TVL in terms of `TVLCurrency`. 
10. Apply ceiling rounding on the output from step 9 using instructions from [UMIP-117](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-117.md) and `Rounding` parameter passed in ancillary data. As an example, if `Rounding` parameter was 0 and the output from step 9 was USD 800,000, the value should be rounded up to 1,000,000. Alternatively, if the output from step 9 was USD 1,200,000, the value should be rounded up to 2,000,000.

## Post-Processing

It is intended to deploy the documented KPI options on Polygon using [LSP contract](https://github.com/UMAprotocol/protocol/blob/master/packages/core/contracts/financial-templates/long-short-pair/LongShortPair.sol) with `General_KPI` price identifier approved in [UMIP-117](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-117.md). The contracts should use [Linear LSP FPL](https://github.com/UMAprotocol/protocol/blob/master/packages/core/contracts/financial-templates/common/financial-product-libraries/long-short-pair-libraries/LinearLongShortPairFinancialProductLibrary.sol) with the `lowerBound` set to 0 and `upperBound` set to 3,000,000. 

Ceiling rounding should be used to calculate the returned value. As an illustration, based on the intended ancillary data above, `upperBound` should be set to 3,000,000 implying the following payouts:
* LP TVL below or equal to USD 1,000,000 should have returned 1,000,000 and long KPI option holders should receive 1,000,000/3,000,000=33.33% of `collateralPerPair` for each token;
* LP TVL above USD 1,000,000 and below or equal to USD 2,000,000 should have returned 2,000,000 and long KPI option holders should receive 2,000,000/3,000,000=66.66% of `collateralPerPair` for each token;
* LP TVL above USD 2,000,000 should have returned 3,000,000 and long KPI option holders should receive 3,000,000/3,000,000=100% of `collateralPerPair` for each token;

`collateralPerPair` above is the total locked collateral per KPI options token and it should be set by the deployer considering the available LP incentivization budget and intended KPI option token distribution amount.
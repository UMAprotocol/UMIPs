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
Rounding:0
```

***Note 1:** `TVLCurrency` represents the quote currency in which the TVL should be measured. This parameter can be set to any quote currency supported by CoinGecko (see full supported list in https://api.coingecko.com/api/v3/simple/supported_vs_currencies).*

***Note 2:** `jarvisLPContract` above is specific to Polygon network*

## Implementation

1. Identify the LP contract on Polygon passed as `jarvisLPContract` parameter in the ancillary data.
2. Identify the LP contract reserve currencies by calling `token0()` and `token1()` methods on the LP contract from step 1.
3. Get total LP reserves by calling `getReserves()` method on the LP contract at the latest available block at or before the evaluation timestamp. This should return `token0` and `token1` balances as index 0 `_reserve0` and index 1 `_reserve1` respectively.
4. For both LP reserve tokens from Step 2, get the latest available pricing before the evaluation timestamp from CoinGecko:
    * Based on CoinGecko [API documentation](https://www.coingecko.com/api/documentations/v3#/contract/get_coins__id__contract__contract_address__market_chart_range) construct price API request with following parameters:
      * `id`: CoinGecko platform id - the chain of the LP contract from Step 1 in https://api.coingecko.com/api/v3/asset_platforms endpoint ("polygon-pos" is used for the Jarvis LP calculation);
      * `contract_address`: reserve token address from Step 2;
      * `vs_currency`: TVL measurement currency based on the passed `TVLCurrency` parameter in the ancillary data (e.g. "usd");
      * `from`: start timestamp;
      * `to`: request timestamp;
    * Note that some tokens might not be supported by CoinGecko on all chains  - in such case consult supported currency/platform list at https://api.coingecko.com/api/v3/coins/list?include_platform=true and replace to supported `id`  and `contract_address` for the same reserve token.
    * Example API request for JRT token pricing information: https://api.coingecko.com/api/v3/coins/polygon-pos/contract/0x596ebe76e2db4470966ea395b0d063ac6197a8c5/market_chart/range?vs_currency=usd&from=1642226400&to=1642917600
    * Example API request for WETH token pricing information: https://api.coingecko.com/api/v3/coins/polygon-pos/contract/0x7ceb23fd6bc0add59e62ac25578270cff1b9f619/market_chart/range?vs_currency=usd&from=1642226400&to=1642917600
    * Locate the `prices` key value from CoinGecko API response - it should contain a list of [ timestamp, price ] values. Choose the price at the latest timestamp before the evaluation timestamp (CoinGecko timestamps are in milliseconds);
    * Voters should verify that obtained price results agree with broad market consensus.
5. Scale down LP reserve balances from Step 3 with their respective decimals (call `decimals()` method on the token contracts from Step 2).
6. Multiply each LP reserve token balance from Step 5 with its price from Step 4.
7. Sum both LP reserve balance values from Step 6 to get the total value of the pool in USD at the latest available block at or before the evaluation timestamp.

## Intended Application

It is intended to deploy the documented KPI options separately on each supported chain using [LSP contract](https://github.com/UMAprotocol/protocol/blob/master/packages/core/contracts/financial-templates/long-short-pair/LongShortPair.sol) with `General_KPI` price identifier approved in [UMIP-117](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-117.md). The contracts would use [Linear LSP FPL](https://github.com/UMAprotocol/protocol/blob/master/packages/core/contracts/financial-templates/common/financial-product-libraries/long-short-pair-libraries/LinearLongShortPairFinancialProductLibrary.sol) with the `lowerBound` set to 0 and `upperBound` set to 2,300,000.

As an illustration, based on the intended ancillary data above with `upperBound` set to 2,300,000, the following payouts would be implied:
* TVL below USD 2,300,000 would divide the returned value by the `upperBound` of 2,300,000. A returned value of 1,150,000 would provide long token holders with 1,150,000/2,300,000 = 50% of `collateralPerPair` for each token;
* TVL above USD 2,300,000 would return 2,300,000/2,300,000 and long KPI option holders would receive 100% of `collateralPerPair` for each token;

`collateralPerPair` above is the total locked collateral per KPI options token and it would be set by the deployer considering the available LP incentivization budget and intended KPI option token distribution amount.
## Title

Tetu USDC_UMA TVL Calculation

## Summary

This calculation is intended to track the TVL in USD of liquidity provider (LP) tokens staked in the [ TetuSwap LP (TLP_USDC_UMA)](https://polygonscan.com/address/0xAbcA7538233cbE69709C004c52DC37e61c03796B).

## Intended Ancillary Data

```
Metric:LP TVL provided to the  TetuSwap LP (TLP_USDC_UMA),
Method:"https://github.com/UMAprotocol/UMIPs/blob/master/Implementations/tetu-lp-tvl.md",
Interval:daily,
Aggregation:Average end of day (midnight UTC) TVL since <START_TIMESTAMP>,
Rounding:0
```



***Note 1:** `TetuSwap LP (TLP_USDC_UMA)` above is specific to Polygon network.*

***Note 2:** <START_TIMESTAMP> should be filled in upon contract deployment based on expected expiration and desired averaging period.*

## Implementation

1. Identify all daily evaluation timestamps at the end of the day (midnight UTC) that fall in between the start timestamp and the request timestamp.
2. Identify the LP contract:`0xAbcA7538233cbE69709C004c52DC37e61c03796B` at https://Polygonscan.com. 
3. Identify the LP contract currencies by calling `token0` and `token1` methods on the LP contract from Step 2. Expected values are:

`token0` "usd-coin" `0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174`

`token1` "uma" `0x3066818837c5e6eD6601bd5a91B0762877A6B731`

4. Using `token0` “usd-coin” and `token1` ”uma” contract addresses acquired in Step 3, on the LP contract call `balanceOfVaultUnderlying` to obtain both separate LP token amounts. 

5. Scale down LP token balances from Step 4 with their respective decimals (call `decimals` method on the token, read as proxy contracts from Step 3).

6. For both LP tokens from Step 3, get the latest available pricing at or before each of the evaluation timestamps, from CoinGecko:
    * Based on CoinGecko [API documentation](https://www.coingecko.com/api/documentations/v3#/coins/get_coins__id__market_chart_range) construct price API request with following parameters:
      * `id`: pass the coin id from Step 3 (e.g. "usd-coin");
      * `vs_currency`: TVL measurement currency ("usd");
      * `from`: start timestamp (passed within the `Aggregation` parameter from the ancillary data);
      * `to`: request timestamp;
    * Note that some tokens might not be supported by CoinGecko on all chains  - in such case consult supported currency/platform list at https://api.coingecko.com/api/v3/coins/list?include_platform=true and replace to supported `id` for the same reserve token.
    * Example API request for `uma` token pricing information:
     https://api.coingecko.com/api/v3/coins/uma/market_chart/range?vs_currency=usd&from=1651731630&to=1652973054

    * Example API request for `usd-coin` token pricing information:
     https://api.coingecko.com/api/v3/coins/usd-coin/market_chart/range?vs_currency=usd&from=1651731630&to=1652973054
    * Locate the `prices` key value from CoinGecko API response - it should contain a list of [ timestamp, price ] values. Choose the price at the latest timestamp before the evaluation timestamp (CoinGecko timestamps are in milliseconds);
    * Voters should verify that obtained price results agree with broad market consensus.
7. Multiply each LP reserve token balance from Step 5 with its price from Step 6 for each evaluation timestamp.
8. Sum both LP reserve balance values from Step 7 to get the total value of the pool in terms of USD at the latest available block at or before each evaluation timestamp.
9. Calculate the average from the daily values in Step 8 to obtain the LP TVL in terms of USD. 


## Post-Processing

It is intended to deploy the documented KPI option  on Polygon using [LSP contract](https://github.com/UMAprotocol/protocol/blob/master/packages/core/contracts/financial-templates/long-short-pair/LongShortPair.sol) with `General_KPI` price identifier approved in [UMIP-117](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-117.md). The contracts would use [Linear LSP FPL](https://github.com/UMAprotocol/protocol/blob/master/packages/core/contracts/financial-templates/common/financial-product-libraries/long-short-pair-libraries/LinearLongShortPairFinancialProductLibrary.sol) with the `lowerBound` set to 0 and `upperBound` set to 1.00. 

With the intention of providing a minimum payout, if the `TetuSwap LP (TLP_USDC_UMA)`TVL is below USD $300,000 after the necessary rounding is applied, voters should return 0.25 . As an illustration, based on the intended ancillary data above, `upperBound` would be set to 1.00 implying the following payouts:
* If TVL is below $300,000 USD at expiry, each KPI option pays out 0.25 TETU.
* If TVL is at or above $300,000 USD at expiry, each KPI option pays out 0.50 TETU.
* If TVL reaches $450,000 USD at expiry, each KPI option pays out 0.75 TETU.
* If TVL is $600,000 USD or above at expiry, each KPI option pays out 1.00 TETU.


`collateralPerPair` above is the total locked collateral per KPI option  token and it would be set by the deployer considering the available LP incentivization budget `and intended KPI option token distribution amount.`

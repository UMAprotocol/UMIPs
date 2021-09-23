## Title

YEL Staked LP TVL Calculation

## Summary

This calculation is intended to track the TVL of liquidity provider (LP) tokens staked in YEL contracts separately for each chain where the respective KPI options program is deployed. As of time of authorship of this document Ethereum and Polygon chains are supported, but it could be extended to any other chain where YEL has LP staking available once UMA optimistic oracle tunnels are implemented there.

Any Uniswap v2 compatible LP tokens are supported as long as both LP reserve currencies have pricing information available on CoinGecko. This document is based off the calculation logic in [YEL DeFiLlama adapter](https://github.com/YieldEnhancementLabs/DefiLlama-Adapters/blob/main/projects/yel/index.js), but the voters will still need to recalculate staked LP token value manually as DeFiLlama adapter also covers other YEL staking products and it does not show breakdown by contract types.

## Intended Ancillary Data

```
Metric:LP TVL staked in YEL protocol,
TVLCurrency:usd,
Method:"https://github.com/UMAprotocol/UMIPs/blob/master/Implementations/yel-lp.md",
yelFarmingContract:0xe7c8477C0c7AAaD6106EBDbbED3a5a2665b273b9,
stakingTokenId:1,
Interval:daily,
Aggregation:Average end of day (midnight UTC) TVL since <START_TIMESTAMP>,
Rounding:0,
TVLCheckpoints:{"0":0,"500000":50,"1000000":120,"2000000":250}
```

***Note 1:** `TVLCurrency` represents the quote currency in which the TVL should be measured. This parameter can be set to any quote currency supported by CoinGecko (see full supported list in https://api.coingecko.com/api/v3/simple/supported_vs_currencies).*

***Note 2:** `yelFarmingContract` above is specific to Ethereum network and should be different for each chain where KPI options are deployed (e.g. 0x954b15065e4FA1243Cd45a020766511b68Ea9b6E on Polygon).*

***Note 3:** `stakingTokenId` represents incentivized LP token index in the YEL staking contract. Currently all YEL staking contracts have LP token index set at 1.*

***Note 4:** <START_TIMESTAMP> should be filled in upon contract deployment based on expected expiration and desired averaging period.*

***Note 5:** `TVLCheckpoints` can be modified to any other JSON formatted object defining post-processing of target TVL's (keys) and returned prices (values).*

## Implementation

1. Identify all daily evaluation timestamps at the end of day (midnight UTC) that fall in between the start timestamp (passed within the `Aggregation` parameter from the ancillary data) and the request timestamp.
2. Identify the chain of the requesting contract (e.g. Ethereum or Polygon).
3. Identify the YEL staking contract (on the chain from Step 2) passed as `yelFarmingContract` parameter in the ancillary data.
4. Identify the incentivized LP token and its staked balances by calling `poolInfo(1)` method on the YEL staking contract from Step 3. Voters should make sure to call it at the latest available block at or before each evaluation timestamp identified in Step 1 (access to archive node would be required). In case the `stakingTokenId` parameter passed in the ancillary data has any other value than 1 modify the `poolInfo` call to contain it as its parameter value. Take a note on the returned LP token contract address (index 0 `stakingToken` from output) and staked LP token balances (index 1 ` stakingTokenTotalAmount` from output).
5. Identify LP contract reserve currencies by calling `token0()` and `token1()` methods on the LP contract from Step 4 (`stakingToken`).
6. Get total LP reserves by calling `getReserves()` method on the LP contract from Step 4 at the latest available block at or before each of evaluation timestamps from Step 1. This should return `token0` and `token1` balances as index 0 `_reserve0` and index 1 `_reserve1` respectively for each evaluation timestamp.
7. For both LP reserve tokens from Step 5 get the latest available pricing before each of evaluation timestamps from CoinGecko:
    * Based on CoinGecko [API documentation](https://www.coingecko.com/api/documentations/v3#/contract/get_coins__id__contract__contract_address__market_chart_range) construct price API request with following parameters:
      * `id`: CoinGecko platform id - find the chain from Step 2 in https://api.coingecko.com/api/v3/asset_platforms endpoint (e.g. "ethereum" or "polygon-pos");
      * `contract_address`: reserve token address from Step 5;
      * `vs_currency`: TVL measurement currency based on the passed `TVLCurrency` parameter in the ancillary data (e.g. "usd");
      * `from`: start timestamp (passed within the `Aggregation` parameter from the ancillary data);
      * `to`: request timestamp;
    * Note that some tokens might not be supported by CoinGecko on all chains  - in such case consult supported currency/platform list at https://api.coingecko.com/api/v3/coins/list?include_platform=true and replace to supported `id`  and `contract_address` for the same reserve token. As of time of authorship of this document YEL is supported only on Ethereum chain, hence its Polygon address would need to be replaced with 0x7815bDa662050D84718B988735218CFfd32f75ea on Ethereum;
    * Example API request for YEL token pricing information: https://api.coingecko.com/api/v3/coins/ethereum/contract/0x7815bDa662050D84718B988735218CFfd32f75ea/market_chart/range?vs_currency=usd&from=1630454400&to=1631491200
    * Locate the `prices` key value from CoinGecko API response - it should contain a list of [ timestamp, price ] values. For each evaluation period (Step 1) choose the price at the latest timestamp before the evaluation timestamp (CoinGecko timestamps are in milliseconds);
    * Voters should verify that obtained price results agree with broad market consensus.
8. Scale down LP reserve balances from Step 6 with their respective decimals (call `decimals()` method on the token contracts from Step 5).
9. Multiply each LP reserve token balance from Step 8 with its price from Step 7 for each evaluation timestamp.
10. Sum both LP reserve balance values from Step 9 to get total value of the pool for each evaluation timestamp.
11. Get total LP token supply by calling `totalSupply()` method on the LP contract from Step 4 at the latest available block at or before each evaluation timestamp.
12. Scale down LP token supply series from Step 11 with its decimals (call `decimals()` method on the LP contract from Step 4).
13. Divide total LP pool values from Step 10 with the corresponding timestamp token supply from Step 12 to get the price per 1 LP token for each evaluation timestamp.
14. Scale down staked LP token balances from Step 4 (`stakingTokenTotalAmount`) with its decimals (call `decimals()` method on the LP contract) for each evaluation timestamp.
15. Multiply staked LP token balances from Step 14 with their corresponding prices from Step 13 to obtain LP TVL in terms of `TVLCurrency` for each evaluation timestamp.
16. Calculate average from the daily values in Step 15 to obtain chain specific staked LP TVL in terms of `TVLCurrency`.

## Post processing

Based on the `TVLCheckpoints` parameter from ancillary data voters should transform the measured average TVL from Step 16 to its corresponding price points. `TVLCheckpoints` contains key-value pairs where keys represent target TVL metric checkpoints and values indicate response price points. Voters should identify the largest TVL checkpoint (key) that is exceeded by the average TVL and return its corresponding price point (value) as resolved price request.

As an example, based on the intended ancillary data parameters above if the average TVL of LP staked in YEL on Ethereum at KPI options expiration was USD 260,000 price should be resolved to 0 (TVL is exceeding only key "0" checkpoint). Alternatively, if the average TVL of LP staked in YEL on Polygon was USD 510,000 price should be resolved to 50 (TVL is exceeding key "500000" checkpoint).

## Intended Application

It is intended to deploy the documented KPI options separately on each supported chain using [LSP contract](https://github.com/UMAprotocol/protocol/blob/master/packages/core/contracts/financial-templates/long-short-pair/LongShortPair.sol) with `General_KPI` price identifier approved in [UMIP-117](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-117.md). The contracts would use [Linear LSP FPL](https://github.com/UMAprotocol/protocol/blob/master/packages/core/contracts/financial-templates/common/financial-product-libraries/long-short-pair-libraries/LinearLongShortPairFinancialProductLibrary.sol) with the `lowerBound` set to 0 and `upperBound` set to the maximum checkpoint key value from the `TVLCheckpoints` parameter.

As an illustration, based on the intended ancillary data above `upperBound` would be set to 250 implying following payouts:
* TVL below or equal to USD 500,000 would have returned 0 price points and long KPI option holders would receive 0 payout;
* TVL above USD 500,000 and below or equal to USD 1,000,000 would have returned 50 price points and long KPI option holders would receive 50/250=20% of `collateralPerPair` for each token;
* TVL above USD 1,000,000 and below or equal to USD 2,000,000 would have returned 120 price points and long KPI option holders would receive 120/250=48% of `collateralPerPair` for each token;
* TVL above USD 2,000,000 would have returned 250 price points and long KPI option holders would receive 250/250=100% of `collateralPerPair` for each token;

`collateralPerPair` above is the total locked collateral per KPI options token and it would be set by the deployer considering the available LP incentivization budget and intended KPI option token distribution amount.

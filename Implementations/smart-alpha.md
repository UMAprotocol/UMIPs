## Title

BarnBridge SMART Alpha KPI Options Calculation

## Summary

SMART Alpha allows users to calibrate their exposure to the performance of an underlying asset represented by junior- and senior-side proofs of liquidity.  When the price goes up, seniors give up some of their assets to the juniors, and vice versa. It is epoch-based, meaning that users deposit the underlying asset for a set period of time and cannot enter and exit until the subsequent epoch. The goal of the KPI options program is to a) bootstrap senior-side secondary liquidity, and b) compensate for junior-side risk.

This document will detail the calculation method for senior/junior balance adjusted TVL in requested SMART Alpha pool.

## Intended Ancillary Data

```
Metric:SMART Alpha pool TVL adjusted by average senior/junior balance,
Endpoint:"<BARNBRIDGE_API_ENDPOINT>",
Method:"https://github.com/UMAprotocol/UMIPs/blob/master/Implementations/smart-alpha.md",
Key:<KEY>,
Interval:based on pool epoch cycle,
Aggregation:Last epoch TVL multiplied by average balance factor for all full epochs since <START_TIMESTAMP>,
Rounding:2,
Pool:<ADDRESS_OF_SMART_ALPHA_POOL>,
TVLCurrency:<TVL_CURRENCY>,
TVLPriceFeed:<TVL_PRICE_FEED>
```
***Note 1:** <BARNBRIDGE_API_ENDPOINT> might not yet be available at the launch of test pilot, hence, `Endpoint` and `Key` parameters would be skipped. Voters would need to rely only on independent calculation based on this implementation document.*
***Note 2:** This is generic ancillary data template, thus <START_TIMESTAMP> and <ADDRESS_OF_SMART_ALPHA_POOL> should be specified upon deploying specific KPI options contract for an incentivized SMART Alpha pool.*
***Note 3:** `TVLCurrency` and `TVLPriceFeed` are optional parameters that should provide the currency and price feed in case TVL should be measured in different currency than pool price feed quote currency.*

## Implementation

1. Based on the provided SMART Alpha pool contract address (passed as `Pool` parameter in the ancillary data) identify the underlying asset currency and the used price feed. Voters should infer the quote currency from the provided price feed. In case optional `TVLCurrency` and `TVLPriceFeed` parameters are passed in the ancillary data, these should be used to set quote currency and price feed instead of the pool price feed.
2. Determine the total value locked in terms of the underlying asset in the `Pool` contract at the request timestamp.
3. Using the quote currency and price feed from Step 1 calculate the value of underlying asset balance from Step 2 expressed in terms of the quote currency at the request timestamp.
4. Based on the SMART Alpha pool contract deployment timestamp and its epoch length identify all possible epoch periods that could fall in between the start timestamp (passed within the `Aggregation` parameter from the ancillary data) and the request timestamp. Even if there have been no user deposits/withdrawals and the epoch has not been manually advanced, this calculation should assume maximum available epoch periods. 
5. For each identified SMART Alpha pool epoch period from Step 4 determine its junior side dominance and calculate epoch target points. In case the epoch has not been advanced junior side dominance for such epoch period should be taken from the last advanced epoch period.
   * if junior dominance is lower or equal to 20% assign 0.5 target point;
   * if junior dominance is higher than 20% and lower or equal to 40% assign 1 target point;
   * if junior dominance is higher than 40% and lower or equal to 60% assign 2 target points;
   * if junior dominance is higher than 60% and lower or equal to 80% assign 1 target point;
   * if junior dominance is higher than 80% assign 0.5 target point.
6. Calculate the arithmetic mean target points from Step 5.
7. Multiply TVL from Step 3 with average target points from Step 6.
8. Round the adjusted TVL from Step 7 to 2 decimals before returning it as a resolved price request.

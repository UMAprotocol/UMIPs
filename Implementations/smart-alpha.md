## Title

BarnBridge SMART Alpha KPI Options Calculation

## Summary

SMART Alpha allows users to calibrate their exposure to the performance of an underlying asset represented by junior- and senior-side proofs of liquidity.  When the price goes up, seniors give up some of their assets to the juniors, and vice versa. It is epoch-based, meaning that users deposit the underlying asset for a set period of time and cannot enter and exit until the subsequent epoch. The goal of the KPI options program is to bootstrap secondary liquidity for both senior and junior SMART Alpha positions.

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
TVLPriceFeed:<ADDRESS_OF_TVL_PRICE_FEED>
```
***Note 1:** <BARNBRIDGE_API_ENDPOINT> might not yet be available at the launch of test pilot, hence, `Endpoint` and `Key` parameters would be skipped. Voters would need to rely only on independent calculation based on this implementation document.*

***Note 2:** This is generic ancillary data template, thus <START_TIMESTAMP>, <ADDRESS_OF_SMART_ALPHA_POOL> and <ADDRESS_OF_TVL_PRICE_FEED> should be specified upon deploying specific KPI options contract for an incentivized SMART Alpha pool.*

***Note 3:** `TVLPriceFeed` should point to the Chainlink aggregator contract that was used as `chainlinkAggregator` parameter when deploying the SMART Alpha pool. Alternatively, this can be any other Chainlink aggregator if the TVL should be measured in a different currency than the pool price feed quote currency. If this parameter is omitted TVL would be measured in terms of pool underlying currency.*

## Rationale and usage

Even though UMA oracle system allows for manual price verification, Chainlink price feeds are used as input here as BarnBridge SMART Alpha pool operation already is depending on Chainlink price feeds.

In order to achieve better accuracy of payouts projects using SMART Alpha pool KPI options should ensure that epochs are advanced before the options expiration so that the time period between the last epoch advancement and options expiration is less than pool epoch period. Even though voters could recalculate theoretical balances for last epoch it would unnecessarily complicate the calculation, thus it is the responsibility of KPI option users to call `advanceEpoch` on the pool contract if needed.

`TVLPriceFeed` parameter should be explicitly set even if the TVL measurement currency is the same as pool price feed quote currency because the SMART Alpha pool contract does not publicly expose the Chainlink aggregator contract address that is required to determine price feed decimal scaling.

In case the TVL is measured in the pool price feed quote currency users of KPI options should be aware that it is not possible to change the `TVLPriceFeed` parameter (it is set in ancillary data upon KPI options contract deployment), hence the pool price feed oracle should not be changed till the expiration of KPI options.

## Implementation

1. Identify the underlying asset currency token by calling `poolToken` method on the the provided SMART Alpha pool contract address (passed as `Pool` parameter in the ancillary data). Also note the token name, symbol and decimals by calling `name`, `symbol` and `decimals` method on the returned token contract. In case `decimals` method fails 18 scaling decimals should be assumed.
2. Determine whether price feed data should be inverted for the TVL calculation by calling `description` method on the Chainlink aggregator contract (passed as `TVLPriceFeed` parameter in the ancillary data). This should return pricing pair description in the form "base / quote" currency. If the identified underlying asset currency from Step 1 corresponds to the price feed base currency then the price feed should be used without modification, but if the underlying currency corresponds to the price feed quote currency then price feed data should be inverted.
3. Determine the total value locked in terms of the underlying asset in the `Pool` contract at the request timestamp by calling `epochBalance` method on the SMART Alpha pool contract and scaling it down by underlying currency decimals from Step 1. Voters should make sure to call `epochBalance` at the latest available block at or before the request timestamp (access to Ethereum archive node would be required).
4. Determine the price of underlying token in terms of TVL measurement currency at the request timestamp by calling `latestAnswer` method on the `TVLPriceFeed` contract at the latest available block at or before the request timestamp and scaling it down by price feed decimals (call `decimals` method on the price feed contract). Invert the obtained price if this is required based on Step 2.
5. Multiply the underlying asset balance from Step 3 with the price from Step 4 to get TVL in KPI options target measurement currency. In case `TVLPriceFeed` parameter is omitted leave the TVL in terms of underlying asset currency from Step 3.
6. Identify all epoch advancements between the KPI options start timestamp (passed within the `Aggregation` parameter from the ancillary data) and the request timestamp by looking at `EpochEnd` events emitted by he SMART Alpha pool contract. Take a note on each epoch advancement block number, timestamp and advanced epoch number (`epochId` parameter in the logged events).
7. Assign weight factor for each epoch advancement from Step 6 calculated as the difference between the `epochId` of considered event and its preceding epoch advancement event. For the first identified epoch advancement this weight should be set to the integer number of full epoch periods (based on the `epochDuration` parameter of the SMART Alpha pool contract) that could theoretically fit in between the  KPI options start timestamp and the first following epoch advancement event (note that this could also be 0 if the difference is less than the epoch period).
8. Determine the junior side liquidity for each advanced epoch from Step 6 by calling `epochJuniorLiquidity` method on the SMART Alpha pool contract at each epoch advancement block number.
9. Determine the total liquidity for each advanced epoch from Step 6 by calling `epochBalance` method on the SMART Alpha pool contract at each epoch advancement block number.
10. For each identified epoch advancement calculate its junior side dominance by dividing `epochJuniorLiquidity` from Step 8 with `epochBalance` from Step 9. In case `epochBalance` is 0 the junior side dominance should be set to 0.
11. For each identified epoch advancement calculate its target points based on the junior side dominance from Step 10. Actual target points should be calculated using a simple step-wise linear function that increases from 0 to 2 as junior dominance rises from 0% to 50%, then decreases back to 0 as junior dominance rises to 100%:
    * if junior dominance is lower or equal to 50% assign target points calculated by multiplying junior dominance share with coefficient 4;
    * if junior dominance is higher than 50% assign target points calculated by multiplying senior dominance share (this is 1 minus junior dominance share) with coefficient 4.
12. Calculate the weighted mean target points from Step 11 applying epoch advancement weights from Step 7 (representing number of full epoch periods between advancements).
13. Multiply TVL from Step 5 with weighted average target points from Step 12.
14. Round the adjusted TVL from Step 13 to 2 decimals before returning it as a resolved price request.


## Title
B. Protocol TVL Calculation:

## Summary

This calculation is intended to track the TVL of B. Protocol users in various lending platforms and will be used with the `General_KPI` price identifier. At the time of authorship, these lending platforms include Compound, Maker and Liquity but could be extended depending on B. Protocol governance and development.

The recommended querying methodology is to use DefiLlama’s TVL calculator. This implementation doc will also describe how the TVL calculation works behind the scenes, so that it could be reproduced by voters querying for on-chain data only.

## Intended Ancillary Data

```
Metric:TVL in BPRO financial contracts measured in USD,
Endpoint:"https://api.llama.fi/protocol/B.Protocol",
Method:"https://github.com/UMAprotocol/UMIPs/blob/master/Implementations/bprotocol-tvl.md",
Key:totalLiquidityUSD,
Interval:Daily,
Rounding:0,
Scaling:0
```
***Note 1:** `totalLiquidityUSD` should be referenced for the timestamp that falls earlier but nearest to the price request timestamp.*  

## Implementation

With DeFiLlama:
1. Voters should query the endpoint listed in Intended Ancillary Data.
2. Voters should find the timestamp key in the `tvl` object that corresponds to the timestamp that is earlier but closest to the price request timestamp, and then use the corresponding `totalLiquidityUSD` value rounded to 0 decimal places.
3. If the `totalLiquidityUSD` is equal to or greater than 150,000,000, voters should return 3.
4. If the `totalLiquidityUSD` is less than 150,000,000, voters should return 1.

Without DeFiLlama (to-do):

## Intended Application:

The use case is to use KPI options to incentivize TVL. The initial payout function is:
1. If the TVL of B. Protocol reaches or exceeds $150m, the KPI option will be worth 3 BPRO tokens.
2. If the TVL does not reach the $150m threshold, the KPI Options will be worth 1 BPRO.

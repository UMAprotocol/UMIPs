## Title

Oolongswap Monthly Volume KPI Option Calculation

## Summary

Oolong is an AMM built on the Boba L2 Network. Oolong was an early adopter of Wagmiv2 KPI options mining. The Boba network wishes to continue Oolong performance incentivization by offering Oolong a binary option that targets an increase in monthly trading volume.

## Intended Ancillary Data

```
Metric:Oolong monthly volume,
Method:"https://github.com/UMAprotocol/UMIPs/blob/master/Implementations/oolongswap-volume.md",
Aggregation:Increase in cumulative volume for the provided time range,
StartTimestamp:1646092800,
EndTimestamp:1648771200,
ThresholdVolume:25000000,
Base: 1,
Success: 2,
Rounding:0
```

## Implementation

Oolongswap wishes to track the total increase in cumulative lifetime volume over a period of time. Since this calculation is somewhat complicated, it is recommended to use Oolong's subgraph to calculate this.

This [cumulative volume query](https://graph.mainnet.boba.network:8000/subgraphs/name/oolongswap/staging/graphql?operationName=users&query=query%20users%20%7B%0A%20%20uniswapFactories(first%3A%201000%2C%20block%3A%20%7Bnumber%3A%20413042%7D)%20%7B%0A%20%20%20%20id%0A%20%20%20%20totalVolumeUSD%0A%20%20%7D%0A%7D%0A) will be used.

1. Find the block numbers that correspond to the blocks either at or before and closest to the `StartTimestamp` and `EndTimestamp` unix timestamps that are specified in ancillary data.
2. For both block numbers, replace the `block.number` value and run the cumulative volume query listed above. Record each returned `totalVolumeUSD` value.
3. Find the difference between the `totalVolumeUSD` value at the block number used for `EndTimestamp` and the value at the block number used for `StartTimestamp`. Round the difference to 0 decimal places (e.g. 25.123 -> 25).

## Post processing

Since this options should provide minimum guaranteed payout of 1 BOBA per KPI option token and currently the audited financial product libraries do not allow setting minimum payout floor above zero, voters should perform post-processing on the calculated volume and return either the `Base` or `Success` values that are in ancillary data:

1. If the volume returned is equal to or above the ThresholdVolume value, return the `Success` value from ancillary data. If there is no `Success` value, return `1`.
2. If the volume returned is less than the ThresholdVolume value, return the `Base` value from ancillary data. If there is no `Base` value, return `0`.

***Note:** All ancillary data values should be treated as "unscaled". When returned on-chain, they should be scaled to 18 decimals like all other UMA price identifiers.*

## Intended Application

It is intended to deploy the documented KPI options on the Boba network using [LSP contract](https://github.com/UMAprotocol/protocol/blob/master/packages/core/contracts/financial-templates/long-short-pair/LongShortPair.sol) with `General_KPI` price identifier approved in [UMIP-117](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-117.md). The contract would use [Linear LSP FPL](https://github.com/UMAprotocol/protocol/blob/master/packages/core/contracts/financial-templates/common/financial-product-libraries/long-short-pair-libraries/LinearLongShortPairFinancialProductLibrary.sol) with the `lowerBound` set to `Base` and `upperBound` set to `Success`.

`collateralPerPair` parameter for the LSP contract would be set to 2 so that the maximum payout per KPI option would reach 2 BOBA if the Oolongswap cumulative volume increase exceeds `ThresholdVolume`.
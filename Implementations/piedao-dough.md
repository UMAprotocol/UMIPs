## Title

Staked DOUGH Calculation

## Summary

PieDAO aims at launching KPI options to promote the new staking program to be released as of beginning October 2021. The KPI options will track the amount of DOUGH v2 staked at a given timestamp through a query to the subgraph provided, and convert it to a corresponding share from maximum KPI options payout.

## Intended Ancillary Data

```
Metric:Total DOUGH v2 staked,
Endpoint:"https://api.thegraph.com/subgraphs/name/pie-dao/vedough",
Method:"https://github.com/UMAprotocol/UMIPs/blob/master/Implementations/piedao-dough.md",
Key:data.globalStats[0].totalDoughStaked,
Interval:request the last updated event at or before evaluation timestamp,
EvaluationTimestamp:1635721589,
Rounding:1
```

## Implementation

1. Construct subgraph query by making sure that `timestamp_lte` parameter corresponds to `EvaluationTimestamp` (passed as ancillary data parameter), e.g.:
   ```
   {
     globalStats(first: 1, orderBy: timestamp, orderDirection: desc, where: {timestamp_lte: 1635721589}) {
       totalDoughStaked
       veTokenTotalSupply
       timestamp
     }
   }
   ```
2. Perform `POST` request on the `Endpoint` (passed as a parameter from ancillary data) with request body from Step 1. As an illustration, `curl` request would look like:
   ```
   curl -X POST \
     -d '{"query": "{globalStats(first: 1, orderBy: timestamp, orderDirection: desc, where: {timestamp_lte: 1635721589}) {totalDoughStaked, veTokenTotalSupply, timestamp}}"}' \
     'https://api.thegraph.com/subgraphs/name/pie-dao/vedough'
   ```
3. Take a note on the raw staked DOUGH v2 from the returned subgraph response value corresponding to `Key` parameter from ancillary data.

## Fallback implementation

In case of technical issues with subgraph raw metric should be resolved by querying on-chain value of DOUGH v2 token held by the staking contract:
1. Identify the latest block at or before the `EvaluationTimestamp`.
2. Call the `balanceOfAt` method on DOUGH v2 token contract `0xad32A8e6220741182940c5aBF610bDE99E737b2D` by passing the address of the staking contract `0x6Bd0D8c8aD8D3F1f97810d5Cc57E9296db73DC45` as the first parameter and identified block number from Step 1 as the second parameter.
3. Take a note on the raw staked DOUGH v2 from the returned on-chain request.

## Post processing

Depending on the value of queried raw staked DOUGH v2 (this is before scaling down token decimals) proposers/voters should transform it to discrete share from maximum KPI options payout according to the table below:

| Raw DOUGH v2 staked range                               | Human readable token amounts          | Resolved price |
|---------------------------------------------------------|---------------------------------------|----------------|
| 0 - 7499999999999999999999999                           | less than 7.5M                        | 0              |
| 7500000000000000000000000 - 9999999999999999999999999   | less than 10M and equal or above 7.5M | 0.2            |
| 10000000000000000000000000 - 14999999999999999999999999 | less than 15M and equal or above 10M  | 0.4            |
| 15000000000000000000000000 -                            | equal or above 15M                    | 1              |

## Intended Application

It is intended to deploy the documented KPI options using [LSP contract](https://github.com/UMAprotocol/protocol/blob/master/packages/core/contracts/financial-templates/long-short-pair/LongShortPair.sol) with `General_KPI` price identifier approved in [UMIP-117](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-117.md). The contract would use [Linear LSP FPL](https://github.com/UMAprotocol/protocol/blob/master/packages/core/contracts/financial-templates/common/financial-product-libraries/long-short-pair-libraries/LinearLongShortPairFinancialProductLibrary.sol) with the `lowerBound` set to 0 and `upperBound` set to 1.

`collateralPerPair` parameter for the LSP contract would be set to 0.5 so that with the intended 10M option token distribution maximum absolute payout to the recipients would be 5M DOUGH v2 (when reaching 15M staked DOUGH v2).

It should also be noted that this implementation tracks staked DOUGH v2 amount at specific timestamp expected 1 month after the deployment while actual contract expiration when token holders would be able to unlock DOUGH v2 would be set 6 months from deployment.

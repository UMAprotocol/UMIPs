## Title

Idle Finance TVL for PYTs using stETH Calculation

## Summary

Idle is a DeFi yield aggregator that offers yield optimization and risk tranching strategies. Idle wishes to offer a KPI option that measures the TVL for PYTs using stETH.

## Intended Ancillary Data

```
Metric:"TVL of Idle Finance stETH PYT denominated in USD",
Method:"https://github.com/UMAprotocol/UMIPs/blob/master/Implementations/metric-operations.md",
Interval:"Daily 24:00 UTC",
Operation:CONV,
OperationParameters:{
  "metricParameters":{
    "Metric":"TVL of Idle Finance stETH PYT denominated in ETH",
    "Operation":"SUM",
    "OperationParameters":{
      "metricParametersArray": metricParametersArray from "https://github.com/UMAprotocol/UMIPs/blob/master/Implementations/idle-subgraph.md"
    }
  },
  "priceIdentifier":"USDETH",
  "inverse":true
},
AggregationPeriod:7776000,
AggregationMethod:TWAP,
Rounding:0
```

## metricParametersArray

The metricParametersArray below represents the TVL for PYTs using stETH. Strategies using stETH will be added to the array as they are deployed and which is subject to change throughout the duration of the contract.

```
[
    {
        "Metric":"TVL of Senior PYT Lido stETH denominated in ETH",
        "Method":"https://github.com/UMAprotocol/UMIPs/blob/master/Implementations/subgraph-query.md",
        "Endpoint":"https://api.thegraph.com/subgraphs/name/samster91/idle-tranches",
        "QueryString":"{trancheInfos(first:1000,orderBy:timeStamp,orderDirection:desc,where:{Tranche:"0x2688fc68c4eac90d9e5e1b94776cf14eade8d877",timeStamp_lte:<QUERY_DTS>,timeStamp_gte:<QUERY_DTS-90D>}){timeStamp,contractValue}}",
        "CollectionKey":"trancheInfos",
        "MetricKey":"contractValue",
        "TimestampKey":"timeStamp"
    },
    {
        "Metric":"TVL of Junior PYT Lido stETH denominated in ETH",
        "Method":"https://github.com/UMAprotocol/UMIPs/blob/master/Implementations/subgraph-query.md",
        "Endpoint":"https://api.thegraph.com/subgraphs/name/samster91/idle-tranches",
        "QueryString":"{trancheInfos(first:1000,orderBy:timeStamp,orderDirection:desc,where:{Tranche:"0x3a52fa30c33caf05faee0f9c5dfe5fd5fe8b3978",timeStamp_lte:<QUERY_DTS>,timeStamp_gte:<QUERY_DTS-90D>}){timeStamp,contractValue}}",
        "CollectionKey":"trancheInfos",
        "MetricKey":"contractValue",
        "TimestampKey":"timeStamp"
    }
]
```

## Intended Application

The [subgraph-query implementation](https://github.com/UMAprotocol/UMIPs/blob/master/Implementations/subgraph-query.md) is intended to be used for the contract. The purpose of this implementation is to enable the flexibility of including future stETH strategies as they are deployed.

It is intended to deploy the documented KPI options using the [LSP contract](https://github.com/UMAprotocol/protocol/blob/master/packages/core/contracts/financial-templates/long-short-pair/LongShortPair.sol) with `General_KPI` price identifier approved in [UMIP-117](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-117.md). The contract would use [Linear LSP FPL](https://github.com/UMAprotocol/protocol/blob/master/packages/core/contracts/financial-templates/common/financial-product-libraries/long-short-pair-libraries/LinearLongShortPairFinancialProductLibrary.sol).

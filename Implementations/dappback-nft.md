## Title

Dappback NFT KPI Option Calculation

## Summary

Dappback allows users to earn tokens by going on task journeys for various projects. Dappback wishes to incentivize increased participation by offering the Dappback community a KPI option that targets holders of an NFT.

## Intended Ancillary Data

```
Metric:Dappback NFT holders measured by supply of a collection,
Method:"https://github.com/UMAprotocol/UMIPs/blob/master/Implementations/dappback-nft.md",
contractAddress:<collectionContractAddress>,
collectionID:<collectionID>,
Rounding:0
```

## Implementation

Dappback wishes to track the number of holders for a specific NFT collection.

1. Find the block number that corresponds to the block either at or before and closest to the request timestamp.
2. At the block number returned from step 1, call the `totalSupply` method on the `contractAddress` from the ancillary data using the `collectionID` value from the ancillary data as the argument. Round the returned value to 0 decimal places (e.g. 25.123 -> 25).

## Intended Application

It is intended to deploy the documented KPI options on Polygon network using [LSP contract](https://github.com/UMAprotocol/protocol/blob/master/packages/core/contracts/financial-templates/long-short-pair/LongShortPair.sol) with `General_KPI` price identifier approved in [UMIP-117](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-117.md). The contract would use [Linear LSP FPL](https://github.com/UMAprotocol/protocol/blob/master/packages/core/contracts/financial-templates/common/financial-product-libraries/long-short-pair-libraries/LinearLongShortPairFinancialProductLibrary.sol).


TBD: specifics around `collateralPerPair`, `lowerBound`, `upperBound`, and expected payouts.
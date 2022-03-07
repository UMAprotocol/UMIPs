## Title

Covenant bribe options on QiDao vault gauge voting

## Summary

Covenant is a protocol for vote bribing built on top of UMA allowing for creative bribe payouts based on achieved vote results.

This document will detail the calculation method for Covenant bribe options on QiDao vault gauge for selected assets.

## Intended Ancillary Data

```
Metric:Total QiDao vault gauge results for specified assets,
Method:"https://github.com/UMAprotocol/UMIPs/blob/master/Implementations/covenant-qidao-gauge.md",
Interval:End of bi-weekly vault incentives gauge voting period,
NextFollowingTimestamp:1646697600,
Vaults:["cxETH (Polygon)","cxDOGE (Polygon)","cxADA (Polygon)"],
PostProcessing:"https://github.com/UMAprotocol/UMIPs/blob/master/Implementations/Post-Processing/covenant-qidao-celsiusx-1.md",
Rounding:0
```

## Implementation

1. Identify the relevant Snapshot proposal page for QiDao vault gauge voting. As approved in [QIP047](https://snapshot.org/#/qidao.eth/proposal/0x632ed91034efe1d79f7dd61db1a64cd10ffa1d5e1a0dda5c839cdd2cfdf22807) the voting for vault gauge incentives should follow a bi-weekly schedule. As the relevant Snapshot proposal page might not yet be posted at the time of deployment of option contracts UMA voters should identify the first sequential vault gauge proposal on QiDao Snapshot space (https://snapshot.org/#/qidao.eth) that has its vote end time after the timestamp passed in the `NextFollowingTimestamp` parameter from ancillary data.
2. Identify all vault assets from JSON array passed as `Vaults` parameter in ancillary data that were voted on in the proposal from Step 1. Since QiDao vote choices do not include vault contract addresses UMA voters might need to use human judgement in vault identification in case the naming syntax slightly differs from vault names passed in the `Vaults` parameter. Still, any vault assets from the `Vaults` parameter that cannot be unambiguously matched to any of proposal choices should be ignored.
3. On the Snapshot proposal page identified in Step 1 sum up resulting votes for all vaults identified in Step 2. Aggregated votes expressed as percent of total (i.e. number ranging from 0 to 100) should be further processed by voters following instructions in the Post processing section.

In case bribe options are deployed with early expiration enabled ancillary data would also have value 1 passed as `earlyExpiration` parameter in ancillary data. If early expiration is enabled UMA proposers/voters should also verify if the voting on the identified QiDao vault gauge proposal had ended before price request timestamp. If QiDao voting had not been finalized and `earlyExpiration` value of 1 is passed UMA proposers/voters should return "magic number" of minimum int256 value as described in [UMIP-107](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-107.md) without any further post-processing.

If however price request comes without `earlyExpiration:1` in ancillary data and QiDao voting proposal had not been finalized before request timestamp UMA proposers/voters should assume 0 as resolved vote percentage and use that as input in post-processing instructions before resolving final price value.

## Post processing

Voters should apply all post processing instructions on the resolved aggregated vote percentage as described in the linked document passed as `PostProcessing` parameter from ancillary data in order to resolve final Covenant bribe payout scale.

Round the resolved Covenant bribe payout scale to number of decimals specified in the `Rounding` parameter from ancillary data before returning it as resolved price request.

## Intended Application

It is intended to deploy the documented Covenant bribe options on Polygon network using [LSP contract](https://github.com/UMAprotocol/protocol/blob/master/packages/core/contracts/financial-templates/long-short-pair/LongShortPair.sol) with `General_KPI` price identifier approved in [UMIP-117](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-117.md). The contract would use [Linear LSP FPL](https://github.com/UMAprotocol/protocol/blob/master/packages/core/contracts/financial-templates/common/financial-product-libraries/long-short-pair-libraries/LinearLongShortPairFinancialProductLibrary.sol) with the `lowerBound` set to 0 and `upperBound` set to maximum possible value based on provided post processing instructions.

`collateralPerPair` parameter for the LSP contract would be determined at deployment based on the maximum bribing budget and intended bribe option distribution.

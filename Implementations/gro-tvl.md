## Title

Gro Protocol TVL Calculation

## Summary

Gro protocol is a stablecoin yield aggregator that tranches risk and yield. The first two products built on it are the PWRD stablecoin with deposit protection and yield, and Vault with leveraged stablecoin yields. The goal of the KPI options program is to motivate users growing TVL locked in the protocol.

This document will detail the calculation method for average Gro Protocol TVL over the requested time period.

## Intended Ancillary Data

```
Metric:Gro Protocol TVL measured in USD,
Method:"https://github.com/UMAprotocol/UMIPs/blob/master/Implementations/gro-tvl.md",
Interval:daily,
Aggregation:Average end of day (midnight UTC) TVL over previous 7 days before the request timestamp,
Rounding:0
```

## Implementation

Total Gro Protocol TVL is determined by calculating the USD value of assets locked in Gro products fetching on-chain information from following contracts deployed on Ethereum (please confirm the canonical list of contract addresses at [Gro Docs](https://docs.gro.xyz/gro-docs/developer-apis/contracts)):

* PWRD Stablecoin: 0xF0a93d4994B3d98Fb5e3A2F90dBc2d69073Cb86b
* Gro Vault (GVT): 0x3ADb04E127b9C0a5D36094125669d4603AC52a0c

In case Gro protocol is expanded with new contracts and this document is not up to date the voters should refer to the canonical list of addresses at [Gro Docs](https://docs.gro.xyz/gro-docs/developer-apis/contracts).

1. Identify all midnight UTC timestamps and their corresponding latest available block numbers during the period provided in the `Aggregation` parameter from the ancillary data.
2. Call the `totalAssets` method on each of Gro product token contracts listed above at each block number identified in the Step 1. The results should be scaled down by 18 decimals and it represents USD value locked in each of Gro products.
3. For each identified block number sum USD values locked in all Gro products obtained from the Step 2.
4. Calculate arithmetic mean of USD TVL values from Step 3 to get the average TVL over the requested time period.
5. Round the average USD TVL from Step 4 to 0 decimals before returning it as resolved price request.

## Intended Application

It is intended to deploy the documented KPI options on Ethereum mainnet using [LSP contract](https://github.com/UMAprotocol/protocol/blob/master/packages/core/contracts/financial-templates/long-short-pair/LongShortPair.sol) with `General_KPI` price identifier approved in [UMIP-117](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-117.md). The contract would use [Linear LSP FPL](https://github.com/UMAprotocol/protocol/blob/master/packages/core/contracts/financial-templates/common/financial-product-libraries/long-short-pair-libraries/LinearLongShortPairFinancialProductLibrary.sol).

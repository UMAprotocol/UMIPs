## Title

Boba network WAGMI TVL KPI Options Calculation

## Summary

Boba is a next-generation Ethereum Layer 2 Optimistic Rollup scaling solution that reduces gas fees, improves transaction throughput, and extends the capabilities of smart contracts. The goal of the WAGMI TVL KPI options program is to incentivize sticky liquidity on the Boba network.

This document will detail the calculation method for Boba network TVL and payout to KPI option holders.

## Intended Ancillary Data

```
Metric:Boba network TVL,
Method:"https://github.com/UMAprotocol/UMIPs/blob/master/Implementations/boba-wagmi-tvl.md",
Interval:daily,
Aggregation:TWAP TVL for the provided time range,
StartTWAP: 1646092800,
EndTWAP: 1648771200,
TVLDenomination:USD,
LowerTVLBound:500000000,
UpperTVLBound:1500000000,
MinimumPayout:1,
Rounding:6
```

## Implementation

### Primary method

Primary method estimates TVL bridged from L1 to Boba network through L1 standard bridge contract. It is based on similar calculation logic that is used to estimate Boba network TVL on Dune Analytics Boba Bridge USD TVL [dashboard](https://dune.xyz/queries/163405/319710) except this method does not consider TVL in other bridging pools.

In order to create L1 standard bridge web3 contract object following implementation ABI should be used against the proxy contract at [0xdc1664458d2f0B6090bEa60A8793A4E66c2F1c00](https://etherscan.io/address/0xdc1664458d2f0B6090bEa60A8793A4E66c2F1c00):

```
[
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"_l1Token","type":"address"},{"indexed":true,"internalType":"address","name":"_l2Token","type":"address"},{"indexed":true,"internalType":"address","name":"_from","type":"address"},{"indexed":false,"internalType":"address","name":"_to","type":"address"},{"indexed":false,"internalType":"uint256","name":"_amount","type":"uint256"},{"indexed":false,"internalType":"bytes","name":"_data","type":"bytes"}],"name":"ERC20DepositInitiated","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"_l1Token","type":"address"},{"indexed":true,"internalType":"address","name":"_l2Token","type":"address"},{"indexed":true,"internalType":"address","name":"_from","type":"address"},{"indexed":false,"internalType":"address","name":"_to","type":"address"},{"indexed":false,"internalType":"uint256","name":"_amount","type":"uint256"},{"indexed":false,"internalType":"bytes","name":"_data","type":"bytes"}],"name":"ERC20WithdrawalFinalized","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"_from","type":"address"},{"indexed":true,"internalType":"address","name":"_to","type":"address"},{"indexed":false,"internalType":"uint256","name":"_amount","type":"uint256"},{"indexed":false,"internalType":"bytes","name":"_data","type":"bytes"}],"name":"ETHDepositInitiated","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"_from","type":"address"},{"indexed":true,"internalType":"address","name":"_to","type":"address"},{"indexed":false,"internalType":"uint256","name":"_amount","type":"uint256"},{"indexed":false,"internalType":"bytes","name":"_data","type":"bytes"}],"name":"ETHWithdrawalFinalized","type":"event"}
]
```

1. Determine the TVL evaluation range from `StartTWAP` till `EndTWAP` as UNIX timestamps passed in the ancillary data.
2. Determine Ethereum mainnet block numbers at or the last before the start and end timestamps from Step 1.
3. Fetch all `ETHDepositInitiated` events emitted by [L1 standard bridge](https://etherscan.io/address/0xdc1664458d2f0B6090bEa60A8793A4E66c2F1c00) contract till the end evaluation block identified in Step 2 and take note of `_amount` parameter and `blockNumber` for each event. `_amount` represents ETH bridged to Boba network expressed in wei.
4. Fetch all `ERC20DepositInitiated` events emitted by [L1 standard bridge](https://etherscan.io/address/0xdc1664458d2f0B6090bEa60A8793A4E66c2F1c00) contract till the end evaluation block identified in Step 2 and take note of `_l1Token` and `_amount` parameters, as well as `blockNumber` for each event. `_amount` represents raw amount of `_l1Token` ERC-20 tokens bridged to Boba network.
5. Fetch all `ETHWithdrawalFinalized` events emitted by [L1 standard bridge](https://etherscan.io/address/0xdc1664458d2f0B6090bEa60A8793A4E66c2F1c00) contract till the end evaluation block identified in Step 2 and take note of `_amount` parameter and `blockNumber` for each event. `_amount` represents ETH bridged back from Boba network to mainnet expressed in wei.
6. Fetch all `ERC20WithdrawalFinalized` events emitted by [L1 standard bridge](https://etherscan.io/address/0xdc1664458d2f0B6090bEa60A8793A4E66c2F1c00) contract till the end evaluation block identified in Step 2 and take note of `_l1Token` and `_amount` parameters, as well as `blockNumber` for each event. `_amount` represents raw amount of `_l1Token` ERC-20 tokens bridged back from Boba network to mainnet.
7.  Order all fetched events in Step 3-6 by `blockNumber` and group them by ERC-20 tokens / Ether.
8. For each ERC-20 token / Ether calculate the outstanding raw amounts bridged to Boba network at the start block identified in Step 2:
    * first, add `_amount` parameter values from Step 3-4 for all events till the start block,
    * then subtract `_amount` parameter values from Step 5-6 for all events till the start block from the sum above.
9. Similarly as in Step 8 calculate outstanding raw amounts bridged to Boba network grouped by each ERC-20 token / Ether till the end block (from Step 2) for each block when corresponding event was triggered. Take a note of block timestamp whenever outstanding bridged amounts have changed.
10. Scale down raw amounts calculated in Step 9 by each ERC-20 token contract decimals (or convert from wei for Ether).
11. For all bridged ERC-20 tokens / Ether get the historical pricing series from CoinGecko for the evaluation period identified in Step 1:
    * Based on CoinGecko [API documentation](https://www.coingecko.com/api/documentations/v3#/contract/get_coins__id__contract__contract_address__market_chart_range) construct price API request with following parameters:
      * `id`: CoinGecko platform id - should be set to "ethereum";
      * `contract_address`: ERC-20 token address;
      * `vs_currency`: TVL measurement currency based on the passed `TVLDenomination` parameter in the ancillary data (e.g. "usd");
      * `from`: start timestamp (identified in Step 1);
      * `to`: end timestamp (identified in Step 1);
    * Note that for Ether a different endpoint (see [API documentation](https://www.coingecko.com/api/documentations/v3#/coins/get_coins__id__market_chart_range)) should be used by setting `id` parameter to "ethereum". This also might apply to some tokens that do not have their contract address registered by CoinGecko;
    * Example API request for BOBA token pricing in USD: https://api.coingecko.com/api/v3/coins/ethereum/contract/0x42bbfa2e77757c645eeaad1655e0911a7553efbc/market_chart/range?vs_currency=usd&from=1646092800&to=1648771200
    * Locate the `prices` key value from CoinGecko API response - it should contain a list of [ timestamp, price ] value pairs. Note that returned CoinGecko timestamps are in milliseconds;
    * In case returned pricing interval is more frequent than 1 hour voters should extend the requested time range. This is necessary to have consistent pricing results independent on when the voters are calculating them.
    * Voters should verify that obtained price results agree with broad market consensus.
12. For each ERC-20 token / Ether calculate outstanding bridged amounts at the start block from Step 8 expressed in `TVLDenomination` currency by multiplying it with last price from Step 11 at or before the start timestamp identified in Step 1.
13. Iterate over ERC-20 token / Ether outstanding balance series from Step 10 and its corresponding pricing series from Step 11. Whenever outstanding balance or pricing has changed recalculate their product expressed in the `TVLDenomination` currency and take a note of period in seconds how long the previous value had lasted.
14. For each ERC-20 token / Ether calculate its TWAP expressed in `TVLDenomination` currency based on outstanding values and time periods from Step 13. For the first valuation change use the period since the start timestamp from Step 1. For the last valuation change use the period since the last block of outstanding balance change till the end timestamp from Step 1.
15. Aggregate TVL expressed in `TVLDenomination` currency from ERC-20 token / Ether valuations in Step 14. This TVL should be further processed by voters following instructions in the Post processing section.

An example implementation script is provided [here](https://github.com/Reinis-FRP/boba-tvl), but voters are encouraged to independently verify its calculation logic and results.

### Fallback method

1. Locate the Boba network statistics page on L2BEAT at the `Endpoint` passed as ancillary data.
2. Determine all dates that should be considered for averaging TVL values from the range (inclusive) passed in `StartTWAP` and `EndTWAP` parameters from the ancillary data.
3. Hover over L2BEAT Boba network TVL chart and take a note on all TVL values for dates identified in Step 1. Use the denomination currency corresponding to the `TVLDenomination` parameter passed as ancillary data.
4. Calculate average Boba network TVL over the `Aggregation` period expressed in `TVLDenomination` currency. This TVL should be further processed by voters following instructions in the Post processing section.

## Post processing

Since Boba network has opted to provide minimum guaranteed payout of 1 BOBA per KPI options token and currently the audited financial product libraries do not allow setting minimum payout floor above zero voters should perform post-processing on the Boba network TVL and return a value between 1 and 2 to the submitted price request:

1. Subtract `LowerTVLBound` (passed as ancillary data) from the resolved Boba network TVL.
2. Subtract `LowerTVLBound` from `UpperTVLBound` as passed in ancillary data.
3. Divide result from Step 1 with result from Step 2 and add 1 to this ratio.
5. In case the Boba network TVL exceeds `UpperTVLBound` the resolved price should be capped at 2.
6. Round the resolved BOBA payout above to 6 decimals before returning it as resolved price request.

## Intended Application

It is intended to deploy the documented KPI options on Boba network using [LSP contract](https://github.com/UMAprotocol/protocol/blob/master/packages/core/contracts/financial-templates/long-short-pair/LongShortPair.sol) with `General_KPI` price identifier approved in [UMIP-117](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-117.md). The contract would use [Linear LSP FPL](https://github.com/UMAprotocol/protocol/blob/master/packages/core/contracts/financial-templates/common/financial-product-libraries/long-short-pair-libraries/LinearLongShortPairFinancialProductLibrary.sol) with the `lowerBound` set to 0 and `upperBound` set to 2.

`collateralPerPair` parameter for the LSP contract would be set to 2 so that the maximum payout per KPI option would reach 2 BOBA if the Boba network TVL exceeds `UpperTVLBound`.

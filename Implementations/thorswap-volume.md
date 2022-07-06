## Title

Thorswap Volume KPI Option Calculation

## Summary

Thorswap is a multi-chain DEX aggregator built on THORChain's cross-chain liquidity protocol. The Thorswap network wishes to incentivize increased volume to the network by offering the Thorswap community a binary option that targets an increase in trading volume.

## Intended Ancillary Data

```
Metric:Thorswap monthly trade volume measured in USD,
Method:"https://github.com/UMAprotocol/UMIPs/blob/master/Implementations/thorswap-volume.md",
Endpoint:"https://node-api.flipsidecrypto.com/api/v2/queries/8ace953e-a38e-405e-b78a-4640c22c651b/data/latest",
MONTH: "<MONTH>"
Key:data[i].TS_SWAP_VOLUME where data[i].MONTH is equal to the MONTH parameter,
Rounding:0
```
***Note 1:** `MONTH` will be updated in actual deployment using the following format: YYYY-MM-DD 00:00:00.000. The first day of the month corresponds to the total monthly value. An example for June 2022 is 2022-06-01 00:00:00.000*

***Note 2:** To avoid early results, Proposers and Voters should wait until the `MONTH` value of the following month used in the ancillary data is able to be queried before reporting results. For example, June 2022 values should not be proposed until 2022-07-01 00:00:00.000 is available*

## Implementation

Thorswap wishes to track the total volume traded on the platform for a specific month. Since this calculation is somewhat complicated, it is recommended to use flipsidecrypto's platform to calculate this.

* [volume per month query](https://node-api.flipsidecrypto.com/api/v2/queries/8ace953e-a38e-405e-b78a-4640c22c651b/data/latest)

Support for the query can be found [here](https://app.flipsidecrypto.com/velocity/queries/8ace953e-a38e-405e-b78a-4640c22c651b). Please note, the below may be updated to reflect changes and Proposers/Voters should compare the query at the time of expiration to confirm the most updated query:

```
with base as (select a.block_timestamp,
a.tx_id,
max(to_amount_usd) as swap_volume
from flipside_prod_db.thorchain.swaps a 
join flipside_prod_db.thorchain.swap_events b 
on a.tx_id = b.tx_id
where right(split_part(memo, ':', 4),3) = '111'
group by 1,2)

select date_trunc('month', block_timestamp) as month,
sum(swap_volume) as ts_swap_volume,
sum(ts_swap_volume) over (order by month) as cumulative_ts_swap_volume
from base 
group by 1
```

1. Use the `volume per month` query above to retrieve the Thorswap monthly trade values. It should contain a list of { MONTH, TS_SWAP_VOLUME, CUMULATIVE_TS_SWAP_VOLUME } values.
2. For the values returned from step 1, locate the `MONTH` key value that corresponds with the parameter specified in the ancillary data.  Choose the `TS_SWAP_VOLUME` value returned in the same array. Round the returned value to 0 decimal places (e.g. 72166475.9878698 -> 72166475).

## Intended Application

It is intended to deploy the documented KPI options on Ethereum network using [LSP contract](https://github.com/UMAprotocol/protocol/blob/master/packages/core/contracts/financial-templates/long-short-pair/LongShortPair.sol) with `General_KPI` price identifier approved in [UMIP-117](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-117.md). The contract would use [Binary LSP FPL](https://github.com/UMAprotocol/protocol/blob/master/packages/core/contracts/financial-templates/common/financial-product-libraries/long-short-pair-libraries/BinaryOptionLongShortPairFinancialProductLibrary.sol) with the `strikePrice` set to 60 million.

The expected payout should be 1 THOR per one option if the USD 60 million TVL threshold is reached and 0 THOR in case if it is below this target. `collateralPerPair` parameter for the LSP contract would be set to 1 so that the maximum payout per KPI option would be:

* If the rounded Thorswap Volume is equal to or above USD 60 million, the request should be resolved as 1. 100% of the collateral amount would go to the long token and 0% to the short token.
* If the rounded Thorswap Volume is below USD 60 million, the request should be resolved as 0. 0% of the collateral amount would go to the long token and 100% to the short token.
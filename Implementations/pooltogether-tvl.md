## Title
PoolTogether TVL Calculation:

## Summary

PoolTogether is a protocol for no-loss prize games. The protocol enables developers to build their own no-loss prize games and offers governance-managed no-loss prize games.

This calculation is intended to track the TVL of PoolTogether user deposits in various pools and will be used with the `General_KPI` price identifier. At the time of authorship, the networks included are Ethereum Mainnet, Polygon, Celo, and BSC but could be extended depending on PoolTogether governance and development.

The recommended querying methodology is to use DefiLlama’s TVL calculator. This implementation doc will also describe how the TVL calculation works behind the scenes so that it could be reproduced by voters querying for on-chain data only.

## Intended Ancillary Data

```
Metric:TVL in PoolTogether financial contracts measured in USD,
Endpoint:"https://api.llama.fi/protocol/pooltogether",
Method:"https://github.com/UMAprotocol/UMIPs/blob/master/Implementations/pooltogether-tvl.md",
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
3. If the `totalLiquidityUSD` is equal to or greater than 500,000,000, voters should return 1.4.
4. If the `totalLiquidityUSD` is less than 500,000,000, voters should return a value between 0.9 and 1.4 based on the calculation: ( `totalLiquidityUSD` / 500,000,000 ) + 0.9.

Without DeFiLlama:

The below subgraph urls are used to return the prize pool and underlying collateral token addresses for each active network. Please note, there may be multiple subgraphs for different versions of deployed prize pool contracts.

* ETH Mainnet Subgraph URL: 
  * https://thegraph.com/legacy-explorer/subgraph/pooltogether/pooltogether-v3_1_0
  * https://thegraph.com/legacy-explorer/subgraph/pooltogether/pooltogether-v3_3_2
  * https://thegraph.com/legacy-explorer/subgraph/pooltogether/pooltogether-v3_3_8
  * https://thegraph.com/legacy-explorer/subgraph/pooltogether/pooltogether-v3_4_3
* Celo Subgraph URL:
  * https://thegraph.com/legacy-explorer/subgraph/pooltogether/celo-v3_4_5
* BSC Subgraph URL:
  * https://thegraph.com/legacy-explorer/subgraph/pooltogether/bsc-v3_4_3

### General TVL Calculation:

1. Construct subgraph query by making sure that the `block` parameter corresponds to the latest available block at or before the request timestamp, e.g.:
```
{
  prizePools(
    block: { number: 13366245 }
  ) {
    id
    underlyingCollateralSymbol
    underlyingCollateralToken
    compoundPrizePool{
      cToken
    }
  }
}
```
2. Take a note of the prize pool contract addresses which are represented by `id`  and the `underlyingCollateralToken`. For networks that have multiple subgraph versions, remove duplicate query responses.
3. Call the `accountedBalance` method on each prize pool contract from step 2 for the latest available block at or before the request timestamp. This will return the balance of controlled tokens (including timelocked) for each prize pool.
4. Scale down the balances returned from Step 3 with the decimals of the respective underlying collateral token (call the `decimals()` method on the underlying collateral token contracts from Step 2).
5. Multiply each balance returned from step 4 by the exchange rate of its respective `underlyingCollateralToken` for the latest available block at or before the request timestamp. This returns the underlying collateral balance in USD.
6. Each underlying collateral balance should be priced in USD for the same timestamp and the value should use the timestamp that falls earlier but nearest to the price request timestamp. DeFiLlama estimates this by using aggregated CoinGecko prices, but all voters should verify that results agree with broad market consensus.
7. Calculate the sum of all underlying collateral balances in USD from Step 5 for Ethereum Mainnet, Celo, and BSC and also add the Polygon TVL (see step 5 from the Polygon section below).

### Polygon TVL Calculation:

PoolTogether TVL KPI options track value locked in the following Polygon prize pool contracts:
* YieldSourcePrizePool (USDT Pool): [0x887E17D791Dcb44BfdDa3023D26F7a04Ca9C7EF4](https://polygonscan.com/address/0x887E17D791Dcb44BfdDa3023D26F7a04Ca9C7EF4)
  * Underlying Collateral Token: [0xc2132D05D31c914a87C6611C10748AEb04B58e8F](https://polygonscan.com/address/0xc2132d05d31c914a87c6611c10748aeb04b58e8f)
* YieldSourcePrizePool (USDC Pool): [0xEE06AbE9e2Af61cabcb13170e01266Af2DEFa946](https://polygonscan.com/address/0xee06abe9e2af61cabcb13170e01266af2defa946)
  * Underlying Collateral Token: [0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174](https://polygonscan.com/address/0x2791bca1f2de4661ed88a30c99a7a9449aa84174)

1. Call the `accountedBalance` method on each prize pool contract above for the latest available block at or before the request timestamp. This will return the balance of controlled tokens (including timelocked) for each prize pool.
2. Scale down the balances from Step 1 with the decimals of the respective underlying collateral token (call the `decimals()` method on the token contracts from the Underlying Collateral Token address above).
3. Multiply each balance returned from step 2 by the exchange rate of the respective Underlying Collateral Token listed above for the latest available block at or before the request timestamp. This returns the underlying collateral balance in USD.
4. Each underlying collateral balance should be priced in USD for the same timestamp and the value should use the timestamp that falls earlier but nearest to the price request timestamp. DeFiLlama estimates this by using aggregated CoinGecko prices, but all voters should verify that results agree with broad market consensus.
5. Calculate the sum of all underlying collateral balances in USD from Step 3.

## Intended Application:

The use case is to use KPI options to incentivize TVL. The initial payout function is:
* If the returned value is equal to or greater than 500,000,000, voters should return 1.4.
* If the returned value is less than 500,000,000, voters should return a value between 0.9 and 1.4 based on the ( TVL at expiry / 500,000,000 ) + 0.9.

It is intended to deploy the documented KPI option on Polygon using [LSP contract](https://github.com/UMAprotocol/protocol/blob/master/packages/core/contracts/financial-templates/long-short-pair/LongShortPair.sol) with `General_KPI` price identifier approved in [UMIP-117](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-117.md). The contracts would use [Linear LSP FPL](https://github.com/UMAprotocol/protocol/blob/master/packages/core/contracts/financial-templates/common/financial-product-libraries/long-short-pair-libraries/LinearLongShortPairFinancialProductLibrary.sol).
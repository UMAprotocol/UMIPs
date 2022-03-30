## Title
PoolTogether TVL-2 Calculation:

## Summary
PoolTogether is a protocol for no-loss prize games. The protocol enables developers to build their own no-loss prize games and offers governance-managed no-loss prize games.
This calculation is intended to track the TVL of PoolTogether user deposits in various pools and will be used with the General_KPI price identifier. At the time of authorship, the networks included are Ethereum Mainnet, Polygon, Celo, Avalanche, and BSC but could be extended depending on PoolTogether governance and development.
The recommended querying methodology is to use DefiLlama’s TVL calculator. This implementation doc will also describe how the TVL calculation works behind the scenes so that it could be reproduced by voters querying for on-chain data only.

## Intended Ancillary Data

```
Metric:TVL in PoolTogether financial contracts measured in USD,
Endpoint:"https://api.llama.fi/protocol/pooltogether",
Method:"https://github.com/UMAprotocol/UMIPs/blob/master/Implementations/pooltogether-tvl2.md",
Key:tvl[i].totalLiquidityUSD where tvl[i].date is the latest daily timestamp before the requested timestamp,
Interval:"Daily 24:00 UTC",
Rounding:6,
Scaling:0
``` 
**Note:** `totalLiquidityUSD` should be referenced for the timestamp that falls earlier but nearest to the price request timestamp.

## Implementation

With DeFiLlama:
  1. Voters should query the endpoint listed in Intended Ancillary Data.
  2. Voters should find the timestamp key in the `tvl` object that corresponds to the latest daily timestamp that is at or before the price request timestamp, and then use the corresponding `totalLiquidityUSD` value.
  3. If the `totalLiquidityUSD` is equal to or greater than 250,000,000, voters should return 1.4.
  4. If the `totalLiquidityUSD` is less than 250,000,000, voters should return a value between 0.9 and 1.4 based on the calculation: (( `totalLiquidityUSD` / 250,000,000 ) / 2 ) + 0.9.

Without DeFiLlama:
**Note:** This implementation was designed under the assumption that the DeFiLlama TVL calculation continues to be made at the end of the day (24:00 UTC). Please confirm DeFiLlama has not made any changes to their methodology when using this implementation.

The below subgraph urls are used to return the prize pool and underlying collateral token addresses for each active network. Please note, there may be multiple subgraphs for different versions of deployed prize pool contracts.

  - ETH Mainnet Subgraph URL:
    - https://thegraph.com/legacy-explorer/subgraph/pooltogether/pooltogether-v3_1_0
    - https://thegraph.com/legacy-explorer/subgraph/pooltogether/pooltogether-v3_3_2
    - https://thegraph.com/legacy-explorer/subgraph/pooltogether/pooltogether-v3_3_8
    - https://thegraph.com/legacy-explorer/subgraph/pooltogether/pooltogether-v3_4_3

  - Celo Subgraph URL:
    - https://thegraph.com/legacy-explorer/subgraph/pooltogether/celo-v3_4_5

  - BSC Subgraph URL:
    - https://thegraph.com/legacy-explorer/subgraph/pooltogether/bsc-v3_4_3

## General TVL Calculation:
  1. Construct subgraph query by making sure that the `block` parameter corresponds to the latest available block at or before the end of the day (24:00 UTC), e.g.:
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
  2. Take a note of the prize pool contract addresses which are represented by `id` and the `underlyingCollateralToken`. For networks that have multiple subgraph versions, remove duplicate query responses.
  3. Call the `accountedBalance` method on each prize pool contract from step 2 for the latest available block at or before the end of the day (24:00 UTC). This will return the balance of controlled tokens (including timelocked) for each prize pool.
  4. Scale down the balances returned from Step 3 with the decimals of the respective underlying collateral token (call the `decimals()` method on the underlying collateral token contracts from Step 2).
  5. Multiply each balance returned from step 4 by the exchange rate of its respective `underlyingCollateralToken` for the latest available block at or before the end of the day (24:00 UTC). This returns the underlying collateral balance in USD.
  6. Each underlying collateral balance should be priced in USD for the same timestamp and the value should use the timestamp that falls earlier but nearest to the end of the day (24:00 UTC). DeFiLlama estimates this by using aggregated CoinGecko prices, but all voters should verify that results agree with broad market consensus.
  7. Calculate the sum of all underlying collateral balances in USD from Step 5 for Ethereum Mainnet, Celo, BSC and also add the Polygon TVL (see step 5 from the Polygon section below) as well as Avalanche TVL (result from step 4 in the Avalanche section below).

## Polygon TVL Calculation:

**Note:** The below calculation uses the Polygon USDT/USDC contract addresses, while the DefiLlama TVL calculation uses the Ethereum contract addresses for USDT/USDC. This is due to Coingecko not recognizing the Polygon USDT/USDC addresses and will be updated if the issue is resolved.

PoolTogether TVL KPI options track value locked in the following Polygon prize pool contracts:
  - YieldSourcePrizePool (USDT Pool): 0x887E17D791Dcb44BfdDa3023D26F7a04Ca9C7EF4
    - Underlying Collateral Token: 0xc2132D05D31c914a87C6611C10748AEb04B58e8F
  - YieldSourcePrizePool (USDC Pool): 0xEE06AbE9e2Af61cabcb13170e01266Af2DEFa946
    - Underlying Collateral Token: 0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174

  1. Call the `accountedBalance` method on each prize pool contract above for the latest available block at or before the end of the day (24:00 UTC). This will return the balance of controlled tokens (including timelocked) for each prize pool.
  2. Scale down the balances from Step 1 with the decimals of the respective underlying collateral token (call the `decimals()` method on the token contracts from the Underlying Collateral Token address above).
  3. Multiply each balance returned from step 2 by the exchange rate of the respective Underlying Collateral Token listed above for the latest available block at or before the end of the day (24:00 UTC). This returns the underlying collateral balance in USD.
  4. Each underlying collateral balance should be priced in USD for the same timestamp and the value should use the timestamp that falls earlier but nearest to the end of the day (24:00 UTC). DeFiLlama estimates this by using aggregated CoinGecko prices, but all voters should verify that results agree with broad market consensus.
  5. Calculate the sum of all underlying collateral balances in USD from Step 3.

## Avalanche TVL Calculation:

**Note:** The below calculation uses the Avalanche USDC.e contract address, while the DefiLlama TVL calculation uses the Ethereum contract addresses for USDC. This is due to Coingecko not recognizing the Avalanche USDC.e address and will be updated if the issue is resolved.

PoolTogether TVL KPI options track value locked in the following Avalanche prize pool contracts:
  - YieldSourcePrizePool (USDC.e Pool): 0xF830F5Cb2422d555EC34178E27094a816c8F95EC
    - Underlying Collateral Token: 0xa7d7079b0fead91f3e65f86e8915cb59c1a4c664
   
   1. Call the `getAccountedBalance` method on the prize pool contract above for the latest available block at or before the end of the day (24:00 UTC). This will return the balance of controlled tokens (including timelocked) for the prize pool.
   2. Scale down the balance from Step 1 with the decimals of the respective underlying collateral token (call the `decimals()` method on the token contracts from the Underlying Collateral Token address above).
  3. Multiply the balance returned from step 2 by the exchange rate of the respective Underlying Collateral Token listed above for the latest available block at or before the end of the day (24:00 UTC). This returns the underlying collateral balance in USD.
  4. The underlying collateral balance should be priced in USD for the same timestamp and the value should use the timestamp that falls earlier but nearest to the end of the day (24:00 UTC). DeFiLlama estimates this by using aggregated CoinGecko prices, but all voters should verify that results agree with broad market consensus.
  
## Intended Application:

The use case is to use KPI options to incentivize TVL. The initial payout function is:
  - If the returned value is equal to or greater than 250,000,000, voters should return 1.4.
  - If the returned value is less than 250,000,000, voters should return a value between 0.9 and 1.4 based on the (( TVL at expiry / 250,000,000 ) / 2 ) + 0.9.

It is intended to deploy the documented KPI option on Polygon using LSP contract with `General_KPI` price identifier approved in UMIP-117. The contract intends to use Linear LSP FPL with the `lowerBound` set to 0, the `upperBound` set to 1.4, and the `collateralPerPair` set to 1.4.

As an illustration, a TVL value of 100,000,000 would result in 1.10 based on the calculation (( 100,000,000 / 250,000,000 ) / 2 ) + 0.9. At settlement, the `expiryPercentLong` would be calculated using `(expiryPrice - lowerBound) / (upperBound - lowerBound)`. With an `expiryPrice` of 1.10, `expiryPercentLong` would be calculated as (1.10 - 0) / (1.4 - 0) = 0.7857. Therefore, 78.6% of collateral would be allocated to long tokens and 21.4% would be allocated to short tokens. With a `collateralPerPair` set to 1.4, 1.10 POOL would be allocated to each long token and 0.30 POOL would be allocated to each short token.

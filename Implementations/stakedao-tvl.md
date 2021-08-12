## Title

StakeDAO TVL Calculation

## Summary

This calculation is intended to track the TVL denominated in USD of all StakeDAO strategies on Ethereum and Polygon. The recommended method to query StakeDAO TVL is to use DeFi Llama's TVL adapter, but this document will detail the TVL calculation so that it could be reproduced if DeFiLlama was either not available or returning incorrect results. The DeFiLlama adapter this is based off of is [here](https://github.com/DefiLlama/DefiLlama-Adapters/blob/main/projects/stakedao/index.js).

## Intended Ancillary Data

Metric:TVL in StakeDAO strategies measured in USD,
Endpoint:"https://api.llama.fi/protocol/stakedao",
Method:"https://github.com/UMAprotocol/UMIPs/blob/master/Implementations/stakedao-tvl.md",
Key:tvl[i].totalLiquidityUSD where tvl[i].date is the latest daily timestamp before the requested timestamp,
Interval:daily,
Rounding:0

## Implementation

Total StakeDAO TVL is determined by calculating the USD value of assets locked in StakeDAO "strategy" vault contracts on Ethereum and Polygon. At the time of authorship, this list includes:

* Crv_3crv_vault: 
  * Contract: 0xB17640796e4c27a39AF51887aff3F8DC0daF9567
  * crvToken: 0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490
* Crv_eurs_vault: 
  * Contract: 0xCD6997334867728ba14d7922f72c893fcee70e84
  * crvToken: 0x194eBd173F6cDacE046C53eACcE9B953F28411d1
* Crv_btc_vault: 
  * Contract: 0x24129B935AfF071c4f0554882C0D9573F4975fEd
  * crvToken: 0x075b1bb99792c9E1041bA13afEf80C91a1e70fB3
* Crv_frax_vault: 
  * Contract: 0x5af15DA84A4a6EDf2d9FA6720De921E1026E37b7
  * crvToken: 0xd632f22692FaC7611d2AA1C0D552930D43CAEd3B
* Crv_frax_vault2: 
  * Contract: 0x99780beAdd209cc3c7282536883Ef58f4ff4E52F
  * crvToken: 0xd632f22692FaC7611d2AA1C0D552930D43CAEd3B
* Crv_eth_vault: 
  * Contract: 0xa2761B0539374EB7AF2155f76eb09864af075250
  * crvToken: 0xA3D87FffcE63B53E0d54fAa1cc983B7eB0b74A9c
* Crv_perpetual_vault: 
  * Contract: 0x52f541764E6e90eeBc5c21Ff570De0e2D63766B6
  * crvToken: 0x5f3b5DfEb7B28CDbD7FAba78963EE202a494e2A2
* Crv_3crv_vault_polygon: 
  * Contract: 0x7d60F21072b585351dFd5E8b17109458D97ec120
  * crvToken: 0xE7a24EF0C5e95Ffb0f6684b813A78F2a3AD7D171
* Crv_btc_vault_polygon: 
  * Contract: 0x953Cf8f1f097c222015FFa32C7B9e3E96993b8c1
  * crvToken: 0xf8a57c1d3b9629b77b6726a042ca48990A84Fb49

Each vault holds a "crvToken". A crvToken is an LP token for a curve pool and also has an associated swapContract. Component assets and swap contracts for each curveToken can be viewed [here](https://github.com/DefiLlama/DefiLlama-Adapters/blob/main/projects/helper/unwrapLPs.js).

Calculating the TVL for one strategy should follow these steps:

1. Determine the crvToken from the list above (with the exception of "Crv_perpetual_vault", see section below).
2. Call `balance()` on the vault contract. This will return the underlying balance of the "crvToken" for the specific vault. Depending on the vault, this "crvToken" balance can be split between multiple contracts including in some scenarios a "gauge" contract and the "vault" contract.
3. Determine the total outstanding LP tokens by calling `totalSupply()` on the "crvToken" contract.
4. For each "crvToken" there is an associated "swapContract", which holds the underlying assets. Component assets and swapContracts for each "crvToken" are listed here.  `balanceOf()` can be called on the underlying token contract for each token to return the amount of that token in the "swapContract".
5. For each component asset divide the balance held by the "swapContract" from Step 4 by total outstanding LP tokens from Step 3 and multiply by the vault underlying "crvToken" balance from step 2. This should estimate the underlying component asset balances indirectly held by the vault.
6. Each component asset should be priced in USD for the same timestamp. DeFiLlama estimates this by using aggregated CoinGecko prices, but all voters should verify that results agree with broad market consensus.
7. Calculate the sum of all component assets in USD from Step 6 and also add the Crv_perpetual_vault TVL (see section below).

Crv_perpetual_vault calculation:

1. For the Crv_perpetual_vault TVL calculation, voters should call the `locked` method on the Vote-escrowed CRV contract (this corresponds to the "crvToken" address for the Crv_perpetual_vault) by passing vault contract address as parameter. This represents CRV locked in vote escrow by the Crv_perpetual_vault.
2. CRV locked from Step 1 should be converted to USD for the same timestamp as other vault underlying asset components. DeFiLlama estimates this by using aggregated CoinGecko prices, but all voters should verify that results agree with broad market consensus.

Crv_eth_vault calculation:

DeFiLlama does not correctly calculate the underlying balance for the Crv_eth_vault, since the associated "swapContract" for ETH/sETH holds ETH that cannot be estimated with the `balanceOf` method. DeFiLlama estimates ETH balance by multiplying sETH balance by 2. This does not return completely accurate results, because the sETH/ETH pool is not weighted equally.

1. Voters should subtract the chainTvls.Ethereum.tokensInUsd[i].tokens.SETH value from tvl[i].totalLiquidityUSD.
2. Separately query for the correct sETH and ETH balances for the underlying Crv_eth_vault swap contract (0xc5424B857f758E906013F3555Dad202e4bdB4567).
3. Multiply those balances by the respective sETH and ETH USD prices for the same timestamp and sum these results. DeFiLlama estimates this by using aggregated CoinGecko prices, but all voters should verify that results agree with broad market consensus.
4. Add the result from step 3 back to [tvl[i].totalLiquidityUSD -  chainTvls.Ethereum.tokensInUsd[i].tokens.SETH] to get the TVL result that should be returned.

***Note:** The adjustment for Crv_eth_vault would become redundant if DeFiLlama corrects its methodology.*


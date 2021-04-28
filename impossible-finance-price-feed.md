## Headers

| UMIP                |                                                               |
| ------------------- | ------------------------------------------------------------- |
| UMIP Title          | Add IF-USD from Impossible's LP as a supported price identifier |
| Authors             | Howy Ho, Calvin Chu                                           |
| Status              | Draft                                                         |
| Created             | April 27th, 2021                                              |
[Discourse Link](https://discourse.umaproject.org/t/adding-if-usd-as-a-price-feed/1019)

# Summary

The DVM should support price requests for IF-USD. IF-USD reflects the price of the Impossible Finance token which we're also requesting to be added as collateral in this [discourse post](https://discourse.umaproject.org/t/adding-impossible-finance-if-as-collateral/1017)

# Motivation

This UMIP allows the DVM to support price requests for IF tokens. Along with the above UMIP, this would allow support for Impossible Finance tokens to be used as collateral.

# Data Specifications

The stablexswap LP pool is our previous stablecoin swap product which is a fork of Uniswap V2.
From the [STAX-BUSD Pool](0x4406FA5a7D32378691E151FB35fd5F4e2B45cd98), the logic for uniswap price feeds can be used for price calculations. However, a bsc provider needs to be provided instead of an eth provider.

-----------------------------------------
- Price identifier name: STAX-USD
- Markets & Pairs: StablexSwap STAX-BUSD Uniswap v2 pair contract
- Example data providers: Uniswap Price Feed
- Cost to use: n/a
- Real-time data update frequency: 3 seconds (BSC block frequency)
- Historical data update frequency: n/a

# Price Feed Implementation

We'll be using the  [Uniswap](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/UniswapPriceFeed.js) price feed. Price feed configuration:

"STAX/USD" : {
  type: "uniswap",
  uniswapAddress: "0x4406FA5a7D32378691E151FB35fd5F4e2B45cd98", <!-- But its a BSC address -->
  twapLength: 7200
}

For IFUSD, we will allow redemption for 1 USD in our ecosystem until we have trading pools open for IFUSD/stablecoins.

# Technical Specifications

Note that the STAX token is a 1:1 exchangeable token for IF tokens. We've deployed an IF contract and will be doing a migration soon. In the meantime, while trading pairs with IF are not open/have low liquidity, there'll be better security to rely on prices from the STAX trading pairs.

- Price identifier name: STAX/USD
- Base Currency: STAX
- Quote Currency: USD
- Rounding: Round to 2 decimal places
- Estimated current value of price identifier: 2.54

<!--  
Do we need to include this? What formatting should we use?
- Price identifier name: IFUSD/USD
- Base Currency: IFUSD
- Quote Currency - USD
- Rounding: n/a
- Estimated current value of price identifier: CONSTANT 1.00
-->

# Rationale

The rationale to add IF tokens as collateral is to enable the creation of IF-ecosystem stablecoins (IFUSD) with risk properties tied to the ecosystem. This would allow us to better control our ecosystem and treasury

# Implementation

Query STAX/BUSD price from Stablexswap (fork of uniswap v2) using 15 minute TWAP

It should be noted that this identifier is potentially prone to manipulation because of it's reliance on only 1 source. Thus, voters should ensure that results do not differ from broad market consensus. Tokenholders are responsible for defining broad market consensus.

# Security Considerations

Price manipulation can occur as we only have a single source of data which is a low liquidity uniswap v2 Pair pool. Although we are using the time-weight average price feature, the low liquidity still poses a risk for a volatile asset such as IF. As such, anyone deploying a contract referencing this identifier should be mindful of chosen parameters to ensure the loss of funds/collateral. The contract deployer should also ensure that they have the infrastructure in place to monitor the pool and top up additional liquidity when the collateral is close to liquidation thresholds.

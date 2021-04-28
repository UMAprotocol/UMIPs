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

The stablexswap LP pool is our previous stablecoin swap product which is an improved fork of Uniswap V2.
From the [BSC:STAX-BUSD Pool](0x4406FA5a7D32378691E151FB35fd5F4e2B45cd98), the logic for uniswap price feeds can be used for price calculations. 
However, a bsc provider needs to be provided instead of an eth provider. In the interim, we can also set up a pool on an ethereum-based swap if necessary. 

In the interim, we have set up a BSC The Graph implementation to make it easier to query information about this pair and other pairs on our swap [link](https://thegraph.com/explorer/subgraph/xzjcool/ifswap)

After our migration, STAX will convert 1:1 to IF token via the Anyswap bridge, compatible with Andre's multichain.xyz, to bring the IF asset into multiple EVM chains.

-----------------------------------------
- Price identifier name: STAX-USD (Future can upgrade to IF-USD)
- Markets & Pairs: StablexSwap STAX-BUSD StableXswap v2 pair contract
- Example data providers: Can Fork: Uniswap Price Feed
- Cost to use: n/a
- Real-time data update frequency: 3 seconds (BSC block frequency, instead of 15 for ETH)
- Historical data update frequency: n/a

# Price Feed Implementation

We'll be using the  [Uniswap](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/UniswapPriceFeed.js) price feed. Price feed configuration:

"STAX/USD" : {
  type: "uniswap",  <!-- our's is a uniswap fork -->
  uniswapAddress: "0x4406FA5a7D32378691E151FB35fd5F4e2B45cd98", <!-- But its a BSC address -->
  twapLength: 115200 <!-- to confirm - is this in terms of block time? We calculated 4 days based on 3 second block times -->
}

For IFUSD, we will allow redemption for 1 USD in our ecosystem within our Launchpad. Thus the price identifier will use a constant 1 with format following what's specified by [this UMIP](https://github.com/UMAprotocol/UMIPs/pull/260/files).
  
# Technical Specifications

Note that the STAX token is a 1:1 exchangeable token for IF tokens. We've deployed an IF contract and will be doing a migration soon. In the meantime, while trading pairs with IF are not open/have low liquidity, there'll be better security to rely on prices from the STAX trading pairs until the migration occurs.

- Price identifier name: STAX/USD
- Base Currency: STAX
- Quote Currency: USD
- Rounding: Round to 2 decimal places for simplicity
- Estimated current value of price identifier: 2.54

- Price identifier name: CONSTANT
- Base Currency: IFUSD
- Quote Currency - USD
- Rounding: n/a
- Estimated current value of price identifier: CONSTANT 1.00

# Rationale

The rationale to add IF tokens as collateral is to enable the creation of IF-ecosystem-native stablecoin (IFUSD) with risk properties tied to the ecosystem. This would allow us to better control our ecosystem and treasury and allow for value accrual to go to our governance token if the launchpads and swaps drive relevant demand to mint our stablecoin.

# Implementation

Query STAX/BUSD price from Stablexswap (fork of uniswap v2) using 4 day TWAP

It should be noted that this identifier is potentially prone to manipulation because of it's reliance on only 1 source. Thus, voters should ensure that results do not differ from broad market consensus. Tokenholders are responsible for defining broad market consensus. We are working on adding more swap liquidity with other venues and other aggregators to ensure that this will not be a source of failure. Naturally with the minting happening on ETH with higher gas fees than BSC, and users needing to pay fees to migrate funds over, this naturally temporarily limits how many users may mint the synthetic asset, as most will not go through this hassle for just a few tokens, so we expect that we will be the primary issuer of this synth at this time to reduce the risk of potential liquidations.

# Security Considerations

Price manipulation can occur as we only have a single source of data which is two pairs with about 500K liquidity in a StablexSwap v2 Pair pool. Although we are using the time-weight average price feature, the low liquidity still poses a risk for a volatile asset such as IF. Thus we have chosen a 4 day TWAP window. As such, anyone deploying a contract referencing this identifier should be mindful of chosen parameters to ensure the loss of funds/collateral. The contract deployer should also ensure that they have the infrastructure in place to monitor the pool and top up additional liquidity when the collateral is close to liquidation thresholds.

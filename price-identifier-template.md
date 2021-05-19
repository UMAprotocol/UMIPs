
## Headers

| UMIP                |                                                               |
| ------------------- | ------------------------------------------------------------- |
| UMIP Title          | Add BNT, vBNT as supported price identifiers|
| Authors             |**StevenFox**         |
| Status              | Draft                                                         |
| Created             | **19 May 2021**                                              |
| Discourse Link      |       |

# Summary 

USDC/BNT 0x23d1b2755d6C243DFa9Dd06624f1686b9c9E13EB
vBNT/BNT 0x8d06AFd8E322d39Ebaba6DD98f17a0ae81C875b8


# Motivation

The DVM currently does not yet support these price identifiers. vBNT (the Bancor Governance Token) is being proposed as a supported collateral type along with the BNT token.  The inclusion of the two pools above as price oracle, support this. The initial use case for these price identifiers is to create a call options


# Data Specifications

Contract Addresses for Bancor Pools:
USDC/BNT 0x23d1b2755d6C243DFa9Dd06624f1686b9c9E13EB
vBNT/BNT 0x8d06AFd8E322d39Ebaba6DD98f17a0ae81C875b8
 
Binance: BNT/USDT Coinbase-Pro: BNT/USD 
Live Price Endpoints: 
Binance: https://api.cryptowat.ch/markets/binance/bntusdt/price
Coinbase-pro:https://api.cryptowat.ch/markets/coinbase-pro/bntusd/price

# Price Feed Implementation

(still to do)

*To allow for the creation of bots that can programmatically calculate prices off-chain to liquidate and dispute transactions, you must create a price feed following the UMA Protocol format (outlined below). This price feed is also necessary to calculate developer mining rewards.*

*If using existing price feeds from the [UMA protocol repo](https://github.com/UMAprotocol/protocol/tree/master/packages/financial-templates-lib/src/price-feed), please list the price feeds used and write a price feed configuration following the examples [here](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/DefaultPriceFeedConfigs.js).*


Existing price feeds include: (*Please remove before submission*)
- [Balancer](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/BalancerPriceFeed.js)
- [Uniswap/SushiSwap](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/UniswapPriceFeed.js)
- [CoinGecko](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/CoinGeckoPriceFeed.js)
- [CoinMarketCap](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/CoinMarketCapPriceFeed.js)
- [CryptoWatch](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/CryptoWatchPriceFeed.js)
- [DefiPulse](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/DefiPulsePriceFeed.js)
- [TraderMade Forex rates](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/TraderMadePriceFeed.js)
- [ExchangeRate Forex rates](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/ForexDailyPriceFeed.js)
- [LP tokens](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/LPPriceFeed.js)
- [Vault tokens](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/VaultPriceFeed.js)
- [Quandl](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/QuandlPriceFeed.js)
- [Any combination of these](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/ExpressionPriceFeed.js)

# Technical Specifications

Price Identifier Name: BNTUSD

Base Currency: BNT

Quote currency: USD

Scaling Decimals: 18 (1e18)

Rounding: Round to nearest 6 decimal places (seventh decimal place digit >= 5 rounds up and < 5 rounds down)

Price Identifier Name: vBNTBNT

Base Currency: BNT

Quote currency: vBNT

Scaling Decimals: 18 (1e18)

Rounding: Round to nearest 6 decimal places (seventh decimal place digit >= 5 rounds up and < 5 rounds down)


# Rationale

The price for vBNT can be taken using the USDC/BNT liquidity pool for the BNT price and the BNT/vBNT to derive the vBNT price.
Our pool contacts maintain an SMA (slowly-moving average) price, which offers protections from flash loans.
The choice in using Bancors own pools is due to it being the highest liquidity pools for the tokens themselves

# Implementation

Get the SMA price of BNT/USDC from the BNT/USDC pool
Get the SMA price of BNT/vBNT from the BNT/vBNT pool

# Security Considerations

Adding this new identifier by itself poses little security risk to the DVM or priceless financial contract users. However, anyone deploying a new priceless token contract referencing this identifier should take care to parameterize the contract appropriately to the reference asset’s volatility and liquidity characteristics to avoid the loss of funds for synthetic token holders. Additionally, the contract deployer should ensure that there is a network of liquidators and disputers ready to perform the services necessary to keep the contract solvent.

$UMA-holders should evaluate the ongoing cost and benefit of supporting price requests for this identifier and also contemplate de-registering this identifier if security holes are identified. As noted above, $UMA-holders should also consider re-defining this identifier as liquidity in the underlying asset changes, or if added robustness (eg via TWAPs) are necessary to prevent market manipulation.

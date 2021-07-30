*An UMIP number will be assigned by an editor. When opening a pull request to submit your UMIP, please use an abbreviated title in the filename. The file name should follow this format - "umip_add_priceidentifiername.md". Please remove this and all italicized instructions before submitting your pr. All bolded fields should be filled in before submission.*

## Headers

| UMIP                |                                                               |
| ------------------- | ------------------------------------------------------------- |
| UMIP Title          | Add **Price Identifier Name** as a supported price identifier |
| Authors             | **Name**                                                      |
| Status              | Draft                                                         |
| Created             | **Today's Date**                                              |
| Discourse Link      | **Create a post in [UMA's Discourse](https://discourse.umaproject.org/c/umips/18) and link here**            |

# Summary 

The DVM should support price requests for **Price Identifier Name**. **Price Identifier Name** reflects the **Summary of Price Identifier**.


# Motivation

*Please explain why you want to add this price identifier. What types of synthetics are you intending to create with this?*

# Data Specifications

*How should voters access the data necessary to calculate the value of this price identifier? What specific markets or data sources should be referenced?*

*If proposing multiple price identifiers, please add markets or other data sources for each.*

-----------------------------------------
- Price identifier name: **First Price ID Name** 
- Base Currency: **BASE** - *ETH - May not apply if this is not a typical Base/Quote price*
- Quote Currency: **QUOTE** - *USD - May not apply if this is not a typical Base/Quote price*
- Markets & Pairs: **Markets & Pairs** - *Example: Binance ETH/USDT, Coinbase Pro ETH/USD. This might not apply to all price identifiers*
- Example data providers: **Provider to use** - *Cryptowatch, TraderMade, Quandl, the Graph*
- Cost to use: **Explanation or link to provider pricing plan**
- Real-time data update frequency: **Frequency** - *60 seconds*
- Historical data update frequency: **Frequency** - *5 minutes*

# Price Feed Implementation

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

## Ancillary Data Specifications

*This is an optional section. If your price identifier is not intended to use ancillary data, you can remove this section entirely. You can read a full explanation of the expected ancillary data format [here](https://docs.google.com/document/d/1vl1BcIMO3NTNxvR0u6fFQqdUgWtIY8XyjVtx8Hkl8Qk/edit?usp=sharing). An UMIP example of this section can be seen [here](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-83.md#technical-specifications).*

# Rationale

*The section should describe why price identifier design decisions were made, as well as any alternative designs that were considered.*

# Implementation

*Describe how UMA tokenholders should arrive at the price in the case of a DVM price request. Document each step a voter should take to query for and return a price at a specific timestamp, including rounding instructions. This should include an example calculation where you pick a specific timestamp and calculate the price at that timestamp.*

# Security Considerations

Some optional questions to consider: (*Please remove before submission*)
- How could pricing data manipulation occur?
- How could this price ID be exploited?
- Do the instructions for determining the price provide people with enough certainty?
- What are current or future concern possibilities with the way the price identifier is defined?
- Are there any concerns around if the price identifier implementation is deterministic?

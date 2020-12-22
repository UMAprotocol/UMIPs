This is the suggested template for new UMIPs that propose supporting new price identifiers.

When opening a pull request to submit your UMIP, please use an abbreviated title in the filename, umip-draft_title_abbrev.md.

The title should be 44 characters or less. 

All italicized text is provided for intructional purposes and should be removed before draft submission if unused in your UMIP.

## Headers
- UMIP <#> 
- UMIP title: <title>
- Author (name or username and email)
- Status: <Draft, Last Call, Approved, Final, Abandoned, Rejected> 
- Created: <date created on>


## Identifier Specifications

- Identifier Name: *(BTCUSD)*
- Data Source(s): (*Binance, Kraken, Coinbase)*
- Result Processing: *(Median)*
- Input Processing: *(None. Human intervention in extreme circumstances where the result differs from broad market consensus.)*
- Decimals: *(4, .0001)*
- Rounding: *(greater than or equal to ‘.00005’ rounds up, less than rounds down)*
- Available data granularity: *(1 second)*

All timestamps should be rounded back to the nearest available data point.


## Price Calculation Methodology 

*Provide example endpoints to get price data at a specific timestamp for the chosen markets.*

| Data Source | Endpoint | Response field to use |
|------------|-----------|-----------|
| Coinbase | https://api.cryptowat.ch/markets/coinbase-pro/ethusd/ohlc?after=1598918400&before=1598918400&periods=60&apikey=XXXX | price |

*These endpoints should provide more than 72 hours worth of historical data availablity. They should also provide prices at a rate more often than once per hour.*

*What additional steps need to happen to the data after being queried?*

## Rationale for Data Sources
*(Bitstamp, Binance, and Kraken were chosen because they have the highest volume for these assets.  We choose USDT instead of USD because the USDT/BTC pair is what is more commonly traded and the exchange rate between USD/USDT is not meaningfully variable.)*


## Price Feed
*Include a link to a PR to the UMA protocol repo with an example price feed that inherits this  [PriceFeedInterface](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/PriceFeedInterface.js):*

*Already supported price feeds that require no additional pull request include:*
- *Any currency pair available on [Cryptowatch](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/CryptoWatchPriceFeed.js)*
- *[Uniswap prices](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/UniswapPriceFeed.js)*
- *[Balancer prices](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/BalancerPriceFeed.js)*




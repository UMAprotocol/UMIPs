## Headers
| UMIP-93   |                                                          |
|------------|----------------------------------------------------------|
| UMIP Title | Add EURUMA, GBPUMA, CHFUMA, CADUMA, JPYUMA, ZARUMA, KRWUMA, NGNUMA and PHPUMA as price identifiers                           |
| Authors    | Pascal Tallarida (pascal@jarvis.network)                 |
| Status     | Draft                                                 |
| Created    | 05/08/2021   
| Discourse link    | https://discourse.umaproject.org/t/add-eur-gbp-chf-cad-jpy-etc-vs-uma-price-identifiers/1062                                   |

## Summary
The DVM should support price requests for the EUR/UMA, GBP/UMA, CHF/UMA, CAD/UMA, JPY/UMA, ZAR/UMA, KRW/UMA, NGN/UMA and PHP/UMA price index and their inverse.

## Motivation
The DVM currently does not support these Forex price index to allow minting synthetic EUR, GBP, CHF, CAD, JPY, ZAR, KRW, NGN and PHP with a $UMA collateral. This would allow us to scale our synthetic asset offering.

### Cost: 
To construct these price feeds, there are two options: get the price of UMA agaisnt one of these currencies, or get the price of UMA agaisnt USD and combine it with the price of USD against one of these currencies.

Coingecko provides a free API for the price of UMA agaisnt one of these currencies, but it would mean to use a single source of data. [Cryptowatch](https://cryptowat.ch/) provides a free tier API for the price of UMA agaisnt USD.

While Forex data are free through open centralized exchange, brokers, and other sources APIs, the most reliable are paid. We propose to use TraderMade's APIs whose pricing is accessible on their website. [TraderMade](https://tradermade.com/market-data/forex-api#pricing) has also a Free Tier which can be used by the voters and would be sufficient to provide the price of a certain asset. The non-free tier is also affordable, and starts at 30 pounds per month.

### Opportunity: 
Synthetic tokens that track fiat currencies such as EUR could be used both for speculations and hedging, but we see a bigger opportunity for using them as building blocks for helping other DeFi protocols and dApps addressing the global market.


## Technical Specification

The definition of this identifiers should be:


- Identifier name: EURUMA
- Base Currency: EUR
- Quote Currency: UMA

-----------------------------------------

- Identifier name: GBPUMA
- Base Currency: GBP
- Quote Currency: UMA

-----------------------------------------

- Identifier name: CHFUMA
- Base Currency: CHF
- Quote Currency: UMA

-----------------------------------------

- Identifier name: CADUMA
- Base Currency: CAD
- Quote Currency: UMA

-----------------------------------------

- Identifier name: JPYUMA
- Base Currency: JPY
- Quote Currency: UMA

-----------------------------------------

- Identifier name: ZARUMA
- Base Currency: ZAR
- Quote Currency: UMA

-----------------------------------------

- Identifier name: KRWUMA
- Base Currency: KRW
- Quote Currency: UMA

-----------------------------------------

- Identifier name: NGNUMA
- Base Currency: NGN
- Quote Currency: UMA

-----------------------------------------

- Identifier name: PHPUMA
- Base Currency: PHP
- Quote Currency: UMA

-----------------------------------------


- Source: https://marketdata.tradermade.com and https://cryptowat.ch/
- Result Processing: None
- Input Processing: None. Human intervention in extreme circumstances where the result differs from broad market consensus.
- Price Steps: 0.00001 (5 decimals in more general trading format)
- Rounding: Closest, 0.5 up (>= .000005 rounds up, < .000005 rounds down)
- Scaling Decimals: 18 (1e18)
- Pricing Interval: 60 seconds
- Dispute timestamp rounding: down (we round to the earliest minute).

## Rationale
Apart from the weekend, there is little to no difference in prices on liquid major Forex pairs like JPYUSD, so any price feed could be used; however, for convenience, we recommend using the one of TraderMade.

## Implementation
To construct UMA/XXX price feed, we need to combine two price feeds: UMA/USD and and USD/XXX: 
•	To get UMA/XXX: we divide UMA/USD by XXX/USD, or multiply it by USD/XXX.
•	To get XXX/UMA: we devide UMA/USD by USD/XXX, or multiply it by XXX/USD.

To construct the UMA/USD price feed, we will calculate the median price between the three data sources used in the UMIP 57: Coinbase (USD), Okex (USDT) and Binance (USDT). We recommend using Cryptowatch. The free tier allows 665 queries per day; the price update frequency is 60 seconds.

To get the USD/XXX prices, we will use TraderMade’s price feeds. The free tier allows 1,000 queries per month; the price update frequency is below 1 second for the live price, and 60 seconds for the historical price. Forex pair price should then be rounded to 5 decimals.

Cryptowatch and TraderMade use a different input format for  retrieving historical data: you need to use Unix timestamp for Cryptowatch, and YYYY-MM-DD-HH:MM for TraderMade. Price requests should use the minute price that is nearest and earliest than the price request timestamp. Voters should use the close price of the OHLC period prior to the price request timestamp. Cryptowatch and TraderMade endpoints are queried based on the OHLC period's close time. For example, a request for a Forex pair price at 2021-05-10-21:10:16 should use query for the period ending at 2021-05-10-21:10:00 (Unix: 1620756600) and use the close price.


### UMAEUR
To construct both live and historical price for UMA/EUR we will multiply UMA/USD by USD/EUR.

Recommended endpoints to query live prices:
•	Coinbase Pro UMA/USD: https://api.cryptowat.ch/markets/coinbase-pro/UMAUSD/price
•	Binance UMA/USDT: https://api.cryptowat.ch/markets/binance/UMAUSDt/price
•	OKEx UMA/USDT: https://api.cryptowat.ch/markets/okex/UMAUSDt/price
•	USD/EUR: https://marketdata.tradermade.com/api/v1/live?currency=USDEUR&api_key=api_key

Recommended endpoints to query historical prices for the 10th of May 2021 at 6:03pm:
•	Coinbase Pro UMA/USD: https://api.cryptowat.ch/markets/coinbase-pro/UMAUSD/ohlc?after=1620669780&before=1620669780&periods=60
•	Binance UMA/USDT: https://api.cryptowat.ch/markets/binance/UMAUSDt/ohlc?after=1620669780&before=1620669780&periods=60
•	OKEx UMA/USDT: https://api.cryptowat.ch/markets/okex/UMAUSDt/ohlc?after=1620669780&before=1620669780&periods=60
•	USD/EUR: https://marketdata.tradermade.com/api/v1/minute_historical?currency=USDEUR&date_time=2021-05-10-18:03&api_key=apikey

### UMAGBP
To construct both live and historical price for UMA/GBP we will multiply UMA/USD by USD/GBP.

Recommended endpoints to query live prices:
•	Coinbase Pro UMA/USD: https://api.cryptowat.ch/markets/coinbase-pro/UMAUSD/price
•	Binance UMA/USDT: https://api.cryptowat.ch/markets/binance/UMAUSDt/price
•	OKEx UMA/USDT: https://api.cryptowat.ch/markets/okex/UMAUSDt/price
•	USD/GBP: https://marketdata.tradermade.com/api/v1/live?currency=USDGBP&api_key=api_key

Recommended endpoints to query historical prices for the 10th of May 2021 at 6:03pm:
•	Coinbase Pro UMA/USD: https://api.cryptowat.ch/markets/coinbase-pro/UMAUSD/ohlc?after=1620669780&before=1620669780&periods=60
•	Binance UMA/USDT: https://api.cryptowat.ch/markets/binance/UMAUSDt/ohlc?after=1620669780&before=1620669780&periods=60
•	OKEx UMA/USDT: https://api.cryptowat.ch/markets/okex/UMAUSDt/ohlc?after=1620669780&before=1620669780&periods=60
•	USD/GBP: https://marketdata.tradermade.com/api/v1/minute_historical?currency=USDGBP&date_time=2021-05-10-18:03&api_key=apikey

### UMACHF
To construct both live and historical price for UMA/CHF we will multiply UMA/USD by USD/CHF.

Recommended endpoints to query live prices:
•	Coinbase Pro UMA/USD: https://api.cryptowat.ch/markets/coinbase-pro/UMAUSD/price
•	Binance UMA/USDT: https://api.cryptowat.ch/markets/binance/UMAUSDt/price
•	OKEx UMA/USDT: https://api.cryptowat.ch/markets/okex/UMAUSDt/price
•	USD/CHF: https://marketdata.tradermade.com/api/v1/live?currency=USDCHF&api_key=api_key

Recommended endpoints to query historical prices for the 10th of May 2021 at 6:03pm:
•	Coinbase Pro UMA/USD: https://api.cryptowat.ch/markets/coinbase-pro/UMAUSD/ohlc?after=1620669780&before=1620669780&periods=60
•	Binance UMA/USDT: https://api.cryptowat.ch/markets/binance/UMAUSDt/ohlc?after=1620669780&before=1620669780&periods=60
•	OKEx UMA/USDT: https://api.cryptowat.ch/markets/okex/UMAUSDt/ohlc?after=1620669780&before=1620669780&periods=60
•	USD/CHF: https://marketdata.tradermade.com/api/v1/minute_historical?currency=USDCHF&date_time=2021-05-10-18:03&api_key=apikey

### UMACAD
To construct both live and historical price for UMA/CAD we will multiply UMA/USD by USD/CAD.

Recommended endpoints to query live prices:
•	Coinbase Pro UMA/USD: https://api.cryptowat.ch/markets/coinbase-pro/UMAUSD/price
•	Binance UMA/USDT: https://api.cryptowat.ch/markets/binance/UMAUSDt/price
•	OKEx UMA/USDT: https://api.cryptowat.ch/markets/okex/UMAUSDt/price
•	USD/CAD: https://marketdata.tradermade.com/api/v1/live?currency=USDCAD&api_key=api_key

Recommended endpoints to query historical prices for the 10th of May 2021 at 6:03pm:
•	Coinbase Pro UMA/USD: https://api.cryptowat.ch/markets/coinbase-pro/UMAUSD/ohlc?after=1620669780&before=1620669780&periods=60
•	Binance UMA/USDT: https://api.cryptowat.ch/markets/binance/UMAUSDt/ohlc?after=1620669780&before=1620669780&periods=60
•	OKEx UMA/USDT: https://api.cryptowat.ch/markets/okex/UMAUSDt/ohlc?after=1620669780&before=1620669780&periods=60
•	USD/CAD: https://marketdata.tradermade.com/api/v1/minute_historical?currency=USDCAD&date_time=2021-05-10-18:03&api_key=apikey

### UMAJPY
To construct both live and historical price for UMA/JPY we will multiply UMA/USD by USD/JPY.

Recommended endpoints to query live prices:
•	Coinbase Pro UMA/USD: https://api.cryptowat.ch/markets/coinbase-pro/UMAUSD/price
•	Binance UMA/USDT: https://api.cryptowat.ch/markets/binance/UMAUSDt/price
•	OKEx UMA/USDT: https://api.cryptowat.ch/markets/okex/UMAUSDt/price
•	USD/JPY: https://marketdata.tradermade.com/api/v1/live?currency=USDJPY&api_key=api_key

Recommended endpoints to query historical prices for the 10th of May 2021 at 6:03pm:
•	Coinbase Pro UMA/USD: https://api.cryptowat.ch/markets/coinbase-pro/UMAUSD/ohlc?after=1620669780&before=1620669780&periods=60
•	Binance UMA/USDT: https://api.cryptowat.ch/markets/binance/UMAUSDt/ohlc?after=1620669780&before=1620669780&periods=60
•	OKEx UMA/USDT: https://api.cryptowat.ch/markets/okex/UMAUSDt/ohlc?after=1620669780&before=1620669780&periods=60
•	USD/JPY: https://marketdata.tradermade.com/api/v1/minute_historical?currency=USDJPY&date_time=2021-05-10-18:03&api_key=apikey

### UMAZAR
To construct both live and historical price for UMA/ZAR we will multiply UMA/USD by USD/ZAR.

Recommended endpoints to query live prices:
•	Coinbase Pro UMA/USD: https://api.cryptowat.ch/markets/coinbase-pro/UMAUSD/price
•	Binance UMA/USDT: https://api.cryptowat.ch/markets/binance/UMAUSDt/price
•	OKEx UMA/USDT: https://api.cryptowat.ch/markets/okex/UMAUSDt/price
•	USD/ZAR: https://marketdata.tradermade.com/api/v1/live?currency=USDZAR&api_key=api_key

Recommended endpoints to query historical prices for the 10th of May 2021 at 6:03pm:
•	Coinbase Pro UMA/USD: https://api.cryptowat.ch/markets/coinbase-pro/UMAUSD/ohlc?after=1620669780&before=1620669780&periods=60
•	Binance UMA/USDT: https://api.cryptowat.ch/markets/binance/UMAUSDt/ohlc?after=1620669780&before=1620669780&periods=60
•	OKEx UMA/USDT: https://api.cryptowat.ch/markets/okex/UMAUSDt/ohlc?after=1620669780&before=1620669780&periods=60
•	USD/ZAR: https://marketdata.tradermade.com/api/v1/minute_historical?currency=USDZAR&date_time=2021-05-10-18:03&api_key=apikey

### UMAKRW
To construct both live and historical price for UMA/KRW we will multiply UMA/USD by USD/KRW.

Recommended endpoints to query live prices:
•	Coinbase Pro UMA/USD: https://api.cryptowat.ch/markets/coinbase-pro/UMAUSD/price
•	Binance UMA/USDT: https://api.cryptowat.ch/markets/binance/UMAUSDt/price
•	OKEx UMA/USDT: https://api.cryptowat.ch/markets/okex/UMAUSDt/price
•	USD/KRW: https://marketdata.tradermade.com/api/v1/live?currency=USDKRW&api_key=api_key

Recommended endpoints to query historical prices for the 10th of May 2021 at 6:03pm:
•	Coinbase Pro UMA/USD: https://api.cryptowat.ch/markets/coinbase-pro/UMAUSD/ohlc?after=1620669780&before=1620669780&periods=60
•	Binance UMA/USDT: https://api.cryptowat.ch/markets/binance/UMAUSDt/ohlc?after=1620669780&before=1620669780&periods=60
•	OKEx UMA/USDT: https://api.cryptowat.ch/markets/okex/UMAUSDt/ohlc?after=1620669780&before=1620669780&periods=60
•	USD/KRW: https://marketdata.tradermade.com/api/v1/minute_historical?currency=USDKRW&date_time=2021-05-10-18:03&api_key=apikey

### UMANGN
To construct both live and historical price for UMA/NGN we will multiply UMA/USD by USD/NGN.

Recommended endpoints to query live prices:
•	Coinbase Pro UMA/USD: https://api.cryptowat.ch/markets/coinbase-pro/UMAUSD/price
•	Binance UMA/USDT: https://api.cryptowat.ch/markets/binance/UMAUSDt/price
•	OKEx UMA/USDT: https://api.cryptowat.ch/markets/okex/UMAUSDt/price
•	USD/NGN: https://marketdata.tradermade.com/api/v1/live?currency=USDNGN&api_key=api_key

Recommended endpoints to query historical prices for the 10th of May 2021 at 6:03pm:
•	Coinbase Pro UMA/USD: https://api.cryptowat.ch/markets/coinbase-pro/UMAUSD/ohlc?after=1620669780&before=1620669780&periods=60
•	Binance UMA/USDT: https://api.cryptowat.ch/markets/binance/UMAUSDt/ohlc?after=1620669780&before=1620669780&periods=60
•	OKEx UMA/USDT: https://api.cryptowat.ch/markets/okex/UMAUSDt/ohlc?after=1620669780&before=1620669780&periods=60
•	USD/NGN: https://marketdata.tradermade.com/api/v1/minute_historical?currency=USDNGN&date_time=2021-05-10-18:03&api_key=apikey

### UMAPHP
To construct both live and historical price for UMA/PHP we will multiply UMA/USD by USD/PHP.

Recommended endpoints to query live prices:
•	Coinbase Pro UMA/USD: https://api.cryptowat.ch/markets/coinbase-pro/UMAUSD/price
•	Binance UMA/USDT: https://api.cryptowat.ch/markets/binance/UMAUSDt/price
•	OKEx UMA/USDT: https://api.cryptowat.ch/markets/okex/UMAUSDt/price
•	USD/PHP: https://marketdata.tradermade.com/api/v1/live?currency=USDPHP&api_key=api_key

Recommended endpoints to query historical prices for the 10th of May 2021 at 6:03pm:
•	Coinbase Pro UMA/USD: https://api.cryptowat.ch/markets/coinbase-pro/UMAUSD/ohlc?after=1620669780&before=1620669780&periods=60
•	Binance UMA/USDT: https://api.cryptowat.ch/markets/binance/UMAUSDt/ohlc?after=1620669780&before=1620669780&periods=60
•	OKEx UMA/USDT: https://api.cryptowat.ch/markets/okex/UMAUSDt/ohlc?after=1620669780&before=1620669780&periods=60
•	USD/PHP: https://marketdata.tradermade.com/api/v1/minute_historical?currency=USDPHP&date_time=2021-05-10-18:03&api_key=apikey


### Weekend timestamp

Over the weekend or some official holidays the REST API for Forex pair prices does not return any price, but we can request the price of a certain moment before the market close (as ex: the closing price of Friday).

Due to unavailability of price feed for foreign exchange rates and commodities over the weekend or during some official holidays, tokenholders and users will be using the latest known price, which for the weekend is essentially the closing price of Friday. Same goes in a case of a liquidation process - the liquidator should use the last known price (during the weekend this is the closing price of Friday) in order to match with the price on which a synthetic asset was created, if it was created over the weekend. If not the closing price on Friday for a certain asset should be a navigating point in calculating the collateralization ratio of a position and in the liquidation process.

If a request timestamp takes place on a weekend or any other day the Forex market is closed, voters should use the latest tick as the price. For the weekend that would be the closing price of the asset on Friday and for official holidays this would be the last know price provided by the price feed.

Please note that this is different than the normal calculation process, which requires using the open price of the period that the price request falls in.

### Forex markets working hours

Forex markets are usually open throughout business days from 10:00 PM UTC time on Sunday, until 9:00 PM UTC time on Friday. However it is good to note that some brokers might close their price feeds 5-10 minutes prior to the official market closing time, thus the latest price given from the broker will be used as a official price for the asset. We should also note here that during those minutes the price remains flat without any changes, however theoretically it is possible to have a stronger price movement.

### Price feed - liquidations and disputes

Liquidation and dispute bots should have their own subscription to price feeds. Our price-feed provider’s API documentation can be found [here](https://marketdata.tradermade.com/documentation). A reference TraderMade implementation that is used by liquidator and dispute bots can be seen [here](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/TraderMadePriceFeed.js).

Our team has adjusted the original Liquidation and Dispute bots in order to fit the interfaces of our protocol. You can find our versions of the Liquidator and Dispute bots on the following GitLab links:

- [Liquidator Bot]
- [Dispute Bot]

TraderMade is provided as an accessible source to query for this data, but ultimately how one queries for these rates should be varied and determined by the voter to ensure that there is no central point of failure.

In the case of a TraderMade outage voters can turn to any other available price feed API or a broker API, as the price feeds for the forementioned financial assets does not differ much between different providers. There might be some slight differences, however they are quite insignificant and would not affect the liquidation or dispute processes. For this case, we provide options for additional price feed providers that voters could utilize.

## Additional price feed providers

### Coingecko.com

Documentation for the API can be found [here](https://www.coingecko.com/api/documentations/v3).

- Live price feed data
- Historical prices based on date and time
- Registration is free and provides 100 free requests per minute

Example requests:

- Live Rate for UMAUSD: https://api.coingecko.com/api/v3/simple/price?ids=UMA&vs_currencies=USD
- 

Note: you can query EUR/UMA, GBP/UMA, CHF/UMA, CAD/UMA, JPY/UMA, ZAR/UMA, KRW/UMA, NGN/UMA and PHP/UMA prices  (https://api.coingecko.com/api/v3/simple/price?ids=UMA&vs_currencies=EUR) for live price, but not for historical price.

Historical prices can be query for any currency as well, but it only returns one update per day.

Therefore, using Coingecko for historical price would not be possible until they increase it.



### FXMarketAPI

Documentation for the API can be found [here](https://fxmarketapi.com/documentation#live_rates).

- Live price feed data
- Historical prices based on date and time
- Registration is free and provides 500 free requests
- Paid plans available
- OHLC request can be used to grab the last closing price before a weekend or a non-working day

Example requests:

- Live Rate for JPYUSD: `https://fxmarketapi.com/apiliveapi_key=api_key&currency=JPYUSD`
- OHLC for a certain date on a currency pair: `https://fxmarketapi.com/apihistorical?api_key=api_key&currency=JPYUSD&date=2020-12-23&format=ohlc`
- Request for JPYUSD price at a certain date and time: `https://fxmarketapi.com/apihistorical?api_key=api_key&currency=JPYUSD&date=2020-12-23-15:50` 

### FCS API

Documentation for the API can be found [here](https://fcsapi.com/document/forex-api).

- 500 API Calls with Free Plan
- Live price data accessible with Free Plan - Updated every 60 seconds or less
- Historical data accessible with the Basic Paid Plan - 10$ per month

Example requests:

- Live Rate for JPY/USD: `https://fcsapi.com/api-v3/forex/latest?symbol=JPY/USD&access_key=api_key`
- Historical price for a certain date for JPY/USD - gives back the OHLC: `https://fcsapi.com/api-v3/forex/history?symbol=JPY/USD&period=1D&from=2020-12-23&to=2020-12-24&access_key=api_key`
- Price of JPY/USD between certain dates and times - gives a breakdown on the price each 1 minute between 12:00 and 12:30: `https://fcsapi.com/api-v3/forex/history?symbol=JPY/USD&period=1M&from=2020-12-23T12:00&to=2020-12-23T12:30&access_key=api_key`  

## Security considerations
Adding this new identifier by itself poses a little security risk to the DVM or priceless financial contract users. However, anyone deploying a new priceless token contract referencing this identifier should take care to parameterize the contract appropriately to avoid the loss of funds for synthetic token holders. Additionally, the contract deployer should ensure that there is a network of liquidators and disputers ready to perform the services necessary to keep the contract solvent.

While the price of JPY/USD or any other forex pair does not vary much across various price feed during the weekday, it may be more challenging to get a unified price feed on the weekend: first, while the underlying market is not closed, most of the broker and banks feeding the APIs price feed are; then, for the one providing a price feed, they often add a very big spread, which makes the price of forex pairs vary significantly by source; a way to mitigate it is to use the last price known. 

A consequence to this is the existence of gaps between the last quote on Friday to the first one on Sunday; while such gaps rarely exceed +/-2%, which should not put in danger the collateralization ratio, an exceptional event happening the weekend may create a bigger gap and could, in theory, endanger the collateral ratio; yet, it is very unlikely to see +/-20% gap on JPY/USD, but it is in theory possible. Nevertheless, due to gaps, a larger number of liquidation and disputes may arise on Sunday 9 pm UTC if the collateral ratio was already getting weaker before the week’s end. In order to mitigate this theoretical risk a high collateralization requirement (120%+) should be set or a reserve fund mechanism should be implemented in order to automatically rebalance the collateralization ratio above 100% (in case it falls below 100%), thus making the liquidation process profitable again.
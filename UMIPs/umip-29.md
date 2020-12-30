## Headers
| UMIP-29    |                                                          |
|------------|----------------------------------------------------------|
| UMIP Title | Add EURUSD, CHFUSD and GBPUSD                            |
| Authors    | Pascal Tallarida (pascal@jarvis.network)                 |
| Status     | Draft                                                    |
| Created    | December 22, 2020                                        |

## Summary
The DVM should support price requests for the EURUSD, GBPUSD and CHFUSD price index.

## Motivation
The DVM currently does not support the EURUSD, GBPUSD and CHFUSD index.

### Cost: 
While Forex data are free through open centralized exchange, brokers, and other sources APIs, the most reliable are paid. We propose to use TraderMade's APIs whose pricing is accessible on their website. TraderMade has also a Free Tier which can be used by the voters and would be sufficient to provide the price of a certain asset.

### Opportunity: 
Synthetic tokens that track Forex pairs such as EURUSD, GBPUSD and CHFUSD could be used both for speculations and hedging, but we see a bigger opportunity for using them as building blocks for helping other DeFi protocols and dApp addressing the european market.

## Technical Specification

The definition of this identifiers should be:

-----------------------------------------
- Identifier name: **EURUSD**
- Base Currency: EUR
- Quote Currency: USD

-----------------------------------------

- Identifier name: **GBPUSD**
- Base Currency: GBP
- Quote Currency: USD

-----------------------------------------

- Identifier name: **CHFUSD**
- Base Currency: CHF
- Quote Currency: USD

-----------------------------------------

Source: https://marketdata.tradermade.com <br>
Result Processing: Median (if more than 1 source is utilized), otherwise Exact Price <br>
Input Processing: None. Human intervention in extreme circumstances where the result differs from broad market consensus. <br>
Price Steps: 0.00001 (5 decimals in more general trading format) <br>
Rounding: Closest, 0.5 up (> .000005 rounds up, < .000005 rounds down) <br>
Scaling Decimals: 18 (1e18) <br>
Pricing Interval: 60 seconds <br>
Dispute timestamp rounding: down <br>

## Rationale
Apart from the weekend, there is little to no difference in prices on liquid major Forex pairs like EURUSD, so any price feed could be used; however, for convenience, we recommend using the one of TraderMade.

## Implementation
The value of this identifier for a given timestamp should be determined by querying for the price of EURUSD, GBPUSD and CHFUSD from TraderMade.com for that timestamp. More specifically, users can query “https://marketdata.tradermade.com/api/v1/minute_historical?currency=EURUSD&date_time=2020-11-11-13:01&api_key=apikey” and use the close price as reference. 

Tradermade’s price feed is an aggregated feed from multiple Tier One and Two Banks, Market-Makers and Data Providers. They are popular with Quantitative Traders, Fintech companies and Institutional customers who require a high quality and trusted feed.

### Weekend timestamp

Over the weekend or some official holidays the REST API does not return any price, but we can request the price of a certain moment before the market close (as ex: the closing price of Friday).

Due to unavailability of price feed for foreign exchange rates and commodities over the weekend or during some official holidays, tokenholders and users will be using the latest known price, which for the weekend is esentially the closing price of Friday. Same goes in a case of a liquidation process - the liquidator should use the last known price (during the weekend this is the closing price of Friday) in order to match with the price on which a synthetic asset was created, if it was created over the weekend. If not the closing price on Friday for a certain asset should be a navigating point in calculating the collateralization ratio of a position and in the liquidation process.

If a request timestamp takes place on a weekend or any other day the Forex market is closed, voters should use the latest tick as the price. For the weekend that would be the closing price of the asset on Friday and for official holidays this would be the last know price provided by the price feed.

### Forex markets working hours

Forex markets are usually open throughout business days from 10:00 PM UTC time on Sunday, until 9:00 PM UTC time on Friday. However it is good to note that some brokers might close their price feeds 5-10 minutes prior to the official market closing time, thus the latest price given from the broker will be used as a official price for the asset. We should also note here that during those minutes the price remains flat without any changes, however theoretically it is possible to have a stronger price movement.

### USDCHF value

As most of the price feed does not provide a price for CHFUSD but USDCHF, the value of this identifier will undergo one additional step: CHFUSD = 1/USDCDF.  Token holders should take care to confirm that the order of the quote and base currency they refer to matches the one being requested by the DVM in the event of a price request.
TraderMade is provided as an accessible source to query for this data, but ultimately how one queries for these rates should be varied and determined by the voter to ensure that there is no central point of failure.
While it's important for tokenholders to have redundancy in their sources, bots and users that interact with the system in realtime need fast sources of price information. In these cases, it can be assumed that the exchange median is accurate enough

### Price feed - liquidations and disputes

Liquidation and dispute bots should have their own subscription to price feeds. Our price-feed provider’s API documentation can be found [here](https://marketdata.tradermade.com/documentation).

In the case of a TraderMade outage voters can turn to any other available price feed API or a broker API, as the price feeds for the forementioned financial assets does not differ much between different providers. There might be some slight differences, however they are quite insignificant and would not affect the liquidation or dispute processes. In that case we'll use a median price from the different price feeds provided by the voters.

## Additional price feed providers

### FXMarketAPI

Documentation for the API can be found [here](https://fxmarketapi.com/documentation#live_rates).

- Live price feed data
- Historical prices based on date and time
- Registration is free and provides 500 free requests
- Paid plans available
- OHLC request can be used to grab the last closing price before a weekend or a non-working day

Example requests:

- Live Rate for EURUSD: `https://fxmarketapi.com/apiliveapi_key=api_key&currency=EURUSD`
- OHLC for a certain date on a currency pair: `https://fxmarketapi.com/apihistorical?api_key=api_key&currency=EURUSD&date=2020-12-23&format=ohlc`
- Request for EURUSD price at a certain date and time: `https://fxmarketapi.com/apihistorical?api_key=api_key&currency=EURUSD&date=2020-12-23-15:50` 

### FCS API

Documentation for the API can be found [here](https://fcsapi.com/document/forex-api).

- 500 API Calls with Free Plan
- Live price data accessible with Free Plan - Updated every 60 seconds or less
- Historical data accessible with the Basic Paid Plan - 10$ per month

Example requests:

- Live Rate for EUR/USD: `https://fcsapi.com/api-v3/forex/latest?symbol=EUR/USD&access_key=api_key`
- Historical price for a certain date for EUR/USD - gives back the OHLC: `https://fcsapi.com/api-v3/forex/history?symbol=EUR/USD&period=1D&from=2020-12-23&to=2020-12-24&access_key=api_key`
- Price of EUR/USD between certain dates and times - gives a breakdown on the price each 1 minute between 12:00 and 12:30: `https://fcsapi.com/api-v3/forex/history?symbol=EUR/USD&period=1M&from=2020-12-23T12:00&to=2020-12-23T12:30&access_key=api_key`  

## Security considerations
Adding this new identifier by itself poses a little security risk to the DVM or priceless financial contract users. However, anyone deploying a new priceless token contract referencing this identifier should take care to parameterize the contract appropriately to avoid the loss of funds for synthetic token holders. Additionally, the contract deployer should ensure that there is a network of liquidators and disputers ready to perform the services necessary to keep the contract solvent.

While the price of EURUSD or any other forex pair does not vary much across various price feed during the weekday, it may be more challenging to get a unified price feed on the weekend: first, while the underlying market is not closed, most of the broker and banks feeding the APIs price feed are; then, for the one providing a price feed, they often add a very big spread, which makes the price of forex pairs vary significantly by source; a way to mitigate it is to use the last price known. 

A consequence to this is the existence of gaps between the last quote on Friday to the first one on Sunday; while such gaps rarely exceed +/-2%, which should not put in danger the collateralization ratio, an exceptional event happening the weekend may create a bigger gap and could, in theory, endanger the collateral ratio; yet, it is very unlikely to see +/-20% gap on EUR/USD, but it is in theory possible. Nevertheless, due to gaps, a larger number of liquidation and disputes may arise on Sunday 9 pm UTC if the collateral ratio was already getting weaker before the week’s end. In order to mitigate this theoretical risk a high collateralization requirement (120%+) should be set or a reserve fund mechanism should be implemented in order to automatically rebalance the collateralization ratio above 100% (in case it falls below 100%), thus making the liquidation process profitable again.

In the past the CHF was pegged to the EUR, but in 2015 this pegged was removed by the Swiss Central Bank in a surprise move, which caused a huge volatile movement on the CHF price. Such movement could put the CHF below the 100% collateralization ratio, although it is highly unlikely to happen. This risk could appear again one day if the peg is reinstated. In the forementioned situation the CHF lost 20% within one day. However with a higher required collateralization ratio such events can be mitigated.

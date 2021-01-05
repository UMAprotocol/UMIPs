## Headers
| UMIP-32     |                                                                                                                                          |
|------------|------------------------------------------------------------------------------------------------------------------------------------------|
| UMIP Title | Add CNYUSD as price identifiers              |
| Authors    | Shankai Ji, jishankai@gmail.com |
| Status     | Draft                                                                                                                                  |
| Created    | December 16, 2020                                                                                                                           |

## Summary (2-5 sentences)
The DVM should support price requests for the CNY/USD price index. 


## Motivation
The DVM currently does not support the CNY/USD index.

Supporting the CNYUSD price identifier would enable the creation of a Chinese Yuan FX derivative, backed by USD. Token minters could go short on the CNY/USD index, while token holders could go long or use synthetic fxCNY for functional purposes.

## Technical Specification
The definition of these identifiers should be:

-----------------------------------------
- Identifier names: **CNYUSD**
- Base Currency: CNY
- Quote Currency: USD
- Result Processing: None
- Price Steps: 0.000001 (6 decimals in more general trading format)
- Date Source: TraderMade
- Input Processing: None. Human intervention in extreme circumstances where the result differs from broad market consensus.
- Rounding: Closest, 0.5 up
- Pricing Interval: 10 minutes
- Dispute timestamp rounding: down


## Rationale
Prices are primarily used by Priceless contracts to calculate a synthetic token’s redemptive value in case of liquidation or expiration. Contract counterparties also use the price index to ensure that sponsors are adequately collateralized. 

TraderMade has adequate CNYUSD data and has been used as a data source in previous price identifiers.

Tradermade’s price feed is an aggregated feed from multiple Tier One and Two Banks, Market-Makers and Data Providers. They are popular with Quantitative Traders, Fintech companies and Institutional customers who require a high quality and trusted feed.


## Implementation
The value of this identifier for a given timestamp should be determined by querying for the price of CNYUSD from TraderMade.com for that timestamp. More specifically, users can query 
```
https://marketdata.tradermade.com/api/v1/minute_historical?currency=CNYUSD&date_time=2020-11-11-13:50&api_key={apikey}
```
and use the close price as reference. Because we use the endpoint with a 10 minute granularity, Voters should rounding all timestamps down and make them fall on the 10 minute interval, to clarify if the price request timestamp is as ex 13:01:59, voters should query 13:00 as a timestamp.

### TraderMade Historical API
TraderMade has CNYUSD historical data available with a 10 minute granularity. 

Example endpoint here: 
```
https://marketdata.tradermade.com/api/v1/minute_historical?currency=CNYUSD&date_time=2020-11-11-13:50&api_key={apikey}
```

The response is:
```
{
  "close": 0.1509, 
  "currency": "CNYUSD", 
  "date_time": "2020-11-11-13:50", 
  "endpoint": "minute_historical", 
  "high": 0.1509, 
  "low": 0.1509, 
  "open": 0.1509, 
  "request_time": "Tue, 29 Dec 2020 09:02:04 GMT"
}
```
Voters should use the `close` price and round to 6 decimals to get the CNYUSD result.

It should be noted that requests that do not fall on the 10 minute interval do not return data. Voters should round time down to the closest 10 minute interval if they request the price which doesn't fall on the 10 minute interval.

### TraderMade Live API

TraderMade also has a live-data endpoint for USDCNY here:
```
https://marketdata.tradermade.com/api/v1/live?currency=CNYUSD&api_key={apikey}
```

The response is:
```
{
  "endpoint": "live", 
  "quotes": [
    {
      "ask": 0.15313, 
      "base_currency": "CNY", 
      "bid": 0.15313, 
      "mid": 0.15313, 
      "quote_currency": "USD"
    }
  ], 
  "requested_time": "Tue, 29 Dec 2020 12:00:50 GMT", 
  "timestamp": 1609243250
}
```
Use the ask price as reference.

### Weekend Price
Over the weekend the REST API does not return any price, but we can request the price of a certain moment before the market close (as ex: the closing price of Friday).

Due to unavailability of price feed for foreign exchange rates over the weekend, tokenholders and users will be using the latest known price, before the market close on Friday, which essentially is the closing price of the asset from Friday. Same goes in a case of a liquidation process - the liquidator should use the last price from Friday in order to match with the price on which a synthetic asset was created, if it was created over the weekend. If not the closing price on Friday for a certain asset should be a navigating point in calculating the collateralization ratio of a position and in the liquidation process.

If a request timestamp takes place on a weekend or any other day the Forex market is closed, voters should use the latest tick as the price. For the weekend that would be the closing price of the asset on Friday.

TraderMade is provided as an accessible source to query for this data, but ultimately how one queries for these rates should be varied and determined by the voter to ensure that there is no central point of failure.

### Price Feeds
Liquidation and dispute bots should have their own subscription to price feeds. Our price-feed provider’s API documentation can be found [here](https://marketdata.tradermade.com/documentation).

In the case of a TraderMade outage voters can turn to any other available price feed API or a broker API, as the price feeds for the forementioned financial assets does not differ much between different providers. There might be some slight differences, however they are quite insignificant and would not affect the liquidation or dispute processes. 


## Security Considerations
Adding these new identifiers by themselves pose little security risk to the DVM or priceless financial contract users. However, anyone deploying a new priceless token contract referencing this identifier should take care to parameterize the contract appropriately to avoid the loss of funds for synthetic token holders. Additionally, the contract deployer should ensure that there is a network of liquidators and disputers ready to perform the services necessary to keep the contract solvent.

 $UMA-holders should evaluate the ongoing cost and benefit of supporting price requests for this identifier and also contemplate de-registering this identifier if security holes are identified.
 
 While the price of CNYUSD or any other forex pair does not vary much across various price feed during the weekday, it may be more challenging to get a unified price feed on the weekend: first, while the underlying market is not closed, most of the broker and banks feeding the APIs price feed are; then, for the one providing a price feed, they often add a very big spread, which makes the price of forex pairs vary significantly by source; a way to mitigate it is to use the last price known.

A consequence to this is the existence of gaps between the last quote on Friday to the first one on Sunday; while such gaps rarely exceed +/-2%, which should not put in danger the collateralization ratio, an exceptional event happening the weekend may create a bigger gap and could, in theory, endanger the collateral ratio; yet, it is very unlikely to see +/-20% gap on CNY/USD, but it is in theory possible. Nevertheless, due to gaps, a larger number of liquidation and disputes may arise on Sunday 9 pm UTC if the collateral ratio was already getting weaker before the week’s end. In order to mitigate this theoretical risk a high collateralization requirement (120%+) should be set or a reserve fund mechanism should be implemented in order to automatically rebalance the collateralization ratio above 100% (in case it falls below 100%), thus making the liquidation process profitable again.

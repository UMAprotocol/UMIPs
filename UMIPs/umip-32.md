## Headers
| UMIP-32     |                                                                                                                                          |
|------------|------------------------------------------------------------------------------------------------------------------------------------------|
| UMIP Title | Add CNYUSD as a price identifier              |
| Authors    | Shankai Ji, jishankai@gmail.com |
| Status     | Approved                                                                                                                                  |
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
- Price Steps: 0.00001 (5 decimals in more general trading format)
- Date Source: TraderMade
- Input Processing: None. Human intervention in extreme circumstances where the result differs from broad market consensus.
- Rounding: Closest, 0.5 up
- Pricing Interval: 10 minutes
- Dispute timestamp rounding: down
- Scaling Decimals: 18


## Rationale
Prices are primarily used by Priceless contracts to calculate a synthetic token’s redemptive value in case of liquidation or expiration. Contract counterparties also use the price index to ensure that sponsors are adequately collateralized. 

TraderMade has adequate CNYUSD data and has been used as a data source in previous price identifiers.

TraderMade’s price feed is an aggregated feed from multiple Tier One and Two Banks, Market-Makers and Data Providers. They are popular with Quantitative Traders, Fintech companies and Institutional customers who require a high quality and trusted feed.


## Implementation
The value of this identifier for a given timestamp should be determined by querying for the price of CNYUSD from TraderMade.com for that timestamp. More specifically, users can use this endpoint.

```
https://marketdata.tradermade.com/api/v1/minute_historical?currency=CNYUSD&date_time=2020-11-11-13:50&api_key={apikey}
```

Historical CNYUSD prices from TraderMade are available on 10 minute increments. Price requests should use the minute price that is nearest and earlier than the price request timestamp. To do this, voters should use the open price of the OHLC period that the price request timestamp falls in. TraderMade endpoints are queried based on the OHLC period's close time.

As an example, a request for a CNYUSD price at 2020-11-11-01:42:16 should use query for the period ending at 2020-11-11-01:50:00 and use the open price.

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
Voters should use the `open` price and round to 5 decimals to get the CNYUSD result.

It should be noted that requests that do not fall on the 10 minute interval do not return data. Voters should round time up to the closest 10 minute interval if they request the price which doesn't fall on the 10 minute interval.

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

### Weekend & Holiday Prices
For price requests that happen in time periods when the FX market is not open (weekends and certain holidays), voters will need to use the last available price before the price request timestamp. As an example, a voter should use the Friday CNYUSD closing price for a price request that happens in off-market hours on a Saturday.

Please note that this is different than the normal calculation process, which requires using the open price of the period that the price request falls in.

### Price Feeds
Liquidation and dispute bots should have their own subscription to price feeds. Our price-feed provider’s API documentation can be found [here](https://marketdata.tradermade.com/documentation). A reference TraderMade implementation that is used by liquidator and dispute bots can be seen [here](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/TraderMadePriceFeed.js).

In the case of a TraderMade outage voters can turn to any other available price feed API or a broker API, as the price feeds for the forementioned financial assets does not differ much between different providers. There might be some slight differences, however they are quite insignificant and would not affect the liquidation or dispute processes. 


## Security Considerations
Adding these new identifiers by themselves pose little security risk to the DVM or priceless financial contract users. However, anyone deploying a new priceless token contract referencing this identifier should take care to parameterize the contract appropriately to avoid the loss of funds for synthetic token holders. Additionally, the contract deployer should ensure that there is a network of liquidators and disputers ready to perform the services necessary to keep the contract solvent.

$UMA-holders should evaluate the ongoing cost and benefit of supporting price requests for this identifier and also contemplate de-registering this identifier if security holes are identified.
 
While the price of CNYUSD or any other forex pair does not vary much across various price feed during the weekday, it may be more challenging to get a unified price feed on the weekend: first, while the underlying market is not closed, most of the broker and banks feeding the APIs price feed are; then, for the one providing a price feed, they often add a very big spread, which makes the price of forex pairs vary significantly by source; a way to mitigate it is to use the last price known.

A consequence to this is the existence of gaps between the last quote on Friday to the first one on Sunday; while such gaps rarely exceed +/-2%, which should not put in danger the collateralization ratio, an exceptional event happening the weekend may create a bigger gap and could, in theory, endanger the collateral ratio; yet, it is very unlikely to see +/-20% gap on CNY/USD, but it is in theory possible. Nevertheless, due to gaps, a larger number of liquidation and disputes may arise on Sunday 9 pm UTC if the collateral ratio was already getting weaker before the week’s end. In order to mitigate this theoretical risk a high collateralization requirement (120%+) should be set or a reserve fund mechanism should be implemented in order to automatically rebalance the collateralization ratio above 100% (in case it falls below 100%), thus making the liquidation process profitable again.

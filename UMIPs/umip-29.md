## Headers
| UMIP-29     |                                                                                                                                          |
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
- Price Steps: 0.0001 (4 decimals in more general trading format)
- Date Source: TraderMade
- Input Processing: None. Human intervention in extreme circumstances where the result differs from broad market consensus.
- Rounding: Closest, 0.5 up
- Pricing Interval: 60 seconds
- Dispute timestamp rounding: down


## Rationale
Prices are primarily used by Priceless contracts to calculate a synthetic token’s redemptive value in case of liquidation or expiration. Contract counterparties also use the price index to ensure that sponsors are adequately collateralized. 

TraderMade has adequate CNYUSD data and has been used as a data source in previous price identifiers.

Tradermade’s price feed is an aggregated feed from multiple Tier One and Two Banks, Market-Makers and Data Providers. They are popular with Quantitative Traders, Fintech companies and Institutional customers who require a high quality and trusted feed.


## Implementation

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

From briefly playing around with this, it should be noted that requests that do not fall on the 10 minute interval do not return data. 

There is also an hourly granularity endpoint here: 
```
https://marketdata.tradermade.com/api/v1/hour_historical?currency=CNYUSD&date_time=2020-10-10-13:00&api_key={apikey}
```

The response is:
```
{
  "close": 0.1493, 
  "currency": "CNYUSD", 
  "date_time": "2020-10-09-13:00", 
  "endpoint": "hour_historical", 
  "high": 0.1493, 
  "low": 0.1493, 
  "open": 0.1493, 
  "request_time": "Tue, 29 Dec 2020 11:59:02 GMT"
}
```

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

### Weekend Price
Over the weekend the REST API does not return any price, but we can request the price of a certain moment before the market close (as ex: the closing price of Friday).

Due to unavailability of price feed for foreign exchange rates over the weekend, tokenholders and users will be using the latest known price, before the market close on Friday, which essentially is the closing price of the asset from Friday. Same goes in a case of a liquidation process - the liquidator should use the last price from Friday in order to match with the price on which a synthetic asset was created, if it was created over the weekend. If not the closing price on Friday for a certain asset should be a navigating point in calculating the collateralization ratio of a position and in the liquidation process.

If a request timestamp takes place on a weekend or any other day the Forex market is closed, voters should use the latest tick as the price. For the weekend that would be the closing price of the asset on Friday.


## Security Considerations
Adding these new identifiers by themselves pose little security risk to the DVM or priceless financial contract users. However, anyone deploying a new priceless token contract referencing this identifier should take care to parameterize the contract appropriately to avoid the loss of funds for synthetic token holders. Additionally, the contract deployer should ensure that there is a network of liquidators and disputers ready to perform the services necessary to keep the contract solvent.

 $UMA-holders should evaluate the ongoing cost and benefit of supporting price requests for this identifier and also contemplate de-registering this identifier if security holes are identified.

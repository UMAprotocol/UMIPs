## Headers
| UMIP-26    |                                                          |
|------------|----------------------------------------------------------|
| UMIP Title | Add XAUPERL and XAUUSD as supported price identifiers    |
| Authors    | CY (cy@perlin.net)                                       |
| Status     | Approved                                                    |
| Created    | December 14, 2020                                        |

## Summary
The DVM should support price requests for the XAUPERL and XAUUSD price indices.

## Motivation
The DVM currently does not support the XAUPERL or XAUUSD price indices.

### Cost: 
* Pricing of XAUPERL does not exist anywhere yet, but it can be done by dividing XAUUSD price by PERLUSD.

* Pricing of PERLUSD is easily accessible through open centralized exchange APIs. PERL is currently only trading on Binance as outlined in [umip-13](./umip-13.md)

* XAU is referred to gold in troy ounce traded on various exchanges. Pricing of XAUUSD is accessible from data provider’s APIs.

### Opportunity: 

* A synthetic token that tracks the underlying assets would enable better price discovery by making it possible to have cash/PERL settled position on the underlying assets. It could be used as a hedging tool.

## Technical Specification
The definition of this identifier should be:
* Identifier name: XAUPERL
* Base Currency: XAU (troy ounce)
* Quote Currency: PERL
* Source: https://marketdata.tradermade.com
* Result Processing: XAUUSD[Tradermade API] is divided by PERLUSD(T)[Binance].
* Input Processing: None. Human intervention in extreme circumstances where the result differs from broad market consensus.
* Price Steps: 0.00001 (5 decimals in more general trading format)
* Rounding: Closest, 0.5 up
* Pricing Interval: 60 seconds
* Dispute timestamp rounding: down
* Scaling Decimals: 18 (1e18)

 And

* Identifier name: XAUUSD
* Base Currency: XAU (troy ounce)
* Quote Currency: USD
* Source: https://marketdata.tradermade.com
* Result Processing: XAUUSD[Tradermade API].
* Input Processing: None. Human intervention in extreme circumstances where the result differs from broad market consensus.
* Price Steps: 0.00001 (5 decimals in more general trading format)
* Rounding: Closest, 0.5 up
* Pricing Interval: 60 seconds
* Dispute timestamp rounding: down
* Scaling Decimals: 18 (1e18)

## Implementation
The value of the XAUUSD or XAUPERL identifier for a given timestamp should be determined by querying for the price of XAUUSD from Tradermade’s API for that timestamp. To determine the value of XAUPERL, the price of PERLUSDT will also need to be queried from Binance for that timestamp.

Historical XAUUSD prices from TraderMade are available on minute increments. Price requests should use the minute price that is nearest and earlier than the price request timestamp. To do this, voters should use the open price of the OHLC period that the price request timestamp falls in. TraderMade endpoints are queried based on the OHLC period's close time.

As an example, a request for a XAUUSD price at 2020-11-11-01:52:16 should use query for the period ending at 2020-11-11-01:53:00 and use the open price. 

The TraderMade endpoint used would be: https://marketdata.tradermade.com/api/v1/minute_historical?currency=XAUUSD&date_time=2020-11-11-01:53&api_key=apikey

If querying for the XAUUSD price, this open price rounded to 5 decimals should be returned as the value of XAUUSD. If XAUUSD is being used in the XAUPERL calculation, this result should be left as is.

After querying the price of XAUUSD and PERLUSD at the timestamp, XAUUSD is divided by PERLUSD to get XAUPERL and rounded to 5 decimals. This is the settlement price voters should look for.

TraderMade’s price feed is an aggregated feed from multiple Tier One and Two Banks, Market-Makers and Data Providers. They are popular with Quantitative Traders, Fintech companies and Institutional customers who require a high quality and trusted feed.

Liquidation and dispute bots should have their own subscription to price feeds. TraderMade's API documentation can be found [here](https://marketdata.tradermade.com/documentation). A reference TraderMade implementation that is used by liquidator and dispute bots can be seen [here](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/TraderMadePriceFeed.js).

### Weekend & Holiday Prices
For price requests that happen in time periods when the FX market is not open (weekends and certain holidays), voters will need to use the last available price before the price request timestamp. As an example, a voter should use the Friday XAUUSD closing price for a price request that happens in off-market hours on a Saturday.

Please note that this is different than the normal calculation process, which requires using the open price of the period that the price request falls in.

## Security considerations
Adding this new identifier by itself poses little security risk to the DVM or priceless financial contract users. However, anyone deploying a new priceless token contract referencing this identifier should take care to parameterize the contract appropriately to the reference asset’s volatility and liquidity characteristics to avoid the loss of funds for synthetic token holders. Additionally, the contract deployer should ensure that there is a network of liquidators and disputers ready to perform the services necessary to keep the contract solvent.

$UMA-holders should evaluate the ongoing cost and benefit of supporting price requests for this identifier and also contemplate de-registering this identifier if security holes are identified. As noted above, $UMA-holders should also consider re-defining this identifier as liquidity in the underlying asset changes, or if added robustness (eg via TWAPs) are necessary to prevent market manipulation.
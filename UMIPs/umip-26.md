## Headers
| UMIP-26    |                                                          |
|------------|----------------------------------------------------------|
| UMIP Title | Add XAUPERL and XAUUSD as supported price identifiers    |
| Authors    | CY (cy@perlin.net)                                       |
| Status     | Final                                                    |
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

## Implementation
The value of the XAUUSD or XAUPERL identifier for a given timestamp should be determined by querying for the price of XAUUSD from Tradermade’s API for that timestamp. To determine the value of XAUPERL, the price of PERLUSDT will also need to be queried from Binance for that timestamp.

Users can query “https://marketdata.tradermade.com/api/v1/minute_historical?currency=XAUUSD&date_time=2020-11-11-13:01&api_key=apikey” and use the close price as reference.

This close price rounded to 5 decimals is the value of XAUUSD.

After querying the price of XAUUSD and PERLUSD at the timestamp, XAUUSD is divided by PERLUSD to get XAUPERL and leave the result as is. This is the settlement price voters should look for.

Tradermade’s price feed is an aggregated feed from multiple Tier One and Two Banks, Market-Makers and Data Providers. They are popular with Quantitative Traders, Fintech companies and Institutional customers who require a high quality and trusted feed.

Liquidation and dispute bots should have their own subscription to price feeds. Our price-feed provider’s API documentation can be found [here](https://marketdata.tradermade.com/documentation).

## Security considerations
Adding this new identifier by itself poses little security risk to the DVM or priceless financial contract users. However, anyone deploying a new priceless token contract referencing this identifier should take care to parameterize the contract appropriately to the reference asset’s volatility and liquidity characteristics to avoid the loss of funds for synthetic token holders. Additionally, the contract deployer should ensure that there is a network of liquidators and disputers ready to perform the services necessary to keep the contract solvent.

$UMA-holders should evaluate the ongoing cost and benefit of supporting price requests for this identifier and also contemplate de-registering this identifier if security holes are identified. As noted above, $UMA-holders should also consider re-defining this identifier as liquidity in the underlying asset changes, or if added robustness (eg via TWAPs) are necessary to prevent market manipulation.
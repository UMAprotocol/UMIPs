## Headers
| UMIP-31    |                                                          |
|------------|----------------------------------------------------------|
| UMIP Title | Add EURUSD, CHFUSD and GBPUSD as price identifiers       |
| Authors    | Pascal Tallarida (pascal@jarvis.network)                 |
| Status     | Draft                                                    |
| Created    | December 21, 2020                                        |

## Summary
The DVM should support price requests for the EUR/USD, GBP/USD and CHF/USD price index.

## Motivation
The DVM currently does not support the EURUSD, GBPUSD and CHFUSD index.

### Cost: 
While Forex data are free through open centralized exchange, brokers, and other sources APIs, the most reliable are paid. We propose to use TraderMade's APIs whose pricing is accessible on their website.

### Opportunity: 
Synthetic tokens that track Forex pairs suche as EURUSD GBPUSD and CHFUSD could be used both for speculationt and hedging, but we see a bigger opportunity for using them as building blocks for helping other DeFi protocols and dApp addressing the european market.

## Technical Specification
The definition of this identifier should be:
Identifier name: EUR/USD-1e18
Base Currency: EUR
Quote Currency: USD

AND

Identifier name: GBP/USD-1e18
Base Currency: GBP
Quote Currency: USD

AND

Identifier name: CHF/USD-1e18
Base Currency: CHF
Quote Currency: USD

Source: https://marketdata.tradermade.com
Result Processing: Median
Input Processing: None. Human intervention in extreme circumstances where the result differs from broad market consensus.
Price Steps: 0.0001 (4 decimals in more general trading format)
Rounding: Closest, 0.0001 up
Decimal: 18 (1e18)
Pricing Interval: 60 seconds
Dispute timestamp rounding: down

## Rationale
Apart from the weekend, there is little to no difference in prices on liquid major Forex pairs like EURUSD, so any price feed could be used; however, for convenience, we recommend using the one of TraderMade.

## Implementation
The value of this identifier for a given timestamp should be determined by querying for the price of EURUSD, GBPUSD and CHFUSD from TraderMade.com for that timestamp. More specifically, users can query “https://marketdata.tradermade.com/api/v1/minute_historical?currency=EURUSD&date_time=2020-11-11-13:01&api_key=apikey” and use the close price as reference. 

Tradermade’s price feed is an aggregated feed from multiple Tier One and Two Banks, Market-Makers and Data Providers. They are popular with Quantitative Traders, Fintech companies and Institutional customers who require a high quality and trusted feed.

Yet, theur REST API does not work when the Forex market is closed, eem to work on Sunday even though the market opens at 10 pm london time (I asked them). The API just returns the friday OHLC

As most of the price feed does not provide a price for CHFUSD but USDCHF, the value of this identifier will undergo one additional step: CHFUSD = 1/USDCDF.  Token holders should take care to confirm that the order of the quote and base currency they refer to matches the one being requested by the DVM in the event of a price request.
Ultimately, how one queries the exchanges should be varied and determined by the voter to ensure that there is no central point of failure.
While it's important for tokenholders to have redundancy in their sources, bots and users that interact with the system in realtime need fast sources of price information. In these cases, it can be assumed that the exchange median is accurate enough

Liquidation and dispute bots should have their own subscription to price feeds. Our price-feed provider’s API documentation can be found [here](https://marketdata.tradermade.com/documentation).

## Security considerations
Adding this new identifier by itself poses a little security risk to the DVM or priceless financial contract users. However, anyone deploying a new priceless token contract referencing this identifier should take care to parameterize the contract appropriately to avoid the loss of funds for synthetic token holders. Additionally, the contract deployer should ensure that there is a network of liquidators and disputers ready to perform the services necessary to keep the contract solvent.

While the price of EURUSD does not vary much across various price feed during the weekday, it may be more challenging to get a unified price feed on the weekend: first, while the underlying market is not closed, most of the broker and banks feeding the APIs price feed are; then, for the one providing a price feed, they often add a very big spread, which makes the price of forex pairs vary significantly by source; a way to mitigate it is to use the last price known. 

A consequence to this is the existence of gaps between the last quote on Friday to the first one on Sunday; while such gaps rarely exceed +/-2%, which should not put in danger the collateralization ratio, an exceptional event happening the weekend may create a bigger gap and could, in theory, endanger the collateral ratio; yet, it is very unlikely to see +/-20% gap on EURUSD, but it is in theory possible. Nevertheless, due to gaps, a larger number of liquidation and disputes may arise on Sunday 9 pm UTC if the collateral ratio was already getting weaker before the week’s end.

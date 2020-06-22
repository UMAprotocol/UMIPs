# Headers
| UMIP-5     |                                                                                                                                          |
|------------|------------------------------------------------------------------------------------------------------------------------------------------|
| UMIP Title | Add COMP/USD as a price identifier                                                                                                 |
| Authors    | Allison Lu, allison@umaproject.org |
| Status     | Final                                                                                                                                    |
| Created    | June 19, 2020                                                                                                                           |

## Summary (2-5 sentences)
The DVM should support price requests for the $COMP/USD price index. 

## Motivation
The DVM currently does not support the $COMP/USD index.

Cost: Pricing for this index is easy to access through open centralized exchange APIs. Current liquidity is low, and cross-exchange price discrepancies are 5%+. Over time, as more $COMP supply becomes available, we anticipate that cross-exchange price discrepancies will be reduced.

Opportunity: A synthetic token that tracks $COMP would enable better price discovery by making it possible to short $COMP. It could be used as a hedging tool. It also increases yield for $COMP holders (who could sell $COMP to buy synthetic $COMP when there are negative funding rates to do so).

## Technical Specification

The definition of this identifier should be:
- Identifier name: COMPUSD
- Base Currency: USD(T)
- Quote Currency: COMP
- Exchanges: Coinbase Pro (COMPUSD), Poloniex (COMPUSDT), FTX (COMPUSD)
- Result Processing: Median
- Input Processing: None. Human intervention in extreme circumstances where the result differs from broad market consensus.
- Price Steps: 0.00001 (5 decimals in more general trading format)
- Rounding: Closest, 0.5 up
- Pricing Interval: 60 seconds
- Dispute timestamp rounding: down

As of the time of writing, the Coinbase Pro market for $COMPUSD is not yet live, though it is expected to go live on Monday, June 22, 2020. Until the Coinbase Pro market officially goes live and starts trading, the technical specification of this identifier is to take the median of available exchanges (eg Poloniex COMPUSDT and FTX COMPUSD). Once Coinbase Pro is live and stable, the technical specification of this identifier will be the median across Coinbase Pro, Poloniex, and FTX.

## Rationale
Prices are primarily used by Priceless contracts to calculate a synthetic token’s redemptive value in case of liquidation or expiration. Contract counterparties also use the price index to ensure that sponsors are adequately collateralized. 

More complex computations (like incorporating additional exchanges, calculating a TWAP or VWAP, or imposing price bands, etc.) have the potential to add a greater level of precision and robustness to the definition of this identifier, particularly at settlement of each expiring synthetic token. However, we felt that the costs in increased complexity and mental load to the stakeholders who need to use it (like sponsors, liquidators, and disputers) outweighed the benefits, especially during this period where the $COMP token is newly launched and being listed on additional exchanges. 

Currently the only exchanges with USD or stablecoin markets for $COMP are Coinbase (as of Monday, June 22), FTX, and Poloniex. The price discrepancy across exchanges can be high since $COMP is a low liquidity token. Over time, as liquidity in the $COMP token migrates across platforms, this identifier can be re-defined to add exchanges, remove exchanges, or change the way that the price is calculated. Any re-definition would be done via off-chain social consensus by $UMA-holders, and ultimately reflected in the way that $UMA-holders vote upon the price of $COMPUSD when called to do so by disputers, or at settlement.


## Implementation

The value of this identifier for a given timestamp should be determined by querying for the price of COMPUSD(T) from Coinbase, FTX, and Poloniex for that timestamp, taking the median, and determining whether that median differs from broad market consensus. This is meant to be vague as the $UMA tokenholders are responsible for defining broad market consensus.

Ultimately, how one queries the exchanges should be varied and determined by the voter to ensure that there is no central point of failure.

While it's important for tokenholders to have redundancy in their sources, bots and users that interact with the system in realtime need fast sources of price information. In these cases, it can be assumed that the exchange median is accurate enough.

[Here](https://github.com/UMAprotocol/protocol/blob/master/financial-templates-lib/price-feed/CryptoWatchPriceFeed.js)
is a reference implementation for an offchain price feed based on the
[CryptoWatch API](https://docs.cryptowat.ch/rest-api/). This feed should be used as a convenient
way to query the price in realtime, but should not be used as a canonical source of truth for
voters. Users are encouraged to build their own offchain price feeds that depend on other sources.

## Security considerations
Adding this new identifier by itself poses little security risk to the DVM or priceless financial contract users. However, anyone deploying a new priceless token contract referencing this identifier should take care to parameterize the contract appropriately to the reference asset’s volatility and liquidity characteristics to avoid the loss of funds for synthetic token holders. Additionally, the contract deployer should ensure that there is a network of liquidators and disputers ready to perform the services necessary to keep the contract solvent.

$UMA-holders should evaluate the ongoing cost and benefit of supporting price requests for this identifier and also contemplate de-registering this identifier if security holes are identified. As noted above, $UMA-holders should also consider re-defining this identifier as liquidity in the underlying asset changes, or if added robustness (eg via TWAPs) are necessary to prevent market manipulation. 

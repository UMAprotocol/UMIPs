## Headers
| UMIP-13    |                                                                                                                                          |
|------------|------------------------------------------------------------------------------------------------------------------------------------------|
| UMIP Title | Add PERLUSD as price identifiers              |
| Authors    | TJ (tj@perlin.net) |
| Status     | Draft                                                                                                                                    |
| Created    | August 31, 2020                                                                                                                           |

## Summary (2-5 sentences)
The DVM should support price requests for the PERL/USD price index.

## Motivation
The DVM currently does not support the PERLUSD price index.
Cost: 
Pricing of PERLUSD is easily accessible through open centralized exchange APIs. PERL is currently only trading on Binance.
Opportunity: A synthetic token that tracks the underlying assets would enable better price discovery by making it possible to have cash/PERL settled position on the underlying assets. It could be used as a hedging tool.
More information on the Perlin products can be found on the website: https://perlinx.finance/

## Technical Specification
The definition of this identifier should be:
- Identifier name: PERLUSD
- Base Currency: PERL
- Quote Currency: USD(T)
- Exchanges: Binance, PerlinX
- Result Processing: No processing.
- Input Processing: None. Human intervention in extreme circumstances where the result differs from broad market consensus.
- Price Steps: 0.00001 (5 decimals in more general trading format)
- Rounding: Closest, 0.5 up
- Pricing Interval: 60 seconds
- Dispute timestamp rounding: down



## Rationale

Prices are primarily used by Priceless contracts to calculate a synthetic token’s redemptive value in case of liquidation or expiration. Contract counterparties also use the price index to ensure that sponsors are adequately collateralized.
More complex computations (like incorporating additional exchanges, calculating a TWAP or VWAP, or imposing price bands, etc.) have the potential to add a greater level of precision and robustness to the definition of this identifier, particularly at settlement of each expiring synthetic token. However, we felt that the costs in increased complexity and mental load to the stakeholders who need to use it (like sponsors, liquidators, and disputers) outweighed the benefits, especially during this period where the synthetic  token is newly launched.
Currently the only exchanges with USD or stablecoin markets for $PERL is Binance. This may introduce a single point of failure. The price from PerlinX can be used as a reference if Binance goes down, and a backup data source is needed. However during normal operation, the price of PERL on PerlinX should closely track the value on Binance.

In the current setting, there will need to be a significant event that erodes confidence in Perlin Network and the token, at the same time where Binance is not operational for value on PerlinX to be used as reference. However this may pose a security issue depending on the depth of PERLUSD liquidity on PerlinX. This may be improved by listing on additional exchanges with genuine volume.

Over time, as liquidity in the $PERL token migrates across platforms, this identifier can be re-defined to add exchanges, remove exchanges, or change the way that the price is calculated. Any re-definition would be done via off-chain social consensus by $UMA-holders, and ultimately reflected in the way that $UMA-holders vote upon the price of $PERLUSD when called to do so by disputers, or at settlement.


## Implementation

The value of this identifier for a given timestamp should be determined by querying for the price of PERLUSDT from Binance for that timestamp. While PERL is also trading on several other exchanges, most of the genuine volume happens on Binance, which forms the broad market consensus. 
While it's important for tokenholders to have redundancy in their sources, bots and users that interact with the system in realtime need fast sources of price information. In these cases, it can be assumed that the price on Binance is accurate enough.
[Here](https://github.com/UMAprotocol/protocol/blob/master/financial-templates-lib/price-feed/CryptoWatchPriceFeed.js) is a reference implementation for an offchain price feed based on the [CryptoWatch API](https://docs.cryptowat.ch/rest-api/). This feed should be used as a convenient way to query the price in realtime, but should not be used as a canonical source of truth for voters. Users are encouraged to build their own offchain price feeds that depend on other sources.

PerlinX will provide the live price feed on the website publicly, and may offer API access in the future.

## Security considerations
Adding this new identifier by itself poses little security risk to the DVM or priceless financial contract users. However, anyone deploying a new priceless token contract referencing this identifier should take care to parameterize the contract appropriately to the reference asset’s volatility and liquidity characteristics to avoid the loss of funds for synthetic token holders. Additionally, the contract deployer should ensure that there is a network of liquidators and disputers ready to perform the services necessary to keep the contract solvent.
$UMA-holders should evaluate the ongoing cost and benefit of supporting price requests for this identifier and also contemplate de-registering this identifier if security holes are identified. As noted above, $UMA-holders should also consider re-defining this identifier as liquidity in the underlying asset changes, or if added robustness (eg via TWAPs) are necessary to prevent market manipulation.

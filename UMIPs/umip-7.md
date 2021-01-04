## Headers
| UMIP-7     |                                                                                                                                          |
|------------|------------------------------------------------------------------------------------------------------------------------------------------|
| UMIP Title | Add BTC/USD and USD/BTC as price identifiers              |
| Authors    | Clayton Roche, clayton@umaproject.org |
| Status     | Approved                                                                                                                                    |
| Created    | July 10, 2020                                                                                                                           |

## Summary (2-5 sentences)
The DVM should support price requests for the BTC/USD and USD/BTC price indexes. 


## Motivation
The DVM currently does not support the BTC/USD or USD/BTC indexes.

Supporting the USDBTC price identifier would enable the creation of zero-coupon fixed-rate dollar loans, if collateralized by wBTC.  This creates positions similar to using wBTC in the MakerDAO system to mint Dai. To give a measure of market size at the date of writing, MakerDAO has 4,947 wBTC locked in this fashion.  

Supporting the BTCUSD price identifier would enable the creation of synthetic BTC.  It enables token minters to go levered short BTC.


## Technical Specification
The definition of these identifiers should be:

-----------------------------------------
- Identifier names: **BTCUSD**
- Base Currency: BTC
- Quote Currency: USD(T)
- Result Processing: Median

-----------------------------------------

- Identifier names: **USDBTC**
- Base Currency: USD(T)
- Quote Currency: BTC
- Result Processing: 1 / Median BTCUSD

-----------------------------------------

- Exchanges: Binance, Coinbase, Bitstamp
- Input Processing: None. Human intervention in extreme circumstances where the result differs from broad market consensus.
- Price Steps: 0.00000001 (8 decimals in more general trading format)
- Rounding: Closest, 0.5 up
- Pricing Interval: 60 seconds
- Dispute timestamp rounding: down


## Rationale
Prices are primarily used by Priceless contracts to calculate a synthetic token’s redemptive value in case of liquidation or expiration. Contract counterparties also use the price index to ensure that sponsors are adequately collateralized. 

UMIP #2 for ETHBTC used Coinbase, Binance, and Bitstamp.  Repeated analysis showed these same exchanges have the highest reputable volume for BTCUSD.  

Binance and Coinbase are both USD pairs, and Bitstamp is an USDT pair.  Including any Tether pair means the prices could change due to the price of Tether.  However, we decided that these two factors sufficiently mitigate this risk: the purpose of the DVM is to give token holders leeway to evaluate events, such as this, and adjust the price response accordingly.  This is adequately captured by the language "determining whether that median differs from broad market consensus."  Second, the USDT price could only have the effect of pulling the median towards the higher or lower of the 2 USD pairs, or it could fall right in between them.  For this reason we believe the USDT concern is sufficiently handled  

We also considered an alternative set of exchanges.  However, based on reports from Bitwise, Cointelegraph, and other news reports, we believe that many crypto exchange volumes had been overreported in the past and the three that we selected had some of the highest genuine volumes in the industry.


## Implementation

The value BTCUSD for a given timestamp should be determined by querying for the price from Coinbase, Bitstamp, and Binance for that timestamp, taking the median, and determining whether that median differs from broad market consensus. This is meant to be vague as the tokenholders are responsible for defining broad market consensus.

The value of USDBTC will follow the exact same process but undergo one additional step: it will be the result of dividing 1/BTCUSD.  

Ultimately, how one queries the exchanges should be varied and determined by the voter to ensure that there is no central point of failure.

While it's important for tokenholders to have redundancy in their sources, bots and users that interact with the system in real time need fast sources of price information. In these cases, it can be assumed that the exchange median is accurate enough.


[Here](https://github.com/UMAprotocol/protocol/blob/master/financial-templates-lib/price-feed/CryptoWatchPriceFeed.js)
is a reference implementation for an offchain price feed based on the
[CryptoWatch API](https://docs.cryptowat.ch/rest-api/). This feed should be used as a convenient
way to query the price in realtime, but should not be used as a canonical source of truth for
voters. Users are encouraged to build their own offchain price feeds that depend on other sources.

## Security considerations
Adding these new identifiers by themselves pose little security risk to the DVM or priceless financial contract users. However, anyone deploying a new priceless token contract referencing this identifier should take care to parameterize the contract appropriately to avoid the loss of funds for synthetic token holders. Additionally, the contract deployer should ensure that there is a network of liquidators and disputers ready to perform the services necessary to keep the contract solvent.
 
There is very high liquidity across these pairs, as well as many resources for UMA holders to access in the event they need to determine broad market consensus due to an issue on any of the exchanges.  For this same reason, there is not much potential for profitable market manipulation relating to these price identifiers.

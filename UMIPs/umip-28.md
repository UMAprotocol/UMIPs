## Headers
| UMIP-28     |                                                                                                                                          |
|------------|------------------------------------------------------------------------------------------------------------------------------------------|
| UMIP Title | Add CNYUSD, USDCNY as price identifiers              |
| Authors    | Shankai Ji, jishankai@quarkchain.org |
| Status     | Draft                                                                                                                                  |
| Created    | December 16, 2020                                                                                                                           |

## Summary (2-5 sentences)
The DVM should support price requests for the CNY/USD and USD/CNY price indexes. 


## Motivation
The DVM currently does not support the CNY/USD or USD/CNY indexes.

Supporting the CNYUSD price identifier would enable the creation of a Chinese Yuan FX derivative, backed by USD. Token minters could go short on the CNY/USD index, while token holders could go long or use synthetic fxCNY for functional purposes.

There is little cost associated with adding this price identifier, as there are multiple free and easily accessible data sources available.

## Technical Specification
The definition of these identifiers should be:

-----------------------------------------
- Identifier names: **CNYUSD**
- Base Currency: CNY
- Quote Currency: USD(T)
- Result Processing: Median
-----------------------------------------
- Identifier names: **USDCNY**
- Base Currency: USD(T)
- Quote Currency: CNY 
- Result Processing: 1 / Median CNYUSD
-----------------------------------------

- Exchanges: Binance, Coinbase, Coingecko,
- Input Processing: None. Human intervention in extreme circumstances where the result differs from broad market consensus.
- Price Steps: 0.000001 (6 decimals in more general trading format)
- Rounding: Closest, 0.5 up
- Pricing Interval: 60 seconds
- Dispute timestamp rounding: down


## Rationale
Prices are primarily used by Priceless contracts to calculate a synthetic token’s redemptive value in case of liquidation or expiration. Contract counterparties also use the price index to ensure that sponsors are adequately collateralized. 

Binance and Coinbase are top exchanges of the world. They are used by most of the price identifieres of UMA. Luckily, we can get CNY/USD(T) price by their apis and it will be easy to add this price identifier.

Coingecko is not an exchange but provides free apis to check crypto prices and widely used. We also can get CNY/USD(T) by its api easily. 

## Implementation

The value of this identifier for a given timestamp should be determined by querying for the price from Coinbase, Coingecko, and Binance for that timestamp, taking the median, and determining whether that median differs from broad market consensus. This is meant to be vague as the tokenholders are responsible for defining broad market consensus.

The value of USDCNY will follow the exact same process but undergo one additional step: it will be the result of dividing 1/CNYUSD.  

Ultimately, how one queries the exchanges should be varied and determined by the voter to ensure that there is no central point of failure.

While it's important for tokenholders to have redundancy in their sources, bots and users that interact with the system in real time need fast sources of price information. In these cases, it can be assumed that the exchange median is accurate enough.


[Here](https://github.com/UMAprotocol/protocol/blob/master/financial-templates-lib/price-feed/CryptoWatchPriceFeed.js)
is a reference implementation for an offchain price feed based on the
[CryptoWatch API](https://docs.cryptowat.ch/rest-api/). This feed should be used as a convenient
way to query the price in realtime, but should not be used as a canonical source of truth for
voters. Users are encouraged to build their own offchain price feeds that depend on other sources.

## Security considerations
Adding these new identifiers by themselves pose little security risk to the DVM or priceless financial contract users. However, anyone deploying a new priceless token contract referencing this identifier should take care to parameterize the contract appropriately to avoid the loss of funds for synthetic token holders. Additionally, the contract deployer should ensure that there is a network of liquidators and disputers ready to perform the services necessary to keep the contract solvent.

 $UMA-holders should evaluate the ongoing cost and benefit of supporting price requests for this identifier and also contemplate de-registering this identifier if security holes are identified.

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
- Result Processing: 1 / Average USDCNY
-----------------------------------------
- Identifier names: **USDCNY**
- Base Currency: USD(T)
- Quote Currency: CNY 
- Result Processing: Average
-----------------------------------------

- Exchanges: Coinbase, Coingecko.
- Input Processing: None. Human intervention in extreme circumstances where the result differs from broad market consensus.
- Price Steps: 0.000001 (6 decimals in more general trading format)
- Rounding: Closest, 0.5 up
- Pricing Interval: 60 seconds
- Dispute timestamp rounding: down


## Rationale
Prices are primarily used by Priceless contracts to calculate a synthetic token’s redemptive value in case of liquidation or expiration. Contract counterparties also use the price index to ensure that sponsors are adequately collateralized. 

Coinbase is a top exchange of the world. It is used by most of the price identifieres of UMA. Luckily, we can get USD(T)/CNY price by its api and it will be easy to add this price identifier.

Coingecko is not an exchange but provides free apis to check crypto prices and widely used. We can get USD(T)/CNY by its api easily.

We tried exchanges such as Binance, Gate and KuCoin. All of their apis don't support USDCNY.

We also tried CoinMarketCap which standard plan above support historical search. It's not a good choice because it needs be paid.

## Implementation

The value of USDCNY for a given timestamp should be determined by querying for the price from Coinbase and Coingecko for that timestamp, taking the average, and determining whether that average differs from broad market consensus. This is meant to be vague as the tokenholders are responsible for defining broad market consensus.

The value of CNYUSD will follow the exact same process but undergo one additional step: it will be the result of dividing 1/USDCNY.  

The chosen historical USDCNY endpoints are:

| Endpoint | Field name of price |
|------------|------------------------------------------------------------------------------------------------------------------------------------------|
| https://api.coinbase.com/v2/prices/USD-CNY/spot | *amount* |
| https://api.coingecko.com/api/v3/coins/tether/history | *current_price* |

Ultimately, how one queries the exchanges should be varied and determined by the voter to ensure that there is no central point of failure.

While it's important for tokenholders to have redundancy in their sources, bots and users that interact with the system in real time need fast sources of price information. In these cases, it can be assumed that the average is accurate enough.

## Security considerations
Adding these new identifiers by themselves pose little security risk to the DVM or priceless financial contract users. However, anyone deploying a new priceless token contract referencing this identifier should take care to parameterize the contract appropriately to avoid the loss of funds for synthetic token holders. Additionally, the contract deployer should ensure that there is a network of liquidators and disputers ready to perform the services necessary to keep the contract solvent.

 $UMA-holders should evaluate the ongoing cost and benefit of supporting price requests for this identifier and also contemplate de-registering this identifier if security holes are identified.

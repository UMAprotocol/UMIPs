## Headers
| UMIP-19     |                                                                                                                                          |
|------------|------------------------------------------------------------------------------------------------------------------------------------------|
| UMIP Title | Add ARSUSD as a price identifier              |
| Authors    | Sean Brown (sean@umaproject.org) |
| Status     | Last Call                                                                                                                                    |
| Created    | October 28, 2020                                                                                                                           |

## Summary (2-5 sentences)
The DVM should support price requests for the ARS/USD price index.


## Motivation
The DVM currently does not support the ARS/USD price index.

Supporting the ARSUSD price identifier would enable the creation of an Argentine Peso stablecoin, backed by USD. Token minters could go short on the ARS/USD index, while token holders could go long or use synthetic ARS for functional purposes.

One practical use for synthetic ARS is in trading pairs on Argentinian cryptocurrency exchanges.

There is little cost associated with adding this price identifier, as there are multiple free and easily accessible data sources available.

## Technical Specification
The definition of this identifier should be:

- Identifier name: ARSUSD
- Base Currency: ARS
- Quote Currency: USD
- Data Sources: Ripio, SatoshiTango, CoinMonitor
- Result Processing: Median. BTC/ARS to ARS/USD conversion defined in the implementation section.
- Input Processing: Human intervention in extreme circumstances where the result differs from broad market consensus.
- Price Steps: 0.000001 (6 decimals in more general trading format)
- Rounding: Closest, 0.5 up
- Pricing Interval: 300 seconds
- Dispute timestamp rounding: down

## Rationale
Prices are primarily used by Priceless contracts to calculate a synthetic token’s redemptive value in case of liquidation or expiration. Contract counterparties also use the price index to ensure that sponsors are adequately collateralized. 

ARSUSD uses Ripio, SatoshiTango and CoinMonitor for BTCARS price information. Ripio and SatoshiTango are Argentinian cryptocurrency exchanges and were chosen because they have some of the highest genuine volumes of ARS/BTC trading. CoinMonitor is a price aggregator that determines its ARS/BTC price as a result of taking the median of a group of buy and a group of sell prices from various cryptocurrency exchanges and then averaging the two. CoinMonitor was chosen as a data source because its price calculation methodology creates a good representation of what the true market rate for BTC/ARS is. All three sources offer free and publicly accessible historical BTC/ARS endpoints.

The decision, to query for BTC/ARS and ARS/USD instead of directly querying for ARS/USD, was made because the ARS/USD pair has a large variance in price reporting, caused by artificial factors. Products built with the ARSUSD price identifier are most likely to be used in Argentinian cryptocurrency exchanges, so the price identifier should use the price reflected by the highest volume crypto-native ARS trading pair.

More explicitly, the choice to use BTC/ARS over ARS/USD choice has to do with the fact that Argentina is currently under a capital restrictions scheme, where retail users and companies cannot access the official exchange rate to buy goods or services. Because of this situation, there are several USD/ARS rates currently within a ~100% spread between the official and unofficial rate. Since this rate will be used to create crypto assets, we consider the fair USD/ARS exchange rate to be the one which you can access to purchase cryptocurrencies. BTC/ARS is the pair with the majority of the trading in the country, with an estimate of 80% of the total volume, with more than 10 different brokers operating daily in the country. Correctly assessing the USD/ARS exchange rate is a complex task and probably will be even more complex in the near future. Since synthetic ARS by nature would be used in cryptocurrency transactions, the argument is that the best approach would be to have the value of synthetic ARS track the rate that a crypto user would get by exchanging ARS into BTC and then BTC into USDC (or an equivalent).

## Implementation

The value of ARSUSD for a given timestamp can be determined with the following process.

1. BTC/ARS should be queried for from the endpoints below for the given timestamp rounded to the nearest available endpoint time value. The results of these queries should be kept at the level of precision they are returned at.
2. The median of the BTC/ARS results should then be taken.
3. The inverse of the BTC/ARS mean is then taken (1/BTCARS) to determine ARS/BTC.
4. The value of BTC/USD for the same timestamp will then need to be determined by following the implementation guidelines defined in UMIP-7.
5. The values of ARS/BTC and BTC/USD will then need to be multiplied to arrive at the ARSUSD value. As specified in the ‘Technical Specification’ section, this result should be rounded to six decimal places.

The chosen historical BTC/ARS endpoints are:

| Endpoint | Field name of price |
|------------|------------------------------------------------------------------------------------------------------------------------------------------|
| https://app.ripio.com/api/v3/public/currencies/BTC/history/ARS/ | *price* |
| https://api.satoshitango.com/v3/ticker/ARS/BTC/history | *avg* |
| https://ar.coinmonitor.info/api/v4/btc_ars/?periodo=96hs | *p* |


Voters are responsible for determining if the result of this process differs from broad market consensus. This is meant to be vague as $UMA tokenholders are responsible for defining broad market consensus.

This is only a reference implementation, how one queries the exchanges should be varied and determined by the voter to ensure that there is no central point of failure.

## Security considerations
Adding this new identifier by itself poses little security risk to the DVM or priceless financial contract users. However, anyone deploying a new priceless token contract referencing this identifier should take care to parameterize the contract appropriately to avoid the loss of funds for synthetic token holders. Additionally, the contract deployer should ensure that there is a network of liquidators and disputers ready to perform the services necessary to keep the contract solvent.

$UMA-holders should evaluate the ongoing cost and benefit of supporting price requests for this identifier and also contemplate de-registering this identifier if security holes are identified.
## Headers
| UMIP - #    |                                                                                                                                          |
|------------|------------------------------------------------------------------------------------------------------------------------------------------|
| UMIP Title | Add EGLD/USD, USD/EGLD as price identifiers              |
| Authors    | Logan (Logan@opendao.io)|
| Status     | Draft                                                                                                                                 |
| Created    | February 13, 2021                                                                                                                           |
| Link to Discourse|    https://discourse.umaproject.org/t/add-egld-usd-usd-egld-price-identifiers/222                         |

## Summary 
The DVM should support price requests for the EGLD/USD and USD/EGLD price indexes.

## Motivation
The DVM currently does not support the EGLD/USD and USD/EGLD price indexes.

Supporting the EGLD/USD and USD/EGLD price identifiers would enable the creation of an EGLDO, backed with EGLD. EGLD holders can utilize the EGLDO stablecoin as a hedging tool, and could go long, or use EGLDO for other purposes. These identifiers also lay the groundwork for potential future projects. 

EGLD has a circulating supply of 17 Million EGLD coins and a max supply of 20.4 Million. Binance is the current most active market trading it, and at the time of writing has a market cap of $3,083,114,914 with a 24 hour trading volume of $604,440,356. More information on Elrond can be found on the website: https://elrond.com/

There is little cost associated with adding this price identifier, as there are multiple free and easily accessible data sources available.

## Markets and Data Sources

Markets:
- Binance, Okex, and Bitfinex should be used to construct the price.These 3 exchanges comprise a significant amount of EGLD/USDT trade volume and have available pricefeeds on Cryptowatch. 

Pairs:
- BINANCE: EGLD/USDT
- OKEX: EGLD/USDT
- BITFINEX: EGLD/USDT

Live Price Endpoints:
- BINANCE: https://api.cryptowat.ch/markets/binance/egldusdt/price
- OKEX: https://api.cryptowat.ch/markets/okex/egldusdt/price
- BITFINEX: https://api.cryptowat.ch/markets/bitfinex/egldusdt/price

Update Time:
- The lower bound on price feeds is one minute.

Historical Price Endpoints:
- BINANCE: https://api.cryptowat.ch/markets/binance/egldusdt/ohlc?after=1612880040&before=1612880040&periods=60
- OKEX: https://api.cryptowat.ch/markets/okex/egldusdt/ohlc?after=1612880040&before=1612880040&periods=60
- BITFINEX: https://api.cryptowat.ch/markets/bitfinex/egldusdt/ohlc?after=1612880040&before=1612880040&periods=60

Do these sources allow for querying up to 74 hours of historical data? 
- Yes

Is an API key required to query these sources?
- No

Is there a cost associated with usage?
- Yes

If there is a free tier available, how many queries does it allow for?
- The lower bound on the number of queries allowed per hour is 1000.

What would be the cost of sending 15,000 queries?
- Approximately $5


## Price Feed Implementation
Associated EGLD price feeds are available via Cryptowatch.  No other further feeds required.

## Technical Specifications


-----------------------------
- Price Identifier Name: EGLD/USD
- Base Currency: EGLD
- Quote currency: USD
- Intended Collateral Currency: USDC
- Collateral Decimals: 6
- Rounding: Round to nearest 6 decimal places (seventh decimal place digit >= 5 rounds up and < 5 rounds down)

-----------------------------

- Price Identifier Name: USD/EGLD
- Base Currency: USD
- Quote Currency: EGLD
- Intended Collateral Currency: EGLD
- Collateral Decimals: 18
- Rounding: Nearest 18 decimal place (nineteenth decimal place digit >= 5 rounds up and < 5 rounds down)

-------------------------------

Does the value of this collateral currency match the standalone value of the listed quote currency?: 
- YES

Is your collateral currency already approved to be used by UMA financial contracts?: 
- No. In progress. See https://github.com/UMAprotocol/UMIPs/pull/180

## Rationale
The addition of EGLD/USD and USD/EGLD fits into a larger goal of advancing the adoption of the UMA protocol by allowing eGLD to be used as collateral for minting a stable coin among a suite of OpenDAO stable coins. This furthers adoption of the protocol by encouraging a convergence of capital from different projects and increasing TVL.

Currently the most liquid exchange with USD or stablecoin markets for eGLD is Binance (~40+% volume). It is the #29 coin in terms of market cap at the time of writing and can be traded on a vast array of exchanges, including what are widely considered to be top tier platforms.

In the current setting, there will need to be a significant event that erodes confidence in Elrond and the eGLD token for it to be a security or PR concern.



## Implementation

Voters should query for the price of EGLD/USD USD/EGLD at the price request timestamp on Binance, Bitfinex and Okex. Recommended endpoints are provided in the markets and data sources section above.

When using the recommended endpoints, voters should:
1)  Use the open price of the OHLC period that the timestamp falls in.

2) Take the median of these results.

3) The median from step 2 should be rounded to six decimals to determine the EGLD/USD price.

4) The value of USD/EGLD will follow the exact same process but undergo one additional step: it will be the result of dividing 1/EGLDUSD.

For both implementations, voters should determine whether the returned price differs from broad market consensus. This is meant to provide flexibility in any unforeseen circumstances as voters are responsible for defining broad market consensus.

This is only a reference implementation, how one queries the exchanges should be varied and determined by the voter to ensure that there is no central point of failure.


## Security considerations

Adding these new identifiers by themselves poses little security risk to the DVM or priceless financial contract users, given we are discussing two of the most high liquidity and high volume assets on the market. However, anyone deploying a new priceless token contract referencing this identifier should take care to parameterize the contract appropriately to avoid the loss of funds for synthetic token holders. Additionally, the contract deployer should ensure that there is a network of liquidators and disputers ready to perform the services necessary to keep the contract solvent.

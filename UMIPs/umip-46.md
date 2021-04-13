## Headers
| UMIP-46    |                                                                                                                                          |
|------------|------------------------------------------------------------------------------------------------------------------------------------------|
| UMIP Title | Add OCEANUSD, USDOCEAN as price identifiers              |
| Authors    | Logan (Logan@opendao.io)|
| Status     | Approved                                                                                                                                 |
| Created    | January 28, 2021                                                                                                                           |
| Link to Discourse    | https://discourse.umaproject.org/t/adding-oceanusd-as-a-price-identifier/118                                                     |

## Summary (2-5 sentences)
The DVM should support price requests for the OCEAN/USD and USD/OCEAN price index. These price identifiers will serve to support OCEAN token as collateral.


## Motivation

Supporting the OCEAN/USD price identifier would enable the creation of the OceanO stablecoin, backed by OCEAN as collateral. Ocean token holders can utilize this as a hedging tool, and could go long, or use OceanO for other purposes. It also lays the groundwork for other future projects that may need to query the same price identifier. 

A platform could use this price identifier to properly determine the quantity of OCEAN required to mint a dollar-pegged OCEAN-backed stable coin. 

The supply of Ocean is capped at 1.41 billion tokens. 51% of this supply is disbursed according to a Bitcoin-like schedule over decades, to fund community projects curated by OceanDAO. At the time of writing, the Ocean token market cap is $243,700,423 in the top 100 projects with a 24-hour trading volume of $137,565,116. 

More information on the Ocean Protocol can be found on the website: https://oceanprotocol.com

## Markets and Data Sources

Binance, Bittrex, and BitZ should be used to construct the price.These 3 exchanges comprise a significant amount of OCEAN trade volume and have available pricefeeds on Cryptowatch. 


Which specific pairs should be queried from each market?
- Binance: OCEAN/USDT
- Bittrex: OCEAN/USDT
- BitZ: OCEAN/USDT


Provide recommended endpoints to query for real-time prices from each market listed.
- Binance OCEAN/USDT: https://api.cryptowat.ch/markets/binance/oceanusdt/price
- Bittrex OCEAN/USDT: https://api.cryptowat.ch/markets/bittrex/oceanusdt/price
- BitZ OCEAN/USDT: https://api.cryptowat.ch/markets/bitz/oceanusdt/price

How often is the provided price updated?
- The lower bound on the price update frequency is a minute.

Provide recommended endpoints to query for historical prices from each market listed.
- Binance: https://api.cryptowat.ch/markets/binance/oceanusdt/ohlc?after=1612880040&before=1612880040&periods=60
- Bittrex: https://api.cryptowat.ch/markets/bittrex/oceanusdt/ohlc?after=1612880460&before=1612880460&periods=60
- BitZ: https://api.cryptowat.ch/markets/bitz/oceanusdt/ohlc?after=1612880040&before=1612880040&periods=60

Do these sources allow for querying up to 74 hours of historical data?
- Yes

How often is the provided price updated?
- The lower bound on the price update frequency is a minute for Binance and BitZ
- Bittrex update frequency is 4 minutes

Is an API key required to query these sources?
- No

Is there a cost associated with usage?
- Yes

If there is a free tier available, how many queries does it allow for?
- The lower bound on the number of queries allowed per hour is >> 1000.

What would be the cost of sending 15,000 queries?
- Approximately $5


## Price Feed Implementation
Associated OCEAN price feeds are available via Cryptowatch.  No other further feeds required.



## Technical Specifications
- Price Identifier Name: OCEAN/USD
- Base Currency: OCEAN
- Quote Currency: USD
- Intended Collateral Currency: USDC
- Scaling Decimals: 18 (1e18)
- Rounding: Round to nearest 6 decimal places (seventh decimal place digit >= 5 rounds up and < 5 rounds down)
- Does the value of this collateral currency match the standalone value of the listed quote currency?: YES
- Is your collateral currency already approved to be used by UMA financial contracts?: YES

- Price Identifier Name: USD/OCEAN
- Base Currency: USD
- Quote Currency: OCEAN
- Intended Collateral Currency: OCEAN
- Scaling Decimals: 18 (1e18)
- Rounding: Round to nearest 18 decimal places (nineteenth decimal place digit >= 5 rounds up and < 5 rounds down)
- Does the value of this collateral currency match the standalone value of the listed quote currency?: YES
- Is your collateral currency already approved to be used by UMA financial contracts?: YES


## Rationale

The addition of OCEAN/USD  and USD/OCEAN fits into a larger goal of advancing the adoption of the UMA protocol by allowing OCEAN to be used as collateral for minting a stable coin among a suite of [OpenDAO](https://opendao.io) stable coins. This furthers adoption of the protocol by encouraging a convergence of capital from different projects and increasing TVL.

Currently the most liquid exchange with USD or stablecoin markets for OCEAN is [Binance](https://www.binance.com/en/trade/OCEAN_USDT) (~17% volume). It can currently be traded on more than two dozen exchanges, including what are widely considered to be several top tier platforms.

In the current setting, there will need to be a significant event that erodes confidence in Ocean and the token for it to be a security or PR concern. 


## Implementation

Voters should query for the price of OCEAN/USDT at the price request timestamp on Binance, Bittrex and BitZ. Recommended endpoints are provided in the markets and data sources  section.

1) When using the recommended endpoints, voters should use the open price of the OHLC period that the timestamp falls in.
2) The median of these results should be taken
3) The median from step 2 should be rounded to six decimals to determine the OCEANUSD price.
4) The value of USDOCEAN will follow the exact same process but undergo one additional step: it will be the result of dividing 1/OCEANUSD.

For both implementations, voters should determine whether the returned price differs from broad market consensus. This is meant to provide flexibility in any unforeseen circumstances as voters are responsible for defining broad market consensus.



## Security considerations

Adding this new identifier by itself poses little security risk to the DVM or priceless financial contract users. However, anyone deploying a new priceless token contract referencing this identifier should take care to parameterize the contract appropriately to the reference asset’s volatility and liquidity characteristics to avoid the loss of funds for synthetic token holders. Additionally, the contract deployer should ensure that there is a network of liquidators and disputers ready to perform the services necessary to keep the contract solvent.

$UMA-holders should evaluate the ongoing cost and benefit of supporting price requests for this identifier and also contemplate de-registering this identifier if security holes are identified. As noted above, $UMA-holders should also consider re-defining this identifier as liquidity in the underlying asset changes, or if added robustness (eg via TWAPs) are necessary to prevent market manipulation.

Opportunities for manipulation seem slim, in relation to other projects in the decentralized finance ecosystem. 


## Headers
| UMIP-#    |                                                                                                                                          |
|------------|------------------------------------------------------------------------------------------------------------------------------------------|
| UMIP Title | Add WBTCUSD, USDWBTC as price identifiers              |
| Authors    | Logan (Logan@opendao.io)                               |
| Status     | Draft                                                                                                                                 |
| Created    | February 2, 2021                                                                                                                           |
| Discourse Link   | https://discourse.umaproject.org/t/adding-wbtc-usd-price-identifier-umip/124                                              |


## Summary (2-5 sentences)
The DVM should support price requests for the WBTC/USD and USD/WBTC price index. These price identifiers will serve to support future developments involving WBTC. 

## Motivation
1. What are the financial positions enabled by creating this synthetic that do not already exist?

The DVM currently does not support the WBTC/USD or USD/WBTC price index. Supporting the WBTCUSD price identifier would enable UMA partners (like OpenDAO or others) to provide access to the asset via the UMA architecture.

2. Please provide an example of a person interacting with a contract that uses this price identifier.

The addition of this price identifier would enable DeFi users to deploy WBTC as collateral for minting a stable coin, or for other purposes. 

3. Consider adding market data

At the time of writing, WBTC is trading at $33,767.47 with a 24-hour trading volume of $346,285,873. There is a circulating supply of 117,000 WBTC coins with a max supply of 117,000. Uniswap is currently the most active market trading it.
More information on the WBTC network can be found on the website: https://wbtc.network/

## Markets and Data Sources

What markets should the price be queried from? It is recommended to have at least 3 markets.

Binance, Sushiswap, and Uniswap should be used to construct the price.These 3 exchanges comprise a significant amount of WBTC trade volume and have available pricefeeds on Cryptowatch. 


Which specific pairs should be queried from each market?

Binance: WBTC/ETH, Sushiswap WBTC/ETH, Uniswap: WBTC/USDC


Provide recommended endpoints to query for real-time prices from each market listed.

Binance: 

WBTC/ETH https://api.binance.com/api/v3/ticker/price?symbol=WBTCETH

Sushiswap:WBTC/ETH

https://sushiswap.fi/token/0x2260fac5e5542a773aa44fbcfedf7c193bc2c599

Uniswap:WBTC/USDC

https://info.uniswap.org/pair/0xb4e16d0168e52d35cacd2c6185b44281ec28c9dc


How often is the provided price updated?

The lower bound on the price update frequency is a minute.


Provide recommended endpoints to query for historical prices from each market listed.

Binance: WBTC/ETH 

https://api.binance.com/api/v3/klines?symbol=WBTCETH&interval=1d

Sushiswap:WBTC/ETH 

https://sushiswap.fi/token/0x2260fac5e5542a773aa44fbcfedf7c193bc2c599

Uniswap:WBTC/USDC

https://info.uniswap.org/pair/0xb4e16d0168e52d35cacd2c6185b44281ec28c9dc


Do these sources allow for querying up to 74 hours of historical data?

Yes


How often is the provided price updated?

The lower bound on the price update frequency is a minute.


Is an API key required to query these sources?

No


Is there a cost associated with usage?

No


If there is a free tier available, how many queries does it allow for?

The lower bound on the number of queries allowed per hour is >> 1000.


What would be the cost of sending 15,000 queries?

Approximately $0


## Price Feed Implementation
Associated WBTC price feeds are available via Cryptowat.ch, Sushiswap, and Uniswap. Conversion from WBTC/ETH to WBTC/USD price needed for Binance and Sushiswap data. No other further feeds required.

## Technical Specifications
Price Identifier Name: WBTC/USD
Base Currency: WBTC
Quote Currency: USD
Intended Collateral Currency: USDC
Does the value of this collateral currency match the standalone value of the listed quote currency?: YES
Is your collateral currency already approved to be used by UMA financial contracts?: YES
Collateral Decimals: 6 decimals
Rounding: Closest, 0.5 up


## Rationale

The addition of WBTCUSD and USDWBTC will serve users at projects that are partnered with companies (such as OpenDAO) which are able to utilize the UMA architecture. More directly, this furthers adoption of the protocol by encouraging a convergence of capital from different projects and by potentially increasing TVL significantly.

Currently the most liquid exchange with USD or stablecoin markets for WBTC is BKEX (17.7% volume) while most overall trade involving WBTC is on Uniswap (~30% volume). BKEX will not be used for defining the price ID, as it is not available through Cryptowatch; however, due to the large volume and high liquidity of WBTC, it should be acceptable to use other markets, even if less voluminous. WBTC can currently be traded on a wide variety of exchanges, including what are widely considered to be several top tier platforms.

In the current setting, there will need to be a significant event that erodes confidence in WBTC and the token for it to be a security or PR concern.



## Implementation

What prices should be queried for and from which markets?
Binance: WBTC/ETH, Sushiswap: WBTC/ETH, Uniswap: WBTC/USDC
Pricing interval
1 minute
Input processing
None. Human intervention in extreme circumstances where the result differs from broad market consensus.
Result processing
median


## Security considerations

WBTC is centralized in that the BTC collateral is custodied by BitGo and thus presents a central source of potential failure that should be considered; in light of this, it is important to note that BitGo is one of the most reputable centralized custodians in the world and has highly advanced coin security protocols in place. Furthermore, BitGo is covered by digital asset insurance worth up to $100 million in the worst case scenario.

Adding this new identifier by itself poses little security risk to the DVM or priceless financial contract users. However, anyone deploying a new priceless token contract referencing this identifier should take care to parameterize the contract appropriately to the reference asset’s volatility and liquidity characteristics to avoid the loss of funds for synthetic token holders. Additionally, the contract deployer should ensure that there is a network of liquidators and disputers ready to perform the services necessary to keep the contract solvent.

$UMA-holders should evaluate the ongoing cost and benefit of supporting price requests for this identifier and also contemplate de-registering this identifier if security holes are identified. As noted above, $UMA-holders should also consider re-defining this identifier as liquidity in the underlying asset changes, or if added robustness (eg via TWAPs) are necessary to prevent market manipulation.

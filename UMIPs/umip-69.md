## HEADERS
| UMIP-69   | |
|------------|------------|
| UMIP Title | Add BCHDOM, BNBDOM, BSVDOM, DOTDOM, ETHDOM, LINKDOM, LTCDOM, USDTDOM & XRPDOM as price identifiers |
| Authors    | Domination Finance (Josh Bowden (<josh@ferrosync.io>), Michal Cymbalisty (<michal@domination.finance>), et. al.)
| Status     | Approved |
| Created    | March 16, 2021 |
| Link to Discourse | https://discourse.umaproject.org/t/add-bchdom-bnbdom-bsvdom-dotdom-ethdom-linkdom-ltcdom-usdtdom-xrpdom-as-price-identifiers/346 |
<br>
<br>

# SUMMARY 
The DVM should support price requests for the relative market capitalization indices of these top 9 cryptocurrencies (according to CoinGecko). These indices are commonly known as *"dominance"* indices. Compared to other typical UMIP price identifiers, these indices are *unit-less* since they are simply a percentage represented as a whole number.

Each price identifier for a particular cryptocurrency's market share in general is calculated by taking,
 * the total *circulating* supply of that cryptocurrency,
 * multiplied by the current price of the token in USD,
 * divided by the global market cap of all cryptocurrencies.

The price identifiers are constructed using the following formulations below.

> **REMARK**&emsp; The formulas shown below gives the reader a general concept of how one arrives at the prices of these indices. In general, there can be significant deviations and methodology as to how data providers actually calculate coin dominance. Calculating global cryptocurrency market cap involves curating 5000+ coins, in CoinGecko's case, as querying live USD prices and outstanding supply of each of those coins on the market -- as well as providing accessible API access. We give a more long form explanation in "Rationale".

> **REMARK**&emsp; The actual price identifier values are whole numbers out of 100. For example, a value of 12.34% is represented as the value
> raw decimal value of `12.34`. Therefore, all price identifier values for dominance indices will always be within the range `0.00 <= x < 100.00`, for some dominance index value `x`.

```
BCHDOM →    [Total BCH circulating supply]
          * [Price of BCHUSD]
          / [Total crypto market cap (USD)]

BNBDOM →    [Total BNB circulating supply]
          * [Price of BNBUSD]
          / [Total crypto market cap (USD)]

BSVDOM →    [Total BSV circulating supply]
          * [Price of BSVUSD]
          / [Total crypto market cap (USD)]

DOTDOM →    [Total DOT circulating supply]
          * [Price of DOTUSD]
          / [Total crypto market cap (USD)]

ETHDOM →    [Total ETH circulating supply]
          * [Price of ETHUSD]
          / [Total crypto market cap (USD)]

LINKDOM →   [Total LINK circulating supply]
          * [Price of LINKUSD]
          / [Total crypto market cap (USD)]

LTCDOM →    [Total LTC circulating supply]
          * [Price of LTCUSD]
          / [Total crypto market cap (USD)]

USDTDOM →   [Total USDT circulating supply]
          * [Price of USDTUSD]
          / [Total crypto market cap (USD)]

XRPDOM →    [Total XRP circulating supply]
          * [Price of XRPUSD]
          / [Total crypto market cap (USD)]
```

# MOTIVATION

The DVM currently does not support the listed dominance indices. Synthetic tokens which track market dominance could be used as hedging tools in one’s portfolio. These synthetic tokens can also be used as tools to speculate on a cryptocurrency's market share relative to all other cryptocurrencies.

1. What are the financial positions enabled by creating this synthetic that do not already exist?

    - These synthetic tokens will enable users to enter into financial positions based on a particular coins market dominance. Previously, our team created an instrument on UMA to be able take positions on the,
      - (i) relative market cap of Bitcoin (BTCDOM), as well as,
      - (ii) all alt-coins against Bitcoin (ALTDOM).
    - These new price identifiers allow users to take positions to long or short the relative market cap of these top 9 crypocurrencies.
    - More importantly, not all these underlying cryptocurrencies are available to be traded on Ethereum.

2. Please provide an example of a person interacting with a contract that uses this price identifier. 

    - A user wanting to short a particular cryptocurrency's market dominance can mint synthetics and then market sell them.
    - A user wanting to long a particular cryptocurrency's market dominance can market buy a synthetic token.

<br> 

# MARKETS & DATA SOURCES

The data source used for these indicies is provided by CoinGecko as a reliable and actively maintained source for coin market dominance. Additional clarification is providing in *Rationale*.

1. Provide recommended endpoints to query for real-time prices from each market listed. 

    - See endpoints listed in *Price Feed Implementation*
    
2. How often is the provided price updated?

    - 1 min

3. Provide recommended endpoints to query for historical prices from each market listed. 

    - See endpoints listed in *Price Feed Implementation*

4.  Do these sources allow for querying up to 74 hours of historical data? 

    - Yes

5. Is an API key required to query these sources? 

    - No

6. Is there a cost associated with usage? 

    - No

7.  If there is a free tier available, how many queries does it allow for?

    - N/A, access is free but rate limited to no more than 1 query/sec

8.   What would be the cost of sending 15,000 queries?

     - $0

<br>

# PRICE FEED IMPLEMENTATION

An existing implementation of a price feed using the `api.domination.finance` endpoint is already implemented. Additional feeds will need to be enabled for the 9 price identifiers that are specified in this UMIP. The associated endpoints for these price identifiers are below. See the section that follows ("Price Feed Sources") that further explains the backing data source of this price feeds.

BNB:
 * https://api.domination.finance/api/v0/price/bnbdom
 * https://api.domination.finance/api/v0/price/bnbdom/history

BCH:
 * https://api.domination.finance/api/v0/price/bchdom
 * https://api.domination.finance/api/v0/price/bchdom/history

BSV:
 * https://api.domination.finance/api/v0/price/bsvdom
 * https://api.domination.finance/api/v0/price/bsvdom/history

DOT:
 * https://api.domination.finance/api/v0/price/dotdom
 * https://api.domination.finance/api/v0/price/dotdom/history

ETH:
 * https://api.domination.finance/api/v0/price/ethdom
 * https://api.domination.finance/api/v0/price/ethdom/history

LINK:
 * https://api.domination.finance/api/v0/price/linkdom
 * https://api.domination.finance/api/v0/price/linkdom/history

LTC:
 * https://api.domination.finance/api/v0/price/ltcdom
 * https://api.domination.finance/api/v0/price/ltcdom/history

USDT:
 * https://api.domination.finance/api/v0/price/usdtdom
 * https://api.domination.finance/api/v0/price/usdtdom/history

XRP:
 * https://api.domination.finance/api/v0/price/xrpdom
 * https://api.domination.finance/api/v0/price/xrpdom/history


## Price Feed Sources

### CoinGecko Live API

The CoinGecko live coin domination feed API is available at the following URL:

```
https://api.coingecko.com/api/v3/global/coin_dominance
```

> Note that the `api.domination.finance` endpoints directly derive from this CoinGecko endpoint. For example, these endpoints will pull the latest snapshot from the CoinGecko endpoint:
> ```
> https://api.domination.finance/api/v0/coingecko/coin_dominance
> https://api.domination.finance/api/v0/price/{XYZ}dom
> ```

The response data uses the following JSON format:
```
[
  "data": [{
    "name": "BTC",
    "id": "bitcoin",
    "market_cap_usd": 287767856413.73145,
    "dominance_percentage": 63.38458529247809
  }],
  "timestamp": 1605329724
  ...
]
```

Each coin whose market dominance is tracked is reported as an element within a JSON array, 
 - `data` - an array of cryptocurrencies
   - `name` - giving the colloquial ticker symbol,
   - `id` - CoinGecko’s unique identifier for the coin,
   - `market_cap_usd` - the total market capitalization in USD,
   - `dominance_percentage` - the market dominance percentage as a decimal number from 0 to 100
 - `timestamp` - the Unix timestamp when this data was generated from CoinGecko
 
### Historical Data API
Dispute bots and voters will need to query the cached historical data, dating back 74 hours. CoinGecko solely provides live data in minutely intervals, hence a custom solution was needed to ensure accurate historical data for a sufficient enough time frame.

A reference implementation for a historical data caching solution is open-source and dual-licensed under MIT and Apache 2.0 to allow any stakeholder to host their own copy as well as provide a reference for any stakeholder who wishes to implement their own.

The repository is available at: https://github.com/ferrosync/coingecko-cache

API documentation is available at: https://api.domination.finance/

<br>

# TECHNICAL SPECIFICATIONS

**1. Price Identifier Names**
    
 - `BCHDOM`
 - `BNBDOM`
 - `BSVDOM`
 - `DOTDOM`
 - `ETHDOM`
 - `LINKDOM`
 - `LTCDOM`
 - `USDTDOM`
 - `XRPDOM`

> Since all the market dominance price identifiers are indices based off of a raw percentage, there is no inherent base or quote currency involved.

**2. Intended Collateral Currency** - DAI

- Is your collateral currency already approved to be used by UMA financial contracts?

    - Yes

**3. Scaling Decimals** - 18

**4. Rounding**

> **REMARK**&emsp;The price identifier values are represented as whole numbers between `0.00` and `100.00`, inclusive. For example, a market dominance of 12.34% is represented as the value
> raw decimal value of `12.34` and will be represented on-chain as the raw value `12340000000000000000`.  
> Appropriate scaling on-chain to 18 decimal places to "convert to wei" is applied as usual.

 - The index value is rounded to nearest 2 decimal places (third decimal place digit >= 5 rounds up and < 5 rounds down)

<br>

# RATIONALE

Prices are primarily used in UMA to calculate a synthetic token’s value in case of liquidation or expiration. Contract counterparties, such as those running liquidation bots, also use the price index to ensure that sponsors are adequately collateralized.

While coin domination can be succinctly represented as a single percentage, the underlying mechanisms for calculating it are quite involved and can dramatically differ by multiple percentage points from one data source to another. Calculating dominance involves knowing the current supply of a cryptocurrency, the prevailing market price of CRYPTOCURRENCY/USD, and the total market capitalization of all tokens in USD. More importantly, calculating the total market capitalization of all tokens in USD is a challenge since different data sources may altogether not include particular alt-coins thereby affecting all coin market dominance percentages.

At the moment, market dominance is commonly referenced through three major sources: TradingView, CoinMarketCap & CoinGecko. However, unlike trading pairs which exhibit strong redundancy without deviation largely due to arbitrage incentives, each data source can vary by multiple percentage points due to differing calculation methodologies. Namely, each site has different methodologies for which alt-coins to admit into the total market cap, and a given coin’s market price and total coin circulation amounts may differ, compounding over hundreds or even thousands of alt-coins. Additionally, on a technical note, live and historical data update frequency varies and historical data may be paywalled, making it significantly harder to successfully run liquidation and dispute bots with redundancy and without paying for API access. To make matters worse, had we proposed a scheme where multiple data sources were used, we’d have to decide on using either the median or mean of the data sources and then have to specify some logic to handle if one of the data sources went down or starting to significantly different from the rest, for example.

In an effort to alleviate these challenges, the Domination Finance team was able to get in touch with Bobby & TM, the co-founders of CoinGecko. The CoinGecko team went above and beyond to meet the requisites, updating CoinGecko’s coin dominance live data to 1-3 minute intervals from what was previously 10 minutes. Although this may introduce a single point of failure, we felt that the costs in increased complexity and mental load on the stakeholders who need to use it (like speculators, sponsors, liquidators & disputers) outweighed the benefits, especially during this period where the synthetic token is newly launched.

While CoinGecko was able to provide the higher time granularity for coin dominance on short notice, historical data, necessary for dispute bots and voters, was unable to be immediately supplied from CoinGecko. Instead, constructing a separate caching service was necessary to track and record the historical data via polling CoinGecko's Live API to be able to compute historical coin dominance at a given point in time. Our caching API is more than sufficient to provide the historical data for dispute bots and voters.

Initially, during normal operation, market dominance indices should closely track the value on CoinGecko. As more data sources for market dominance data are created and examined, voters are encouraged to add additional sources of information into the methodology for the price calculation. CoinGecko's full methodology for calculating dominance indices is detailed [here](https://www.coingecko.com/en/methodology).

<br>

# IMPLEMENTATION

1. **What prices should be queried for and from which markets?**

    - The applicable price market dominance index should be queried depending on the cryptocurrency of interest. The current chosen method is to query for dominance indices from the Domination Finance API, which simply caches CoinGecko dominance data.   

2. **Pricing interval**

    - 1 min (round down relative to UTC)

3. **Input processing**

    - None.

4. **Result processing** 

    - See rounding rules in *Technical Specification*.


For all price requests, voters should ensure that the calculated price does not differ greatly from broad market consensus. This is meant to be vague as the $UMA tokenholders are responsible for defining broad market consensus. This is especially important when relying on a third-party caching API; one possible way to verify this would be to query from the less granular CoinGecko API and compare results against those returned by Domination Finance API.

<br>

# Security considerations

The current implementation relies on CoinGecko's and the Domination Finance's API endpoints to be able to receive accurate pricing information. Since calculating market dominance is an involved process with a number of variables at play, the trade-off is made to have a stable formulation from a single source instead of multiple sources which have widely varying calculation methodologies and public data availability.

In the unlikely event that market index values returned from data sources are extreme outliers or erroneous compared to current market consensus, $UMA-holders may choose to use prevailing market consensus or using a nearby timestamp value instead.

Anyone deploying a new priceless token contract referencing these identifiers should take care to parameterize the contract appropriately to avoid the loss of funds for synthetic token holders. Additionally, the contract deployer should ensure that there is a network of liquidators and disputers ready to perform the services necessary to keep the contract solvent.

$UMA-holders should evaluate the ongoing cost and benefit of supporting price requests for these identifiers and also contemplate de-registering these identifiers if security holes are identified. As noted above, $UMA-holders should also consider re-defining this identifier as liquidity in the underlying asset changes, or if added robustness is necessary to prevent market manipulation.

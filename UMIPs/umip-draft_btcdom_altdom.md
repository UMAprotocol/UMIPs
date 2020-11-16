## Headers
 - UMIP <#>
 - Title: Add BTCDOM and ALTDOM as price identifiers
 - Author: Domination Finance Team
 - Status: Pending approval
 - Created: November 14, 2020


## Summary (2-5 sentences)
The DVM should support price requests for a Bitcoin and altcoin dominance index. Upon redemption, BTCDOM + ALTDOM = 100.00.

These two price identifiers can be defined as: 

```
BTCDOM →    [Total BTC supply]
          * [Price of BTCUSD]
          / [Total crypto market cap (USD)]
ALTDOM → 100.00% - BTCDOM
```


## Motivation

The DVM currently does not support a Bitcoin or altcoin dominance index. Synthetic tokens which track Bitcoin and altcoin dominance could be used as hedging tools in one’s portfolio. These synths can also be used as tools to speculate on Bitcoin’s market share relative to all other cryptocurrencies.

## Technical Specification

The definition of these identifiers should be:

Identifier name: `BTCDOM`  
Result Processing / Source: CoinGecko

Identifier name: `ALTDOM`  
Result Processing: (100.00 - BTCDOM)

Input Processing: None. Human intervention in extreme circumstances where the result differs from broad market consensus. Live data will be cached from CoinGecko on the (1-3 minute) interval in order to backlog 96 hours of historical data to allow for the successful deployment of liquidation and dispute bots.

Price Steps: `00.01`  
Rounding: Closest, 0.01 up  
Pricing Interval: 1 minute  
Dispute timestamp rounding: down (UTC)  

## Rationale

Prices are primarily used in UMA to calculate a synthetic token’s value in case of liquidation or expiration. Contract counterparties, such as those running liquidation bots, also use the price index to ensure that sponsors are adequately collateralized. 

While coin domination can be succinctly represented as a single percentage, the underlying mechanisms for calculating it are quite involved and can dramatically differ by multiple percentage points from one data source to another. Calculating, for example, Bitcoin dominance involves knowing the current supply of bitcoin, the prevailing market price of BTC/USD, and the total market capitalization of all tokens in USD. More importantly, calculating the total market capitalization of all tokens in USD is a challenge since different data sources may altogether not include particular alt-coins thereby affecting all coin market dominance percentages.

At the moment, Bitcoin dominance is commonly referenced through three major sources: TradingView, CoinMarketCap & CoinGecko. However, unlike trading pairs which exhibit strong redundancy without deviation largely due to arbitrage incentives, each data source can vary by multiple percentage points due to differing calculation methodologies. Namely, each site has different methodologies for which alt-coins to admit into the total market cap, and a given coin’s market price and total coin circulation amounts may differ, compounding over hundreds or even thousands of alt-coins. Additionally, on a technical note, live and historical data update frequency varies and historical data may be paywalled, making it significantly harder to successfully run liquidation and dispute bots with redundancy and without paying for API access. To make matters worse, had we proposed a scheme where multiple data sources were used, we’d have to decide on using either the median or mean of the data sources and then have to specify some logic to handle if one of the data sources went down or starting to significantly different from the rest, for example.

In an effort to alleviate these challenges, the Domination Finance team was able to get in touch with Bobby & TM, the cofounders of CoinGecko. The CoinGecko team went above and beyond to meet the requisites, updating CoinGecko’s coin dominance live data to 1-3 minute intervals from what was previously 10 minutes. Although this may introduce a single point of failure, we felt that the costs in increased complexity and mental load on the stakeholders who need to use it (like speculators, sponsors, liquidators & disputers) outweighed the benefits, especially during this period where the synthetic token is newly launched.

While CoinGecko was able to provide the higher time granularity for coin dominance on short notice, historical data, necessary for dispute bots and voters, was unable to be immediately supplied from CoinGecko. Instead, constructing a separate caching service is necessary to track and record the historical data from polling the CoinGecko live API to be able to compute historical coin dominance at a given point in time. This stop gap measure should be more than sufficient to provide the historical data for dispute bots and voters. Additionally, CoinGecko currently provides historical coin dominance data at an hourly granularity (which, to avoid confusion, is not the granularity this UMIP is proposing) to sanity check the minutely historical data. This hourly granularity graph is available at the very bottom of the web page at:

```
https://www.coingecko.com/en/global_charts 
```

The JSON data backing the 24 hour coin dominance at 1 hour intervals is available at:

```
https://www.coingecko.com/global_charts/market_dominance_data?duration=1&locale=en
```

Initially, during normal operation, the Bitcoin dominance index should closely track the value on CoinGecko. As more data sources for Bitcoin dominance data are created and examined, voters are encouraged to add additional sources of information into the methodology for the price calculation.

## Implementation

The value of BTCDOM for a given timestamp should be determined by querying the Bitcoin dominance value from CoinGecko and determining whether that median differs from broad market consensus. This is meant to be vague as the token holders are responsible for defining broad market consensus.

The value of ALTDOM will follow the exact same process but undergo one additional step: it will be the result of subtracting (100.00 - BTCDOM). 

While it’s important for stakeholders to ensure complete accuracy in their sources, bots and users that interact with the system in real time need fast sources of price information. In these cases, it can be assumed that CoinGecko’s data is accurate enough.

### CoinGecko Live API

The CoinGecko live coin domination feed API is available at the following URL:

```
https://api.coingecko.com/api/v3/global/coin_dominance
```

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
 - “data” - an array of cryptocurrencies
 - “name” - giving the colloquial ticker symbol,
 - “id” - CoinGecko’s unique identifier for the coin,
 - “market_cap_usd” - the total market capitalization in USD,
 - “dominance_percentage” - the market dominance percentage as a decimal number from 0 to 100
 - “timestamp” - the Unix timestamp when this data was generated from CoinGecko
 
### Historical Data API
Dispute bots and voters will need to query the cached historical data, dating back 96 hours. CoinGecko solely provides live data in (1-3) minute intervals, hence a custom solution was needed to ensure accurate historical data for a sufficient enough time frame. The reference implementation of the custom historical data caching solution will be made open-source to allow any stakeholder to host their own copy and provide a base for stakeholder who may choose to implement their own.

The historical data custom solution is available at the following URL:
```
https://api.domination.finance/api/v0/coingecko/coin_dominance?timestamp={unix_timestamp}

Example: https://api.domination.finance/api/v0/coingecko/coin_dominance?timestamp=1605318900 
```
where “`{unix_timestamp}`” is the requested historical snapshot data as a Unix timestamp in seconds (i.e. number of seconds since Jan 01, 1970 00:00 UTC). It will be automatically rounded down to the minute to the next available historical data snapshot. If the “`timestamp`” query argument is not supplied, then the latest snapshot will be returned.
The response data uses the following JSON format (functioning as a superset of CoinGecko’s API format):
```
[
  "data": [
    {
      "name": "BTC",
      "id": "bitcoin",
      "market_cap_usd": 287767856413.73145,
      "dominance_percentage": 63.38458529247809
    }
    ...
  ],
  "timestamp": 1605328389,
  "meta": {
    "provenance_uuid": "7fd0978b-4482-41b5-9d6b-882939d25147",
    "blob_sha256": "086b6234cf2a3bc94badaf0ef7b0b1a503b949e615e3d41899a7e9b2a4fd0975",
    "imported_at_timestamp": 1605328363149,
    "requested_timestamp": 1605328389000,
    "actual_timestamp": 1605328389000,
  }
]
```

The response format contains the following information:
 - “`data`” - array of cryptocurrencies (same format as CoinGecko’s /global/coin_dominance endpoint)
 - “`timestamp`” - the Unix timestamp from original CoinGecko generated data
 - “`meta`” - additional metadata
 - “`provenance_uuid`” - a UUID generated for each request CoinGecko to provide for data provenance. The original request and response data and HTTP headers can be inspected at:    
  
    `https://api.domination.finance/api/v0/provenance/{uuid}`

    Example: `https://api.domination.finance/api/v0/provenance/7fd0978b-4482-41b5-9d6b-882939d25147`

 - “`blob_sha256`” - a SHA256 hash of the body of the original response from CoinGecko. The raw response body and be retrieved at:

    `https://api.domination.finance/api/v0/blob/{hash}`

    Example: `https://api.domination.finance/api/v0/blob/086b6234cf2a3bc94badaf0ef7b0b1a503b949e615e3d41899a7e9b2a4fd0975` 


 - “`imported_at_timestamp`” - the Unix timestamp (in milliseconds) when the snapshot was taken. Note that this time is the local machine time on the API server and not CoinGecko’s servers.


 - “`requested_timestamp`” - the Unix timestamp (in milliseconds) that was requested or the latest timestamp if no specific timestamp was requested.


 - “`actual_timestamp`” - the Unix timestamp (in milliseconds) that was actually returned from CoinGecko for this request. This is the same timestamp as the “timestamp” at the root of the JSON response.

## Security Considerations

These are the first identifiers proposed for registration with the DVM which are not based on existing trading pairs. Adding these new identifiers by itself poses little security risk to the DVM or priceless financial contract users. However, anyone deploying a new priceless token contract referencing these identifiers should take care to parameterize the contract appropriately to avoid the loss of funds for synthetic token holders. Additionally, the contract deployer should ensure that there is a network of liquidators and disputers ready to perform the services necessary to keep the contract solvent.

$UMA-holders should evaluate the ongoing cost and benefit of supporting price requests for these identifiers and also contemplate de-registering these identifiers if security holes are identified. As noted above, $UMA-holders should also consider re-defining this identifier as liquidity in the underlying asset changes, or if added robustness is necessary to prevent market manipulation.

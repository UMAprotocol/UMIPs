## HEADERS
| UMIP-92     |                                                                                                                                  |
|------------|------------------------------------------------------------------------------------------------------------------------------------------|
| UMIP Title | Add uCRSPTMT_SEP21 as a price identifier                                                                                                  |
| Authors    | Javier Prieto, [@javipus](github.com/javipus)
| Status      | Last Call                                                                                                                             |
| Created    | Mar 23, 2021
| [Link to Discourse](https://discourse.umaproject.org/t/add-vti-may21-price-identifier/895)    |                                                                              

<br>

# SUMMARY 

The DVM should support price requests for the [CRSP US Total Market TR Index](http://www.crsp.org/products/investment-products/crsp-us-total-market-index) (CRSPTMT), a highly diversified index that aims to track the US stock market as a whole.

<br>

# MOTIVATION

UMA already counts with many price identifiers enabling the creation of derivatives on crypto assets and prices, as well as some identifiers for traditional, off-chain financial products like gold or stocks. However, access to highly diversified indices tracking large sectors of the economy are sorely lacking. Having exposure to broad indices could prove beneficial to people outside the US, as these products provide excellent risk-adjusted returns. In particular, they provide a relatively low risk strategy to beat USD inflation.

The [Center for Research in Security Prices](http://www.crsp.org/products/documentation/crsp-indexes) (CRSP) is a data provider affiliated to the University of Chicago that maintains several such indices. Of all of them, the [US Total Market Total Return Index](http://www.crsp.org/products/investment-products/crsp-us-total-market-index) (CRSPTMT), is the most comprehensive and realistic metric of total US stock market performance, as it includes nearly all publicly traded US companies and it accounts for dividends.

<br>

# MARKETS & DATA SOURCES

The contract will expire at 16:00 EST on 2021/09/21. The corresponding POSIX timestamp is `1632240000`. To determine the price, the DVM will choose between the two protocols described below depending on the timestamp of the oracle request, `request_timestamp`.

- If `request_timestamp > 1632240000`, use the "After expiry" protocol.
- Otherwise, use the "Before expiry" protocol.

## After expiry

After expiry, the contract should be settled according to the close price of the index on 2021/09/21. This price will be obtained by calling the `GOOGLEFINANCE` function on Google Sheets with the following parameters:

```
=GOOGLEFINANCE("CRSPTMT", "close", DATE(2021, 5, 21))
```

This query can be done without API keys and at no cost to the user. Although querying the price via Google Sheets is preferred, it can also be accessed using web interface provided by [Google Search](https://www.google.com/search?hl=en&q=CRSPTMT).

## Before expiry

Before expiry, the price will be determined by the on-chain secondary market. At any time, the price will be the 2h Time-Weighted Average Price (TWAP) of the Uniswap uCRSPTMT_SEP21/USDC pool with the largest liquidity.

Voters should follow this protocol to determine the price:

1. Find the uCRSPTMT_SEP21/USDC Uniswap pool with the largest liquidity.
2. Determine the price of uCRSPTMT_SEP21 in USD returned by the pool for every timestamp between the request timestamp minus 2 hours and the request timestamp, inclusive.
3. The price to return is the arithmetic mean of all the prices at each timestamp, rounded to 6 decimals as explained below.

<br>

# PRICE FEED IMPLEMENTATION

The liquidator and disputer bots should use the reference [Uniswap price feed](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/UniswapPriceFeed.js) implementation.

<br>

# TECHNICAL SPECIFICATIONS

**1. Price Identifier Name** - uCRSPTMT_SEP21

**2. Base Currency** - uCRSPTMT_SEP21

**3. Quote currency** - USDC

**4. Intended Collateral Currency** - USDC

**5. Collateral Decimals** - 6

**6. Rounding** - The price shall be rounded to 6 decimal places using [round half down](https://en.wikipedia.org/wiki/Rounding#Round_half_down).

<br>

# RATIONALE

A self-referential price before expiry avoids price drift when US markets are not trading (nights and weekends). This requires token sponsors to set an initial price; it is recommended they consult the Google Finance price when doing this, as they may be arbitraged otherwise.

Short-lived price manipulation of an AMM is relatively cheap, but it becomes expensive over time as the position can be easily arbitraged. This motivates the introduction of TWAPs, in line with [Uniswap's recommendation for building price oracles](https://uniswap.org/docs/v2/smart-contract-integration/building-an-oracle/).

<br>

# IMPLEMENTATION

1. **What prices should be queried for and from which markets?**

  - After expiry: CRSPTMT close price on 2021/09/21 from Google Finance
  - Before expiry: Uniswap 2h TWAP

2. **Pricing interval**

  - After expiry: NA
  - Before expiry: Every block (~15 seconds)

3. **Processing**
  
  - After expiry: Google Finance CRSPTMT price
  - Before expiry: NA

<br>

# Security considerations

1. Where could manipulation occur?
If trading is not very liquid, the price could be temporarily manipulated before expiry by executing large trades on Uniswap. However, we note that sustaining the attack for the whole duration of a 2h TWAP would be too costly and probably not worth it.

2. What are current or future concern possibilities with the way the price identifier is defined?
After expiry, the price ID relies on a single data source. If Google Finance was down at the time for whatever reason, this could delay contract settlement.

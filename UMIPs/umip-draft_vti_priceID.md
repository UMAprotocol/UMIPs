## HEADERS
| UMIP [#]     |                                                                                                                                  |
|------------|------------------------------------------------------------------------------------------------------------------------------------------|
| UMIP Title | Add uVTI_MAY2021 as a price identifier                                                                                                  |
| Authors    | Javier Prieto, [@javipus](github.com/javipus)
| Status      | Draft                                                                                                                                   |
| Created    | Mar 23, 2021 
| Link to Discourse    |                                                                               

<br>

# SUMMARY 

The DVM should support price requests for the [Vanguard Total Stock Market ETF](https://investor.vanguard.com/etf/profile/overview/vti) (VTI), a highly diversified exchange-traded fund that aims to track the US stock market as a whole.

<br>

# MOTIVATION

UMA already counts with many price identifiers enabling the creation of derivatives on crypto assets and prices, as well as some identifiers for traditional, off-chain financial products like gold or stocks. However, access to highly diversified indices tracking large sectors of the economy are sorely lacking. Having exposure to index funds could prove beneficial to people outside the US, as these products provide excellent risk-adjusted returns. In particular, they provide a relatively low risk strategy to beat USD inflation.

<br>

# MARKETS & DATA SOURCES

The contract will expire at 16:00 EST on 2021/05/21. The corresponding POSIX timestamp is `1621627200`. To determine the price, the DVM will choose between the two protocols described below depending on the timestamp of the oracle request, `request_timestamp`.

- If `request_timestamp > 1621627200`, use the "After expiry" protocol.
- Otherwise, use the "Before expiry" protocol.

## After expiry

After expiry, the contract should be settled by querying the expiry date (2021/05/21) close price from the NYSE, the only exchange where VTI shares are traded. The price will be quoted in USD. The price will be the arithmetic mean of the prices returned by the Google and Yahoo APIs. Here are example queries using the [yfinance](https://github.com/ranaroussi/yfinance) package and the Google Sheets function `GOOGLEFINANCE`:

```python
from yfinance import Ticker
from pandas import to_datetime
vti = Ticker("VTI")
price = vti.history().loc[to_datetime("2021/05/21"), "Close"]
```

```
=GOOGLEFINANCE("VTI", "close", DATE(2021, 5, 21))
```

Both queries can be done without need for API keys and at no cost to the user, as they are below the free tier limit of both services. Although querying the APIs directly is preferred, non-technical users can access the price using web interfaces provided by [Yahoo Finance](https://finance.yahoo.com/quote/VTI) and [Google Search](https://www.google.com/search?hl=en&q=%24vti).

## Before expiry

Before expiry, the price will be determined by the on-chain secondary market. At any time, the price will be the 2h Time-Weighted Average Price (TWAP) of the Uniswap uVTI_21MAY/USDC pool with the largest volume.

<br>

# PRICE FEED IMPLEMENTATION

The liquidator and disputer bots should use the reference [Uniswap price feed](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/UniswapPriceFeed.js) implementation.

<br>

# TECHNICAL SPECIFICATIONS

**1. Price Identifier Name** - uVTI_MAY21

**2. Base Currency** - uVTI_MAY21

**3. Quote currency** - USDC // TODO: USD oracle or divide by USD/USDC price

**4. Intended Collateral Currency** - USDC

**5. Collateral Decimals** - 6

**6. Rounding** - Down

<br>

# RATIONALE

A self-referential price before expiry avoids price drift when NYSE is not trading (nights and weekends). This requires token sponsors to set initial price; it is recommended they consult the Yahoo/Google APIs as they may be arbitraged otherwise.

Short-lived price manipulation of an AMM is relatively cheap, but becomes expensive over time as the position can be arbitraged. This motivates the introduction of TWAPs, in line with Uniswap's recommendation for building price oracles.

<br>

# IMPLEMENTATION

1. **What prices should be queried for and from which markets?**

  - After expiry: VTI close price on 2021/05/21 from Yahoo Finance and Google Finance
  - Before expiry: Uniswap 2h TWAP

2. **Pricing interval**

  - After expiry: NA
  - Before expiry: Every block (~15 seconds)

3. **Processing**
  
  - After expiry: `mean(yahoo_vti_price, google_vti_price)`
  - Before expiry: NA

<br>

# Security considerations

1. Where could manipulation occur?
If trading is not very liquid, the price could be temporarily manipulated before expiry by executing large trades on Uniswap. However, we note that sustaining the attack for the whole duration of a 2h TWAP would be too costly and probably not worth it.

2. What are current or future concern possibilities with the way the price identifier is defined?
After expiry, the price ID relies on only two data sources. If both were down for whatever reason, this could delay contract settlement.
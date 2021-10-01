## Headers
- UMIP <#> 
- UMIP title: Add uVIXUSDC, uSPYUSDC as price identifiers and uVIXUSDC_FR, uSPYUSDC_FR as funding rate identifiers
- Author BinomFX (binomfx@gmail.com)
- Status: Draft 
- Created: 07.09.2021
- Discourse Link: https://discourse.umaproject.org/t/add-uvix-uspy-price-identifiers/1316?u=binomfx

## Summary (2-5 sentences)
The DVM should support price requests for uVIXUSDC, uSPYUSDC UMA perpetual and corresponding uVIXUSDC_FR, uSPYUSDC_FR funding rate identifiers.
The purpose of these price identifiers is to create synthetic tokens, price of which is linked to the quotes of the VIX volatility index and the ETF SPY. These synthetic tokens can be used both for creating speculative strategies and for hedging.

## Motivation
Synthetic tokens that track the exchange quotes of the volatility index (VIX) and the S&P exchange traded fund (ETF SPY) can be used both for speculative purposes and for hedging. At the same time, the user gets the opportunity to use the price movement of exchange assets without the need to use such centralized structures as exchanges and brokerage companies. In addition, these tokens can be used as components associated with classical markets by other DeFi and DApp protocols, which makes it possible to scale.

## Technical Specification
- **Identifier name: uVIXUSDC**
- Base asset: VIX
- Quote Currency: USD
- Intended Collateral Currency: USDC
- Market: CBOE
- Source: 
- https://marketstack.com/, API - Cost to use: Free - End-of-Day Data; Paid – Intraday Data (https://marketstack.com/plan)
- https://www.tradingview.com/chart/iB9OZdOa/?symbol=CBOE%3AVIX, Manual - Cost to use: Free
- Result Processing: None
- Input Processing: None. 
- Scaling Decimals: 18 (1e18)
- Rounding: Round to nearest 6 decimal places (seventh decimal place digit >= 5 rounds up and < 5 rounds down)

- **Identifier name: uSPYUSDC**
- Base asset: SPY
- Quote Currency: USD 
- Intended Collateral Currency: USDC
- Market: AMEX
- Source: 
- https://marketstack.com/, API - Cost to use: Free - End-of-Day Data; Paid – Intraday Data (https://marketstack.com/plan)
- https://www.tradingview.com/chart/iB9OZdOa/?symbol=AMEX%3ASPY, Manual - Cost to use: Free
- Result Processing: None
- Input Processing: None. 
- Scaling Decimals: 18 (1e18)
- Rounding: Round to nearest 6 decimal places (seventh decimal place digit >= 5 rounds up and < 5 rounds down)

## Rationale
The choice of underlying assets for creating new price identifiers, the price of which is linked to the exchange quotes of the VIX volatility index and the SPY ETF, is determined by the opportunities for speculative trading and hedging that are created for users, as well as the DeFi industry development opportunities:

- **SPY** - The SPDR S&P 500 Trust ETF, also known as the SPY ETF, is one of the most popular funds that aims to track the Standard & Poor's 500 Index, which comprises 500 large- and mid-cap U.S. stocks. These stocks are selected by a committee based on market size, liquidity, and industry. The S&P 500 serves as one of the main benchmarks of the U.S. equity market and indicates the financial health and stability of the economy.
- **VIX** - The CBOE Volatility Index (VIX) is a real-time index that represents the market's expectations for the relative strength of near-term price changes of the S&P 500 index (SPX). Because it is derived from the prices of SPX index options with near-term expiration dates, it generates a 30-day forward projection of volatility. Volatility, or how fast prices change, is often seen as a way to gauge market sentiment, and in particular the degree of fear among market participants.

These underlying assets are traded on the AMEX and CBOE stock exchanges, but reliable sources of quotations are either paid or provide data with a delay. We suggest using the MarketStack API as the main source of quotes, which has both free and paid tariff plans, and also provides historical price data.

Back in early 2018, MarketStack was initially presented under a different name with the aim of providing a free and cost-effective market data alternative to Yahoo Finance. In the course of the years, MarketStack REST API has become one of the most popular one-stop shop solutions for real-time, intraday and historical stock data, supporting a total of 170,000+ stock tickers from 70 global stock exchanges, including NASDAQ, Australian Stock Exchange, London Stock Exchange, and many more.

The MarketStack API is built on top of scalable, cutting-edge cloud infrastructure, handling millions of concurrent API requests each day. Using the API customer will be able to obtain rate information as well as metadata about stock tickers, companies as well as stock exchanges.

Underlying stocks are trade during exchange hours which leaves gaps in prices between 4:00PM EST close and 9:30AM EST open the next day and on weekends and market holidays. 

A 2-hour TWAP was chosen to mitigate any risk of attempted price manipulation attempts on the market price of the synthetic. To meaningfully manipulate the price that token sponsors’ collateralization is calculated with, an attacker would have to manipulate the trading price of a token for an extended amount of time. This is described further in the Security Considerations section.

## Implementation
Historical VIX and SPY prices are available from MarketStack.com (API) and TadingView.com (Manually). 
Price requests should use the minute price that is nearest and later than the price request timestamp. To do this, voters should use the open price of the OHLC period that the price request timestamp falls in. MarketStack endpoints are queried based on the OHLC period's close time.
Example MarketStack request for a SPY real time price (available on: Basic Plan and higher):
```
http://api.marketstack.com/v1/intraday
    ? access_key = YOUR_ACCESS_KEY
    & symbols = SPY
```
Example MarketStack request for a VIX historical price:
```
http://api.marketstack.com/v1/eod
    ? access_key = YOUR_ACCESS_KEY
    & symbols = VIX.INDX
    & date_from = 2021-08-23
    & date_to = 2021-09-02
```
API Response Objects:
```
Response Object	Description
pagination > limit	Returns your pagination limit value.
pagination > offset	Returns your pagination offset value.
pagination > count	Returns the results count on the current page.
pagination > total	Returns the total count of results available.
date	Returns the exact UTC date/time the given data was collected in ISO-8601 format.
symbol	Returns the stock ticker symbol of the current data object.
exchange	Returns the exchange MIC identification associated with the current data object.
open	Returns the raw opening price of the given stock ticker.
high	Returns the raw high price of the given stock ticker.
low	Returns the raw low price of the given stock ticker.
close	Returns the raw closing price of the given stock ticker.
last	Returns the last executed trade of the given symbol on its exchange.
volume	Returns the volume of the given stock ticker.
```
### Weekend timestamp
Over the weekend or some official holidays the REST API does not return any price, but we can request the price of a certain moment before the market close (as ex: the closing price of Friday).
Due to unavailability of price feed for stock exchange rates over the weekend or during some official holidays, tokenholders and users will be using the latest known price, which for the weekend is essentially the closing price of Friday. Same goes in a case of a liquidation process - the liquidator should use the last known price (during the weekend this is the closing price of Friday) in order to match with the price on which a synthetic asset was created, if it was created over the weekend. If not the closing price on Friday for a certain asset should be a navigating point in calculating the collateralization ratio of a position and in the liquidation process.
If a request timestamp takes place on a weekend or any other day the stock market is closed, voters should use the latest tick as the price. For the weekend that would be the closing price of the asset on Friday and for official holidays this would be the last know price provided by the price feed.
Please note that this is different than the normal calculation process, which requires using the open price of the period that the price request falls in.
### Stock markets working hours
Underlaying assets trade during exchange hours which leaves gaps in prices between 4:00PM EST close and 9:30AM EST open the next day and on weekends and market holidays.
### Price feed - liquidations and disputes
Liquidation and dispute bots should have their own subscription to price feeds. Our price-feed provider’s API documentation can be found here: https://marketstack.com/documentation. A reference MarketStack implementation that is used by liquidator and dispute bots can be seen here: https://github.com/unisxapp/uma/commit/11db86a556098e2f71022c40ef3bb6d777e60f59.
MarketStack is provided as an accessible source to query for this data, but ultimately how one queries for these rates should be varied and determined by the voter to ensure that there is no central point of failure.
In the case of a MarketStack outage voters can turn to any other available price feed API or a broker API, as the price feeds for the forementioned financial assets does not differ much between different providers. There might be some slight differences, however they are quite insignificant and would not affect the liquidation or dispute processes. For this case, we provide options for additional price feed providers that voters could utilize.
### Additional price feed providers
- **Yahoo Finance** – Rapidapi.com
- Documentation for the API can be found here: https://rapidapi.com/apidojo/api/yahoo-finance1
- Live price feed data
- Historical prices based on date and time
- Registration is free
- Paid plans available: https://rapidapi.com/apidojo/api/yahoo-finance1/pricing
- OHLC request can be used to grab the last closing price before a weekend or a non-working day
- Example requests:
```
var axios = require("axios").default;

var options = {
  method: 'GET',
  url: 'https://apidojo-yahoo-finance-v1.p.rapidapi.com/auto-complete',
  params: {q: 'VIX', region: 'US'},
  headers: {
    'x-rapidapi-host': 'apidojo-yahoo-finance-v1.p.rapidapi.com',
    'x-rapidapi-key': YOUR_ACCESS_KEY
  }
};

axios.request(options).then(function (response) {
	console.log(response.data);
}).catch(function (error) {
	console.error(error);
});
```
- **Stock and Options Trading Data Provider API** – Rapidapi.com
- Documentation for the API can be found here: https://rapidapi.com/mpeng/api/stock-and-options-trading-data-provider
- Live price feed data
- Historical prices based on date and time
- Registration is free
- Paid plans available: https://rapidapi.com/mpeng/api/stock-and-options-trading-data-provider/pricing
- OHLC request can be used to grab the last closing price before a weekend or a non-working day
- Example requests:
```
var axios = require("axios").default;

var options = {
  method: 'GET',
  url: 'https://stock-and-options-trading-data-provider.p.rapidapi.com/straddle/SPY',
  headers: {
    'x-rapidapi-host': 'stock-and-options-trading-data-provider.p.rapidapi.com',
    'x-rapidapi-key': YOUR_ACCESS_KEY
  }
};

axios.request(options).then(function (response) {
	console.log(response.data);
}).catch(function (error) {
	console.error(error);
});
```

## Security considerations
Security considerations are focused on the use of the token price for monitoring collateral ratios.
- **Token price manipulation** - Under illiquid market conditions, an attacker could attempt to drive prices down to withdraw more collateral than normally allowed or drive prices up to trigger liquidations. However, it is important to note that almost all attacks that have been performed on DeFi projects are executed with flash loans, which allows the attacker to obtain leverage and instantaneously manipulate a price and extract collateral. Additionally, flash loans will have no effect on a tradable token price because the TWAP calculation is measured based on the price at the end of each block. Collateralization based off of a TWAP should make these attacks ineffective and would require attackers to use significantly more capital and take more risk to exploit any vulnerabilities.
- **Mismatch between TWAP and gap higher in token price** - An aggressive gap higher in the token price accompanied by real buying and then a follow through rally could create a concern. In this scenario we could see the TWAP of the token significantly lag the actual market price and create an opportunity for sponsors to mint tokens with less collateral than what they can sell them from in the market. It is important to note that this is an edge case scenario either driven by an irrational change in market expectations or it can be driven by a “fat finger” mistake which is a vulnerability to any market. Even in this edge case we believe the design of the token and the parameters chosen should mitigate risks. The current Perpetual contract requires sponsors to mint tokens with enough collateral to meet the Global Collateral Ratio (GCR) which has stood well above 200% for other contracts. Therefore, assuming the GCR is similar for uVIX and uSPY, the market would need to first rally at least 100% before potentially being exposed. If the sponsor wishes to withdraw collateral below the GCR they would request a “slow withdrawal” which would subject him to a 2 hour “liveness period” where anybody can liquidate the position if it fell below the required collateral ratio. The combination of the GCR and 2 hour “liveness period” allows the 2 hour TWAP to “catch up” to the market price and would protect from this scenario and deter sponsors from attempting to exploit it.

Security considerations, like the ones above, have been contemplated and addressed, but there is potential for security holes to emerge due to the novelty of this price identifier.

Additionally, anyone deploying a new priceless token contract referencing this identifier should take care to parameterize the contract appropriately to avoid the loss of funds for synthetic token holders. Contract deployers should also ensure that there is a network of liquidators and disputers ready to perform the services necessary to keep the contract solvent.

$UMA-holders should evaluate the ongoing cost and benefit of supporting price requests for this identifier and also contemplate de-registering this identifier or editing its implementation if security holes are identified. 

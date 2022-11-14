## HEADERS
|UMIP     | | 
|:-------------|:-----------------------------------------------------------------------------|
|UMIP title|Add uSPAC10g as price identifier|
|Author|BinomFX (binomfx@gmail.com)|
|Status|Draft| 
|Created|27.10.2022|
|Discourse Link|https://discourse.umaproject.org/t/add-uspac10g-as-price-identifier/1835|

## SUMMARY
The DVM should support price requests for uSPAC10g price identifier<br>
The purpose of this price identifier is to create a synthetic token, the price of which is linked to the value of an index of the **10** most active SPACs (Special Purpose Acquisition Companies) during a given time period.<br> That synthetic token can be used for creating speculative strategies in SPAC market.<br>
The difference from the existing UMIP-140 is that the proposed price ID does not require manually changing the basket of 10 SPAC shares on a quarterly basis. Now the index basket is obtained automatically with each price request via the spacHero API.

## MOTIVATION
A synthetic token that tracks the index of the 10 most active SPAC stocks can be used for speculative purposes and allow the user to earn on price movements in one of the most interesting markets without centralized intermediaries such as exchanges and brokers.<br>
In addition, that token can be used as a component associated with classical markets by other DeFi and DApp protocols, which makes it possible to scale.

## TECHNICAL SPECIFICATION
| | |
|:---------------------------|:---------------------------------------------------|
|**Identifier name**         |**uSPAC10g**|
|Base asset                  | Most active SPAC shares.|
|Quote Currency              | USD|
|Intended Collateral Currency| USDC|
|Market                      | NYSE, NASDAQ|
|Shares Basket Source        |["spacHero – Rapidapi.com"](https://rapidapi.com/spachero/api/spachero-spac-database/), API - Cost to use: Free 10 requests per day, [Pricing](https://rapidapi.com/spachero/api/spachero-spac-database/pricing)|
|Shares Quotes Source        |["Mboum Finance – Rapidapi.com"](https://rapidapi.com/sparior/api/mboum-finance), API - Cost to use: Free 500 requests per month, [Pricing](https://rapidapi.com/sparior/api/mboum-finance/pricing)|
|Scaling Decimals            | 18 (1e18)|
|Rounding                    | Round to nearest 6 decimal places (seventh decimal place digit >= 5 rounds up and < 5 rounds down)|

## RATIONALE
Special Purpose Acquisition Companies (“SPACs”) are companies formed to raise capital in an initial public offering (“IPO”) with the purpose of using the proceeds to acquire one or more unspecified businesses or assets to be identified after the IPO (irrespective of form, a “Business Combination”). SPACs have only a limited period during which they may consummate a Business Combination, generally not exceeding 24 months. A SPAC generally focuses upon one industry or sector, but may maintain flexibility to engage in transactions in other industries or sectors if necessary or appropriate. More information about SPACs can be found [here](https://spac.guide/spacbasics/) and [here](https://www.spacanalytics.com/).<br>
The SPAC market is growing exponentially:

|Year|IPO Count|Gross Proceeds(mms)|Average IPO Size(mms)|
|:--:|--------:|------------------:|--------------------:|
|2021|      456|          130,375.8|                285.9|
|2020|      248|           83,354.0|                336.1|
|2019|       59|           13,608.3|                230.6|
|2018|       46|           10,751.9|                233.7|
|2017|       34|           10,048.5|                295.5|
|2016|       13|            3,499.2|                269.2|

By their nature, SPAC shares are subject to impulsive growth at the moment of information or even just rumors that a target company for a merger has been found.<br>
A good way to capitalize on such momentum growth without having to analyze hundreds of SPACs is to take advantage of the movement of the index value that includes stocks of the most active SPACs.<br>

The selection of **10** stocks of the most active SPACs included in the basket of the proposed uSPAC10 index is made according to [spacHero database top-10 gainers](https://www.spachero.com/). spacHero is a free SPAC resource for retail investors. [**spacHero – Rapidapi.com**](https://rapidapi.com/spachero/api/spachero-spac-database/) is an official spacHero SPAC API with live rankings, SPAC target names, merger meetings, warrant redemption deadlines, price targets, SEC filings, investor presentations and more.<br>

Underlying assets are traded on the NYSE and NASDAQ, but reliable sources of quotations are either paid or provide data with a delay.<br> 
We suggest using the [**Mboum Finance – Rapidapi.com**](https://rapidapi.com/sparior/api/mboum-finance) API as the main source of quotes, which has both free and paid tariff plans, and also provides historical price data.<br> 

>**Rapidapi.com** Finance APIs allow end-users a variety of service options for their accounts as well as to stay current on events and news that impact their portfolios and financial security. For example, a finance API could remotely connect them to their bank account to initiate deposits, transfers, or other transactions. Other financial APIs include stock market news and trading platforms, cryptocurrency markets, and more. A financial API provides a secure link from a consumer to the databases and transactional servers of the institutions with which they do business. Application programming interfaces, or APIs, are the digital links between data providers and end-users. In the financial sector, security is essential as sensitive information is transferred in real-time, so only the most robust protocols are utilized to protect the data transmitted on both ends.<br>

Underlying stocks are traded during exchange hours which leaves gaps in prices between 4:00PM EST close and 9:30AM EST open the next day and on weekends and market holidays. 

## IMPLEMENTATION
### Price Identifier
In order to determine the index value, the following steps are required:

![uSPAC10g-IdxCalc](https://user-images.githubusercontent.com/25432493/198379446-af065a62-88a7-4c94-9315-f6b98b1123ca.jpg)

#### 1. Obtain Index Basket
The index basket is formed **weekly** by requesting top-10 gainers from the spacHero database, available from "spacHero – Rapidapi.com" (API)<br> 
> In order to index can reliably reflect the market picture, a periodic change of the basket of stocks included in the index is required. The index basket changes immediately after the week closes.<br>

##### Example "spacHero – Rapidapi.com" request for top-10 gainers:

```
const axios = require("axios");

const options = {
  method: 'GET',
  url: 'https://spachero-spac-database.p.rapidapi.com/top10/',
  params: {period: 'weekly', type: 'common', sortby: 'gainers'},
  headers: {
    'X-RapidAPI-Key': API_KEY,
    'X-RapidAPI-Host': 'spachero-spac-database.p.rapidapi.com'
  }
};

axios.request(options).then(function (response) {
	console.log(response.data);
}).catch(function (error) {
	console.error(error);
});
```

API Response Object:

```
{
  "Gainers": [
    {
      "Commons_Symbol": "CRHC",
      "Commons_Weekly_Change": "12.71",
      "Commons_Price": "9.94",
      "Commons_Volume": "43113"
    },
    {
      "Commons_Symbol": "HHGC",
      "Commons_Weekly_Change": "3.04",
      "Commons_Price": "10.39",
      "Commons_Volume": "4279"
    },
    {
      "Commons_Symbol": "ATA",
      "Commons_Weekly_Change": "2.15",
      "Commons_Price": "10.42",
      "Commons_Volume": "22000"
    },
    {
      "Commons_Symbol": "AMAO",
      "Commons_Weekly_Change": "1.98",
      "Commons_Price": "10.22",
      "Commons_Volume": "0"
    },
    {
      "Commons_Symbol": "EBAC",
      "Commons_Weekly_Change": "1.42",
      "Commons_Price": "9.92",
      "Commons_Volume": "43900"
    },
    {
      "Commons_Symbol": "RCAC",
      "Commons_Weekly_Change": "1.02",
      "Commons_Price": "9.94",
      "Commons_Volume": "20249"
    },
    {
      "Commons_Symbol": "TRTL",
      "Commons_Weekly_Change": "0.72",
      "Commons_Price": "9.82",
      "Commons_Volume": "3030"
    },
    {
      "Commons_Symbol": "IMAQ",
      "Commons_Weekly_Change": "0.70",
      "Commons_Price": "10.15",
      "Commons_Volume": "19285"
    },
    {
      "Commons_Symbol": "LIBY",
      "Commons_Weekly_Change": "0.70",
      "Commons_Price": "10.09",
      "Commons_Volume": "510"
    },
    {
      "Commons_Symbol": "ICNC",
      "Commons_Weekly_Change": "0.69",
      "Commons_Price": "10.14",
      "Commons_Volume": "0"
    }
  ]
}
```
<br>

#### 2. Get shares quotes

Real time and historical share prices are available from "Mboum Finance – Rapidapi.com" (API).<br> 
The API allows you to get quotes of up to 200 stocks per request.
The request returns the current stock price at the time of the request, as well as the closing price of the previous day. Close price should be used.<br>

##### Example "Mboum Finance – Rapidapi.com" request for realtime prices of shares from previous step (The API allows you to get quotes of up to 200 stocks per request):

```
const axios = require("axios");

const options = {
  method: 'GET',
  url: 'https://mboum-finance.p.rapidapi.com/qu/quote',
  params: {symbol: 'CRHC,HHGC,ATA,AMAO,EBAC,RCAC,TRTL,IMAQ,LIBY,ICNC'},
  headers: {
    'X-RapidAPI-Key': API_KEY,
    'X-RapidAPI-Host': 'mboum-finance.p.rapidapi.com'
  }
};

axios.request(options).then(function (response) {
	console.log(response.data);
}).catch(function (error) {
	console.error(error);
});
```

API Response Object:

```
[
  0:{

[
  {
    "ask": 10.01,
    "askSize": 8,
    "averageDailyVolume10Day": 82710,
    "averageDailyVolume3Month": 597631,
    "bid": 10,
    "bidSize": 13,
    "bookValue": -0.637,
    "currency": "USD",
    "dividendDate": null,
    "earningsTimestamp": {
      "date": "2021-03-31 10:59:00.000000",
      "timezone_type": 1,
      "timezone": "+00:00"
    },
    "earningsTimestampStart": {
      "date": "2021-03-31 10:59:00.000000",
      "timezone_type": 1,
      "timezone": "+00:00"
    },
    "earningsTimestampEnd": {
      "date": "2021-03-31 10:59:00.000000",
      "timezone_type": 1,
      "timezone": "+00:00"
    },
    "epsForward": null,
    "epsTrailingTwelveMonths": 0.12,
    "exchange": "NYQ",
    "exchangeDataDelayedBy": 0,
    "exchangeTimezoneName": "America/New_York",
    "exchangeTimezoneShortName": "EDT",
    "fiftyDayAverage": 9.5942,
    "fiftyDayAverageChange": 0.41079998,
    "fiftyDayAverageChangePercent": 0.042817533,
    "fiftyTwoWeekHigh": 10.05,
    "fiftyTwoWeekHighChange": -0.045000076,
    "fiftyTwoWeekHighChangePercent": -0.0044776197,
    "fiftyTwoWeekLow": 7.85,
    "fiftyTwoWeekLowChange": 2.1550002,
    "fiftyTwoWeekLowChangePercent": 0.27452233,
    "financialCurrency": "USD",
    "forwardPE": null,
    "fullExchangeName": "NYSE",
    "gmtOffSetMilliseconds": -14400000,
    "language": "en-US",
    "longName": "Cohn Robbins Holdings Corp.",
    "market": "us_market",
    "marketCap": 1035517504,
    "marketState": "REGULAR",
    "messageBoardId": "finmb_681725236",
    "postMarketChange": null,
    "postMarketChangePercent": null,
    "postMarketPrice": null,
    "postMarketTime": null,
    "priceHint": 2,
    "priceToBook": -15.706436,
    "quoteSourceName": "Nasdaq Real Time Price",
    "quoteType": "EQUITY",
    "regularMarketChange": -0.00500011,
    "regularMarketChangePercent": -0.049951144,
    "regularMarketDayHigh": 10.01,
    "regularMarketDayLow": 9.99,
    "regularMarketOpen": 9.99,
    "regularMarketPreviousClose": 10.01,
    "regularMarketPrice": 10.005,
    "regularMarketTime": {
      "date": "2022-11-02 18:42:41.000000",
      "timezone_type": 1,
      "timezone": "+00:00"
    },
    "regularMarketVolume": 54899,
    "sharesOutstanding": 82800000,
    "shortName": "Cohn Robbins Holdings Corp.",
    "sourceInterval": 15,
    "symbol": "CRHC",
    "tradeable": false,
    "trailingAnnualDividendRate": 0,
    "trailingAnnualDividendYield": 0,
    "trailingPE": 83.375,
    "twoHundredDayAverage": 9.8469,
    "twoHundredDayAverageChange": 0.15810013,
    "twoHundredDayAverageChangePercent": 0.016055828
  },
1: {},
2: {},
3: {},
4: {},
5: {},
6: {},
7: {},
8: {},
9: {}
]
```
<br>
The response to the request is an array, the number of elements in which corresponds to the number of shares in the request. Each element contains data on the corresponding share in accordance with the structure above.<br>
Main fields:<br>
- "regularMarketPreviousClose": 10.01, - closing price of the previous day
- "regularMarketPrice": 10.005, - current price
- symbol": "CRHC" - symbol of share
<br>

##### Retrieving historical price

To retrieve historical price, the `stock/history/{stock}/{interval}` method should be used for each share separately. The request must specify the interval with which historical data is provided (5m|15m|30m|1h|1d|1wk).<br>
The response to the request contains the following data:
- metadata - information about the share and the current price
- array of historical data in accordance with the specified interval

##### Example "Mboum Finance – Rapidapi.com" request for historical price (interval = 1d):

```
const axios = require("axios");

const options = {
  method: 'GET',
  url: 'https://mboum-finance.p.rapidapi.com/hi/history',
  params: {symbol: 'CRHC', interval: '1d', diffandsplits: 'false'},
  headers: {
    'X-RapidAPI-Key': '37cec062d9msh1906bc89b032f5fp1c6fc8jsn21883587ddcb',
    'X-RapidAPI-Host': 'mboum-finance.p.rapidapi.com'
  }
};

axios.request(options).then(function (response) {
	console.log(response.data);
}).catch(function (error) {
	console.error(error);
});
```

API Response Object:

```
{
  "meta": {
    "currency": "USD",
    "symbol": "CRHC",
    "exchangeName": "NYQ",
    "instrumentType": "EQUITY",
    "firstTradeDate": 1604064600,
    "regularMarketTime": 1667414561,
    "gmtoffset": -14400,
    "timezone": "EDT",
    "exchangeTimezoneName": "America/New_York",
    "regularMarketPrice": 10.005,
    "chartPreviousClose": 9.75,
    "priceHint": 2,
    "dataGranularity": "1d",
    "range": ""
  },
  "items": {                        // total 506 elements for 1d interval
    "1604064600": {
      "date": "10-30-2020",
      "date_utc": 1604064600,
      "open": 9.8,
      "high": 9.8,
      "low": 9.75,
      "close": 9.75,
      "volume": 2000,
      "adjclose": 9.75
    },
    "1604327400": {},
    "1604413800": {}, 
                 ...
    "1667414561": {
      "date": "11-02-2022",
      "date_utc": 1667414561,
      "open": 9.99,
      "high": 10.01,
      "low": 9.99,
      "close": 10.01,
      "volume": 54899,
      "adjclose": 10.01
    }
  },
  "error": null
} 
```
<br>

#### 3. Evaluate index value
3.1. Sum up quotes of all N SPAC shares included in index.<br>
3.2. Divide result by N (number of shares in index basket).<br>
```
           SumUp (Qi)
INDEX = ------------------
               N
```
where:
- Qi - quote of Share i in index;<br>
- N - number of shares in index. **N = 10**<br>

### Weekend timestamp
Over the weekend or some official holidays the REST API does not return any price, but we can request the price of a certain moment before the market close (as ex: the closing price of Friday).
Due to unavailability of price feed for stock exchange rates over the weekend or during some official holidays, tokenholders and users will be using the latest known price, which for the weekend is essentially the closing price of Friday. Same goes in a case of a liquidation process - the liquidator should use the last known price (during the weekend this is the closing price of Friday) in order to match with the price on which a synthetic asset was created, if it was created over the weekend. If not the closing price on Friday for a certain asset should be a navigating point in calculating the collateralization ratio of a position and in the liquidation process.
If a request timestamp takes place on a weekend or any other day the stock market is closed, voters should use the latest tick as the price. For the weekend that would be the closing price of the asset on Friday and for official holidays this would be the last know price provided by the price feed.
Please note that this is different than the normal calculation process, which requires using the open price of the period that the price request falls in.
### Stock markets working hours
Underlaying assets trade during exchange hours which leaves gaps in prices between 4:00PM EST close and 9:30AM EST open the next day and on weekends and market holidays.
### Price feed
Our price-feed provider’s API documentation can be found [here](https://rapidapi.com/sparior/api/mboum-finance).<br>
A reference price feed implementation that is used by liquidator and dispute bots can be seen [here](https://github.com/unisxapp/protocol/blob/USPAC5PriceFeed/packages/financial-templates-lib/src/price-feed/DefaultPriceFeedConfigs.ts)<br>
"Mboum Finance – Rapidapi.com" is provided as an accessible source to query for this data, but ultimately how one queries for these rates should be varied and determined by the voter to ensure that there is no central point of failure.<br>
In the case of a "Mboum Finance – Rapidapi.com" outage voters can turn to any other available price feed API or a broker API, as the price feeds for the forementioned financial assets does not differ much between different providers. There might be some slight differences, however they are quite insignificant and would not affect the liquidation or dispute processes. For this case, we provide options for additional price feed providers that voters could utilize.
### Additional price feed providers
- **Quotient – Rapidapi.com**<br>
-- Documentation for the API can be found here: https://rapidapi.com/dubois4and/api/quotient<br>
-- Live price feed data<br>
-- Registration is free<br>
-- Free and paid plans available: https://rapidapi.com/dubois4and/api/quotient/pricing<br>
-- OHLC request can be used to grab the last closing price before a weekend or a non-working day<br>
-- Example (CRHC) requests:
```
const axios = require("axios");

const options = {
  method: 'GET',
  url: 'https://quotient.p.rapidapi.com/equity/intraday',
  params: {
    symbol: 'CRHC',
    interval: '1',
    from: '2020-04-21 10:00',
    to: '2020-04-21 10:30',
    adjust: 'false'
  },
  headers: {
    'X-RapidAPI-Key': API_KEY,
    'X-RapidAPI-Host': 'quotient.p.rapidapi.com'
  }
};

axios.request(options).then(function (response) {
	console.log(response.data);
}).catch(function (error) {
	console.error(error);
});
```

## SECURITY CONSIDERATIONS
Security considerations are focused on the use of the token price for monitoring collateral ratios.

The risk of manipulation of stock quotes included in the index is insignificant because a reliable source of quotes is used. In addition, users - voters and disputers - have the opportunity to check the calculation of the index value based on independent sources of quotations themselves.

***
Security considerations, like the ones above, have been contemplated and addressed, but there is potential for security holes to emerge due to the novelty of this price identifier.

Additionally, anyone deploying a new priceless token contract referencing this identifier should take care to parameterize the contract appropriately to avoid the loss of funds for synthetic token holders. Contract deployers should also ensure that there is a network of liquidators and disputers ready to perform the services necessary to keep the contract solvent.

$UMA-holders should evaluate the ongoing cost and benefit of supporting price requests for this identifier and also contemplate de-registering this identifier or editing its implementation if security holes are identified. 

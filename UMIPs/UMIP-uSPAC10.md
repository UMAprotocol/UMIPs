## HEADERS
|UMIP-<#>      | | 
|:-------------|:-----------------------------------------------------------------------------|
|UMIP title|Add uSPAC10 as price identifier|
|Author|BinomFX (binomfx@gmail.com)|
|Status|Draft| 
|Created|20.10.2021|
|Discourse Link|https://discourse.umaproject.org/t/add-uspac10-as-price-identifier-for-emp-contract/1357?u=binomfx|

## SUMMARY
The DVM should support price requests for uSPAC10 price identifier<br>
The purpose of these price identifier is to create synthetic token, price of which is linked to the value of index of **10** most active SPACs (Special Purpose Acquisition Companies) shares.<br> That synthetic token can be used for creating speculative strategies at IPO market.

## MOTIVATION
A synthetic token that tracks the index of the 10 most active SPACs stocks can be used for speculative purposes and allows the user to earn on price movements in one of the most interesting markets without centralized intermediaries such as exchanges and brokers.<br> 
In addition, that token can be used as components associated with classical markets by other DeFi and DApp protocols, which makes it possible to scale.

## TECHNICAL SPECIFICATION
| | |
|:---------------------------|:---------------------------------------------------|
|**Identifier name**         |**uSPAC10**|
|Base asset                  | Most active SPAC shares.|
|Quote Currency              | USD|
|Intended Collateral Currency| USDC|
|Market                      | NYSE, NASDAQ|
|Source                      |["Stock Data  – Rapidapi.com"](https://rapidapi.com/principalapis/api/stock-data-yahoo-finance-alternative/), API - Cost to use: Free 1000 requests per month, [Pricing](https://rapidapi.com/principalapis/api/stock-data-yahoo-finance-alternative/pricing)|
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
`A good way to capitalize on such momentum growth without having to analyze hundreds of SPACs is to take advantage of the movement of the index value that includes stocks of the most active SPACs.`<br>

The selection of **10** stocks of the most active SPACs included in the basket of the proposed uSPAC10 index is made according to [SPAC Analytics Top Performing SPACs](https://www.spacanalytics.com/).<br>
>SPAC Analytics is the leading provider of SPAC data and research to portfolio managers and investment banks since 2007.

These underlying assets are traded on the NYSE and NASDAQ, but reliable sources of quotations are either paid or provide data with a delay.<br> 
We suggest using the ["Stock Data  – Rapidapi.com"](https://rapidapi.com/principalapis/api/stock-data-yahoo-finance-alternative/) API as the main source of quotes, which has both free and paid tariff plans, and also provides historical price data.

>Back in early 2018, MarketStack was initially presented under a different name with the aim of providing a free and cost-effective market data alternative to Yahoo Finance. In the course of the years, MarketStack REST API has become one of the most popular one-stop shop solutions for real-time, intraday and historical stock data, supporting a total of 170,000+ stock tickers from 70 global stock exchanges, including NASDAQ, Australian Stock Exchange, London Stock Exchange, and many more.

>The MarketStack API is built on top of scalable, cutting-edge cloud infrastructure, handling millions of concurrent API requests each day. Using the API customer will be able to obtain rate information as well as metadata about stock tickers, companies as well as stock exchanges.

Underlying stocks are traded during exchange hours which leaves gaps in prices between 4:00PM EST close and 9:30AM EST open the next day and on weekends and market holidays. 

## IMPLEMENTATION
### Price Identifier
The index basket is formed by including the first 10 stocks from the Top Performing SPACs table from the website [SPACanalytics.com](https://www.spacanalytics.com/)
The list of stocks included in the index basket are:
|N|TICKER|MARKET|
|:-:|:------:|:--------:|
|1|DWAC|NASDAQ|
|2|IRDM|NASDAQ|
|3|PRIM|NASDAQ|
|4|TGLS|NASDAQ|
|5|MP|NYSE|
|6|LCID|NASDAQ|
|7|GDYN|NASDAQ|
|8|SMPL|NASDAQ|
|9|ENVX|NASDAQ|
|10|QS|NYSE|
<br>
In order to determine the index value, the following steps are required:

#### 1. Get shares quotes
Real time and historical share prices are available from "Stock Data – Rapidapi.com" (API).<br> 
Price requests should use the daily price for the date corresponding to price request timestamp. Close price should be used.
<br><br>
##### Example "Stock Data – Rapidapi.com" request for 10 shares listed above **realtime prices**:
```
var axios = require("axios").default;

var options = {
  method: 'GET',
  url: 'https://stock-data-yahoo-finance-alternative.p.rapidapi.com/v6/finance/quote',
  params: {symbols: 'DWAC,IRDM,PRIM,TGLS,MP,LCID,GDYN,SMPL,ENVX,QS'},
  headers: {
    'x-rapidapi-host': 'stock-data-yahoo-finance-alternative.p.rapidapi.com',
    'x-rapidapi-key': '37cec062d9msh1906bc89b032f5fp1c6fc8jsn21883587ddcb'
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
{1 item
    "quoteResponse":{2 items
        "result":[10 items
            0:{63 items
                "language":"en-US"
                "region":"US"
                "quoteType":"EQUITY"
                "quoteSourceName":"Delayed Quote"
                "triggerable":true
                "currency":"USD"
                "shortName":"Digital World Acquisition Corp."
                "marketState":"POSTPOST"
                "twoHundredDayAverageChangePercent":0.03635165
                "priceToBook":-181.1017
                "sourceInterval":15
                "exchangeDataDelayedBy":0
                "ipoExpectedDate":"2021-09-30"
                "tradeable":false
                "exchange":"NGM"
                "longName":"Digital World Acquisition Corp."
                "messageBoardId":"finmb_715145893"
                "exchangeTimezoneName":"America/New_York"
                "exchangeTimezoneShortName":"EST"
                "gmtOffSetMilliseconds":-18000000
                "market":"us_market"
                "esgPopulated":false
                "firstTradeDateMilliseconds":1633008600000
                "priceHint":2
                "postMarketChangePercent":-0.56153876
                "postMarketTime":1638233985
                "postMarketPrice":42.5
                "postMarketChange":-0.24000168
                "regularMarketChange":-0.3599968
                "regularMarketChangePercent":-0.83525944
                "regularMarketTime":1638219603
                "regularMarketPrice":42.74
                "regularMarketDayHigh":44.2
                "regularMarketDayRange":"41.51 - 44.2"
                "regularMarketDayLow":41.51
                "regularMarketVolume":1393432
                "regularMarketPreviousClose":43.1
                "bid":42.41
                "ask":42.69
                "bidSize":8
                "askSize":9
                "fullExchangeName":"NasdaqGM"
                "financialCurrency":"USD"
                "regularMarketOpen":43.46
                "averageDailyVolume3Month":23048800
                "averageDailyVolume10Day":4166100
                "fiftyTwoWeekLowChange":32.9
                "fiftyTwoWeekLowChangePercent":3.343496
                "fiftyTwoWeekRange":"9.84 - 175.0"
                "fiftyTwoWeekHighChange":-132.26
                "fiftyTwoWeekHighChangePercent":-0.7557714
                "fiftyTwoWeekLow":9.84
                "fiftyTwoWeekHigh":175
                "sharesOutstanding":30027200
                "bookValue":-0.236
                "fiftyDayAverage":41.24083
                "fiftyDayAverageChange":1.4991722
                "fiftyDayAverageChangePercent":0.03635165
                "twoHundredDayAverage":41.24083
                "twoHundredDayAverageChange":1.4991722
                "marketCap":1590556288
                "displayName":"Digital World"
                "symbol":"DWAC"
            }
            1:{...}71 items
            2:{...}76 items
            3:{...}76 items
            4:{...}73 items
            5:{...}73 items
            6:{...}72 items
            7:{...}73 items
            8:{...}72 items
            9:{...}72 items
        ]
        "error":NULL
    }
}
```
The most important fields are:
- "exchangeDataDelayedBy":0 - means no delay in quotes
- "regularMarketPrice":42.74 - current price, after closing (4:00 pm ET) equals current day close price
- "regularMarketDayHigh":44.2 - high daily price
- "regularMarketDayLow":41.51 - low daily price
- "regularMarketPreviousClose":43.1 - previous day close price, changedat 0:00 am ET
- "regularMarketOpen":43.46 - open daily price
- "symbol":"DWAC" - share ticker

##### Example "Stock Data – Rapidapi.com" request for 10 shares listed above **historical** price:
```
var axios = require("axios").default;

var options = {
  method: 'GET',
  url: 'https://stock-data-yahoo-finance-alternative.p.rapidapi.com/v8/finance/spark',
  params: {
    symbols: 'DWAC,IRDM,PRIM,TGLS,MP,LCID,GDYN,SMPL,ENVX,QS',
    range: '3mo',
    interval: '1d'
  },
  headers: {
    'x-rapidapi-host': 'stock-data-yahoo-finance-alternative.p.rapidapi.com',
    'x-rapidapi-key': '37cec062d9msh1906bc89b032f5fp1c6fc8jsn21883587ddcb'
  }
};

axios.request(options).then(function (response) {
	console.log(response.data);
}).catch(function (error) {
	console.error(error);
});
```
API Response Objects:

```
{10 items
    "SMPL":{8 items
        "previousClose":NULL
        "chartPreviousClose":35.62
        "symbol":"SMPL"
        "timestamp":[...]63 items
        "end":NULL
        "start":NULL
        "close":[63 items
            0:35.69
            1:35.82
            2:35.56
            3:34.75
            4:35.71
            5:34.65
            6:35.17
            7:35.1
            8:34.73
            9:34.95
            10:34.98
            11:34.61
            12:34.27
            13:34.91
            14:35.74
            15:35.73
            16:35.01
            17:35.13
            18:34.44
            19:35.28
            20:34.49
            21:35.5
            22:35.33
            23:35.17
            24:35.89
            25:36.21
            26:35.49
            27:35.41
            28:35.43
            29:34.45
            30:34.63
            31:35.01
            32:35.23
            33:34.5
            34:34.15
            35:34.31
            36:37.27
            37:38.82
            38:39.7
            39:38.86
            40:40.15
            41:39.65
            42:39.55
            43:40.05
            44:39.88
            45:39.5
            46:41.02
            47:40.88
            48:40.4
            49:39.74
            50:39.22
            51:39.51
            52:39.75
            53:40.47
            54:39.62
            55:39.38
            56:39.01
            57:39.09
            58:39.45
            59:39.67
            60:37.93
            61:37.77
            62:36.97
        ]
        "dataGranularity":300
    }
    "IRDM":{...}8 items
    "LCID":{...}8 items
    "QS":{...}8 items
    "MP":{...}8 items
    "GDYN":{...}8 items
    "PRIM":{...}8 items
    "DWAC":{...}8 items
    "ENVX":{...}8 items
    "TGLS":{...}8 items
}
```

#### 2. Evaluate index value
2.1. Sum up quotes of all N SPAC shares included in index.<br>
2.2. Divide result by N (number of shares in index basket).<br>
```
           SumUp (Qi)
INDEX = ------------------
               N
```
where:
- Qi - quote of Share i in index;<br>
- N - number of shares in index. **N = 10**<br>

> In order to index can reliably reflect the market picture, a periodic change of the basket of stocks included in the index is required. Therefore, we will publish a new price identifier quarterly.

### Weekend timestamp
Over the weekend or some official holidays the REST API does not return any price, but we can request the price of a certain moment before the market close (as ex: the closing price of Friday).
Due to unavailability of price feed for stock exchange rates over the weekend or during some official holidays, tokenholders and users will be using the latest known price, which for the weekend is essentially the closing price of Friday. Same goes in a case of a liquidation process - the liquidator should use the last known price (during the weekend this is the closing price of Friday) in order to match with the price on which a synthetic asset was created, if it was created over the weekend. If not the closing price on Friday for a certain asset should be a navigating point in calculating the collateralization ratio of a position and in the liquidation process.
If a request timestamp takes place on a weekend or any other day the stock market is closed, voters should use the latest tick as the price. For the weekend that would be the closing price of the asset on Friday and for official holidays this would be the last know price provided by the price feed.
Please note that this is different than the normal calculation process, which requires using the open price of the period that the price request falls in.
### Stock markets working hours
Underlaying assets trade during exchange hours which leaves gaps in prices between 4:00PM EST close and 9:30AM EST open the next day and on weekends and market holidays.
### Price feed
Our price-feed provider’s API documentation can be found [here](https://rapidapi.com/principalapis/api/stock-data-yahoo-finance-alternative/).<br>
A reference price feed implementation that is used by liquidator and dispute bots can be seen [here](https://github.com/unisxapp/uma/tree/USPAC5PriceFeed)<br>
"Stock Data  – Rapidapi.com" is provided as an accessible source to query for this data, but ultimately how one queries for these rates should be varied and determined by the voter to ensure that there is no central point of failure.<br>
In the case of a "Stock Data  – Rapidapi.com" outage voters can turn to any other available price feed API or a broker API, as the price feeds for the forementioned financial assets does not differ much between different providers. There might be some slight differences, however they are quite insignificant and would not affect the liquidation or dispute processes. For this case, we provide options for additional price feed providers that voters could utilize.
### Additional price feed providers
- **Yahoo Finance – Rapidapi.com**<br>
-- Documentation for the API can be found here: https://rapidapi.com/apidojo/api/yahoo-finance1<br>
-- Live price feed data<br>
-- Historical prices based on date and time<br>
-- Registration is free<br>
-- Free and paid plans available: https://rapidapi.com/apidojo/api/yh-finance/pricing<br>
-- OHLC request can be used to grab the last closing price before a weekend or a non-working day<br>
-- Example (PSTH) requests:
```
var axios = require("axios").default;

var options = {
  method: 'GET',
  url: 'https://apidojo-yahoo-finance-v1.p.rapidapi.com/auto-complete',
  params: {q: 'PSTH', region: 'US'},
  headers: {
    'x-rapidapi-host': 'apidojo-yahoo-finance-v1.p.rapidapi.com',
    'x-rapidapi-key': ACCESS_KEY
  }
};

axios.request(options).then(function (response) {
  console.log(response.data);
}).catch(function (error) {
  console.error(error);
});
```
- **Stock and Options Trading Data Provider API – Rapidapi.com**<br>
-- Documentation for the API can be found here: https://rapidapi.com/mpeng/api/stock-and-options-trading-data-provider<br>
-- Live price feed data<br>
-- Historical prices based on date and time<br>
-- Registration is free<br>
-- Free and paid plans available: https://rapidapi.com/mpeng/api/stock-and-options-trading-data-provider/pricing<br>
-- OHLC request can be used to grab the last closing price before a weekend or a non-working day<br>
-- Example (PSTH) requests:
```
var axios = require("axios").default;

var options = {
  method: 'GET',
  url: 'https://stock-and-options-trading-data-provider.p.rapidapi.com/straddle/PSTH',
  headers: {
    'x-rapidapi-host': 'stock-and-options-trading-data-provider.p.rapidapi.com',
    'x-rapidapi-key': ACCESS_KEY
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

The risk of manipulation of stock quotes included in the index is insignificant because a reliable source of quotes is used. In addition, users - wouters and disputers - have the opportunity to check the calculation of the index value based on independent sources of quotations themselves.

***
Security considerations, like the ones above, have been contemplated and addressed, but there is potential for security holes to emerge due to the novelty of this price identifier.

Additionally, anyone deploying a new priceless token contract referencing this identifier should take care to parameterize the contract appropriately to avoid the loss of funds for synthetic token holders. Contract deployers should also ensure that there is a network of liquidators and disputers ready to perform the services necessary to keep the contract solvent.

$UMA-holders should evaluate the ongoing cost and benefit of supporting price requests for this identifier and also contemplate de-registering this identifier or editing its implementation if security holes are identified. 

## HEADERS
|UMIP-      | | 
|:-------------|:-----------------------------------------------------------------------------|
|UMIP title|Add uSPAC10_JUN22 as price identifier|
|Author|BinomFX (binomfx@gmail.com)|
|Status|Draft| 
|Created|28.03.2022|
|Discourse Link|https://discourse.umaproject.org/t/add-uspac10-as-price-identifier-for-emp-contract/1357?u=binomfx|

## SUMMARY
The DVM should support price requests for uSPAC10_MAR22 price identifier<br>
The purpose of these price identifier is to create synthetic token, price of which is linked to the value of index of **10** most active SPACs (Special Purpose Acquisition Companies) shares.<br> That synthetic token can be used for creating speculative strategies at IPO market.

## MOTIVATION
A synthetic token that tracks the index of the 10 most active SPACs stocks can be used for speculative purposes and allows the user to earn on price movements in one of the most interesting markets without centralized intermediaries such as exchanges and brokers.<br> 
In addition, that token can be used as components associated with classical markets by other DeFi and DApp protocols, which makes it possible to scale.

## TECHNICAL SPECIFICATION
| | |
|:---------------------------|:---------------------------------------------------|
|**Identifier name**         |**uSPAC10_JUN22**|
|Base asset                  | Most active SPAC shares.|
|Quote Currency              | USD|
|Intended Collateral Currency| USDC|
|Expiration date             | 30.06.2022|
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
We suggest using the ["Stock Data – Rapidapi.com"](https://rapidapi.com/principalapis/api/stock-data-yahoo-finance-alternative/) API as the main source of quotes, which has both free and paid tariff plans, and also provides historical price data.

>Stock Data – Rapidapi.com is a decision for retrieving real time stock data. Alternative to the Yahoo Finance API. Rapidapi.com Finance APIs allow end-users a variety of service options for their accounts as well as to stay current on events and news that impact their portfolios and financial security. For example, a finance API could remotely connect them to their bank account to initiate deposits, transfers, or other transactions. Other financial APIs include stock market news and trading platforms, cryptocurrency markets, and more. A financial API provides a secure link from a consumer to the databases and transactional servers of the institutions with which they do business. Application programming interfaces, or APIs, are the digital links between data providers and end-users. In the financial sector, security is essential as sensitive information is transferred in real-time, so only the most robust protocols are utilized to protect the data transmitted on both ends.

Underlying stocks are traded during exchange hours which leaves gaps in prices between 4:00PM EST close and 9:30AM EST open the next day and on weekends and market holidays. 

## IMPLEMENTATION
### Price Identifier
The index basket is formed by including the first 10 stocks from the Top Performing SPACs table from the website [SPACanalytics.com](https://www.spacanalytics.com/)
The list of stocks included in the index basket are:
|N|TICKER|MARKET|
|:--:|:------:|:--------:|
| 1|DWAC|NASDAQ|
| 2|IRDM|NASDAQ|
| 3|MP  |NYSE  |
| 4|PRIM|NASDAQ|
| 5|WSC |NASDAQ|
| 6|SMPL|NASDAQ|
| 7|TGLS|NASDAQ|
| 8|CERE|NASDAQ|
| 9|KW  |NYSE  |
|10|ROIC|NASDAQ|
<br>
In order to determine the index value, the following steps are required:

#### 1. Get shares quotes
Real time and historical share prices are available from "Stock Data – Rapidapi.com" (API).<br> 
Price requests should use the 1 minute quotes for the date corresponding to price request timestamp. Close price should be used.
<br><br>
##### Example "Stock Data – Rapidapi.com" request for 10 shares listed above **realtime prices**:
```
var axios = require("axios").default;

var options = {
  method: 'GET',
  url: 'https://stock-data-yahoo-finance-alternative.p.rapidapi.com/v6/finance/quote',
  params: {symbols: 'DWAC,IRDM,PRIM,TGLS,MP,LCID,GDYN,SMPL,KW,BWMX'},
  headers: {
    'x-rapidapi-host': 'stock-data-yahoo-finance-alternative.p.rapidapi.com',
    'x-rapidapi-key': ACCESS_KEY
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
- "regularMarketPreviousClose":43.1 - previous day close price, changed at 0:00 am ET
- "regularMarketOpen":43.46 - open daily price
- "symbol":"DWAC" - share ticker

##### Retrieving historical price

To retrieve historical price, the `Stock History` method should be used. It is available via `https://stock-data-yahoo-finance-alternative.p.rapidapi.com/v8/finance/spark` endpoint. 1 minute pricing interval should be used.

For each symbol the method returns two arrays of the same length. The first is array of timestamps for interval open moment. The second is array of **closing** prices for the same intervals.

The price for the given timestamp is calculated like this:

- Find the interval for the timestamp. The interval begin timestamp must be less or equal than given timestamp, and the interval end timestamp must be greater than given timestamp
- Get the closing price for the interval found in the previous step
- Evaluate index value (see later)


##### Example "Stock Data – Rapidapi.com" request for 10 shares listed above **historical** price:
```
var axios = require("axios").default;

var options = {
  method: 'GET',
  url: 'https://stock-data-yahoo-finance-alternative.p.rapidapi.com/v8/finance/spark',
  params: {
    symbols: 'DWAC,IRDM,PRIM,TGLS,MP,LCID,GDYN,SMPL,KW,BWMX',
    interval: '1m'
  },
  headers: {
    'x-rapidapi-host': 'stock-data-yahoo-finance-alternative.p.rapidapi.com',
    'x-rapidapi-key': ACCESS_KEY
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
{10 items
  "SMPL":{8 items
    "symbol":"SMPL"
    "timestamp":[...]95 items
    "previousClose":37.92
    "chartPreviousClose":37.92
    "end":1639602000
    "start":1639578600
    "close":[95 items
      0:38
      1:37.73
      2:37.73
      3:37.74
      4:37.63
      5:37.59
      6:37.5
      7:37.635
      8:37.65
      9:37.645
      10:37.69
      11:37.6
      12:37.6
      13:37.59
      14:37.55
      15:37.475
      16:37.59
      17:37.54
      18:37.59
      19:37.67
      20:37.655
      21:37.719
      22:37.7
      23:37.81
      24:37.76
      25:37.76
      26:37.655
      27:37.74
      28:37.72
      29:37.8
      30:37.77
      31:37.78
      32:37.685
      33:37.69
      34:37.76
      35:37.57
      36:37.6
      37:37.59
      38:37.62
      39:37.6
      40:37.64
      41:37.53
      42:37.58
      43:37.53
      44:37.451
      45:37.41
      46:37.36
      47:37.36
      48:37.33
      49:37.28
      50:37.31
      51:37.28
      52:37.285
      53:37.36
      54:37.305
      55:37.31
      56:37.34
      57:37.36
      58:37.38
      59:37.35
      60:37.315
      61:37.345
      62:37.32
      63:37.39
      64:37.36
      65:37.36
      66:37.27
      67:37.39
      68:37.395
      69:37.43
      70:37.45
      71:37.5
      72:37.44
      73:37.58
      74:37.51
      75:37.445
      76:37.49
      77:37.469
      78:37.41
      79:37.41
      80:37.42
      81:37.41
      82:37.42
      83:37.39
      84:37.345
      85:37.32
      86:37.305
      87:37.339
      88:37.36
      89:37.36
      90:37.39
      91:37.35
      92:37.35
      93:37.33
      94:NULL
    ]
    "dataGranularity":300
  }
  "IRDM":{...}8 items
  "LCID":{...}8 items
  "QS":{...}8 items
  "GDYN":{...}8 items
  "PRIM":{...}8 items
  "MP":{...}8 items
  "DWAC":{...}8 items
  "KW":{...}8 items
  "BWMX":{...}8 items
}
```

#### 2. Evaluate index value
2.1. Sum up quotes of all N SPAC shares included in index.<br>
2.2. Divide result by N (number of shares in index basket).<br>
```
           SumUp (Qi)
INDEX = ------------------ * K
               N
```
where:
- Qi - quote of Share i in index;<br>
- N - number of shares in index. **N = 10**<br>
- K - Correction factor, used to smooth the index values when the basket is changed. For the current index bucket **K = 1**. The value of K changes when the index basket changes and is calculated in accordance as quotient of division INDEXold by INDEXnew:<br>
```
                INDEXold
          K = ------------
                INDEXnew
```
where:
- INDEXold – the last index value calculated from the old basket;<br>
- INDEXnew – the first index value calculated for the new basket at the same time as INDEXold;<br>

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
A reference price feed implementation that is used by liquidator and dispute bots can be seen [here](__________________________________________________________)<br>
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

The risk of manipulation of stock quotes included in the index is insignificant because a reliable source of quotes is used. In addition, users - vouters and disputers - have the opportunity to check the calculation of the index value based on independent sources of quotations themselves.

***
Security considerations, like the ones above, have been contemplated and addressed, but there is potential for security holes to emerge due to the novelty of this price identifier.

Additionally, anyone deploying a new priceless token contract referencing this identifier should take care to parameterize the contract appropriately to avoid the loss of funds for synthetic token holders. Contract deployers should also ensure that there is a network of liquidators and disputers ready to perform the services necessary to keep the contract solvent.

$UMA-holders should evaluate the ongoing cost and benefit of supporting price requests for this identifier and also contemplate de-registering this identifier or editing its implementation if security holes are identified. 

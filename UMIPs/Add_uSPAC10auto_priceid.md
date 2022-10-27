## HEADERS
|UMIP-     | | 
|:-------------|:-----------------------------------------------------------------------------|
|UMIP title|Add uSPAC10g as price identifier|
|Author|BinomFX (binomfx@gmail.com)|
|Status|Draft| 
|Created|27.10.2022|
|Discourse Link|https://discourse.umaproject.org/_________|

## SUMMARY
The DVM should support price requests for uSPAC10g price identifier<br>
The purpose of this price identifier is to create synthetic token, price of which is linked to the value of index of **10** most active SPACs (Special Purpose Acquisition Companies) shares.<br> That synthetic token can be used for creating speculative strategies at IPO market.<br>
The difference from the existing UMIP-140 is that the proposed price ID does not require manually changing the basket of 10 SPAC shares on a quarterly basis.

## MOTIVATION
A synthetic token that tracks the index of the 10 most active SPACs stocks can be used for speculative purposes and allows the user to earn on price movements in one of the most interesting markets without centralized intermediaries such as exchanges and brokers.<br> 
In addition, that token can be used as components associated with classical markets by other DeFi and DApp protocols, which makes it possible to scale.

## TECHNICAL SPECIFICATION
| | |
|:---------------------------|:---------------------------------------------------|
|**Identifier name**         |**uSPAC10g**|
|Base asset                  | Most active SPAC shares.|
|Quote Currency              | USD|
|Intended Collateral Currency| USDC|
|Market                      | NYSE, NASDAQ|
|Shares Basket Source        |["spacHero – Rapidapi.com"](https://rapidapi.com/spachero/api/spachero-spac-database/), API - Cost to use: Free 10 requests per day, [Pricing](https://rapidapi.com/spachero/api/spachero-spac-database/pricing)|
|Shares Quotes Source        |["Yahoo Finance 97 – Rapidapi.com"](https://rapidapi.com/asepscareer/api/yahoo-finance97), API - Cost to use: Free 900 requests per month, [Pricing](https://rapidapi.com/asepscareer/api/yahoo-finance97/pricing)|
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
We suggest using the [**Yahoo Finance 97 – Rapidapi.com**](https://rapidapi.com/asepscareer/api/yahoo-finance97) API as the main source of quotes, which has both free and paid tariff plans, and also provides historical price data.<br> 

>**Rapidapi.com** Finance APIs allow end-users a variety of service options for their accounts as well as to stay current on events and news that impact their portfolios and financial security. For example, a finance API could remotely connect them to their bank account to initiate deposits, transfers, or other transactions. Other financial APIs include stock market news and trading platforms, cryptocurrency markets, and more. A financial API provides a secure link from a consumer to the databases and transactional servers of the institutions with which they do business. Application programming interfaces, or APIs, are the digital links between data providers and end-users. In the financial sector, security is essential as sensitive information is transferred in real-time, so only the most robust protocols are utilized to protect the data transmitted on both ends.<br>

Underlying stocks are traded during exchange hours which leaves gaps in prices between 4:00PM EST close and 9:30AM EST open the next day and on weekends and market holidays. 

## IMPLEMENTATION
### Price Identifier
In order to determine the index value, the following steps are required:

#### 1. Obtain Index Basket
The index basket is formed **weekly** by requesting top-10 gainers from the spacHero database, available from "spacHero – Rapidapi.com" (API)<br> 
> In order to index can reliably reflect the market picture, a periodic change of the basket of stocks included in the index is required. Therefore, we request a new price identifier weekly.

##### Example "spacHero – Rapidapi.com" request for top-10 gainer:

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

Real time and historical share prices are available from "Yahoo Finance 97 – Rapidapi.com" (API).<br> 
It is necessary to request the price of each stock included in the index basket in the previous step.<br>
Price requests should use the 1 minute quotes for the date corresponding to price request timestamp. Close price should be used.
<br><br>
##### Example "Yahoo Finance 97 – Rapidapi.com" request for **realtime prices**:

```
const axios = require("axios");

const encodedParams = new URLSearchParams();
encodedParams.append("symbol", "CRHC");
encodedParams.append("period", "1d");

const options = {
  method: 'POST',
  url: 'https://yahoo-finance97.p.rapidapi.com/price',
  headers: {
    'content-type': 'application/x-www-form-urlencoded',
    'X-RapidAPI-Key': API_KEY,
    'X-RapidAPI-Host': 'yahoo-finance97.p.rapidapi.com'
  },
  data: encodedParams
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
  "data": [
    {
      "Close": 9.9399995804,
      "Date": 1664496000000,
      "Dividends": 0,
      "High": 9.9399995804,
      "Low": 9.9300003052,
      "Open": 9.9300003052,
      "Stock Splits": 0,
      "Volume": 43100
    }
  ],
  "message": "Success",
  "status": 200
} 
```
<br>
##### Retrieving historical price

To retrieve historical price, the `Stock History` method should be used. It is available via `https://stock-data-yahoo-finance-alternative.p.rapidapi.com/v8/finance/spark` endpoint. 1 minute pricing interval should be used.

For each symbol the method returns two arrays of the same length. The first is array of timestamps for interval open moment. The second is array of **closing** prices for the same intervals.

The price for the given timestamp is calculated like this:

- Find the interval for the timestamp. The interval begin timestamp must be less or equal than given timestamp, and the interval end timestamp must be greater than given timestamp
- Get the closing price for the interval found in the previous step
- Evaluate index value (see later)


##### Example "Yahoo Finance 97 – Rapidapi.com" request for **historical** price:

```
const axios = require("axios");

const encodedParams = new URLSearchParams();
encodedParams.append("end", "2022-09-30");
encodedParams.append("symbol", "CRHC");
encodedParams.append("start", "2022-09-01");

const options = {
  method: 'POST',
  url: 'https://yahoo-finance97.p.rapidapi.com/price-customdate',
  headers: {
    'content-type': 'application/x-www-form-urlencoded',
    'X-RapidAPI-Key': API_KEY,
    'X-RapidAPI-Host': 'yahoo-finance97.p.rapidapi.com'
  },
  data: encodedParams
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
  "data": [
    {
      "Adj Close": 9.6800003052,
      "Close": 9.6800003052,
      "Date": 1661990400000,
      "High": 9.779999733,
      "Low": 9.25,
      "Open": 9.6899995804,
      "Volume": 1222500
    },
    {
      "Adj Close": 8.8599996567,
      "Close": 8.8599996567,
      "Date": 1662076800000,
      "High": 9.9499998093,
      "Low": 8.3100004196,
      "Open": 9.8100004196,
      "Volume": 1037200
    },
    {
      "Adj Close": 8.5799999237,
      "Close": 8.5799999237,
      "Date": 1662422400000,
      "High": 9.1000003815,
      "Low": 8.1999998093,
      "Open": 8.8900003433,
      "Volume": 637100
    },
    {
      "Adj Close": 9.1300001144,
      "Close": 9.1300001144,
      "Date": 1662508800000,
      "High": 9.1999998093,
      "Low": 8.5,
      "Open": 8.6000003815,
      "Volume": 285400
    },
    {
      "Adj Close": 7.9600000381,
      "Close": 7.9600000381,
      "Date": 1662595200000,
      "High": 9.3999996185,
      "Low": 7.8499999046,
      "Open": 9.3999996185,
      "Volume": 596500
    },
    {
      "Adj Close": 8.4499998093,
      "Close": 8.4499998093,
      "Date": 1662681600000,
      "High": 8.6700000763,
      "Low": 7.9099998474,
      "Open": 7.9099998474,
      "Volume": 153800
    },
    {
      "Adj Close": 8.2899999619,
      "Close": 8.2899999619,
      "Date": 1662940800000,
      "High": 8.5900001526,
      "Low": 8.2100000381,
      "Open": 8.4399995804,
      "Volume": 108300
    },
    {
      "Adj Close": 8.3699998856,
      "Close": 8.3699998856,
      "Date": 1663027200000,
      "High": 8.6000003815,
      "Low": 8.1800003052,
      "Open": 8.1800003052,
      "Volume": 144300
    },
    {
      "Adj Close": 8.5500001907,
      "Close": 8.5500001907,
      "Date": 1663113600000,
      "High": 8.6440000534,
      "Low": 8.3599996567,
      "Open": 8.3999996185,
      "Volume": 43100
    },
    {
      "Adj Close": 8.6000003815,
      "Close": 8.6000003815,
      "Date": 1663200000000,
      "High": 8.9799995422,
      "Low": 8.4510002136,
      "Open": 8.470000267,
      "Volume": 191900
    },
    {
      "Adj Close": 8.779999733,
      "Close": 8.779999733,
      "Date": 1663286400000,
      "High": 9,
      "Low": 8.4600000381,
      "Open": 8.5100002289,
      "Volume": 142900
    },
    {
      "Adj Close": 8.8100004196,
      "Close": 8.8100004196,
      "Date": 1663545600000,
      "High": 8.8199996948,
      "Low": 8.3000001907,
      "Open": 8.7299995422,
      "Volume": 154700
    },
    {
      "Adj Close": 9.1700000763,
      "Close": 9.1700000763,
      "Date": 1663632000000,
      "High": 9.4499998093,
      "Low": 8.5100002289,
      "Open": 8.6999998093,
      "Volume": 539800
    },
    {
      "Adj Close": 9.1800003052,
      "Close": 9.1800003052,
      "Date": 1663718400000,
      "High": 9.279999733,
      "Low": 8.8500003815,
      "Open": 9.279999733,
      "Volume": 116200
    },
    {
      "Adj Close": 9.1999998093,
      "Close": 9.1999998093,
      "Date": 1663804800000,
      "High": 9.375,
      "Low": 9.0220003128,
      "Open": 9.1309995651,
      "Volume": 160700
    },
    {
      "Adj Close": 9.1700000763,
      "Close": 9.1700000763,
      "Date": 1663891200000,
      "High": 9.3000001907,
      "Low": 8.9200000763,
      "Open": 9.1300001144,
      "Volume": 115300
    },
    {
      "Adj Close": 9.9300003052,
      "Close": 9.9300003052,
      "Date": 1664150400000,
      "High": 9.9499998093,
      "Low": 9.9200000763,
      "Open": 9.9300003052,
      "Volume": 698500
    },
    {
      "Adj Close": 9.9300003052,
      "Close": 9.9300003052,
      "Date": 1664236800000,
      "High": 9.9499998093,
      "Low": 9.9200000763,
      "Open": 9.9200000763,
      "Volume": 196400
    },
    {
      "Adj Close": 9.9300003052,
      "Close": 9.9300003052,
      "Date": 1664323200000,
      "High": 9.9399995804,
      "Low": 9.9300003052,
      "Open": 9.9300003052,
      "Volume": 29300
    },
    {
      "Adj Close": 9.9300003052,
      "Close": 9.9300003052,
      "Date": 1664409600000,
      "High": 9.9399995804,
      "Low": 9.9200000763,
      "Open": 9.9200000763,
      "Volume": 24500
    }
  ],
  "message": "Success",
  "status": 200
}
```

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
Our price-feed provider’s API documentation can be found [here](https://rapidapi.com/asepscareer/api/yahoo-finance97).<br>
A reference price feed implementation that is used by liquidator and dispute bots can be seen [here](https://github.com/unisxapp/protocol/blob/USPAC5PriceFeed/packages/financial-templates-lib/src/price-feed/DefaultPriceFeedConfigs.ts)<br>
"Yahoo Finance 97 – Rapidapi.com" is provided as an accessible source to query for this data, but ultimately how one queries for these rates should be varied and determined by the voter to ensure that there is no central point of failure.<br>
In the case of a "Yahoo Finance 97 – Rapidapi.com" outage voters can turn to any other available price feed API or a broker API, as the price feeds for the forementioned financial assets does not differ much between different providers. There might be some slight differences, however they are quite insignificant and would not affect the liquidation or dispute processes. For this case, we provide options for additional price feed providers that voters could utilize.
### Additional price feed providers
- **YahooFinance Stocks – Rapidapi.com**<br>
-- Documentation for the API can be found here: https://rapidapi.com/integraatio/api/yahoofinance-stocks1/<br>
-- Live price feed data<br>
-- Historical prices based on date and time<br>
-- Registration is free<br>
-- Free and paid plans available: https://rapidapi.com/integraatio/api/yahoofinance-stocks1/pricing<br>
-- OHLC request can be used to grab the last closing price before a weekend or a non-working day<br>
-- Example (CRHC) requests:
```
const axios = require("axios");

const encodedParams = new URLSearchParams();
encodedParams.append("symbol", "CRHC");

const options = {
  method: 'POST',
  url: 'https://yahoo-finance97.p.rapidapi.com/stock-info',
  headers: {
    'content-type': 'application/x-www-form-urlencoded',
    'X-RapidAPI-Key': API_KEY,
    'X-RapidAPI-Host': 'yahoo-finance97.p.rapidapi.com'
  },
  data: encodedParams
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

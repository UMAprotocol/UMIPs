## HEADERS
|UMIP-<#>      | | 
|:-------------|:-----------------------------------------------------------------------------|
|UMIP title|Add uSPAC5 as price identifier and uSPAC5_FR as funding rate identifier|
|Author|BinomFX (binomfx@gmail.com)|
|Status|Draft| 
|Created|07.10.2021|
|Discourse Link|https://discourse.umaproject.org/t/add-uspac5-as-price-identifier-and-uspac5-fr-as-funding-rate-identifier/1316|

## SUMMARY
The DVM should support price requests for uSPAC5 UMA perpetual price identifier and corresponding uSPAC5_FR funding rate identifiers.<br>
The purpose of these price identifier is to create synthetic token, price of which is linked to the value of index of 5 most active SPACs (Special Purpose Acquisition Companies) shares.<br> That synthetic token can be used for creating speculative strategies at IPO market.

## MOTIVATION
A synthetic token that tracks the index of the 5 most active SPACs stocks can be used for speculative purposes and allows the user to earn on price movements in one of the most interesting markets without centralized intermediaries such as exchanges and brokers.<br> 
In addition, that token can be used as components associated with classical markets by other DeFi and DApp protocols, which makes it possible to scale.

## TECHNICAL SPECIFICATION
| | |
|:---------------------------|:---------------------------------------------------|
|**Identifier name**         |**uSPAC5**|
|Base asset                  | Most active SPAC shares, enumerated in SPAC5.JSON file, stored in IPFS.|
|Quote Currency              | USD|
|Intended Collateral Currency| USDC|
|Market                      | NYSE|
|Source                      |https://marketstack.com/, API - Cost to use: Free - End-of-Day Data; Paid – Intraday Data (https://marketstack.com/plan)|
|Scaling Decimals            | 18 (1e18)|
|Rounding                    | Round to nearest 6 decimal places (seventh decimal place digit >= 5 rounds up and < 5 rounds down)|
| | |
|**Identifier Name**         |**uSPAC5_FR**|
|Base asset                  | uSPAC5_FR|
|Quote currency              | None. This is a percentage.|
|Scaling Decimals            | 18|
|Rounding                    | Round to nearest 9 decimal places (10th decimal place digit >= 5 rounds up and < 5 rounds down)|
|Synthetic Name              | uSPAC5|
|Synthetic Address           | 0x___________________________________|
|Perpetual Contract Address  | 0x_________________________________|
|UNISWAP Pool Address        | 0x________________________________|
|UNISWAP Pair                | uSPAC5/USDC|

## RATIONALE
Special Purpose Acquisition Companies (“SPACs”) are companies formed to raise capital in an initial public offering (“IPO”) with the purpose of using the proceeds to acquire one or more unspecified businesses or assets to be identified after the IPO (irrespective of form, a “Business Combination”).<br>
SPACs have only a limited period during which they may consummate a Business Combination, generally not exceeding 24 months.<br>
A SPAC generally focuses upon one industry or sector, but may maintain flexibility to engage in transactions in other industries or sectors if necessary or appropriate.<br>
More information about SPACs can be found [here](https://spac.guide/spacbasics/) and [here](https://www.spacanalytics.com/).<br>
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

The selection of 5 stocks of the most active SPACs included in the basket of the proposed uSPAC5 index is made according to [yahoo.finance Most Active SPACs](<https://finance.yahoo.com/u/yahoo-finance/watchlists/most-active-spacs>).<br>
These underlying assets are traded on the NYSE, but reliable sources of quotations are either paid or provide data with a delay.<br> 
We suggest using the [MarketStack](https://marketstack.com/) API as the main source of quotes, which has both free and paid tariff plans, and also provides historical price data.

>Back in early 2018, MarketStack was initially presented under a different name with the aim of providing a free and cost-effective market data alternative to Yahoo Finance. In the course of the years, MarketStack REST API has become one of the most popular one-stop shop solutions for real-time, intraday and historical stock data, supporting a total of 170,000+ stock tickers from 70 global stock exchanges, including NASDAQ, Australian Stock Exchange, London Stock Exchange, and many more.

>The MarketStack API is built on top of scalable, cutting-edge cloud infrastructure, handling millions of concurrent API requests each day. Using the API customer will be able to obtain rate information as well as metadata about stock tickers, companies as well as stock exchanges.

Underlying stocks are traded during exchange hours which leaves gaps in prices between 4:00PM EST close and 9:30AM EST open the next day and on weekends and market holidays. 

## IMPLEMENTATION
### Price identifier
#### 1. Read index basket
1.1. Get IPFS address from smart contract.<br>
1.2. Read SPAC5.JSON file from IPFS.<br>


SPAC5.JSON file format (SPAC shares - TOP5 [Most Active SPACs Yahoo Finance](https://finance.yahoo.com/u/yahoo-finance/watchlists/most-active-spacs) at 08.10.2021):
```
[
    “Date”: “08.10.2021”,  
    “K”: “1”,  
    “Shares”: 
    [
      {"Symbol": “PSTH”, "Weight": "0.2"},
      {“Symbol”: “IPOF”, "Weight": "0.2"},
      {“Symbol”: “GGPI”, "Weight": "0.2"},
      {“Symbol”: “GSAH”, "Weight": "0.2"},
      {“Symbol”: “HZAC”, "Weight": "0.2"}
    ]
]
```

#### 2. Get shares quotes
Real time and historical share prices are available from MarketStack.com (API).<br> 
Price requests should use the dayly price that is nearest and later than the price request timestamp. In the future, it is planned to use hourly and minute prices. To do this, voters should use the open price of the OHLC period that the price request timestamp falls in. MarketStack endpoints are queried based on the OHLC period's close time.
<br><br>
Example MarketStack request for a PSTH real time **end-of-day** price (available on: All plans):
```
https://api.marketstack.com/v1/eod
    ? access_key = YOUR_ACCESS_KEY
    & symbols = PSTH
```
   
Example MarketStack request for a PSTH real time **intraday** price (available on: Basic Plan and higher):
```
http://api.marketstack.com/v1/intraday
    ? access_key = YOUR_ACCESS_KEY
    & symbols = PSTH
```
Example MarketStack request for a PSTH **historical** price (Available on: All plans):
```
http://api.marketstack.com/v1/eod
    ? access_key = YOUR_ACCESS_KEY
    & symbols = PSTH
    & date_from = 2021-08-23
    & date_to = 2021-09-02
```
API Response Objects:

|  Response Object  |Description                                                            |
|:------------------|:----------------------------------------------------------------------|
|pagination > limit|  Returns your pagination limit value.|
|pagination > offset|  Returns your pagination offset value.|
|pagination > count|  Returns the results count on the current page.|
|pagination > total|  Returns the total count of results available.|
|date|  Returns the exact UTC date/time the given data was collected in ISO-8601 format.|
|symbol|  Returns the stock ticker symbol of the current data object.|
|exchange|  Returns the exchange MIC identification associated with the current data object.|
|open|  Returns the raw opening price of the given stock ticker.|
|high|  Returns the raw high price of the given stock ticker.|
|low|  Returns the raw low price of the given stock ticker.|
|close|  Returns the raw closing price of the given stock ticker.|
|last|  Returns the last executed trade of the given symbol on its exchange.|
|volume|  Returns the volume of the given stock ticker.|

#### 3. Evaluate index value
3.1. Sum up weighted quotes of all 5 SPAC shares. Weighted quote is a share quote multiplied by corresponding weihgt from SPAC5.JSON file.<br>
3.2. Divide result by 5 (number of shares).<br>
3.3. Multiply result by K (correction factor).
```
                SumUp (Qi * Wi)
      INDEX = ------------------- * K
                       N
```
where:
- Qi - quote of Share i in index;<br>
- Wi - weight of Share i in index.<br>
- K - Correction factor, used to smooth the index values when the basket is changed. The value of K for the current index bucket is taken from the SPAC5.JSON file. The value of K changes when the index basket changes and is calculated in accordance with Section 4.2.<br>
- N - number of shares in index.<br>
#### 4. Revise index basket
4.1. In order to index can reliably reflect the market picture, a periodic change of the basket of stocks included in the index is required.<br>
Usually, revision of the index basket is carried out quarterly. The revision of the uSPAC5 index basket is carried out on the following dates:
- last 5 days of March;
- last 5 days of June;
- last 5 days of September;
- last 5 days of December.

In order to create new index bucket, you need to do the following:
- Select the first 5 shares of SPAC by the link: [Most Active SPACs Yahoo Finance](https://finance.yahoo.com/u/yahoo-finance/watchlists/most-active-spacs);
- Enter the tickers of these shares in the SPAC5.JSON file;
- Calculate the value of correction factor K (see further section 4.2.) and enter it in the SPAC5.JSON;
- Put it in the SPAC5.JSON date of change.

4.2. Correction factor (**K**), used to smooth the index values when the basket is changed.<br><br>
The value of K calculated as quotient of division INDEXold by INDEXnew:<br>
```
                INDEXold
          K = ------------
                INDEXnew
```
where:
- INDEXold – the last index value calculated from the old basket;<br>
- INDEXnew – the first index value calculated for the new basket at the same time as INDEXold;<br>

The initial value of K is chosen arbitrarily, for example 1.

#### 5. Change index basket
5.1. Upload a new SPAC5.JSON file in IPFS, get a link to the file.<br>
5.2. Replace the link to the file in the smart contract by voting users.<br>

When changing the composition of the index, the link to the new file is changed in the smart contract by voting. So, malicious modification of the index composition is impossible.

### Funding rate identifier
1. To calculate uSPAC5_FR, the following steps should be performed:<br>
1.1. Query for the SPAC5 value at the disputed funding rate proposal timestamp.<br>
1.2. Query for the cumulative funding rate multiplier (CFRM) at the price request timestamp.<br>
1.3. Then you should multiply the uSPAC5 value and CFRM - this result will be called uSPAC5-FV in future steps.<br>
1.4. Query for the 1-hour TWAP uSPAC5-PERP from the listed AMM pool. This will return TWAP uSPAC5-PERP denominated in USDC. This rate should be left as is, without conversion between USDC and USD.<br>
1.5. Subtract the result of step 4 from the result of step 3. [uSPAC-FV - uSPAC5-PERP].<br>
1.6. Divide the result of step 5 by uSPAC5-FV from step 4. [uSPAC5-FV - uSPAC5-PERP]/uSPAC5-FV.<br>
1.7. Divide the result of step 6 by 86400 (number of seconds per day) to get the funding rate per second.<br>
1.8. Implement min and max bounds on this result with: max(-0.00001, min(0.00001, result)).<br>
1.9. Voters should then round this result to 9 decimal places.<br>
1.10. Voters should determine whether the returned funding rate differs from broad market consensus. This is meant to provide flexibility in any unforeseen circumstances as voters are responsible for defining broad market consensus.

2. Calculation of the Cumulative Funding Rate Multiplier (CFRM)<br>
2.1. CFRM for a specific contract is stored on-chain for each perpetual contract.<br>
2.2. Vouters can request this on-chain data at the funding rate proposal timestamp in any way convenient for them:
- Simulation of `applyFundingRate` transaction. An example of this can be seen [here]().<br>
- Calling the `fundingRate` method of the uSPAC5 perpetual contract.<br><br>
2.3. The results will be in the following format:
```
   {
    rate,
    identifier,
    cumulativeMultiplier,
    updateTime,
    applicationTime,
    proposalTime
   }
```
2.4. Vouters should use the `cumulativeMultipler` value.

### Weekend timestamp
Over the weekend or some official holidays the REST API does not return any price, but we can request the price of a certain moment before the market close (as ex: the closing price of Friday).
Due to unavailability of price feed for stock exchange rates over the weekend or during some official holidays, tokenholders and users will be using the latest known price, which for the weekend is essentially the closing price of Friday. Same goes in a case of a liquidation process - the liquidator should use the last known price (during the weekend this is the closing price of Friday) in order to match with the price on which a synthetic asset was created, if it was created over the weekend. If not the closing price on Friday for a certain asset should be a navigating point in calculating the collateralization ratio of a position and in the liquidation process.
If a request timestamp takes place on a weekend or any other day the stock market is closed, voters should use the latest tick as the price. For the weekend that would be the closing price of the asset on Friday and for official holidays this would be the last know price provided by the price feed.
Please note that this is different than the normal calculation process, which requires using the open price of the period that the price request falls in.
### Stock markets working hours
Underlaying assets trade during exchange hours which leaves gaps in prices between 4:00PM EST close and 9:30AM EST open the next day and on weekends and market holidays.
### Price feed
Our price-feed provider’s API documentation can be found [here](https://marketstack.com/documentation).<br>
A reference MarketStack implementation that is used by liquidator, dispute and funding rate proposer bots can be seen [here]()<br>
MarketStack is provided as an accessible source to query for this data, but ultimately how one queries for these rates should be varied and determined by the voter to ensure that there is no central point of failure.<br>
In the case of a MarketStack outage voters can turn to any other available price feed API or a broker API, as the price feeds for the forementioned financial assets does not differ much between different providers. There might be some slight differences, however they are quite insignificant and would not affect the liquidation or dispute processes. For this case, we provide options for additional price feed providers that voters could utilize.
### Additional price feed providers
- **Yahoo Finance – Rapidapi.com**<br>
-- Documentation for the API can be found here: https://rapidapi.com/apidojo/api/yahoo-finance1<br>
-- Live price feed data<br>
-- Historical prices based on date and time<br>
-- Registration is free<br>
-- Paid plans available<br>
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
-- Paid plans available<br>
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

1) There is no risk of malicious modification of the index basket because the file with the list of stocks included in the index is stored in a decentralized IPFS file system and the link to it can be changed only as a result of user voting.
2) The risk of manipulation of stock quotes included in the index is insignificant because a reliable source of quotes is used. In addition, users - wouters and disputers - have the opportunity to check the calculation of the index value based on independent sources of quotations themselves.
3) Token price manipulation risk - 1-hour TWAP was chosen to mitigate any risk of attempted price manipulation attempts on the market price of the synthetic. To meaningfully manipulate the price that token sponsors’ collateralization is calculated with, an attacker would have to manipulate the trading price of a token for an extended amount of time. 


***
Security considerations, like the ones above, have been contemplated and addressed, but there is potential for security holes to emerge due to the novelty of this price identifier.

Additionally, anyone deploying a new priceless token contract referencing this identifier should take care to parameterize the contract appropriately to avoid the loss of funds for synthetic token holders. Contract deployers should also ensure that there is a network of liquidators and disputers ready to perform the services necessary to keep the contract solvent.

$UMA-holders should evaluate the ongoing cost and benefit of supporting price requests for this identifier and also contemplate de-registering this identifier or editing its implementation if security holes are identified. 

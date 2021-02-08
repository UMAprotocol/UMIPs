## HEADERS

| UMIP [#]          |                                                                                    |
|-------------------|------------------------------------------------------------------------------------|
| UMIP Title        | Add DAIPHP as a price identifier                                                   |
| Authors           | Chris Verceles (chris.verceles@halodao.com), James Orola (james.orola@halodao.com) |
| Status            | Draft                                                                              |
| Created           | Feb 3, 2021                                                                        |
| Link to Discourse | [LINK]                                                                             |

<br />

# SUMMARY 

The DVM should support price requests for the DAI/PHP price index.

<br />

# MOTIVATION

This section should clearly explain the types of financial products that will be created and the mechanics of an example financial product using this price identifier. Please answer the following questions:

1. What are the financial positions enabled by creating this synthetic that do not already exist?

    - Supporting the DAIPHP price identifier would enable the creation of a Philippine Peso stablecoin (UBE), backed by DAI. Token minters could go short on the DAI/PHP index, while token holders could go long or use synthetic PHP for functional purposes.

2. Please provide an example of a person interacting with a contract that uses this price identifier. 

    - in trading pairs on Philippine cryptocurrency exchanges

    - basis for on chain, on demand liquidity in cross border remittance (our team is starting with the Singapore Philippine corridor with ZKSync, Argent and various on/off ramps)

3. Consider adding market data  (e.g., if we add a “Dai alternative,” the author could show the market size of Dai)

<br />

# MARKETS & DATA SOURCES

 **Required questions**

1. What markets should the price be queried from? It is recommended to have at least 3 markets.

    - CoinMarketCap
    - CoinGecko

2.  Which specific pairs should be queried from each market?

    - DAI:PHP

2. Provide recommended endpoints to query for real-time prices from each market listed. 

    - CMC: `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=DAI&convert=PHP&CMC_PRO_API_KEY=<free tier api key>`

    - CG: `https://api.coingecko.com/api/v3/simple/token_price/ethereum?contract_addresses=0x6b175474e89094c44da98b954eedeac495271d0f&vs_currencies=php`
    
4. How often is the provided price updated?

    - CMC: every 60 seconds
    - CG: ?

5. Provide recommended endpoints to query for historical prices from each market listed. 

    - CMC: `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/historical?symbol=DAI&convert=PHP&&time_start=<unix timestamp>&time_end=<unix timestamp>&CMC_PRO_API_KEY=<standard plan api key>`
    
      - _Note: Only available for Standard & higher tier plans_

    - CG: `https://api.coingecko.com/api/v3/coins/dai/history?date=<dd-mm-yyyy>`

6.  Do these sources allow for querying up to 74 hours of historical data? 

    - CMC: Yes
    - CG: Yes

7.  How often is the provided price updated?

    - CMC: every 5 minutes
    - CG: ?

8. Is an API key required to query these sources? 

    - CMC: Yes
    - CG: No

9. Is there a cost associated with usage? 

    - CMC: Yes, if historical prices endpoint is used, otherwise no
    - CG: No

10. If there is a free tier available, how many queries does it allow for?

    - CMC: Yes, 10K call credits /mo
    - CG: Yes, 100 requests/minute

11.  What would be the cost of sending 15,000 queries?

     - CMC: $29/ mo for Hobbyist plan which bumps call credits to 40K /mo
     - CG: Free!

<br />

# PRICE FEED IMPLEMENTATION

Link to the UMA protocol PR:

- https://github.com/UMAprotocol/protocol/pull/2480

Link to the price feed pull request.

- https://github.com/UMAprotocol/protocol/issues/2474

<br>

# TECHNICAL SPECIFICATIONS

**1. Price Identifier Name** - DAIPHP

**2. Base Currency** - [ADD BASE CURRENCY]

**3. Quote currency** - [ADD QUOTE CURRENCY]

- If your price identifier is a currency pair, your quote currency will be the
denominator of your currency pair. If your price identifier does not have a quote currency, please explain the reasoning behind this.

- Please be aware that the value of any UMA synthetic token is the value of the price identifier in units of the collateral currency used. If a contract’s price identifier returns 1, and is collateralized in renBTC, each synthetic will be worth 1 renBTC. In most cases, the value of your quote currency and intended collateral currency should be equal.

- [Response - if applicable]

**4. Intended Collateral Currency** - DAI

- Does the value of this collateral currency match the standalone value of the listed quote currency? 

    - [ANSWER]

- Is your collateral currency already approved to be used by UMA financial contracts? If no, submit a UMIP to have the desired collateral currency approved for use. 

    - Yes

**5. Collateral Decimals** - 18

  - DAI has 18 Decimals (obtained [here](https://etherscan.io/token/0x6b175474e89094c44da98b954eedeac495271d0f)). 

**6. Rounding** - [ADD ROUNDING]

- **Note** - this should always be less than or equal to the `Intended Collateral Currency` field.

- **Example** 

    - Round to 3 decimal places. 

    - If the price is .0235, then this would be rounded up to .024. If the price is .02349, then this would be rounded down to .023. 

<br>

# RATIONALE

The rationale should flesh out the specification by describing what motivated the design and why particular design decisions were made, as well as any alternative designs that were considered.

- [RESPONSE]

**Example questions**

- Why this implementation of the identifier as opposed to other implementation designs?

- What analysis can you provide on where to get the most robust prices? (Robust as in legitimate liquidity, legitimate volume, price discrepancies between exchanges, and trading volume between exchanges)

- What is the potential for the price to be manipulated on the chosen exchanges?

- Should the prices have any processing (e.g., TWAP)? 

    - If so, why was this processing method chosen?

<br>

# IMPLEMENTATION

Describe how UMA tokenholders should arrive at the price in the case of a DVM price request? Document each step a voter should take to query for and return a price at a specific timestamp. This should include a waterfall of if-then statements (e.g., if a certain exchange is not available, then proceed in a different way). Include the following in the description:


1. **What prices should be queried for and from which markets?**

    - DAI:PHP from CoinMarketCap & CoinGecko

2. **Pricing interval**

    - 60

3. **Input processing**

    - Obtain an api key from CoinMarketCap (https://pro.coinmarketcap.com/signup/) then substitute it to `CMC_PRO_API_KEY` url parameter value

4. **Result processing**

    - Take the mean from CoinMarketCap + CoinGecko DAI:PHP price

<br>

# Security considerations

**Example questions**

1. Where could manipulation occur?

2. How could this price ID be exploited?

3. Do the instructions for determining the price provide people with enough certainty?

4. What are current or future concern possibilities with the way the price identifier is defined?

5. Are there any concerns around if the price identifier implementation is deterministic?
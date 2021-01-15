# UMIP Price Identifier Template

Below is a template for creating a UMIP to register a new price identifier with UMA’s Data Verification Mechanism (DVM). 


## HEADERS
| UMIP [#]     |                                                                                                                                  |
|------------|------------------------------------------------------------------------------------------------------------------------------------------|
| UMIP Title | [TITLE]                                                                                                  |
| Authors    | [Name or username and email]
| Status     | [Draft, Last Call, Approved, Final, Abandoned, Rejected]                                                                                                                                   |
| Created    | [DATE]                                                                             
<br>
Note that an UMIP number will be assigned by an editor. When opening a pull request to submit your UMIP, please use an abbreviated title in the filename, umip-draft_title_abbrev.md.
The title should be 44 characters or less.

<br>
<br>

# SUMMARY 

"If you can't explain it simply, you don't understand it well enough." Provide a simplified and layman-accessible explanation of the issue.

- **Example** 

    - The DVM should support price requests for the [Base currency / Quote currency] price index.


# MOTIVATION

This section should clearly explain the types of financial products that will be created and the mechanics of an example financial product using this price identifier. Please answer the following questions:

1. What are the financial positions enabled by creating this synthetic that do not already exist?

    - [ANSWER]

2. Please provide an example of a person interacting with a contract that uses this price identifier. 

    - Remember, price identifiers **return the units of the collateral currency**. 

         - For example, if at expiry the price id returns 1 and the contract is collateralized in renBTC, each synth would be worth 1 renBTC.

    - [ANSWER]

3. Consider adding market data  (e.g., if we add a “Dai alternative,” the author could show the market size of Dai)

<br> 

# MARKETS & DATA SOURCES

 **Required questions**

1. What markets should the price be queried from? It is recommended to have at least 3 markets.

    - [ANSWER]

2.  Which specific pairs should be queried from each market?

    - [ANSWER]

2. Provide recommended endpoints to query for real-time prices from each market listed. 

    - These should match the data sources used in  "Price Feed Implementation". 

    - [ADD-ENDPOINTS]
    
4. How often is the provided price updated?

    - [ANSWER]

5. Provide recommended endpoints to query for historical prices from each market listed. 

    - [ADD-ENDPOINTS]

6.  Do these sources allow for querying up to 74 hours of historical data? 

    - [ANSWER]

7.  How often is the provided price updated?

    - [ANSWER]

8. Is an API key required to query these sources? 

    - [ANSWER]

9. Is there a cost associated with usage? 

    - [ANSWER]

10. If there is a free tier available, how many queries does it allow for?

    - [ANSWER]

11.  What would be the cost of sending 15,000 queries?

     - [ANSWER]

<br>

# PRICE FEED IMPLEMENTATION

To allow for the creation of bots that can programmatically calculate prices off-chain to liquidate and dispute transactions, you must create a price feed following the UMA Protocol format (outlined below). This price feed is also necessary to calculate developer mining rewards.

To meet this criteria, please include a link to a PR to the UMA [protocol repo](https://github.com/UMAprotocol/protocol) with an example price feed that inherits this [PriceFeedInterface](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/PriceFeedInterface.js). 

Classes of price identifiers that are supported by default and require no additional price feed include.

- Any currency pair available on [Cryptowatch](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/CryptoWatchPriceFeed.js)

- [Uniswap prices](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/UniswapPriceFeed.js)

- [Balancer prices](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/BalancerPriceFeed.js)

Please provide a link to your price feed pull request.

- [ADD-LINK-TO-PULL-REQUEST]

<br>

# TECHNICAL SPECIFICATIONS

**1. Price Identifier Name** - [ADD NAME]

**2. Base Currency** - [ADD BASE CURRENCY]

**3. Quote currency** - [ADD QUOTE CURRENCY]

- If your price identifier is a currency pair, your quote currency will be the
denominator of your currency pair. If your price identifier does not have a quote currency, please explain the reasoning behind this.

- Please be aware that the value of any UMA synthetic token is the value of the price identifier in units of the collateral currency used. If a contract’s price identifier returns 1, and is collateralized in renBTC, each synthetic will be worth 1 renBTC. In most cases, the value of your quote currency and intended collateral currency should be equal.

- [Response - if applicable]

**4. Intended Collateral Currency** - [ADD COLLATERAL CURRENCY]

- Does the value of this collateral currency match the standalone value of the listed quote currency? 

    - [ANSWER]

- Is your collateral currency already approved to be used by UMA financial contracts? If no, submit a UMIP to have the desired collateral currency approved for use. 

    - View [here](https://docs.umaproject.org/uma-tokenholders/approved-collateral-currencies) to see a list of approved collateral currencies. 

    - [ANSWER]

**5. Collateral Decimals** - [ADD DECIMALS]

- Price identifiers need to be automatically scaled to reflect the units of collateral that a price represents. Because of this, the amount of decimals that a price is scaled to needs to match the used collateral currency. 

- **Example**

    - USDC has 18 Decimals (obtained [here](https://etherscan.io/token/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48)). 

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

    - **Note** - This should match the markets and pairs listed in the `Markets and Data Sources` section.  

    - [ANSWER]

2. **Pricing interval**

    - [ANSWER]

3. **Input processing**

    - [ANSWER]

4. **Result processing** 

    - **Note** - a result processing of "median" is more resilient to market manipulation versus a result processing of "average"

     - [ANSWER]

<br>

# Security considerations

**Example questions**

1. Where could manipulation occur?

2. How could this price ID be exploited?

3. Do the instructions for determining the price provide people with enough certainty?

4. What are current or future concern possibilities with the way the price identifier is defined?

5. Are there any concerns around if the price identifier implementation is deterministic?

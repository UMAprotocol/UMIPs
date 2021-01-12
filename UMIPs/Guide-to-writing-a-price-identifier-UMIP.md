# Guide to writing a UMIP for Price Identifiers

Below is a detailed guide for creating a UMIP to register a new price identifier with UMA’s Data Verification Mechanism (DVM). 


## HEADERS


| UMIP [#]     |                                                                                                                                          |
|------------|------------------------------------------------------------------------------------------------------------------------------------------|
| UMIP Title | [TITLE]                                                                                                  |
| Authors    | [Name or username and email]
| Status     | [Draft, Last Call, Approved, Final, Abandoned, Rejected]                                                                                                                                   |
| Created    | [DATE]                                                                             
<br>


Note that an UMIP number will be assigned by an editor. When opening a pull request to submit your UMIP, please use an abbreviated title in the filename, umip-draft_title_abbrev.md.
The title should be 44 characters or less.

# Status
A successful UMIP will move along the following stages: Draft ⟶ Last Call ⟶ Final ⟶ Approved. Unsuccessful states are also possible: Abandoned and Rejected.

## Draft
A UMIP that is open for consideration and is undergoing rapid iteration and changes should be set to “Draft”. In order to proceed to “Last Call", the UMIP template for adding a new price identifier must be completed. Every UMIP author is responsible for facilitating conversations and building community consensus for the proposal in [UMA’s Discord](https://discord.com/invite/jsb9XQJ)  via the “price-id-umips’ channel. 

## Last Call
A UMIP that is done with its initial iteration and ready for review by a wide audience will be set to “Last Call” status. If upon review, there is a material change or substantial unaddressed complaints, the UMIP will revert to "Draft". If the UMIP requires code changes, the core devs must review the UMIP. A successful UMIP will be in "Last Call" status for a reasonable period of time for the community to provide feedback before moving to a vote by UMA tokenholders.

## Final
An UMIP that successfully passes "Last Call" will move to "Final" status and be voted on by UMA tokenholders.

## Approved

If UMA tokenholders approve the proposal, UMA protocol will be updated to include the necessary changes. At this time, any code changes (if relevant) should be merged into the core protocol repository so that the core protocol repository always reflects the live code that is running. The UMIP is then considered to be in the "Approved" state.

## Abandoned

If at any point during the UMIP Finalization Process, a UMIP is abandoned, it will be labeled as such. Grounds for abandonment include a lack of interest by the original author(s), or it may not be a preferred option anymore.

## Rejected
If UMA tokenholders do not approve a proposal, or the UMIP is fundamentally broken or rejected by the community, it will not be implemented.


<br>

# SUMMARY 

"If you can't explain it simply, you don't understand it well enough." Provide a simplified and layman-accessible explanation of the issue.

### Example 

- The DVM should support price requests for the [Base currency / Quote currency] price index.

<br>

# MOTIVATION

This section should clearly explain the types of financial products that will be created and the mechanics of an example financial product using this price identifier. Please answer the following questions:

1. What are the financial positions enabled by creating this synthetic that do not already exist?
2. Please provide an example of a person interacting with a contract that uses this price identifier. 
    - Remember, price identifiers **return the units of the collateral currency**. 
     - For example, if at expiry the price id returns 1 and the contract is collateralized in renBTC, each synth would be worth 1 renBTC.
3. Consider adding market data  (e.g., if we add a “Dai alternative,” the author could show the market size of Dai)

<br>

> ### **Example** 

> The DVM currently does not support the USD/ETH price index. Supporting the USD/ETH price identifier would enable the creation of zero-coupon fixed-rate dollar loans, if collateralized by WETH. This creates positions similar to using ETH in the MakerDAO system to mint Dai.

> Given a current USD/ETH price of .001 (ETH/USD is $1,000), Alice (a minter) would interact with an expiring contract collateralized in WETH by using 0.2 WETH (worth $200) as collateral to mint synthetic tokens at a 200% collateralization ratio. 

> When the contract expires at the end of the month, the USDETH price has moved down to .0005 (ETH/USD is $2,000). Alice’s position now has a collateralization ratio of 400% and each synthetic can be redeemed for .0005 WETH. 

<br> 

# MARKETS & DATA SOURCES

### **Required questions**
<br>

1. What markets should the price be queried from? It is recommended to have at least 3 markets. <br> 

    - Which specific pairs should be queried from each market?
2. Provide recommended endpoints to query for real-time prices from each market listed. 
    - These should match the data sources used in your `Price Feed Implementation`. 
    <br>
3. How often is the provided price updated?
4. Provide recommended endpoints to query for historical prices from each market listed. 

    - Do these sources allow for querying up to 74 hours of historical data? 
    <br>

    - How often is the provided price updated?
5. Is an API key required to query these sources?  

    - Is there a cost associated with usage? 
    <br>

    -  If there is a free tier available, how many queries does it allow for?
     <br>
     
    - What would be the cost of sending 15,000 queries?

<br>

### **Guidance**
<br>

Currency pairs can have varying prices depending on the market that they are traded on. As an example, the price of BTC/USD will vary between Coinbase Pro, Binance and Gemini. Because of this, you should be specific about the markets that you wish to gather your price information from. 

**This should default to the three highest volume markets available**. If three markets are not available, or you wish to use more or less than three, please specify the justification for doing so.

Specify the availability of this price data. Price data should, at a minimum, meet these requirements.

- Have both a real-time and historical price data sources available
- Data sources should update the price at least once per hour.
- The historical endpoint needs to be able to provide data at least 74 hours in the past
- A liquidation or dispute bot will make approximately 15,000 calls per data source per month. If your recommended data sources are not free, please specify the cost of 15,000 calls.

**Note**: An API for accessing data is not the same thing as the markets you choose to determine the price.  You would not say that cryptowatch is a market for data, as it is just an aggregator of market data.  Examples of markets are “Coinbase Pro, Binance, Bitstamp.”  Data sources are still necessary to demonstrate the accessibility of the data and are often just the specific market’s API.

<br>

### **Recommended Data Sources**
<br>

If you would like to obtain prices for Cryptocurrency pairs, [these pairs](https://cryptowat.ch/) are available via Cryptowatch. Forex rates are available on [TraderMade](https://tradermade.com/).

<br>

# PRICE FEED IMPLEMENTATION

To allow for the creation of bots that can programmatically calculate prices off-chain to liquidate and dispute transactions, you must create a price feed following the UMA Protocol format (outlined below). This price feed is also necessary to calculate developer mining rewards.

To meet this criteria, please include a link to a PR to the UMA [protocol repo](https://github.com/UMAprotocol/protocol) with an example price feed that inherits this [PriceFeedInterface](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/PriceFeedInterface.js). 

Classes of price identifiers that are supported by default and require no additional price feed include.

- Any currency pair available on [Cryptowatch](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/CryptoWatchPriceFeed.js)
- [Uniswap prices](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/UniswapPriceFeed.js)
- [Balancer prices](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/BalancerPriceFeed.js)

Please provide a link to your price feed pull request.

<br>

# TECHNICAL SPECIFICATIONS

### **Price Identifier Name** - [NAME]
<br>

- If your identifier name is less than 8 characters, the price ID should be written as [BASEQUOTE] (e.g., ETHUSD). 

- If your identifier name is greater than 8 characters, the price ID should be written as [BASE/QUOTE] (e.g., STABLESPREAD/USDC)

- If your identifier does not have a quote currency, the Price ID should be written as [NAME] 

<br>

### **Base Currency** - [BASE CURRENCY]
<br>
1. What price will be reported?

- If your identifier is a currency pair, this is the numerator of your pair.

 **Example**

- If your price identifier is ETH/BTC, this is ETH. 

<br>

### **Quote currency** - [QUOTE CURRENCY]
<br>
1. What will the price be denominated in? 

- If your price identifier is a currency pair, your quote currency will be the
denominator of your currency pair. 

- If your price identifier does not have a quote currency, please explain the reasoning behind this.

<br>

 **Please be aware that the value of any UMA synthetic token is the value of the price identifier in units of the collateral currency used. If a contract’s price identifier returns 1, and is collateralized in renBTC, each synthetic will be worth 1 renBTC. In most cases, the value of your quote currency and intended collateral currency should be equal.**

<br>

**Example** 

If the price identifier is USD/BTC, this is BTC. If the price identifier is the Bitcoin Dominance Percentage, this is none.

<br>

### **Intended Collateral Currency** - [COLLATERAL CURRENCY]

<br>

1. What collateral currency do you intend to use for the synthetic contract that uses this price identifier? 

2. Does the value of this collateral currency match the standalone value of the listed quote currency? 

3. Is your collateral currency already approved to be used by UMA financial contracts? If no, submit a UMIP to have the desired collateral currency approved for use. 
    - View [here](https://docs.umaproject.org/uma-tokenholders/approved-collateral-currencies) to see a list of approved collateral currencies. 

<br>

### **Collateral Decimals** - [DECIMALS]
<br>
1. How many decimal places does your desired collateral currency have?

-  Price identifiers need to be automatically scaled to reflect the units of collateral that a price represents. Because of this, the amount of decimals that a price is scaled to needs to match the used collateral currency. 

**Example**

USDC has 18 Decimals (obtained [here](https://etherscan.io/token/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48)).

<br>

### **Rounding** - [DECIMALS ROUNDED]
<br>
1. What decimal place should the price identifier be rounded to by UMA tokenholders when submitting price data to the DVM?

- **Note** - this should always be less than or equal to the `Intended Collateral Currency` field.

<br>

**Example** 

Round to 3 decimal places. 

If the price is .0235, then this would be rounded up to .024. If the price is .02349, then this would be rounded down to .023. 

<br>

# RATIONALE

The rationale should flesh out the specification by describing what motivated the design and why particular design decisions were made, as well as any alternative designs that were considered.

### **Example questions**
<br>

- Why this implementation of the identifier as opposed to other implementation designs?
- What analysis can you provide on where to get the most robust prices? (Robust as in legitimate liquidity, legitimate volume, price discrepancies between exchanges, and trading volume between exchanges)
- What is the potential for the price to be manipulated on the chosen exchanges?
- Should the prices have any processing (e.g., TWAP)? 
     - If so, why was this processing method chosen?

<br>

# IMPLEMENTATION

Describe how UMA tokenholders should arrive at the price in the case of a DVM price request? Document each step a voter should take to query for and return a price at a specific timestamp. This should include a waterfall of if-then statements (e.g., if a certain exchange is not available, then proceed in a different way). Include the following in the description:

<br>

1. **What prices should be queried for and from which markets?**
 - This should match the markets and pairs listed in the `Markets and Data Sources` section. It is recommended to have prices from 3 or more markets. 

2. **Pricing interval**
-  Should timestamps for pricing queries be rounded?
<br>

    - Price feeds do not always have granularity in seconds, so this specifies how to round the timestamp. For example, if you had a pricing interval of 1 minute (which is common), it means it would round 10:50:45 to 10:50:00.
<br>

3. **Input processing**
- Denote if and why UMA tokenholders should change the calculation method for the price identifier. 
<br>

    - For example, for ETH/USD price requests, inputs are results received from exchanges and if an exchange is no longer valid, then human intervention is required. 


- The input processing can typically be denoted as "Human intervention in extreme circumstances where the result differs from broad market consensus".
<br>

4. **Result processing**
- What type of processing should voters perform to determine the final price of an asset (e.g., take the median or mode of all votes submitted)? 
    - **Note** - a result processing of "median" is more resilient to market manipulation versus a result processing of "average". 

<br>

# Security considerations

### **Example questions**
<br>

1. Where could manipulation occur?

2. How could this price ID be exploited?
3. Do the instructions for determining the price provide people with enough certainty?
4. What are current or future concern possibilities with the way the price identifier is defined?
5. Are there any concerns around if the price identifier implementation is deterministic?

<br>

**Example Security Section**

Adding this new identifier by itself poses little security risk to the DVM or priceless financial contract users. However, anyone deploying a new priceless token contract referencing this identifier should take care to parameterize the contract appropriately to the reference asset’s volatility and liquidity characteristics to avoid the loss of funds for synthetic token holders. 

Additionally, the contract deployer should ensure that there is a network of liquidators and disputers ready to perform the services necessary to keep the contract solvent. $UMA-holders should evaluate the ongoing cost and benefit of supporting price requests for this identifier and also contemplate de-registering this identifier if security holes are identified.

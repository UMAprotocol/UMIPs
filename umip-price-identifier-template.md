# UMIP Price Identifier Template

Below is a template for creating a UMIP to register a new price identifier with UMA’s Data Verification Mechanism (DVM). 


## HEADERS
| UMIP [#]     |                                                                                                                                  |
|------------|------------------------------------------------------------------------------------------------------------------------------------------|
| UMIP Title | Add bBadger/USD, [bwBTC/ETH SLP]-USD as price identifiers                                                                                                 |
| Authors    | BitcoinPalmer, mitche50, Defi Frog
| Status     | [Draft                                                                                                                                  |
| Created    | 1/17/2021                                                                           

<br>

# SUMMARY 

The DVM should support price requests for the below price indexes:
 - USD-[bwBTC/ETH SLP] and [bwBTC/ETH SLP]-USD
 - USD/bBadger and bBadger/USD


# MOTIVATION

The DVM currently does not support USD-[bwBTC/ETH SLP], [bwBTC/ETH SLP]-USD, USD/bBadger or bBadger/USD as price identifiers. 

BadgerDAO’s first product is Sett vault, an automated DeFi aggregator focused on tokenized BTC assets. Users that tokenized Bitcoin in Badger vaults receive a corresponding “b” denominated token in return that represents their vault position. Unfortunately these vault positions then become illiquid. Many of our users would like to borrow against their BTC vault positions as collateral to mint Badger Dollars (a yield dollar). At the time of writing, Badger’s Sett Vaults have brought in over 700m in TVL. 

The first vaults that could generate Badger Dollars will be bwBTC/ETH SLP and bBadger. Definitions of these vaults are below: 

- **bwBTC/ETH SLP**
    - Liquidity provider tokens for the wBTC/ETH pool in Sushiswap that is staked in the Badger Sett Vault wBTC/ETH SLP resulting to mint bwBTC/ETH SLP token(s). 
    - View [here](https://etherscan.io/token/0x758a43ee2bff8230eeb784879cdcff4828f2544d) for it's associated token address

 - **bBadger**
    - Badger token that is staked in the Badger Sett Vault to mint bBadger token(s)
    - View [here](https://etherscan.io/address/0x19d97d8fa813ee2f51ad4b4e04ea08baf4dffc28) for it's associated token address

Supporting the USD-[bwBTC/ETH SLP], [bwBTC/ETH]-USD, USD/bBadger and bBadger/USD price identifiers would enable the creation of Badger Dollars synthetic tokens. It enables token minters to leverage their vaulted positions in Badgers Setts.  

This would allow Alice to use 100 bBadger (worth $1200) to create 400 USD synth tokens (worth $400).  At expiry, Alice could redeem her 400 USD synthetic tokens for the USD amount of bBadger the USD synthetic tokens are worth.  Once this is complete, she could then withdrawal the rest of her collateral (100 bBadger). 


# MARKETS & DATA SOURCES

1. What markets should the price be queried from? It is recommended to have at least 3 markets.

    - Sushiswap TWAP
        - https://sushiswapclassic.org/
    - Uniswap TWAP 
        - https://uniswap.org/

2.  Which specific pairs should be queried from each market?

B wrapped tokens have 2 components to finding the underlying value of the tokens associated with them.  Each wrapped token has a pricePerFullShare, which is the amount of underlying tokens that 1 b token could be redeemed for through the withdraw function.  This underlying token can have different ways to determine its value depending on what type of token it is.

The price per full share can be found by querying the contract of the token with `getPricePerFullShare` as seen in method 9 on this contract: https://etherscan.io/address/0x19D97D8fA813EE2f51aD4B4e04EA08bAf4DFfC28#reaProxyContract

**bwBTC/ETH SLP**
For bwBTC/ETH SLP, you would find the value by querying the sushiswap subgraph using the below query:
https://api.thegraph.com/subgraphs/name/sushiswap/exchange
    query: `
    {
          pair(id:"${address.toLowerCase()}") {
                reserve0
                reserve1
                totalSupply
          }
    }`
For the sushi wBTC/ETH SLP, token0 = wBTC and token1 = ETH.  We can then determine the value of the provided SLP by the below pseudo code:
wBTC Ratio = Reserve0 / totalSupply
ETH Ratio = Reserve1 / totalSupply
wBTCBalance = slpBalance * wBTC Ratio
ethBalance = slpBalance * wBTC Ratio
slpValue = (wBTCBalance * wBTCPrice) + (ethBalance * ethPrice)

The prices used can be the normal price oracles for wBTC and ETH.

**bBadger**

For bBadger you could use the same getPricePerFullShare method from the contract to get the underlying amount, and then the price can be queried via the graph for both sushi and uniswap using TWAPs.

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

    - No (until The Graph Marketplace starts charging fees)

10. If there is a free tier available, how many queries does it allow for?

    - NA

11.  What would be the cost of sending 15,000 queries?

     - Free (until The Graph Marketplace starts charging fees)

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

**1. Price Identifier Name** - [bwBTC/ETH SLP]-USD

**2. Base Currency** - bwBTC/ETH SLP

**3. Quote currency** - USD

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

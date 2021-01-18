## HEADERS
| UMIP [#]     |                                                                                                                                  |
|------------|------------------------------------------------------------------------------------------------------------------------------------------|
| UMIP Title | BadgerDAO Setts Vault Price Identifiers                                                                                                  |
| Authors    | mitche50, J au Defi, bitcoinpalmer, Defi Frog
| Status     | Draft                                                                                                                            |
| Created    | 1/15 /2021                                                                              
<br>
Note that an UMIP number will be assigned by an editor. When opening a pull request to submit your UMIP, please use an abbreviated title in the filename, umip-draft_title_abbrev.md.
The title should be 44 characters or less.

<br>
<br>

# SUMMARY 

The DVM should support price requests for the below price indexes:
- USD/bBadger
- bBadger/USD
- USD-[bwBTC/ETH SLP]
- [bwBTC/ETH SLP]-USD



# MOTIVATION

The DVM currently does not support the USD-[bwBTC/ETH SLP],  [bwBTC/ETH SLP]-USD, USD/bBadger or bBadger/USD price identifiers.  

BadgerDAO’s first product is Sett vault, an automated DeFi aggregator focused on tokenized BTC assets. Users that tokenized Bitcoin in our vaults receive a corresponding “b” denominated token in return that represents their vault position. Unfortunately these vault positions then become illiquid. Many of our users would like to borrow against their BTC vault positions as collateral to mint Badger Dollars (a yield dollar). At the time of writing, Badger’s Sett Vaults have brought in over 700m in TVL. 

**bwBTC/ETH SLP**
- Liquidity provider tokens for the wBTC/ETH pool in Sushiswap that is staked in the Badger Sett Vault wBTC/ETH SLP resulting to mint bwBTC/ETH SLP token(s).
- View [here] (https://etherscan.io/token/0x758a43ee2bff8230eeb784879cdcff4828f2544d) for it's associated token address

**bBadger**
- Badger token that is staked in the Badger Sett Vault to mint bBadger token(s)
- View [here](https://etherscan.io/token/0x19d97d8fa813ee2f51ad4b4e04ea08baf4dffc28) for it's associated token address

Supporting the USD-[bwBTC/ETH SLP],  [bwBTC/ETH]-USD, USD/bBadger and bBadger/USD price identifiers would enable the creation of Badger Dollars synthetic token. It enables token minters to leverage their vaulted positions in Badgers Setts.  This would allow Alice to use 100 bBadger (worth $1200) to create 400 USD synth tokens (worth $400).  At expiry, Alice could redeem her 400 USD synthetic tokens for the USD amount of bBadger the USD synthetic tokens are worth.  Once this is complete, she could then withdrawal the rest of her collateral (100 bBadger).

<br> 

# MARKETS & DATA SOURCES

 **Required questions**

1. What markets should the price be queried from? It is recommended to have at least 3 markets.

    - [bwBTC/ETH SLP]-USD and USD-[bwBTC/ETH SLP]
        - Sushiswap (to get the underlying balances)
        - Binance, Huobi and Coinbase Pro (BTC and ETH prices)

    - bBadger/USD and USD/bBadger
        - Uniswap
        - Sushiswap


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

We would be using the Sushiswap and Uniswap TWAPs to determine price 

https://github.com/ConcourseOpen/DeFi-Pulse-Adapters/blob/master/projects/badger/index.js

Please provide a link to your price feed pull request.

- [ADD-LINK-TO-PULL-REQUEST]

<br>

# TECHNICAL SPECIFICATIONS

## USD/bBadger

**1. Price Identifier Name** - USD/bBadger

**2. Base Currency** - USD

**3. Quote currency** - bBadger

**4. Intended Collateral Currency** - bBadger

- Does the value of this collateral currency match the standalone value of the listed quote currency? 

    - Yes

- Is your collateral currency already approved to be used by UMA financial contracts? If no, submit a UMIP to have the desired collateral currency approved for use. 

    - Not yet but there is a PR to have the collateral currency approved

**5. Collateral Decimals** - 18

**6. Rounding** - Round to 18 decimal places

<br>

## bBadger/USD

**1. Price Identifier Name** - bBadger/USD

**2. Base Currency** - bBadger

**3. Quote currency** - USD

**4. Intended Collateral Currency** - USDC

- Does the value of this collateral currency match the standalone value of the listed quote currency? 

    - Yes

- Is your collateral currency already approved to be used by UMA financial contracts? If no, submit a UMIP to have the desired collateral currency approved for use. 

    - Yes

**5. Collateral Decimals** - 6

**6. Rounding** - Round to 6 decimal places

<br>

## [bwBTC/ETH SLP]-USD]

**1. Price Identifier Name** - [bwBTC/ETH SLP]-USD

**2. Base Currency** - bwBTC/ETH SLP

**3. Quote currency** - USD

**4. Intended Collateral Currency** - USDC

- Does the value of this collateral currency match the standalone value of the listed quote currency? 

    - Yes

- Is your collateral currency already approved to be used by UMA financial contracts? If no, submit a UMIP to have the desired collateral currency approved for use. 

    - Yes


**5. Collateral Decimals** - 6

**6. Rounding** - Round to 6 decimal places

<br>

## USD-[bwBTC/ETH SLP]

**1. Price Identifier Name** - USD-[bwBTC/ETH SLP]

**2. Base Currency** - USD

**3. Quote currency** - bwBTC/ETH SLP

**4. Intended Collateral Currency** - bwBTC/ETH SLP

- Does the value of this collateral currency match the standalone value of the listed quote currency? 

    - Yes

- Is your collateral currency already approved to be used by UMA financial contracts? If no, submit a UMIP to have the desired collateral currency approved for use. 

    - Not yet but there is a PR to have the collateral currency approved


**5. Collateral Decimals** - 18

**6. Rounding** - Round to 18 decimal places

<br>

# RATIONALE

The rationale should flesh out the specification by describing what motivated the design and why particular design decisions were made, as well as any alternative designs that were considered.

- [RESPONSE]

<br>

# IMPLEMENTATION

B wrapped tokens have 2 components to finding the underlying value of the tokens associated with them.  Each wrapped token has a pricePerFullShare, which is the amount of underlying tokens that 1 b token could be redeemed for through the withdraw function.  This underlying token can have different ways to determine its value depending on what type of token it is.

The price per full share can be found by querying the contract of the token with `getPricePerFullShare` as seen in method 9 on this contract: https://etherscan.io/address/0x19D97D8fA813EE2f51aD4B4e04EA08bAf4DFfC28#reaProxyContract

<br>

## USD-[bwBTC/ETH SLP]

For the bwBTC/ETH SLP, you would find the value by querying the sushiswap subgraph using the below query:
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


1. **Pricing interval**

    - [ANSWER]

2. **Input processing**

    - None. Human intervention in extreme circumstances where the result differs from broad market consensus.

3. **Result processing** 

     - Mode

     <br>

## [bwBTC/ETH SLP]-USD

1. **Pricing interval**

    - [ANSWER]

2. **Input processing**

    - None. Human intervention in extreme circumstances where the result differs from broad market consensus.

3. **Result processing** 

     - Mode

     <br>

## USD/bBadger

For bBadger you could use the same getPricePerFullShare method (described above) from the contract to get the underlying amount, and then the price can be queried via the graph for both Sushi and Uniswap using TWAPs.


1. **Pricing interval**

    - [ANSWER]

2. **Input processing**

    - None. Human intervention in extreme circumstances where the result differs from broad market consensus.

3. **Result processing** 

     - Mode

     <br>

## bBadger/USD

For bBadger you could use the same getPricePerFullShare method from the contract to get the underlying amount, and then the price can be queried via the graph for both sushi and uniswap using TWAPs.


1. **Pricing interval**

    - [ANSWER]

2. **Input processing**

    - None. Human intervention in extreme circumstances where the result differs from broad market consensus.

3. **Result processing** 

     - Mode


<br>

# Security considerations

Adding this new identifier by itself poses little security risk to the DVM or priceless financial contract users. However, anyone deploying a new priceless token contract referencing this identifier should take care to parameterize the contract appropriately to the reference asset’s volatility and liquidity characteristics to avoid the loss of funds for synthetic token holders.

Additionally, the contract deployer should ensure that there is a network of liquidators and disputers ready to perform the services necessary to keep the contract solvent. $UMA-holders should evaluate the ongoing cost and benefit of supporting price requests for this identifier and also contemplate de-registering this identifier if security holes are identified.


## HEADERS
| UMIP-39     |                                                                                                                                  |
|------------|------------------------------------------------------------------------------------------------------------------------------------------|
| UMIP Title | BadgerDAO Setts Vault Price Identifiers                                                                                                  |
| Authors    | mitche50, J au Defi, bitcoinpalmer, Defi Frog
| Status     | Draft                                                                                                                            |
| Created    | 1/15 /2021                                                                              

<br>

# SUMMARY 

The DVM should support price requests for the below price indexes:
- USD/bBadger
- USD-[bwBTC/ETH SLP]




# MOTIVATION

The DVM currently does not support the USD-[bwBTC/ETH SLP], USD/bBadger price identifiers.  

BadgerDAO’s first product is Sett vault, an automated DeFi aggregator focused on tokenized BTC assets. Users that tokenized Bitcoin in our vaults receive a corresponding “b” denominated token in return that represents their vault position. Unfortunately these vault positions then become illiquid. Many of our users would like to borrow against their BTC vault positions as collateral to mint Badger Dollars (a yield dollar). At the time of writing, Badger’s Sett Vaults have brought in over 700m in TVL.


bwBTC/ETH SLP is BadgerDAO's highest TVL vault and bBadger is our native token vault, only less in value than the curve vault.


**bwBTC/ETH SLP**
- Liquidity provider tokens for the wBTC/ETH pool in Sushiswap that is staked in the Badger Sett Vault wBTC/ETH SLP resulting to mint bwBTC/ETH SLP token(s).
- View [here] (https://etherscan.io/token/0x758a43ee2bff8230eeb784879cdcff4828f2544d) for its associated token address

**bBadger**
- Badger token that is staked in the Badger Sett Vault to mint bBadger token(s)
- View [here](https://etherscan.io/token/0x19d97d8fa813ee2f51ad4b4e04ea08baf4dffc28) for its associated token address

Supporting the USD-[bwBTC/ETH SLP] and USD/bBadger price identifiers would enable the creation of Badger Dollars synthetic token. It enables token minters to leverage their vaulted positions in Badgers Setts.  This would allow Alice to use 100 bBadger (worth $1200) to create 400 USD synth tokens (worth $400).  At expiry, Alice could redeem her 400 USD synthetic tokens for the USD amount of bBadger the USD synthetic tokens are worth.  Once this is complete, she could then withdrawal the rest of her collateral (100 bBadger).

<br> 

# MARKETS & DATA SOURCES

 **Required questions**

1. What markets should the price be queried from? It is recommended to have at least 3 markets.

    - USD-[bwBTC/ETH SLP]
        - Sushiswap (to get the underlying balances)
        - Binance, Huobi and Coinbase Pro (BTC and ETH prices)

    - USD/bBadger
        - Uniswap
        - Sushiswap

        **Note** - The above are approved collateral currencies on UMA. View below. 

        https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-35.md



2. Provide recommended endpoints to query for real-time prices from each market listed. 

    - Sushiswap  graph explorer
        - https://thegraph.com/explorer/subgraph/jiro-ono/sushiswap-v1-exchange

    - Uniswap graph explorers
        - https://thegraph.com/explorer/subgraph/uniswap/uniswap-v2


5. Provide recommended endpoints to query for historical prices from each market listed. 


**bBadger query** 
``` {
    query: {
        token(id: "0x3472A5A71965499acd81997a54BBA8D852C6E53d", block:{number: 11589591}) {
            derivedETH
        }
    },
} 
```

**bwBTC/ETH SLP Query**

``` {
    query: {
        pair(id: "0xCEfF51756c56CeFFCA006cD410B03FFC46dd3a58",  block:{number: 11589591}) {
            totalSupply
            reserve0
            reserve1
            token0{
                derivedETH
            }
            token1{
                derivedETH
            }
        }
    },
} 
```
6.  Do these sources allow for querying up to 74 hours of historical data? 

    - Yes, detailed in implementation section

7.  How often is the provided price updated?

    - Every block

8. Is an API key required to query these sources? 

    - No

9. Is there a cost associated with usage? 

    - No (this could change when The Graph turns into a marketplace)

10. If there is a free tier available, how many queries does it allow for?

    - No limit currently

11.  What would be the cost of sending 15,000 queries?

     - $0

<br>

# PRICE FEED IMPLEMENTATION

We would be using the Sushiswap and Uniswap 2-hour TWAPs to determine price 

https://github.com/ConcourseOpen/DeFi-Pulse-Adapters/blob/master/projects/badger/index.js


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

    - Yes

**5. Collateral Decimals** - 18

**6. Rounding** - Round to 18 decimal places

<br>


## USD-[bwBTC/ETH SLP]

**1. Price Identifier Name** - USD-[bwBTC/ETH SLP]

**2. Base Currency** - USD

**3. Quote currency** - bwBTC/ETH SLP

**4. Intended Collateral Currency** - bwBTC/ETH SLP

- Does the value of this collateral currency match the standalone value of the listed quote currency? 

    - Yes

- Is your collateral currency already approved to be used by UMA financial contracts? If no, submit a UMIP to have the desired collateral currency approved for use. 

    - Yes


**5. Collateral Decimals** - 18

**6. Rounding** - Round to 18 decimal places

<br>

# RATIONALE

**Why this implementation of the identifier as opposed to other implementation designs?**

This implementation is due to Badger’s main sources of liquidity being on Sushiswap and Uniswap.  Currently, only low volume and low depth centralized exchanges have Badger listed, and most liquidity will remain on DEXs as it is incentivized.

**What analysis can you provide on where to get the most robust prices? (Robust as in legitimate liquidity, legitimate volume, price discrepancies between exchanges, and trading volume between exchanges)**

Sushiswap and Uniswap have the vast majority of Badger volume and depth.  These should be used over all other sources.

**What is the potential for the price to be manipulated on the chosen exchanges?**

Badger is not a collateral on any loan services and the majority of the liquidity is locked into farming vaults / geysers.  The potential risk for this is low.

**Should the prices have any processing (e.g., TWAP)?**

Since pricing is coming from uniswap, we should use the TWAP as defined in the price feed that already exists.


TWAPs increase reliability of pulling data from AMMs. Without this, flash loans can be used to exploit pricing and cause liquidations.


<br>

# IMPLEMENTATION

B wrapped tokens have 2 components to finding the underlying value of the tokens associated with them.  Each wrapped token has a pricePerFullShare, which is the amount of underlying tokens that 1 b token could be redeemed for through the withdraw function.  This underlying token can have different ways to determine its value depending on what type of token it is.

The price per full share can be found by querying the contract of the token with `getPricePerFullShare` as seen in method 9 on this contract: https://etherscan.io/address/0x19D97D8fA813EE2f51aD4B4e04EA08bAf4DFfC28#reaProxyContract



getPricePerFullShare is a pure view logic function in which no one has any authority to manipulate:

``` 
if (totalSupply() == 0) 
{ return 1e18;
}
return balance().mul(1e18).div(totalSupply());
```

This returns the value of the balance of the vault divided by the number of shares to give the user the value of 1 share of the vault token. balance() represents the total balance of the underlying token in the vault. For example, if a user has 1 bBadger, this could be worth 1.2 Badger (which would be the ratio of balance / totalSupply).

For bBadger you could use the same getPricePerFullShare method (described above) from the contract to get the underlying amount, and then the price can be queried via the graph for both Sushi and Uniswap using 2-hour TWAPs.

<br>

## USD/bBadger

**A. How should tokenholders arrive at the price in the case of a DVM price request?** 

To find the price for USD/bBadger perform the following steps:

1. Query contract 0x19D97D8fA813EE2f51aD4B4e04EA08bAf4DFfC28 for method getPricePerFullShare
2. Multiply this value by 1e-18 to get the ratio of b tokens to underlying tokens
3. Multiply the amount of bBadger by the result of the above 
4. HTTP GET request to the uniswap subgraph 

    {
        query: {
            token(id: "0x3472A5A71965499acd81997a54BBA8D852C6E53d") {
                derivedETH
            }
        },
    }

5. The graph can accept blockheights to get historical data.  To get this information, include block:{number: 11589591} (as and example to get block height 11589591) in the pair parameters.  Example:

    {
        query: {
            token(id: "0x3472A5A71965499acd81997a54BBA8D852C6E53d", block:{number: 11589591}) {
                derivedETH
            }
        },
    }

    - This gives the current price of Badger in ETH

5. Multiply the price of Badger (in ETH) by the amount of underlying tokens to get the value of the bBadger in ETH
6. Take the price of bBadger in ETH and multiple it by the ETH/USD price to obtain the price of bBadger (in USD)
    - Using the implementation defined in [UMIP 6](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-6.md), query for the price of ETH USD and multiply the results from steps 5 by ETH/USD price
8. Take the inverse of the bBadger/USD price by performing 1/the price of bBadger (in USD)


1. **Pricing interval**

    - 1 second

2. **Input processing**

    - None. Human intervention in extreme circumstances where the result differs from broad market consensus.

3. **Result processing** 

     - Median

     <br>



## USD-[bwBTC/ETH SLP]

**A. How should tokenholders arrive at the price in the case of a DVM price request?** 

1. Query contract 0x758a43ee2bff8230eeb784879cdcff4828f2544d for method getPricePerFullShare

2. Multiply this value by 1e-18 to get the ratio of b tokens to underlying tokens

3. Multiply the amount of bwBTC/ETH SLP by the result of the above multiplication

4. HTTP GET request to the sushiswap subgraph https://api.thegraph.com/subgraphs/name/jiro-ono/sushiswap-v1-exchange with the below json query:
  ```  {
        query: {
            pair(id: "0xCEfF51756c56CeFFCA006cD410B03FFC46dd3a58") {
                totalSupply
                reserve0
                reserve1
                token0{
                    derivedETH
                }
                token1{
                    derivedETH
                }
            }
        },
    }
```
-  Note - Token0 is wBTC, token1 is wETH

5. To get the value of the SLP you would take the derivedETH value for each token, multiply it by the respective reserve, add them together and then divide by the total supply

    - The calculation is:

        ``` ((data.pair.token0.derivedETH * data.pair.reserve0 * 1e18) + (data.pair.token1.derivedETH * data.pair.reserve1 * 1e18)) / data.pair.totalSupply```

6. The graph can accept blockheights to get historical data.  To get this information, include block:{number: 11589591} (as and example to get block height 11589591) in the pair parameters.  Example:

   ``` {
        query: {
            pair(id: "0xCEfF51756c56CeFFCA006cD410B03FFC46dd3a58",  block:{number: 11589591}) {
                totalSupply
                reserve0
                reserve1
                token0{
                    derivedETH
                }
                token1{
                    derivedETH
                }
            }
        },
    }
    ```

7. Take this result and multiply by the amount of underlying tokens you have to get the value of bwBTC/ETH in ETH

8. Take the price of bwBTC/ETH in ETH and multiple it by the ETH/USD price to obtain the price of bwBTC/ETH (in USD)
    - Using the implementation defined in [UMIP 6](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-6.md), query for the price of ETH USD and multiply the results from step 7 by the ETH/USD price
9. Take the inverse of the bwBTC/ETH price by performing 1 / the price of bwBTC/ETH (in USD)

1. **Pricing interval**

    - 1 second

2. **Input processing**

    - None. Human intervention in extreme circumstances where the result differs from broad market consensus.

3. **Result processing** 

     - Median


The median is applied to wBTC/ETH pair components (across 3 exchanges) via: 

- Amount of underlying wBTC and ETH tokens you can redeem for a given amount of wrapped pool token
- Amount of redeemable wBTC x price of wBTC across 3 exchanges
- Amount of redeemable ETH x price of ETH across 3 exchanges
- Sum of the two medians -> median price of underlying collateral



<br>

# Security considerations

Adding this new identifier by itself poses little security risk to the DVM or priceless financial contract users. However, anyone deploying a new priceless token contract referencing this identifier should take care to parameterize the contract appropriately to the reference asset’s volatility and liquidity characteristics to avoid the loss of funds for synthetic token holders.

Although these are "wrapped" tokens, an objective value of the underlying collateral can be accurately determined to adequately inform both participating liquidators and disputers.

The value of collateral can be objective in terms of price per full share * underlying asset value. 

If the vault was hacked in a way that drained funds, the price per full share would decrease in a way that makes the collateral "proportionally recoverable" for all users. There is also insurance from Nexus mutual to consider in terms of valuing the asset in the event of a covered vulnerability

For context, the wrapping mechanism mints a token that represents a % share of a liquidity pool or vault. This is common practice when providing liquidity to an AMM or depositing into a yield optimizer. Using identifiers like price per full share, an oracle can deterministically calculate the value of what the unwrapped ERC20 tokens would be worth at any given time.

Additionally, the contract deployer should ensure that there is a network of liquidators and disputers ready to perform the services necessary to keep the contract solvent. $UMA-holders should evaluate the ongoing cost and benefit of supporting price requests for this identifier and also contemplate de-registering this identifier if security holes are identified.

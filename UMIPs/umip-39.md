## HEADERS
| UMIP-39     |                                                                                                                                  |
|------------|------------------------------------------------------------------------------------------------------------------------------------------|
| UMIP Title | Add USD/bBadger and USD-[bwBTC/ETH SLP] as supported price identifiers                                                                                                   |
| Authors    | mitche50, J au Defi, bitcoinpalmer, Defi Frog, Sean Brown (smb2796) 
| Status     | Approved                                                                                                                           |
| Created    | 1/15/2021                                                                              


# SUMMARY 

The DVM should support price requests for the below price indexes:
- USD/bBadger
- USD-[bwBTC/ETH SLP]

# MOTIVATION

The DVM currently does not support the USD-[bwBTC/ETH SLP], USD/bBadger price identifiers.  

BadgerDAO’s first product is Sett vault, an automated DeFi aggregator focused on tokenized BTC assets. Users that tokenized Bitcoin in our vaults receive a corresponding “b” denominated token in return that represents their vault position. Unfortunately these vault positions then become illiquid. Many of our users would like to borrow against their BTC vault positions as collateral to mint Badger Dollars (a yield dollar). At the time of writing, Badger’s Sett Vaults have brought in over 1 billion in TVL.

bwBTC/ETH SLP is BadgerDAO's highest TVL vault and bBadger is our native token vault, only less in value than the curve vault.

**bwBTC/ETH SLP**
- Liquidity provider tokens for the wBTC/ETH pool in Sushiswap that is staked in the Badger Sett Vault wBTC/ETH SLP to mint bwBTC/ETH SLP token(s).
- View [here](https://etherscan.io/token/0x758a43ee2bff8230eeb784879cdcff4828f2544d) for its associated token address

**bBadger**
- Badger token that is staked in the Badger Sett Vault to mint bBadger token(s)
- View [here](https://etherscan.io/token/0x19d97d8fa813ee2f51ad4b4e04ea08baf4dffc28) for its associated token address

Supporting the USD-[bwBTC/ETH SLP] and USD/bBadger price identifiers would enable the creation of Badger Dollars synthetic token. It enables token minters to leverage their vaulted positions in Badgers Setts.  This would allow Alice to use 100 bBadger (worth $1200) to create 400 USD synth tokens (worth $400).  At expiry, Alice could redeem her 400 USD synthetic tokens for the USD amount of bBadger the USD synthetic tokens are worth.  Once this is complete, she could then withdrawal the rest of her collateral (100 bBadger).

# MARKETS & DATA SOURCES

 **Required questions**

1. What markets should the price be queried from? It is recommended to have at least 3 markets.

    - USD-[bwBTC/ETH SLP]
        - Sushiswap (to get the underlying balances)
        - Uniswap and Sushiswap for WBTC/ETH
        - Binance, Coinbase, Kraken for ETH/USD (follows the specifications in UMIP-6)

    - USD/bBadger
        - Uniswap and Sushiswap for WBTC/ETH
        - Uniswap and Sushiswap for Badger/WBTC
        - Binance, Coinbase, Kraken for ETH/USD (follows the specifications in UMIP-6)

2. Provide recommended endpoints to query for real-time prices from each market listed. 

    - Sushiswap graph explorer
        - https://thegraph.com/explorer/subgraph/jiro-ono/sushiswap-v1-exchange

    - Uniswap graph explorers
        - https://thegraph.com/explorer/subgraph/uniswap/uniswap-v2


3. Provide recommended endpoints to query for historical prices from each market listed. 


**bBadger query** 
``` 
{
    token(id: "0x3472a5a71965499acd81997a54bba8d852c6e53d", block:{number: 11589591}) {
        derivedETH
    }
}
```

**bwBTC/ETH SLP Query**

``` 
{
    pair(id: "0xceff51756c56ceffca006cd410b03ffc46dd3a58",  block:{number: 11589591}) {
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
}
```
6.  Do these sources allow for querying up to 74 hours of historical data? 

    - Yes, detailed in implementation section

7.  How often is the provided price updated?

    - Every block

8. Is an API key required to query these sources? 

    - No

9. Is there a cost associated with usage? 

    - No (this could change when The Graph turns into a marketplace). Note, the price feed does not use The Graph. Using the graph is a secondary reference implementation. 

10. If there is a free tier available, how many queries does it allow for?

    - No limit currently

11.  What would be the cost of sending 15,000 queries?

     - $0

# PRICE FEED IMPLEMENTATION

We would be using the Sushiswap and Uniswap 2-hour TWAPs to obtain price information.  

https://github.com/ConcourseOpen/DeFi-Pulse-Adapters/blob/master/projects/badger/index.js


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


# RATIONALE

**Why this implementation of the identifier as opposed to other implementation designs?**

This implementation is due to Badger’s main sources of liquidity being on Sushiswap and Uniswap.  Currently, only low volume and low depth centralized exchanges have Badger listed, and most liquidity will remain on DEXs as it is incentivized.

**What analysis can you provide on where to get the most robust prices? (Robust as in legitimate liquidity, legitimate volume, price discrepancies between exchanges, and trading volume between exchanges)**

Sushiswap and Uniswap have the vast majority of Badger volume and depth.  These should be used over all other sources.

**What is the potential for the price to be manipulated on the chosen exchanges?**

Badger is not a collateral on any loan services and the majority of the liquidity is locked into farming vaults / geysers.  The potential risk for this is low.

**Should the prices have any processing (e.g., TWAP)?**

Processing is defined in the implementation section.

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

For bBadger you could use the same getPricePerFullShare method (described above) from the contract to get the underlying amount, and then the underlying values can be queried to give the price of one bBadger token in USD.

For both implemenations, a block number will need to be used. The block number should be the block that is closest to and before the timestamp that the price request timestamp.

## Obtaining the WBTC/USD price

For both of these price identifiers, the WBTC/USD price will need to be used in the pricing calculation.

To obtain the WBTC/USD price, follow this process. The price request timestamp should be passed as the `timestamp` parameter.

1. Obtain the price of wBTC/USD by querying for wBTC/ETH on Sushiswap and Uniswap
- Voters can obtain this information in any way that they wish. A subgraph query is provided for both sources as a reference implementation.

Query for the WBTC/ETH price using the below [subgraph query](https://api.thegraph.com/subgraphs/name/sushiswap/exchange) for Sushiswap:
    
```
    {
          pair(id: "0xceff51756c56ceffca006cd410b03ffc46dd3a58",  block:{number: 11589591}) {
                reserve0
                reserve1
                totalSupply
          }
    }
```
    
    
Query for the WBTC/ETH price using the below [subgraph query](https://thegraph.com/explorer/subgraph/uniswap/uniswap-v2) for Uniswap:  

```
    {
          pair(id: "0xbb2b8038a1640196fbe3e38816f3e67cba72d940",  block:{number: 11589591}) {
                reserve0
                reserve1
                totalSupply
          }
    }
```

2. Take the average of the results between Sushiswap and Uniswap
3. Using the specifications in UMIP 6 query for the price of ETHUSD
4. Multiple the results of steps 2 and 3 together to get the price wBTC/USD

## USD/bBadger

**A. How should tokenholders arrive at the price in the case of a DVM price request?** 

To find the price for USD/bBadger perform the following steps:

1. Query contract 0x19d97d8fa813ee2f51ad4b4e04ea08baf4dffc28 for method getPricePerFullShare. This information is on-chain and can be queried in any way that a voter wishes at the price request block. 
2. Multiply this value by 1e-18 to get the ratio of one bBadger token to underlying badger tokens (i.e. bBadger/Badger).
3. Query for the price of Badger/WBTC on Sushiswap. Pool address: `0x110492b31c59716ac47337e616804e3e3adc0b4a`. Multiply this by the WBTC/USD price obtained earlier to get the Badger/USD price.
4. Repeat step 3 for Uniswap. Pool address: `0xcd7989894bc033581532d2cd88da5db0a4b12859`
5. Query for the price of Badger/USD on Huobi.
6. Take the median of steps 3-5 to get the Badger/USD price that should be used.
7. Multiply bBadger/Badger by Badger/USD to get the bBadger/USD price.
8. Take the inverse of this (1/(bBadger/USD)) to get the price of USD/bBadger. This price should then be rounded to 18 decimals.

**Pricing interval**
    - 60 seconds

**Input processing**
    - None. Human intervention in extreme circumstances where the result differs from broad market consensus.

**Result processing** 
    - This price should be returned as 18 decimals.  

## USD-[bwBTC/ETH SLP]

**A. How should tokenholders arrive at the price in the case of a DVM price request?** 

1. Obtain the [bwBTC/ETH SLP] to WBTC and [bwBTC/ETH SLP] to ETH ratios in the pool. 

Query the sushiswap subgraph using this query:
https://api.thegraph.com/subgraphs/name/sushiswap/exchange

```
    {
          pair(id: "0xceff51756c56ceffca006cd410b03ffc46dd3a58",  block:{number: 11589591}) {
                reserve0
                reserve1
                totalSupply
          }
    }
```

For the sushi wBTC/ETH SLP, token0 = wBTC and token1 = ETH.  We can then determine the value of the provided SLP by the below pseudo code:

- WBTC Ratio = Reserve0 / totalSupply
- ETH Ratio = Reserve1 / totalSupply

2. Multiply the WBTC ratio by the WBTC/USD price. 
3. Obtain the ETH/USD price by following the directions in UMIP-6. Multiply the ETH ratio by the ETH/USD price.
4. Add the results of steps 2 and 3 to get the [bwBTC/ETH SLP]/USD price.
5. Take the inverse of step 4 (1/([bwBTC/ETH SLP]/USD)) to get the USD-[bwBTC/ETH SLP] price.

## USD-[bwBTC/ETH SLP]

**Pricing interval**

- Every block

**Input processing**

- None. Human intervention in extreme circumstances where the result differs from broad market consensus.

**Result processing** 

- Round to 18 decimal places.


# Security considerations

Adding this new identifier by itself poses little security risk to the DVM or priceless financial contract users. However, anyone deploying a new priceless token contract referencing this identifier should take care to parameterize the contract appropriately to the reference asset’s volatility and liquidity characteristics to avoid the loss of funds for synthetic token holders.

Although these are "wrapped" tokens, an objective value of the underlying collateral can be accurately determined to adequately inform both participating liquidators and disputers.

The value of collateral can be objective in terms of price per full share * underlying asset value. 

If the vault was hacked in a way that drained funds, the price per full share would decrease in a way that makes the collateral "proportionally recoverable" for all users. There is also insurance from Nexus mutual to consider in terms of valuing the asset in the event of a covered vulnerability

For context, the wrapping mechanism mints a token that represents a % share of a liquidity pool or vault. This is common practice when providing liquidity to an AMM or depositing into a yield optimizer. Using identifiers like price per full share, an oracle can deterministically calculate the value of what the unwrapped ERC20 tokens would be worth at any given time.

Additionally, the contract deployer should ensure that there is a network of liquidators and disputers ready to perform the services necessary to keep the contract solvent. $UMA-holders should evaluate the ongoing cost and benefit of supporting price requests for this identifier and also contemplate de-registering this identifier if security holes are identified.

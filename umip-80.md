## HEADERS
| UMIP-XX    |                                                                                                                                  	|
|------------|------------------------------------------------------------------------------------------------------------------------------------------|
| UMIP Title | Add iFARM/USD and USD/iFARM as supported price identifiers                                                                               |
| Authors    |EAsports and gruad 														        |
| Status     | DRAFT                                                                                                                                    |
| Created    | 4/17/2021                                                                              						|


# SUMMARY 

The DVM should support price requests for the below price indexes:
- iFARM/USD
- USD/iFARM

# MOTIVATION

The DVM currently does not support the iFARM/USD and USD/iFARM price identifiers.  

Harvest Finance tokenized is profit sharing pool for FARM as an interest bearing receipt iFARM. Users that tokenized FARM in our vaults receive a corresponding “i” denominated token in return that represents their vault position. These iFARM tokens compound interest while remaining in the users wallet to be held, exchanged for other assets or staked on other platforms.  Many of our users would like to borrow against their iFARM positions as collateral to borrow other cryptocurrencies. At the time of writing, Harvest Finance has $534 million in TVL with FARM/iFARM representing approximately $150M in TVL.

**FARM**
-"A key innovation of the $FARM token is that it entitles holders to a performance fee (currently 30%) taken from Harvest's yield farming strategies." View[FARM tokenomics on Wiki](https://farm.chainwiki.dev/en/supply)
 
- View [here](https://etherscan.io/token/0xa0246c9032bc3a600820415ae600c6388619a14d) for its associated token address

**iFARM**
- Represents staked FARM in the profit sharing pool.  Is is an interest bearing receipt whose underlying value is based on FARM.  The relationship between FARM and iFARM is governed by the exchange rate in the iFARM contract which increases over time in relation to the amount of FARM distributed in the profit share vault.

Supporting the iFARM/USD and USD/iFARM price identifiers would enable the collateralization of iFARM to borrow against iFARM and use that associate credit to purchase other cryptocurrencies. It enables token stakers to leverage their vaulted positions in iFARM.  This would allow Alice to use 100 iFARM (worth $2860 at current FARM prices) to create 800 USD synth tokens (worth $800).  At expiry, Alice could redeem her 800 USD synthetic tokens for the USD amount of iFARM the USD synthetic tokens are worth.  Once this is complete, she could then withdrawal the rest of her collateral.

# MARKETS & DATA SOURCES

 **Required questions**

1. What markets should the price be queried from? It is recommended to have at least 3 markets.

    - FARM
        - Uniswap for FARM/ETH LP which is the officially supported LP by Harvest and currently has the largest liquidity
        - FARM/USDC on cryptowatch View [here](https://cryptowat.ch/assets/farm)
        - Binance, Coinbase, Kraken for ETH/USD (follows the specifications in UMIP-6) to convert native FARM/ETH LP to USD
    - iFARM
        - [Contract Address](https://etherscan.io/address/0x1571eD0bed4D987fe2b498DdBaE7DFA19519F651) which details in getPricePerFullShare the exchange rate between FARM and iFARM accounting for the "decimals" property (18)
        - This is a mathematical relationship governed by the contract and therefore does not need an independent feed. [***Question to Harvest: What about historical values?  What is the best way to query the contract for a value at a particular time?***]
    - Binance, Coinbase, Kraken for ETH/USD (follows the specifications in UMIP-6) to convert native FARM/ETH LP to USD.

2. Provide recommended endpoints to query for real-time prices from each market listed. [**Note to Harvest: Best reference for real-time prices?**]

    - Sushiswap graph explorer
        - https://thegraph.com/explorer/subgraph/jiro-ono/sushiswap-v1-exchange

    - Uniswap graph explorers
        - https://thegraph.com/explorer/subgraph/uniswap/uniswap-v2 [Need to add proper query for actual price]


3. Provide recommended endpoints to query for historical prices from each market listed. 

4. FARM/USDC: 

	- https://cryptowat.ch/assets/farm [**Need to add proper link to historical prices**]

5.  Do these sources allow for querying up to 74 hours of historical data? 

    - Yes

6.  How often is the provided price updated?

    - ???

7. Is an API key required to query these sources? 

    - No

8. Is there a cost associated with usage? 

    - No (this could change when The Graph turns into a marketplace). Note, the price feed does not use The Graph. Using the graph is a secondary reference implementation. 

9.  If there is a free tier available, how many queries does it allow for?

    - No limit currently

10.   What would be the cost of sending 15,000 queries?

     - $0

# PRICE FEED IMPLEMENTATION 

[**NOTE: These are from another UMA!  I have not updated these for iFARM**]Pricing this identifier requires the use of a combination of price feeds. The price feed configuration is shown [here](https://github.com/UMAprotocol/protocol/pull/2576), and uses the [VaultPriceFeed](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/VaultPriceFeed.js), [LPPriceFeed](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/LPPriceFeed.js), [ExpressionPriceFeed](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/ExpressionPriceFeed.js), [CryptoWatchPriceFeed](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/CryptoWatchPriceFeed.js) and [UniswapPriceFeed](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/UniswapPriceFeed.js).


# TECHNICAL SPECIFICATIONS

## iFARM/USD

**1. Price Identifier Name** - iFARM-USD

**2. Base Currency** - USD

**3. Quote currency** - iFARM

**4. Intended Collateral Currency** - iFARM

- Does the value of this collateral currency match the standalone value of the listed quote currency? 

    - Yes

- Is your collateral currency already approved to be used by UMA financial contracts? If no, submit a UMIP to have the desired collateral currency approved for use. 

    - DRAFT UMIP in process

**5. Scaling Decimals** - 18 (1e18)

**6. Rounding** - Round to 18 decimal places


## USD/iFARM

**1. Price Identifier Name** - USD-iFARM

**2. Base Currency** - ??

**3. Quote currency** - ??

**4. Intended Collateral Currency** - USD

- Does the value of this collateral currency match the standalone value of the listed quote currency? 

    - Yes

- Is your collateral currency already approved to be used by UMA financial contracts? If no, submit a UMIP to have the desired collateral currency approved for use. 

    - Yes

**5. Scaling Decimals** - 18 (1e18)

**6. Rounding** - Round to 18 decimal places


# RATIONALE

**Why this implementation of the identifier as opposed to other implementation designs?**

This implementation is due to Harvest’s main sources of liquidity being on Uniswap and using a base currency of ETH.  

**What analysis can you provide on where to get the most robust prices? (Robust as in legitimate liquidity, legitimate volume, price discrepancies between exchanges, and trading volume between exchanges)**

Uniswap has the vast majority of FARM volume and depth.  These should be used over all other sources.

**What is the potential for the price to be manipulated on the chosen exchanges?**

iFARM is not a collateral currently on any loan services and the majority of the liquidity is locked into profit share vaults.  The potential risk for this is low.

**Should the prices have any processing (e.g., TWAP)?**

Processing is defined in the implementation section.

# IMPLEMENTATION

iFARM is an interest bearing receipt representing a compounding amount of FARM deposited into the Harvest profit sharing pool.  Each wrapped token has a pricePerFullShare, which is the amount of underlying FARM tokens that 1 iFARM could be redeemed for through the withdraw function.  This underlying token can have different ways to determine its value depending on what type of token it is.

The price per full share can be found by querying the contract of the token with `getPricePerFullShare` as seen in method 9 on this [contract](https://etherscan.io/address/0x1571eD0bed4D987fe2b498DdBaE7DFA19519F651#readProxyContract).

getPricePerFullShare is a pure view logic function in which no one has any authority to manipulate:

``` 
if (totalSupply() == 0) 
{ 
    return 1e18;
}
return balance().mul(1e18).div(totalSupply());
```

This returns the value of the balance of the vault divided by the number of shares to give the user the value of 1 share of the vault token. balance() represents the total balance of the underlying token in the vault. For example, if a user has 1 iFARM, this could be worth 1.06 FARM (which would be the ratio of balance / totalSupply).

For iFARM you could use the same getPricePerFullShare method (described above) from the contract to get the underlying amount of FARM, and then the underlying values can be queried to give the price of one FARM token in ETH.  That in turn can be converted to USD by querying the ratio of ETH/USD using UMIP-6.

For both implemenations, a block number will need to be used. The block number should be the block that is closest to and before the timestamp that the price request timestamp.

## Determining the iFARM/USD price

**A. How should tokenholders arrive at the price in the case of a DVM price request?** 

To obtain the iFARM/USD price, follow this process. The price request timestamp should be passed as the `timestamp` parameter.

1. Determine the iFARM/FARM from getPricePerFullShare property of the iFARM token contract.
2. Query for FARM/ETH prices on  Uniswap
- Voters can obtain this information in any way that they wish. A subgraph query is provided for both sources as a reference implementation.

Query for the FARM/ETH price using the below [subgraph query](https://thegraph.com/explorer/subgraph/uniswap/uniswap-v2) for Uniswap:  

```
    {
            }
```

3. The FARM/ETH price is determined by dividing `reserve0` by `reserve1`. This price should be queried using a 5-minute TWAP.
4. Using the specifications in UMIP 6 query for the price of ETHUSD.
5. Multiple the results of steps 1, 2 and 3 together to get the iFARM/USD price (specifically iFARM/USD = iFARM/FARM FARM/ETH ETH/USD)
6. Take the inverse of step 4 to get USD/iFARM price

**Pricing interval**
    - 60 seconds

**Input processing**
    - None. Human intervention in extreme circumstances where the result differs from broad market consensus.

**Result processing** 
    - This price should be returned as 18 decimals.  

# Security considerations

Adding this new identifier by itself poses little security risk to the DVM or priceless financial contract users. However, anyone deploying a new priceless token contract referencing this identifier should take care to parameterize the contract appropriately to the reference asset’s volatility and liquidity characteristics to avoid the loss of funds for synthetic token holders.

Although these are "wrapped" tokens, an objective value of the underlying collateral can be accurately determined to adequately inform both participating liquidators and disputers.

The value of collateral can be objective in terms of price per full share * underlying asset value. 

If the vault was hacked in a way that drained funds, there is also insurance from Nexus mutual to consider in terms of valuing the asset in the event of a covered vulnerability **NOTE: Is this true?  Need to check insurance markets**

Additionally, the contract deployer should ensure that there is a network of liquidators and disputers ready to perform the services necessary to keep the contract solvent. $UMA-holders should evaluate the ongoing cost and benefit of supporting price requests for this identifier and also contemplate de-registering this identifier if security holes are identified.

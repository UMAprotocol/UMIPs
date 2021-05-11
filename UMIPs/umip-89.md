## HEADERS
| UMIP-89    |                                                                                                                                  	|
|------------|------------------------------------------------------------------------------------------------------------------------------------------|
| UMIP Title | Add iFARMUSD and USDiFARM as supported price identifiers                                                                               |
| Authors    |EAsports and gruad 														        |
| Status     | Approved                                                                                                                                    |
| Created    | 4/17/2021                                                                              						|
| Discourse Link    | https://discourse.umaproject.org/t/adding-ifarm-as-collateral/922                                                                              						|


# SUMMARY 

The DVM should support price requests for the below price indexes:
- iFARMUSD
- USDiFARM

# MOTIVATION

The DVM currently does not support the iFARMUSD and USDiFARM price identifiers.  

Harvest Finance tokenized its profit sharing pool for FARM as an interest bearing receipt iFARM. Users that tokenized FARM in Harvest strategy vaults receive a corresponding “i” denominated token in return that represents their vault position. These iFARM tokens compound interest while remaining in the users wallet to be held, exchanged for other assets or staked on other platforms.  Many owners of iFARM would like to borrow against those positions as collateral. At the time of writing, Harvest Finance has more than $500 million in TVL with FARM/iFARM representing approximately $150M in TVL.

**FARM**
-"A key innovation of the $FARM token is that it entitles holders to a performance fee (currently 30%) taken from Harvest's yield farming strategies." View[FARM tokenomics on Wiki](https://farm.chainwiki.dev/en/supply)
 
- View [here](https://etherscan.io/token/0xa0246c9032bc3a600820415ae600c6388619a14d) for its associated token address

**iFARM**
- Represents staked FARM in the profit sharing pool.  Is is an interest bearing receipt whose underlying value is based on FARM.  The relationship between FARM and iFARM is governed by the exchange rate in the iFARM contract which increases over time in relation to the amount of FARM distributed in the profit share vault.

Supporting the iFARMUSD and USDiFARM price identifiers would enable the collateralization of iFARM to borrow against iFARM and use that associated credit to purchase other cryptocurrencies. It enables token stakers to leverage their vaulted positions in iFARM.  This would allow Alice to use 10 iFARM (worth $2860 for example if FARM price is $286 and her iFARM has not yet appreciated) to create 800 USD synth tokens (worth $800).  At expiry, Alice could redeem her 800 USD synthetic tokens for the USD amount of iFARM the USD synthetic tokens are worth.  Once this is complete, she could then withdrawal the rest of her collateral.

# MARKETS & DATA SOURCES

 **Required questions**

1. What markets should the price be queried from? It is recommended to have at least 3 markets.

    - FARM
        - Uniswap v2 for FARM/ETH LP which is the officially supported LP by Harvest and currently has the largest liquidity. The pool address is [0x56feAccb7f750B997B36A68625C7C596F0B41A58](https://etherscan.io/address/0x56feaccb7f750b997b36a68625c7c596f0b41a58).
        - Binance, Coinbase, Kraken for ETH/USD (follows the specifications in UMIP-6) to convert native FARM/ETH LP to USD
    - iFARM
        - [Contract Address](https://etherscan.io/address/0x1571eD0bed4D987fe2b498DdBaE7DFA19519F651) which details in getPricePerFullShare the exchange rate between FARM and iFARM accounting for the "decimals" property (18)
        - This is a mathematical relationship governed by the contract and therefore does not need an independent feed.

2. Provide recommended endpoints to query for real-time prices from each market listed.

    - Uniswap graph explorers
        - https://thegraph.com/explorer/subgraph/uniswap/uniswap-v2

3. Provide recommended endpoints to query for historical prices from each market listed.
	- Same as real-time prices

4.  Do these sources allow for querying up to 72 hours of historical data? 

    - Yes

5.  How often is the provided price updated?

    - Each Block is queried

6. Is an API key required to query these sources? 

    - Yes, for our reference implentation

7. Is there a cost associated with usage? 

    - Not currently. 

8.  If there is a free tier available, how many queries does it allow for?

    - No limit currently

9.   What would be the cost of sending 15,000 queries?

     - $0

# PRICE FEED IMPLEMENTATION 

These price identifiers will use price feeds that already exist in the UMA protocol repo. Both will use the [Cryptowatch](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/CryptoWatchPriceFeed.js), [Uniswap](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/UniswapPriceFeed.js) and [Expression](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/ExpressionPriceFeed.js) price feeds to get the price of FARMUSD. They will also use the [LPPriceFeed](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/LPPriceFeed.js) to determine the amount of FARM that each iFARM is redeemable for.

The default price feed config for SUSHIUSD would follow this pattern:

```
iFARMUSD: {
    type: "expression",
    expression: `
        FARMUSD = FARMETH_UNISWAP * ETHUSD;
        FARMUSD * FARM_PER_SHARE
    `,
    lookback: 7200,
    minTimeBetweenUpdates: 60,
    customFeeds: {
      FARMETH_UNISWAP: { type: "uniswap", address: "0x56feAccb7f750B997B36A68625C7C596F0B41A58", twapLength: 900 },
      FARM_PER_SHARE: {
        type: "lp",
        poolAddress: "0x1571eD0bed4D987fe2b498DdBaE7DFA19519F651",
        tokenAddress: "0xa0246c9032bC3A600820415aE600c6388619A14D"
      },
      ETHUSD: {
        type: "medianizer",
        minTimeBetweenUpdates: 60,
        medianizedFeeds: [
            { type: "cryptowatch", exchange: "coinbase-pro", pair: "ethusd" },
            { type: "cryptowatch", exchange: "binance", pair: "ethusdt" },
            { type: "cryptowatch", exchange: "kraken", pair: "ethusd" }
        ]
        }
    }
}
```


Another reference implementation is [here](https://github.com/gruadus/uniswap-trade-parser/tree/uma) the form of a python script that provides a data.csv file with all relevant data by block as well as calculated prices for each block.  This reference implementation uses both the [Alchemy](https://dashboard.alchemyapi.io) API's and [Etherscan](https://etherscan.io/) API's.

While both implementations are functional, users are encouraged to verify the performance of these or create their own implementations. 

# TECHNICAL SPECIFICATIONS

## iFARMUSD

**1. Price Identifier Name** - iFARMUSD

**2. Base Currency** - iFARM

**3. Quote currency** - USD

**4. Intended Collateral Currency** - iFARM

- Does the value of this collateral currency match the standalone value of the listed quote currency? 

    - Yes

- Is your collateral currency already approved to be used by UMA financial contracts? If no, submit a UMIP to have the desired collateral currency approved for use. 

    - DRAFT UMIP in process

**5. Scaling Decimals** - 18 (1e18)

**6. Rounding** - Round to 18 decimal places


## USDiFARM

**1. Price Identifier Name** - USDiFARM

**2. Base Currency** - USD

**3. Quote currency** - iFARM

**4. Intended Collateral Currency** - USDC

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

getPricePerFullShare is a pure view logic function in which no one has any authority to manipulate.  The reference code cited above returns this value in in a data.csv file by block.

This returns the value of the balance of the vault divided by the number of shares to give the user the value of 1 share of the vault token. balance() represents the total balance of the underlying token in the vault. For example, if a user has 1 iFARM, this could be worth 1.06 FARM (which would be the ratio of balance / totalSupply).

For iFARM you could use the same getPricePerFullShare method (described above) from the contract to get the underlying amount of FARM, and then the underlying values can be queried to give the price of one FARM token in ETH.  That in turn can be converted to USD by querying the ratio of ETH/USD using UMIP-6.

For both implementions, a block number will need to be used. The block number should be the block that is closest to and before the timestamp that the price request timestamp.

## Determining the iFARMUSD and USDiFARM prices

**A. How should tokenholders arrive at the price in the case of a DVM price request?** 

To obtain the iFARMUSD price, follow this process. The price request timestamp should be passed as the `timestamp` parameter.

1. Determine the iFARM/FARM from getPricePerFullShare property of the iFARM token contract.
2. Query for FARM/ETH prices from the Uniswap v2 FARM/ETH [pool](https://etherscan.io/address/0x56feaccb7f750b997b36a68625c7c596f0b41a58).
- Voters can obtain this information in any way that they wish. A python script that pulls a subgraph query is provided as a reference implementation.  See GitHub repo code referenced above as an example.
3. The FARM/ETH price is determined by dividing `reserve1` by `reserve0`. This price should be queried using a 15-minute TWAP.  All blocks within the 15 minnutes just prior to the block that occurs at or during the the timestamp of price request would be queried.
4. Using the specifications in UMIP 6 query for the price of ETHUSD.
5. Multiple the results of steps 1, 2 and 3 together to get the iFARMUSD price (specifically iFARMUSD = iFARM/FARM FARM/ETH ETH/USD)
6. Take the inverse of step 4 to get USDiFARM price

**Pricing interval**
    - Every block

**Input processing**
    - None. Human intervention in extreme circumstances where the result differs from broad market consensus.

**Result processing** 
    - This price should be returned as 18 decimals.  

# Security considerations

Adding this new identifier by itself poses little security risk to the DVM or priceless financial contract users. However, anyone deploying a new priceless token contract referencing this identifier should take care to parameterize the contract appropriately to the reference asset’s volatility and liquidity characteristics to avoid the loss of funds for synthetic token holders.

Although these are "wrapped" tokens, an objective value of the underlying collateral can be accurately determined to adequately inform both participating liquidators and disputers.

The value of collateral can be objective in terms of price per full share * underlying asset value. 

If the vault was hacked in a way that drained funds, there is also insurance from Nexus mutual to consider in terms of valuing the asset in the event of a covered vulnerability

Additionally, the contract deployer should ensure that there is a network of liquidators and disputers ready to perform the services necessary to keep the contract solvent. $UMA-holders should evaluate the ongoing cost and benefit of supporting price requests for this identifier and also contemplate de-registering this identifier if security holes are identified.

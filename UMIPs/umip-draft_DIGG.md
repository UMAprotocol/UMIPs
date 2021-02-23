
## HEADERS
| UMIP [#]     |                                                                                                                                  |
|------------|------------------------------------------------------------------------------------------------------------------------------------------|
| UMIP Title | Add DIGGBTC, DIGGETH, and DIGGUSD as price identifiers                                                                                                  |
| Authors    | Alex (abgtrading30@gmail.com)
| Status     | Draft                                                                                                                                   |
| Created    | February 22, 2021 
| Link to Discourse    | https://discourse.umaproject.org/t/add-digg-btc-digg-eth-digg-usd-as-token-price-identifiers/254                                                                              
<br>

# SUMMARY 

The DVM should support price requests for the below price indexes:
- DIGG/BTC
- DIGG/ETH
- DIGG/USD

# MOTIVATION

The DVM currently does not support the DIGG/BTC, DIGG/ETH or DIGG/USD price identifiers.

Supporting the ability to mint synthetic DIGG tokens priced against BTC, ETH, and USD would allow traders to hedge, speculate, and obtain long/short exposure while retaining WBTC or ETH exposure. Many users of these synthetic assets may be Badger yield farmers who want to hedge or arbitrage the DIGG rate.

An example of someone that may want to use DIGGBTC would be a trader who has underlying DIGG exposure earning a high annual yield. DIGG is trading significantly higher than the BTC price and he/she doesn't want to take any of their DIGG out of the vault or sell. Instead, one could mint DIGGBTC and sell some to the market. If DIGG does eventually converge towards the BTC price, the trader is able to buy back their collateral at a cheaper price. This is just one use case as there are other ways to use the synthetic based on volatility, arbitrage, and the rebases.

The Marketcap of DIGG is currently around $75 million. What makes synthetic DIGG interesting is the game theory behind DIGG, the volatility of both the BTC and DIGG prices, along with yield farmers being able to use these synthetics to hedge their DIGG exposure.

<br> 

# MARKETS & DATA SOURCES

 **Required questions**

1. What markets should the price be queried from? It is recommended to have at least 3 markets.
    -	Sushiswap
    -	Uniswap

2.  Which specific pairs should be queried from each market?
    -	DIGG/BTC
        - Sushiswap and Uniswap
    -	DIGG/ETH
        - Sushiswap and Uniswap for DIGG/WBTC
        - Sushiswap and Uniswap for WBTC/ETH
    -	DIGG/USD
        - Sushiswap and Uniswap for DIGG/WBTC
        - Sushiswap and Uniswap for WBTC/ETH
        - Binance, Coinbase, and Kraken for ETH/USD (follows the specification in UMIP-6)

3. Provide recommended endpoints to query for real-time prices from each market listed. 

    - Sushiswap graph explorer
        - https://thegraph.com/explorer/subgraph/jiro-ono/sushiswap-v1-exchange
        - DIGG/WBTC Pool Address: 0x9a13867048e01c663ce8ce2fe0cdae69ff9f35e3

    - Uniswap graph explorers
        - https://thegraph.com/explorer/subgraph/uniswap/uniswap-v2
        - DIGG/WBTC Pool Address: 0xe86204c4eddd2f70ee00ead6805f917671f56c52

- **DIGG/WBTC Sushiswap query** 

- To query the DIGG/WBTC price, divide `reserve0` by `reserve1`:
``` 
{
    pair(id: "0x9a13867048e01c663ce8ce2fe0cdae69ff9f35e3") {
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

- **DIGG/WBTC Uniswap query** 

- To query the DIGG/WBTC price, divide `reserve0` by `reserve1`:
``` 
{
    pair(id: "0xe86204c4eddd2f70ee00ead6805f917671f56c52") {
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

4. How often is the provided price updated?

    - Every block.

5. Provide recommended endpoints to query for historical prices from each market listed. 

- **DIGG/WBTC Sushiswap query** 

- To query the DIGG/WBTC price, divide `reserve0` by `reserve1`:
``` 
{
    pair(id: "0x9a13867048e01c663ce8ce2fe0cdae69ff9f35e3",  block:{number: 11808657}) {
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

- **DIGG/WBTC Uniswap query** 

- To query the DIGG/WBTC price, divide `reserve0` by `reserve1`:
``` 
{
    pair(id: "0xe86204c4eddd2f70ee00ead6805f917671f56c52",  block:{number: 11808657}) {
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

    - Sushiswap: Yes
    - Uniswap: Yes

7.  How often is the provided price updated?

    - Every Block for Uniswap and Sushiswap

8. Is an API key required to query these sources? 

    - No

9. Is there a cost associated with usage? 

    - No (this could change when The Graph turns into a marketplace). Note, the price feed does not use The Graph. Using the graph is a secondary reference implementation.

10. If there is a free tier available, how many queries does it allow for?

    - No limit currently

11.  What would be the cost of sending 15,000 queries?

     - $0

<br>

# PRICE FEED IMPLEMENTATION

These price identifiers use the [UniswapPriceFeed](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/UniswapPriceFeed.js) and [ExpressionPriceFeed](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/ExpressionPriceFeed.js).

<br>

# TECHNICAL SPECIFICATIONS

## DIGG/USD

**1. Price Identifier Name** - DIGGUSD

**2. Base Currency** - DIGG

**3. Quote currency** - USD

**4. Intended Collateral Currency** - USDC

- Does the value of this collateral currency match the standalone value of the listed quote currency? 

    - Yes

- Is your collateral currency already approved to be used by UMA financial contracts? 

    - Yes (https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-18.md)

**5. Collateral Decimals** - USDC has 6 decimals (https://etherscan.io/token/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48)

**6. Rounding** - Round to 6 decimal places. (seventh decimal place digit >= 5 rounds up and < 5 rounds down)
 
<br>

## DIGG/BTC

**1. Price Identifier Name** - DIGGBTC

**2. Base Currency** - DIGG

**3. Quote currency** - BTC

**4. Intended Collateral Currency** - WBTC

- Does the value of this collateral currency match the standalone value of the listed quote currency? 

    - Yes

- Is your collateral currency already approved to be used by UMA financial contracts? 

    - Yes (https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-45.md)

**5. Collateral Decimals** - WBTC has 8 decimals (https://etherscan.io/token/0x2260fac5e5542a773aa44fbcfedf7c193bc2c599)

**6. Rounding** - Round to 8 decimal places. (ninth decimal place digit >= 5 rounds up and < 5 rounds down)
 
<br>

## DIGG/ETH

**1. Price Identifier Name** - DIGGETH

**2. Base Currency** - DIGG

**3. Quote currency** - ETH

**4. Intended Collateral Currency** - WETH

- Does the value of this collateral currency match the standalone value of the listed quote currency? 

    - Yes

- Is your collateral currency already approved to be used by UMA financial contracts? 

    - Yes (https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-10.md)

**5. Collateral Decimals** - WETH has 18 decimals (https://etherscan.io/token/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2)

**6. Rounding** - Round to 18 decimal places. (nineteenth decimal place digit >= 5 rounds up and < 5 rounds down)
 
<br>

# RATIONALE

**Why this implementation of the identifier as opposed to other implementation designs?**

This implementation is due to DIGG's main sources of liquidity being on Sushiswap and Uniswap.  Currently, only one low volume and low depth centralized exchange has DIGG listed, and most liquidity will remain on DEXs as it is incentivized.

**What analysis can you provide on where to get the most robust prices? (Robust as in legitimate liquidity, legitimate volume, price discrepancies between exchanges, and trading volume between exchanges)**

Sushiswap and Uniswap have the vast majority of DIGG volume and depth.  These should be used over all other sources.

**What is the potential for the price to be manipulated on the chosen exchanges?**

DIGG is not a collateral on any loan services and the majority of the liquidity is locked into farming vaults.  The potential risk for this is low.

**Should the prices have any processing (e.g., TWAP)?**

Processing is defined in the implementation section.

<br>

# IMPLEMENTATION

For all implementations, a block number will need to be used. The block number should be the block that is closest to and before the timestamp that the price request timestamp.

## Determining the WBTC/ETH price

For both of the DIGGETH and DIGGUSD price identifiers, the WBTC/ETH price will need to be used in the pricing calculation.

To determine the WBTC/ETH price, follow this process. The price request timestamp should be passed as the `timestamp` parameter.

1. Query for WBTC/ETH prices on Sushiswap and Uniswap
- Voters can obtain this information in any way that they wish. A subgraph query is provided for both sources as a reference implementation.

Query for the WBTC/ETH price using the below [subgraph query](https://api.thegraph.com/subgraphs/name/sushiswap/exchange) for Sushiswap:
    
```
    {
          pair(
              id: "0xceff51756c56ceffca006cd410b03ffc46dd3a58",  
              block:{number: 11808657}
            ) {
                reserve0
                reserve1
                totalSupply
          }
    }
```
    
Query for the WBTC/ETH price using the below [subgraph query](https://thegraph.com/explorer/subgraph/uniswap/uniswap-v2) for Uniswap:  

```
    {
          pair(
              id: "0xbb2b8038a1640196fbe3e38816f3e67cba72d940",  
              block:{number: 11808657}
              ) {
                reserve0
                reserve1
                totalSupply
            }
    }
```

2. The WBTC/ETH price is determined by dividing `reserve0` by `reserve1`. This price should be queried using a 2-hour TWAP.
3. Take the mean of the results between Sushiswap and Uniswap to get the WBTC/ETH price.

**For DIGG/WBTC**

    1. Query DIGG/WBTC Price from Sushiswap using 2 minute TWAP (0x9a13867048e01c663ce8ce2fe0cdae69ff9f35e3).
    2. Query DIGG/WBTC Price from Uniswap using 2 minute TWAP (0xe86204c4eddd2f70ee00ead6805f917671f56c52).
    3. Take the mean of steps 1 and 2 and round to 8 decimal places to get the final DIGG/WBTC price. 

**For DIGG/ETH**

    1. Query DIGG/WBTC Price from Sushiswap using 2 minute TWAP (0x9a13867048e01c663ce8ce2fe0cdae69ff9f35e3).
    2. Query DIGG/WBTC Price from Uniswap using 2 minute TWAP (0xe86204c4eddd2f70ee00ead6805f917671f56c52).
    3. Query WBTC/ETH Price from Sushiswap using 2 minute TWAP (0xceff51756c56ceffca006cd410b03ffc46dd3a58).
    4. Query WBTC/ETH Price from Uniswap using 2 minute TWAP (0xbb2b8038a1640196fbe3e38816f3e67cba72d940).
    5. Take the mean of steps 1 and 2 to get the DIGG/WBTC price. 
    6. Take the mean of steps 3 and 4 to get the WBTC/ETH price.
    7. Multiply steps 5 and 6 and round to 18 decimal places to get the final DIGG/ETH price. 


**For DIGG/USD**

    1. Query DIGG/WBTC Price from Sushiswap using 2 minute TWAP (0x9a13867048e01c663ce8ce2fe0cdae69ff9f35e3).
    2. Query DIGG/WBTC Price from Uniswap using 2 minute TWAP (0xe86204c4eddd2f70ee00ead6805f917671f56c52).
    3. Query WBTC/ETH Price from Sushiswap using 2 minute TWAP (0xceff51756c56ceffca006cd410b03ffc46dd3a58).
    4. Query WBTC/ETH Price from Uniswap using 2 minute TWAP (0xbb2b8038a1640196fbe3e38816f3e67cba72d940).
    5. Query the ETH/USD Price as per UMIP-6.
    6. Take the mean of steps 1 and 2 to get the DIGG/WBTC price. 
    7. Take the mean of steps 3 and 4 to get the WBTC/ETH price.
    8. Multiply steps 6 and 7 to get the DIGG/ETH price. 
    9. Multiply the DIGG/ETH price acquired from step 8 by the ETH/USD price acquired in step 4 and round to 6 decimals get the final DIGG/USD price.


1. **What prices should be queried for and from which markets?**

    -	DIGG/WBTC
        - Sushiswap and Uniswap
    -	DIGG/ETH
        - Sushiswap and Uniswap for DIGG/WBTC
        - Sushiswap and Uniswap for WBTC/ETH
    -	DIGG/USD
        - Sushiswap and Uniswap for DIGG/WBTC
        - Sushiswap and Uniswap for WBTC/ETH
        - Binance, Coinbase, and Kraken for ETH/USD (follows the specification in UMIP-6)

2. **Pricing interval**

    - Every block.

3. **Input processing**

    - None. Human intervention in extreme circumstances where the result differs from broad market consensus.

4. **Result processing** 

     - Mean for DIGG/WBTC and WBTC/ETH
     - DIGG/WBTC: 8 decimals
     - DIGG/ETH: 18 decimals
     - DIGG/USD: 6 decimals

<br>

# Security considerations

Adding this new identifier by itself poses little security risk to the DVM or priceless financial contract users. However, anyone deploying a new priceless token contract referencing this identifier should take care to parameterize the contract appropriately to the reference asset’s volatility and liquidity characteristics to avoid the loss of funds for synthetic token holders. Additionally, the contract deployer should ensure that there is a network of liquidators and disputers ready to perform the services necessary to keep the contract solvent.

$UMA-holders should evaluate the ongoing cost and benefit of supporting price requests for this identifier and also contemplate de-registering this identifier if security holes are identified. As noted above, $UMA-holders should also consider re-defining this identifier as liquidity in the underlying asset changes, or if added robustness (eg via TWAPs) are necessary to prevent market manipulation.
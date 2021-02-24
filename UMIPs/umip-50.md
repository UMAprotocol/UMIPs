
## HEADERS
| UMIP-50     |                                                                                                                                  |
|------------|------------------------------------------------------------------------------------------------------------------------------------------|
| UMIP Title | Add YAMETH, ETHYAM, YAMUSD, and USDYAM as price identifiers                                                                                                  |
| Authors    | Ross (ross@yam.finance)
| Status     | Approved                                                                                                                                  |
| Created    | January 28th, 2021  
| Forum Post | https://discourse.umaproject.org/t/add-yam-usd-and-yam-eth-price-identifiers/171

# SUMMARY 

The DVM should support price requests for the following indexes

   - YAM/ETH 
   - ETH/YAM 
   - YAM/USD
   - USD/YAM 


# MOTIVATION

The DVM currently does not support the YAMETH, ETHYAM, YAMUSD or USDYAM price indices.

Supporting the YAMUSD price identifier would enable the creation of a YAM backed stablecoin, built using one of the perpetual stablecoin frameworks being developed on UMA. YAM token holders can utilize this as a hedging tool, and could go long or use it for other financial purposes. There is also potential for the YAM DAO itself to use YAM reserves or newly minted tokens as a community backed line of credit to mint YAM backed stablecoins to support its mission or to add liquidity to UMA synths supported on Degenerative.finance. 

A user would lock YAM in order to mint a new overcollateralized dollar-pegged token. This price feed would be used to determine the liquidation price of the collateral. If the Perpetual token has a funding rate, the price feed would also be used to determine it and would dictate whether there is a premium on repayment to return the YAM collateral.

Supporting the YAM/ETH and ETH/YAM price identifiers would enable the creation of similar products that use YAM as collateral with ETH denominated as a reference price. 

The creation of a ETH denominated price index for YAM would more easily allow for the use of YAM collateral in ETH denominated synthetics like uGAS.

The Marketcap of YAM is currently around $38 million. While this is not a lot compared to the amount of ETH available to use to mint new synthetics, it is an untapped market that we can build around to provide additional utility to our community. 

More information on YAM can be found on the website: https://yam.finance/

# MARKETS & DATA SOURCES

 **Required questions**

1. What markets should the price be queried from? It is recommended to have at least 3 markets.

- Sushiswap 
- Uniswap 
- Huobi   

2.  Which specific pairs should be queried from each market?

- YAM/ETH on sushiswap
- YAM/ETH on Uniswap
- YAM/USDT on Huobi
- ETH/USD per UMIP 6

3. Provide recommended endpoints to query for real-time prices from each market listed. 

    - Sushiswap YAM/ETH Pool Address: 0x0f82e57804d0b1f6fab2370a43dcfad3c7cb239c
    - Uniswap YAM/ETH Pool Address: 0xe2aab7232a9545f29112f9e6441661fd6eeb0a5d
    - Huobi YAM/USDT: https://api.cryptowat.ch/markets/Huobi/yamusdt/price
   
5. Provide recommended endpoints to query for historical prices from each market listed. 

    * Sushiswap and Uniswap price data is onchain. One example of how a voter can query this price, would be with the subgraph query shown below:

        ```
        {
            token(
                id:"0x0aacfbec6a24756c20d41914f2caba817c0d8521", 
                block: {number: 11849560}
            )
            {
                derivedETH
            }
        }
        ``` 
        
     - Huobi YAM/USDT: https://api.cryptowat.ch/markets/huobi/yamusdt/ohlc?after=1612993806&before=1614100000&periods=60
       
6.  Do these sources allow for querying up to 74 hours of historical data? 

    - Yes

7.  How often is the provided price updated?

    - Every Block for uniswap and sushiswap. Every 60 seconds for Huobi

8. Is an API key required to query these sources? 

    - No

9. Is there a cost associated with usage? 

    - No (this could change when The Graph turns into a marketplace). Note, the price feed does not use The Graph. Using the graph is a secondary reference implementation. 

10. If there is a free tier available, how many queries does it allow for?

    - No limit currently

11.  What would be the cost of sending 15,000 queries?

     - $0

# PRICE FEED IMPLEMENTATION

These price identifiers use the [UniswapPriceFeed](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/UniswapPriceFeed.js), [CryptoWatchPriceFeed](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/CryptoWatchPriceFeed.js) and [ExpressionPriceFeed](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/ExpressionPriceFeed.js).

# TECHNICAL SPECIFICATIONS

## USD/YAM

**1. Price Identifier Name** - USDYAM

**2. Base Currency** - USD

**3. Quote currency** - YAM

**4. Intended Collateral Currency** - YAM

- Does the value of this collateral currency match the standalone value of the listed quote currency? 

    - YES

- Is your collateral currency already approved to be used by UMA financial contracts? 

    - Yes (https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-44.md)

**5. Collateral Decimals** - YAM has 18 decimals (https://etherscan.io/token/0x0aacfbec6a24756c20d41914f2caba817c0d8521)

**6. Rounding** - Round to 18 decimal places. 

<br>

## YAM/USD 

**1. Price Identifier Name** - YAMUSD

**2. Base Currency** - YAM

**3. Quote currency** - USD

**4. Intended Collateral Currency** - USDT

- Does the value of this collateral currency match the standalone value of the listed quote currency? 

    - Yes

- Is your collateral currency already approved to be used by UMA financial contracts? 

    - Yes. Per UMIP 18

**5. Collateral Decimals** - USDT, which is used in this calculation, has 6 decimals (https://etherscan.io/token/0xdac17f958d2ee523a2206206994597c13d831ec7)

**6. Rounding** - Round to 6 decimal places. 

<br>

## ETH/YAM

**1. Price Identifier Name** - ETHYAM

**2. Base Currency** - ETH

**3. Quote currency** - YAM

**4. Intended Collateral Currency** - YAM

- Does the value of this collateral currency match the standalone value of the listed quote currency? 

    - YES

- Is your collateral currency already approved to be used by UMA financial contracts?

    - Pending UMIP (https://github.com/UMAprotocol/UMIPs/pull/154)

**5. Collateral Decimals** - YAM has 18 decimals (https://etherscan.io/token/0x0aacfbec6a24756c20d41914f2caba817c0d8521)

**6. Rounding** - Round to 18 decimal places.

**7. Notes** - Sushiswap pool to be queried using 1 minute TWAP (time weighted average price).

<br>

## YAM/ETH

**1. Price Identifier Name** - YAM/ETH

**2. Base Currency** - YAM

**3. Quote currency** - ETH

**4. Intended Collateral Currency** - ETH

- Does the value of this collateral currency match the standalone value of the listed quote currency? 

    - YES

- Is your collateral currency already approved to be used by UMA financial contracts?

    - Yes

**5. Collateral Decimals** - ETH has 18 decimals 

**6. Rounding** - Round to 18 decimal places. 

**7. Notes** - Sushiswap pool to be queried using 1 minute TWAP (time weighted average price).

<br>


# RATIONALE

Prices are primarily used by Priceless contracts to calculate a synthetic token’s redemptive value in case of liquidation or expiration. Contract counterparties also use the price index to ensure that sponsors are adequately collateralized. More complex computations (like incorporating additional exchanges, calculating a TWAP or VWAP, or imposing price bands, etc.) have the potential to add a greater level of precision and robustness to the definition of this identifier, particularly at settlement of each expiring synthetic token.

The addition of YAMETH, ETHYAM, YAMUSD, and USDYAM fits into a larger goal of advancing the adoption of the UMA protocol by allowing YAM to be used as collateral for minting derivatives on the Degenerative platform, as well as other UMA based synthetics. This furthers adoption of the protocol by encouraging a convergence of capital from different projects and increasing TVL.

Using the Sushiswap Price should give the most accurate price for YAM/ETH on the market as it has the deepest liquidity. Uniswap liquidity is increasing but much lower. All AMM pools should be queried using a 1 minute TWAP to prevent flash-loan attacks and liquidations.

The YAM/USDT pool on Huobi has more volume than YAM/ETH.


# IMPLEMENTATION

**For YAM/ETH and ETH/YAM**

    1. Query YAM/ETH Price from Sushiswap using 1 minute TWAP (0x0f82e57804d0b1f6fab2370a43dcfad3c7cb239c).
    2. Query YAM/ETH Price from Uniswap using 1 minute TWAP (0xe2aab7232a9545f29112f9e6441661fd6eeb0a5d).
    3. Query YAM/USDT price from Huobi.
    4. Query the USD/ETH Price as per UMIP-6.
    5. Multiply the YAM/USDT price found in step 3 by the USD/ETH price to get the Huobi YAM/ETH price.
    6. Take the median of prices acquired from steps 1, 2, and 5 and round to 18 decimals get the final YAM/ETH price.
    7. (for ETH/YAM) Take the Inverse of the result of step 7 (1/ YAM/ETH) and round to 18 decimals to get the ETH/YAM price.

**For YAM/USD and USD/YAM** 

    1. Query YAM/ETH Price from Sushiswap using 1 minute TWAP (0x0f82e57804d0b1f6fab2370a43dcfad3c7cb239c).
    2. Query YAM/ETH Price from Uniswap using 1 minute TWAP (0xe2aab7232a9545f29112f9e6441661fd6eeb0a5d).
    3. Query the ETH/USD Price as per UMIP-6.
    4. Multiply the YAM/ETH prices in steps 1 and 2 by the ETH/USD price to get the respective YAM/USD prices.
    5. Query the YAM/USDT Price on Huobi. 
    6. Take the median of prices acquired from steps 4 & 5 and round to 6 decimals to get the YAM/USD price.
    7. (for USD/YAM) Take the Inverse of the result of step 6 (1/ YAM/USD) and round to 18 decimals to get the USD/YAM price.

# Security considerations

Sushiswap is the most liquid DEX and it is an on-chain pooled AMM style exchange, if liquidity is withdrawn too fast, there may be a risk in the price peg, and therefore the integrity of the system. In the current setting, there would need to be a significant event that erodes confidence in YAM and the token, causing Sushiswap liquidity to be withdrawn quickly and en-masse. This threat is mitigated via YAM incentives paid to liquidity providers who stake their tokens. The price on uniswap should follow sushiswap due to on chain arbitrage unless there is a serious problem with Ethereum. Furthermore, in also querying Huobi this risk is minimized.

Adding this new identifier by itself poses little security risk to the DVM or priceless financial contract users. However, anyone deploying a new priceless token contract referencing this identifier should take care to parameterize the contract appropriately to the reference asset’s volatility and liquidity characteristics to avoid the loss of funds for synthetic token holders. Additionally, the contract deployer should ensure that there is a network of liquidators and disputers ready to perform the services necessary to keep the contract solvent.

$UMA-holders should evaluate the ongoing cost and benefit of supporting price requests for this identifier and also contemplate de-registering this identifier if security holes are identified. As noted above, $UMA-holders should also consider re-defining this identifier as liquidity in the underlying asset changes, or if added robustness (eg via TWAPs) are necessary to prevent market manipulation.





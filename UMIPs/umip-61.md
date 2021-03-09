## Headers
| UMIP-61   |   |
|------------|---|
| UMIP Title | Add INDEXETH, INDEXUSD, DPIETH and DPIUSD as price identifier |
| Authors    | Gottlieb Freudenreich (gottlieb.freudenreich@gmail.com)
| Status     | Proposed |
| Created    | 2020-03-08 |
| Discourse Link | 

# SUMMARY 

The DVM should support price requests for the following indexes

   - INDEX/ETH 
   - ETH/INDEX 
   - INDEX/USD
   - USD/INDEX
   - DPI/ETH
   - ETH/DPI
   - DPI/USD
   - USD/DPI


# MOTIVATION

The DVM currently does not support the INDEXETH, ETHINDEX, INDEXUSD, USDINDEX, DPIETH, ETHDPI, DPIUSD and USDDPI price indices.

Supporting the DPIUSD and INDEXUSD price identifier would enable the creation of a DPI/INDEX backed stablecoin, built using one of the perpetual stablecoin frameworks being developed on UMA. DPI/INDEX token holders can utilize this as a hedging tool, and could go long or use it for other financial purposes. There is also potential for the Index Cooperation to use INDEX reserves to build KPI Options within the UMA protocol.

A user would lock DPI/INDEX in order to mint a new overcollateralized dollar-pegged token. This price feed would be used to determine the liquidation price of the collateral. If the Perpetual token has a funding rate, the price feed would also be used to determine it and would dictate whether there is a premium on repayment to return the INDEX/DPI collateral.

Supporting the INDEX/ETH or DPI/ETH and ETH/INDEX or ETH/DPI price identifiers would enable the creation of similar products that use INDEX/DPI as collateral with ETH denominated as a reference price. 

The creation of a ETH denominated price index for INDEX/DPI would more easily allow for the use of INDEX/DPI collateral in ETH denominated synthetics like uGAS.

The Marketcap of INDEX is currently around $23 million. The Marketcap of DPI is currently around $140 million. While this is not a lot compared to the amount of ETH available to use to mint new synthetics, it is an untapped market that we can build around to provide additional utility to our community. 

More information on INDEX/DPI can be found on the website: https://www.indexcoop.com/

# MARKETS & DATA SOURCES

 **Required questions**

1. What markets should the price be queried from? It is recommended to have at least 3 markets.

- Uniswap 
- Sushiswap 
- Balancer   

2.  Which specific pairs should be queried from each market?

- INDEX/ETH on Uniswap
- INDEX/ETH on Balancer
- ETH/INDEX on Sushiswap
- DPI/ETH on Uniswap
- DPI/ETH on Balancer
- ETH/DPI on Sushiswap
- ETH/USD per UMIP 6

3. Provide recommended endpoints to query for real-time prices from each market listed. 

    - Uniswap DPI/ETH Pool Address: 0x4d5ef58aac27d99935e5b6b4a6778ff292059991
    - Uniswap INDEX/ETH Pool Address: 0x3452a7f30a712e415a0674c0341d44ee9d9786f9
    - Sushiswap DPI/ETH Pool Address: 0x34b13f8cd184f55d0bd4dd1fe6c07d46f245c7ed
    - Sushiswap INDEX/ETH Pool Address: 0xa73df646512c82550c2b3c0324c4eedee53b400c
    - Balancer INDEX/ETH Pool Address: 0xcf19a7c81fcf0e01c927f28a2b551405e58c77e5
    - Balancer DPI/WETH/WBTC/cUSDC Pool Address: 0x2aa3041fe813cfe572969216c6843c33f14f9194

   
5. Provide recommended endpoints to query for historical prices from each market listed. 

    * Uniswap, Sushiswap and Balancer price data is onchain. One example of how a voter can query this price, would be with the subgraph query shown below:

        ```
        {
            token(
                id:"0x1494ca1f11d487c2bbe4543e90080aeba4ba3c2b", 
                block: {number: 12004168}
            )
            {
                derivedETH
            }
        }
        ``` 
        
       
6.  Do these sources allow for querying up to 74 hours of historical data? 

    - Yes

7.  How often is the provided price updated?

    - Every Block for uniswap, balancer and sushiswap.

8. Is an API key required to query these sources? 

    - No

9. Is there a cost associated with usage? 

    - No (this could change when The Graph turns into a marketplace). Note, the price feed does not use The Graph. Using the graph is a secondary reference implementation. 

10. If there is a free tier available, how many queries does it allow for?

    - No limit currently

11.  What would be the cost of sending 15,000 queries?

     - $0

# PRICE FEED IMPLEMENTATION

These price identifiers use the [UniswapPriceFeed](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/UniswapPriceFeed.js), [BalancerPriceFeed](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/BalancerPriceFeed.js) and [ExpressionPriceFeed](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/ExpressionPriceFeed.js).

# TECHNICAL SPECIFICATIONS

## USD/INDEX

**1. Price Identifier Name** - USDINDEX

**2. Base Currency** - USD

**3. Quote currency** - INDEX

**4. Intended Collateral Currency** - INDEX

- Does the value of this collateral currency match the standalone value of the listed quote currency? 

    - Yes

- Is your collateral currency already approved to be used by UMA financial contracts? 

    - Pending UMIP 

**5. Scaling Decimals** - 18 (1e18)

**6. Rounding** - Round to 18 decimal places. 

<br>

## INDEX/USD 

**1. Price Identifier Name** - INDEXUSD

**2. Base Currency** - INDEX

**3. Quote currency** - USD

**4. Intended Collateral Currency** - USDT

- Does the value of this collateral currency match the standalone value of the listed quote currency? 

    - Yes

- Is your collateral currency already approved to be used by UMA financial contracts? 

    - Yes. Per UMIP 18

**5. Scaling Decimals** - 18 (1e18)

**6. Rounding** - Round to 6 decimal places. 

<br>

## ETH/INDEX

**1. Price Identifier Name** - ETHINDEX

**2. Base Currency** - ETH

**3. Quote currency** - INDEX

**4. Intended Collateral Currency** - INDEX

- Does the value of this collateral currency match the standalone value of the listed quote currency? 

    - YES

- Is your collateral currency already approved to be used by UMA financial contracts?

    - Pending UMIP

**5. Scaling Decimals** - 18 (1e18)

**6. Rounding** - Round to 18 decimal places.

**7. Notes** - Uniswap pool to be queried using 1 minute TWAP (time weighted average price).

<br>

## INDEX/ETH

**1. Price Identifier Name** - INDEX/ETH

**2. Base Currency** - INDEX

**3. Quote currency** - ETH

**4. Intended Collateral Currency** - ETH

- Does the value of this collateral currency match the standalone value of the listed quote currency? 

    - Yes

- Is your collateral currency already approved to be used by UMA financial contracts?

    - Yes

**5. Scaling Decimals** - 18 (1e18)

**6. Rounding** - Round to 18 decimal places. 

**7. Notes** - Uniswap pool to be queried using 1 minute TWAP (time weighted average price).

<br>

## USD/DPI

**1. Price Identifier Name** - USDDPI

**2. Base Currency** - USD

**3. Quote currency** - DPI

**4. Intended Collateral Currency** - DPI

- Does the value of this collateral currency match the standalone value of the listed quote currency? 

    - Yes

- Is your collateral currency already approved to be used by UMA financial contracts? 

    - Pending UMIP 

**5. Scaling Decimals** - 18 (1e18)

**6. Rounding** - Round to 18 decimal places. 

<br>

## DPI/USD 

**1. Price Identifier Name** - DPIUSD

**2. Base Currency** - DPI

**3. Quote currency** - USD

**4. Intended Collateral Currency** - USDT

- Does the value of this collateral currency match the standalone value of the listed quote currency? 

    - Yes

- Is your collateral currency already approved to be used by UMA financial contracts? 

    - Yes. Per UMIP 18

**5. Scaling Decimals** - 18 (1e18)

**6. Rounding** - Round to 6 decimal places. 

<br>

## ETH/DPI

**1. Price Identifier Name** - ETHDPI

**2. Base Currency** - ETH

**3. Quote currency** - DPI

**4. Intended Collateral Currency** - DPI

- Does the value of this collateral currency match the standalone value of the listed quote currency? 

    - Yes

- Is your collateral currency already approved to be used by UMA financial contracts?

    - Pending UMIP 

**5. Scaling Decimals** - 18 (1e18)

**6. Rounding** - Round to 18 decimal places.

**7. Notes** - Uniswap pool to be queried using 1 minute TWAP (time weighted average price).

<br>

## DPI/ETH

**1. Price Identifier Name** - DPI/ETH

**2. Base Currency** - DPI

**3. Quote currency** - ETH

**4. Intended Collateral Currency** - ETH

- Does the value of this collateral currency match the standalone value of the listed quote currency? 

    - Yes

- Is your collateral currency already approved to be used by UMA financial contracts?

    - Yes

**5. Scaling Decimals** - 18 (1e18)

**6. Rounding** - Round to 18 decimal places. 

**7. Notes** - Uniswap pool to be queried using 1 minute TWAP (time weighted average price).

<br>


# RATIONALE

Prices are primarily used by Priceless contracts to calculate a synthetic token’s redemptive value in case of liquidation or expiration. Contract counterparties also use the price index to ensure that sponsors are adequately collateralized. More complex computations (like incorporating additional exchanges, calculating a TWAP or VWAP, or imposing price bands, etc.) have the potential to add a greater level of precision and robustness to the definition of this identifier, particularly at settlement of each expiring synthetic token.

The addition of INDEXETH, ETHINDEX, DPIUSD, and USDDPI fits into a larger goal of advancing the adoption of the UMA protocol by allowing INDEX and DPI to be used as collateral for minting derivatives within the UMA ecosystem, as well as other UMA based synthetics. This furthers adoption of the protocol by encouraging a convergence of capital from different projects and increasing TVL.

Using the Uniswap Price should give the most accurate price for DPI/ETH and INDEX/ETH on the market as it has the deepest liquidity. Sushiswap liquidity is increasing but much lower. All AMM pools should be queried using a 1 minute TWAP to prevent flash-loan attacks and liquidations.

The USD/ETH and ETH/USD Price can be calculated as per UMIP-6.


# IMPLEMENTATION

**For INDEX/ETH and ETH/INDEX**

    1. Query INDEX/ETH Price from Uniswap using 1 minute TWAP (0x3452a7f30a712e415a0674c0341d44ee9d9786f9).
    2. Query INDEX/ETH Price from Sushiswap using 1 minute TWAP (0xa73df646512c82550c2b3c0324c4eedee53b400c).
    3. Query INDEX/ETH Price from Balancer using 1 minute TWAP (0xcf19a7c81fcf0e01c927f28a2b551405e58c77e5).
    4. Take the median of prices acquired from steps 1, 2, and 3 and round to 18 decimals get the final INDEX/ETH price.
    5. (for ETH/INDEX) Take the Inverse of the result of step 7 (1/ INDEX/ETH) and round to 18 decimals to get the ETH/INDEX price.

**For INDEX/USD and USD/INDEX** 

    1. Query INDEX/ETH Price from Uniswap using 1 minute TWAP (0x3452a7f30a712e415a0674c0341d44ee9d9786f9).
    2. Query INDEX/ETH Price from Sushiswap using 1 minute TWAP (0xe2aab7232a9545f29112f9e6441661fd6eeb0a5d).
    3. Query INDEX/ETH Price from Balancer using 1 minute TWAP (0xcf19a7c81fcf0e01c927f28a2b551405e58c77e5).
    3. Query the ETH/USD Price as per UMIP-6.
    4. Multiply the INDEX/ETH prices in steps 1, 2 and 3 by the ETH/USD price to get the respective INDEX/USD prices.
    6. Take the median of prices acquired from step 4 and round to 6 decimals to get the INDEX/USD price.
    7. (for USD/INDEX) Take the Inverse of the result of step 6 (1/ INDEX/USD) and round to 18 decimals to get the USD/INDEX price.

**For DPI/ETH and ETH/DPI**

    1. Query DPI/ETH Price from Uniswap using 1 minute TWAP (0x4d5ef58aac27d99935e5b6b4a6778ff292059991).
    2. Query DPI/ETH Price from Sushiswap using 1 minute TWAP (0xe2aab7232a9545f29112f9e6441661fd6eeb0a5d).
    3. Query DPI/ETH Price from Balancer using 1 minute TWAP (0x2aa3041fe813cfe572969216c6843c33f14f9194).
    4. Take the median of prices acquired from steps 1, 2, and 3 and round to 18 decimals get the final DPI/ETH price.
    5. (for ETH/DPI) Take the Inverse of the result of step 4 (1/ DPI/ETH) and round to 18 decimals to get the ETH/DPI price.

**For DPI/USD and USD/DPI** 

    1. Query DPI/ETH Price from Uniswap using 1 minute TWAP (0x4d5ef58aac27d99935e5b6b4a6778ff292059991).
    2. Query DPI/ETH Price from Sushiswap using 1 minute TWAP (0xe2aab7232a9545f29112f9e6441661fd6eeb0a5d).
    3. Query DPI/ETH Price from Balancer using 1 minute TWAP (0x2aa3041fe813cfe572969216c6843c33f14f9194).
    3. Query the ETH/USD Price as per UMIP-6.
    4. Multiply the DPI/ETH prices in steps 1, 2 and 3 by the ETH/USD price to get the respective DPI/USD prices.
    6. Take the median of prices acquired from step 4 and round to 6 decimals to get the DPI/USD price.
    7. (for USD/DPI) Take the Inverse of the result of step 6 (1/ DPI/USD) and round to 18 decimals to get the USD/DPI price.

# Security considerations

Uniswap is the most liquid DEX and it is an on-chain pooled AMM style exchange, if liquidity is withdrawn too fast, there may be a risk in the price peg, and therefore the integrity of the system. In the current setting, there would need to be a significant event that erodes confidence in the Index Cooperative or the DPI token, causing Uniswap liquidity to be withdrawn quickly and en-masse. This threat is mitigated via INDEX incentives paid to liquidity providers who stake their tokens. The price on sushiswap should follow uniswap due to on chain arbitrage unless there is a serious problem with Ethereum. Furthermore, in also querying Binance this risk is minimized.

Adding this new identifier by itself poses little security risk to the DVM or priceless financial contract users. However, anyone deploying a new priceless token contract referencing this identifier should take care to parameterize the contract appropriately to the reference asset’s volatility and liquidity characteristics to avoid the loss of funds for synthetic token holders. Additionally, the contract deployer should ensure that there is a network of liquidators and disputers ready to perform the services necessary to keep the contract solvent.

$UMA-holders should evaluate the ongoing cost and benefit of supporting price requests for this identifier and also contemplate de-registering this identifier if security holes are identified. As noted above, $UMA-holders should also consider re-defining this identifier as liquidity in the underlying asset changes, or if added robustness (eg via TWAPs) are necessary to prevent market manipulation.





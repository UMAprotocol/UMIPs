
## HEADERS
| UMIP [xx]     |                                                                                                                                  |
|------------|------------------------------------------------------------------------------------------------------------------------------------------|
| UMIP Title | Add YAMETH, ETHYAM, YAMUSD, and USDYAM as price identifiers]                                                                                                  |
| Authors    | Ross (ross@yam.finance)
| Status     | Draft                                                                                                                                  |
| Created    | January 28th, 2021  
| Forum Post | https://discourse.umaproject.org/t/add-yam-usd-and-yam-eth-price-identifiers/171

# SUMMARY 

The DVM should support price requests for the following indexes

YAM/ETH 
ETH/YAM 
YAM/USD
USD/YAM 


# MOTIVATION

The DVM currently does not support the YAMETH, ETHYAM, YAMUSD or USDYAM price indices.

Supporting the YAMUSD price identifier would enable the creation of a YAM backed stablecoin, built using one of the perpetual stablecoin frameworks being developed on UMA. YAM token holders can utilize this as a hedging tool, and could go long or use it for other financial purposes. There is also potential for the YAM DAO itself to use YAM reserves or newly minted tokens as a community backed line of credit to mint YAM backed stablecoins to support its mission or to add liquidity to UMA synths supported on Degenerative.finance. 

A user would lock YAM in order to mint a new overcollateralized dollar-pegged token.  This price feed would be used to determine the liquidation price of the collateral. If the Perpetual token has a funding rate, the price feed would also be used to determine it and would dictate whether there is a premium on repayment to return the YAM collateral.

Supporting the YAM/ETH and ETH/YAM price identifiers would enable the creation of similar products that use YAM as collateral with ETH denominated as a reference price. 

The creation of a ETH denominated price index for YAM would more easily allow for the use of YAM collateral in ETH denominated synthetics like uGAS.

The Marketcap of YAM is currently around $38 million. While this is not a lot compared to the amount of ETH available to use to mint new synthetics, it is an untapped market that we can build around to provide additional utility to our community. 

More information on YAM can be found on the website: https://yam.finance/

# MARKETS & DATA SOURCES

 **Required questions**

1. What markets should the price be queried from? It is recommended to have at least 3 markets.

Sushiswap 
Huobi  
Gate.io  

2.  Which specific pairs should be queried from each market?

YAM/ETH on sushiswap 
YAM/USDT on Huobi
YAM/USDT on Gate
ETH/USD per UMIP 6

3. Provide recommended endpoints to query for real-time prices from each market listed. 

    - Sushiswap graph explorer
    https://thegraph.com/explorer/subgraph/jiro-ono/sushiswap-v1-exchange

 - Uniswap graph explorer
    https://thegraph.com/explorer/subgraph/uniswap/uniswap-v2


5. Provide recommended endpoints to query for historical prices from each market listed. 

YAM
```
{
token(id:"0x0aacfbec6a24756c20d41914f2caba817c0d8521", block: {number: 11849560})
    {derivedETH}
} 
```
Returns ETH/YAM price

USDC

```
{
token(id:"0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", block: {number: 11849560})
    {derivedETH}
} 
```
Returns ETH/USD price

Divide ETH/YAM by ETH/USD to get USD/YAM


6.  Do these sources allow for querying up to 74 hours of historical data? 

    - Yes, detailed in implementation section

7.  How often is the provided price updated?

    - Every Block

8. Is an API key required to query these sources? 

    - No

9. Is there a cost associated with usage? 

    - No (this could change when The Graph turns into a marketplace). Note, the price feed does not use The Graph. Using the graph is a secondary reference implementation. 

10. If there is a free tier available, how many queries does it allow for?

    - No limit currently

11.  What would be the cost of sending 15,000 queries?

     - $0

# PRICE FEED IMPLEMENTATION

In progress

# TECHNICAL SPECIFICATIONS

## USD/YAM

**1. Price Identifier Name** - USDYAM

**2. Base Currency** - USD

**3. Quote currency** - YAM

**4. Intended Collateral Currency** - YAM

- Does the value of this collateral currency match the standalone value of the listed quote currency? 

    - YES

- Is your collateral currency already approved to be used by UMA financial contracts? If no, submit a UMIP to have the desired collateral currency approved for use. 

    - Pending UMIP (https://github.com/UMAprotocol/UMIPs/pull/154)

**5. Collateral Decimals** - YAM has 18 decimals (https://etherscan.io/token/0x0aacfbec6a24756c20d41914f2caba817c0d8521)

**6. Rounding** - Round to 18 decimal places. 

<br>

## YAM/USD 

**1. Price Identifier Name** - YAMUSD

**2. Base Currency** - YAM

**3. Quote currency** - USDT

**4. Intended Collateral Currency** - USDT

- Does the value of this collateral currency match the standalone value of the listed quote currency? 

    - Yes

- Is your collateral currency already approved to be used by UMA financial contracts? If no, submit a UMIP to have the desired collateral currency approved for use. 

    - Yes. Per UMIP 18

**5. Collateral Decimals** - USDT has 6 decimals (https://etherscan.io/token/0xdac17f958d2ee523a2206206994597c13d831ec7)

**6. Rounding** - Round to 6 decimal places. 

<br>

## ETH/YAM

**1. Price Identifier Name** - ETHYAM

**2. Base Currency** - ETH

**3. Quote currency** - YAM

**4. Intended Collateral Currency** - YAM

- Does the value of this collateral currency match the standalone value of the listed quote currency? 

    - YES

- Is your collateral currency already approved to be used by UMA financial contracts? If no, submit a UMIP to have the desired collateral currency approved for use. 

    - Pending UMIP (https://github.com/UMAprotocol/UMIPs/pull/154)

**5. Collateral Decimals** - YAM has 18 decimals (https://etherscan.io/token/0x0aacfbec6a24756c20d41914f2caba817c0d8521)

**6. Rounding** - Round to 18 decimal places. 

<br>

## YAM/ETH

**1. Price Identifier Name** - YAM/ETH

**2. Base Currency** - YAM

**3. Quote currency** - ETH

**4. Intended Collateral Currency** - ETH

- Does the value of this collateral currency match the standalone value of the listed quote currency? 

    - YES

- Is your collateral currency already approved to be used by UMA financial contracts? If no, submit a UMIP to have the desired collateral currency approved for use. 

    - Yes

**5. Collateral Decimals** - ETH has 18 decimals 

**6. Rounding** - Round to 18 decimal places. 

<br>


# RATIONALE

- Prices are primarily used by Priceless contracts to calculate a synthetic token’s redemptive value in case of liquidation or expiration. Contract counterparties also use the price index to ensure that sponsors are adequately collateralized. More complex computations (like incorporating additional exchanges, calculating a TWAP or VWAP, or imposing price bands, etc.) have the potential to add a greater level of precision and robustness to the definition of this identifier, particularly at settlement of each expiring synthetic token.

The addition of YAMETH, ETHYAM, YAMUSD, and USDYAM fits into a larger goal of advancing the adoption of the UMA protocol by allowing YAM to be used as collateral for minting derivatives on the Degenerative platform, as well as other UMA based synthetics. This furthers adoption of the protocol by encouraging a convergence of capital from different projects and increasing TVL.

Using the Sushiswap Price should give the most accurate price for YAM/ETH on the market as it has the deepest liquidity. All AMM pools should be queried using a 2-hour TWAP to prevent flash-loan attacks and liquidations.

The YAM/USDT pools on Huobi and Gate.io have the most volume. Much more than YAM/ETH.


# IMPLEMENTATION

**For YAM/ETH and ETH/YAM **

1. **What prices should be queried for and from which markets?**

    - YAM/ETH Price from Sushiswap (https://app.sushiswap.fi/pair/0x0f82e57804d0b1f6fab2370a43dcfad3c7cb239c)

    - ETH/YAM Price from Sushiswap (https://app.sushiswap.fi/pair/0x0f82e57804d0b1f6fab2370a43dcfad3c7cb239c)
    
    //should we add YAM/ETH from Huobi and gate.io even though they have pretty shitty volume? or calculate the YAM/ETH from YAM/USDT on those exchanges?

2. **Pricing interval**

    - Per Ethereum Block (roughly 12 seconds)

3. **Input processing**

    - None. Human intervention in extreme circumstances where the result differs from broad market consensus.

4. **Result processing** 

      - When more approved exchanges and price feeds are added, results should be calculated using the median price.
 
<br>

**For YAM/USD:** 

1. **What prices should be queried for and from which markets?**

 YAM/ETH Price from Sushiswap (https://sushiswap.fi/pair/0x0f82e57804d0b1f6fab2370a43dcfad3c7cb239c)
Query the ETH/USD Price as per UMIP-6
Multiply the YAM/ETH price by the ETH/USD price to get the YAM/USD price
Query the YAM/USDT price on Gate.io
Query the YAM/USDT Price on Huobi 
Take the median of prices acquired from steps 3-5 to get the final YAM/USD price
Take the Inverse of the result of step 6 (1/ YAM/USD) to get the USD/YAM price.

2. **Pricing interval**

On chain intervals to be per Ethereum block (roughly 12 seconds). Intervals for centralized exchanges should be the price closest in time before the queried Ethereum block.

3. **Input processing**

    - None. Human intervention in extreme circumstances where the result differs from broad market consensus.

4. **Result processing** 

      - Round to 6 decimals

<br>

**For USD/YAM:** 

1. **What prices should be queried for and from which markets?**

Follow all steps laid out in finding the YAM/USD price above.
Take the Inverse of that result (1/ YAM/USD) to get the USD/YAM price.

2. **Pricing interval**

See YAM/USD

3. **Input processing**

    -     See YAM/USD 

4. **Result processing** 

    -     Round to 18 decimals


# Security considerations

//will edit this section once we have confirmed exchanges and pairs. Risk should be limited with more exchanges now available.
Because there is only 1 liquid exchange and it is an on-chain AMM style, if liquidity is withdrawn too fast, there may be a risk in the price peg, and therefore the integrity of the system. In the current setting, there would need to be a significant event that erodes confidence in YAM and the token, causing Sushiswap liquidity to be withdrawn quickly and en-masse. This threat is mitigated via YAM incentives paid to liquidity providers who stake their tokens.

Adding this new identifier by itself poses little security risk to the DVM or priceless financial contract users. However, anyone deploying a new priceless token contract referencing this identifier should take care to parameterize the contract appropriately to the reference asset’s volatility and liquidity characteristics to avoid the loss of funds for synthetic token holders. Additionally, the contract deployer should ensure that there is a network of liquidators and disputers ready to perform the services necessary to keep the contract solvent.

$UMA-holders should evaluate the ongoing cost and benefit of supporting price requests for this identifier and also contemplate de-registering this identifier if security holes are identified. As noted above, $UMA-holders should also consider re-defining this identifier as liquidity in the underlying asset changes, or if added robustness (eg via TWAPs) are necessary to prevent market manipulation.





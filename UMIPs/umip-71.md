# Headers

| UMIP-71           |                                                                                           |
|-------------------|--------------------------------------------------------------------------------------------|
| UMIP Title        | Add XIOUSD, USDXIO, XIOETH, ETHXIO as supported price identifiers                         |
| Authors           | Anthony Scarpulla (anthony@blockzerolabs.io) and Krasimir Raykov (kraykov1994@gmail.com)   |
| Status            | Last Call                                                                                      |
| Create            | March 24th, 2021                                                                           |
| Link to Discourse	| https://discourse.umaproject.org/t/approve-xio-price-identifiers/384             |

# SUMMARY

The DVM should support price requests for the following indexes

- XIO/ETH
- ETH/XIO
- XIO/USD
- USD/XIO


# MOTIVATION

The DVM currently does not support the XIOUSD, USDXIO, XIOETH and ETHXIO price identifiers.

XIO is also being proposed as supported collateral types, and using it as collateral
together with the price identifier would allow XIO holders to get leverage on their holdings by minting yield-dollar type stablecoins.

Supporting the XIO/ETH and ETH/XIO price identifiers would enable the creation of similar products that use XIO as collateral with ETH denominated as a reference price.

# MARKETS & DATA SOURCES

1. What markets should the price be queried from? It is recommended to have at least 3 markets.

    - Uniswap

2.  Which specific pairs should be queried from each market?

    - XIO/ETH
    - ETH/USD per UMIP 6

3. Provide recommended endpoints to query for real-time prices from each market listed.

    - XIO/ETH pair: https://info.uniswap.org/pair/0xe0cc5afc0ff2c76183416fb8d1a29f6799fb2cdf
    - ETH/USDT pair using UMIP 6

    All the data can be queried from the Uniswap V2 subgraph: https://thegraph.com/explorer/subgraph/uniswap/uniswap-v2

4. How often is the provided price updated?

    - On every Ethereum block (i.e. every ~15 seconds)

5. Provide recommended endpoints to query for historical prices from each market listed.

    - Historical data can also be fetched from the subgraph:
    ```
    {
      token(
          id:"TOKEN_ADDRESS",
          block: {number: BLOCK_NUMBER}
      )
      {
          derivedETH
      }
    }
    ```

6.  Do these sources allow for querying up to 74 hours of historical data?

    - Yes.

7.  How often is the provided price updated?

    - On each Ethereum block (i.e. every ~15 seconds)

8. Is an API key required to query these sources?

    - No.

9. Is there a cost associated with usage?

    - No.

10. If there is a free tier available, how many queries does it allow for?

    - No limits at the moment.

11.  What would be the cost of sending 15,000 queries?

     - $0

<br>

# PRICE FEED IMPLEMENTATION
These price identifiers can use the [Uniswap](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/UniswapPriceFeed.js) price feed, so no new price feed is required, only configuring an existing one.


# TECHNICAL SPECIFICATIONS

## XIO/USD

**1. Price Identifier Name** - XIOUSD

**2. Base Currency** - XIO

**3. Quote currency** - USD

**4. Intended Collateral Currency** - USDC

- Does the value of this collateral currency match the standalone value of the listed quote currency?

    - Yes

- Is your collateral currency already approved to be used by UMA financial contracts?

    - Yes (https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-18.md)

**5. Collateral Decimals** - USDC has 6 decimals (https://etherscan.io/token/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48)

**6. Scaling Decimals** - 18 (1e18)

**7. Rounding** - Round to 6 decimal places. (seventh decimal place digit >= 5 rounds up and < 5 rounds down)


## USD/XIO

**1. Price Identifier Name** - USDXIO

**2. Base Currency** - USD

**3. Quote currency** - XIO

**4. Intended Collateral Currency** - XIO

- Does the value of this collateral currency match the standalone value of the listed quote currency?

    - Yes

- Is your collateral currency already approved to be used by UMA financial contracts?

    - There is a pending [UMIP](https://github.com/UMAprotocol/UMIPs/pull/218/files)

**5. Collateral Decimals** - 18 decimals

**6. Scaling Decimals** - 18 (1e18)

**7. Rounding** - Round to 6 decimal


## ETH/XIO

**1. Price Identifier Name** - ETHXIO

**2. Base Currency** - ETH

**3. Quote currency** - XIO

**4. Intended Collateral Currency** - XIO

- Does the value of this collateral currency match the standalone value of the listed quote currency?

    - Yes

- Is your collateral currency already approved to be used by UMA financial contracts?

    - There is a pending [UMIP](https://github.com/UMAprotocol/UMIPs/pull/218/files)

**5. Collateral Decimals** - 18 decimals

**6. Scaling Decimals** - 18 (1e18)

**7. Rounding** - Round to 6 decimal

## XIO/ETH

**1. Price Identifier Name** - XIOETH

**2. Base Currency** - XIO

**3. Quote currency** - ETH

**4. Intended Collateral Currency** - WETH

- Does the value of this collateral currency match the standalone value of the listed quote currency?

    - Yes

- Is your collateral currency already approved to be used by UMA financial contracts?

    - Yes

**5. Collateral Decimals** - 18 decimals

**6. Scaling Decimals** - 18 (1e18)

**7. Rounding** - Round to 6 decimal

# RATIONALE

**Why this implementation of the identifier as opposed to other implementation designs?**

Uniswap is the main liquidity source of XIO, that's the reason why we want to use Uniswap for the price feed. There are few centralized exchanges that has XIO listed, but most of the liquidity and volume is on Uniswap.

**What analysis can you provide on where to get the most robust prices? (Robust as in legitimate liquidity, legitimate volume, price discrepancies between exchanges, and trading volume between exchanges)**

Uniswap has the vast majority of XIO volume and liquidity. SO Uniswap should be used over all other sources.

**What is the potential for the price to be manipulated on the chosen exchanges?**

There is always a possibility for a market manipulation, that's why we will use TWAP in order to mitigate the risk.

**Should the prices have any processing (e.g., TWAP)?**

A 1 hour TWAP will mitigate any risk of attempted price manipulation on the market price (e.g. from a flash loan/whale attack). To meaningfully manipulate the price an attacker would have to manipulate the trading price of a token for an extended amount of time (more than 1 hour.)

<br>

# IMPLEMENTATION

## For XIO/USD and USD/XIO

```
1. Query XIO/ETH Price from Uniswap using 1 hour TWAP.
2. Query the ETH/USD Price as per UMIP-6.
3. Multiply the XIO/ETH price by the ETH/USD price and round to 6 decimals to get the XIO/USD price.
4. (for USD/XIO) Take the Inverse of the result of step 3 (1/ XIO/USD) to get the USD/XIO price.
```

## For XIO/ETH and ETH/XIO

```
1. Query XIO/ETH Price from Uniswap using 1 hour TWAP and round to 6 decimals.
2. (for ETH/XIO) Take the Inverse of the result of step 1 (1/ XIO/ETH)
```

It should be noted that this identifier is potentially prone to attempted manipulation because of its reliance on one pricing source. As always, voters should ensure that their results do not differ from broad market consensus. This is meant to be vague as the
tokenholders are responsible for defining broad market consensus.

1. **What prices should be queried for and from which markets?**

    - Prices are queried from Uniswap and listed in the `Technical Specifications` section.  

2. **Pricing interval**

    - Every block

3. **Input processing**

    - None.

4. **Result processing** 

    - See rounding rules in *Technical Specification*.

# Security Considerations

Uniswap is the most liquid DEX and it is an on-chain pooled AMM style exchange, if liquidity is withdrawn too fast, there may be a risk in the price peg, and therefore the integrity of the system. In the current setting, there would need to be a significant event that erodes confidence in XIO and the token, causing Uniswap liquidity to be withdrawn quickly and en-masse. This threat is mitigated via XIO incentives paid to liquidity providers.

Adding this new identifier by itself poses little security risk to the DVM or priceless financial contract users. However, anyone deploying a new priceless token contract referencing this identifier should take care to parameterize the contract appropriately to the reference asset’s volatility and liquidity characteristics to avoid the loss of funds for synthetic token holders. Additionally, the contract deployer should ensure that there is a network of liquidators and disputers ready to perform the services necessary to keep the contract solvent.

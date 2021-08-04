## Headers

| UMIP-119                |                                                               |
| ------------------- | ------------------------------------------------------------- |
| UMIP Title          | Add ibBTC/BTC, BTC/ibBTC, ibBTC/USD, USD/ibBTC as a supported price identifiers |
| Authors             | hash_error                                                      |
| Status              | Approved                                                         |
| Created             | July 18, 2021                                              |
| Discourse Link      |             |

# Summary 

The DVM should support price requests for the below price indexes:
- ibBTC/BTC
- BTC/ibBTC
- ibBTC/USD
- USD/ibBTC

# Motivation

The DVM currently does not support the ibBTC/BTC, BTC/ibBTC, ibBTC/USD or USD/ibBTC price identifiers.

Badger DAO and DefiDollar partnered to create a collateralized interest bearing Bitcoin token (ibBTC) providing holders exposure to Badger's Bitcoin collateralized non-native vaults composed of strategies to generate yield on Bitcoin. The intent of ibBTC is to become THE interest bearing BTC asset in the cryptocurrency multi-verse (cross-chain).  ibBTC offers the holder direct exposure to BTC and allows for yield generating properties through the underlying vault strategies of the collateral assets.

ibBTC is a BTC collateral backed asset. A strong, trusted price oracle is critical for ibBTC to be utilized as a base asset for lending/borrowing and stable minting protocols in the defi cross-chain space.

# Data Specifications

1. Recommended markets to query price from
    - Sushiswap (Ethereum network)
    - Sushiswap (Polygon network)

2. Specific pairs to query from each market
    - ibBTC/BTC and BTC/ibBTC
        - ibBTC/WBTC: Sushiswap (Ethereum network) and Sushiswap (Polygon network)
    - ibBTC/USD and USD/ibBTC
        - ibBTC/WBTC: Sushiswap (Ethereum network) and Sushiswap (Polygon network)
        - BTC/USD: refer to `BTCUSD` in UMIP-7

3. Provide recommended endpoints to query for real-time prices from each market listed.

Sushiswap (Ethereum)
ibBTC/WBTC Pool Address: 0x18d98D452072Ac2EB7b74ce3DB723374360539f1

Sushiswap (Polygon)
ibBTC/WBTC Pool Address: 0x8F8e95Ff4B4c5E354ccB005c6B0278492D7B5907

4. Frequency of price update
    
    - every block

5.  Do these sources allow for querying up to 74 hours of historical data? 

    - Sushiswap: Yes

6.  How often is the provided price updated?

    - Every Block for Sushiswap

7. Is an API key required to query these sources? 

    - No

8. Is there a cost associated with usage? 

    - No (this could change when The Graph turns into a marketplace). Note, the price feed does not use The Graph. Using the graph is a secondary reference implementation.

9. If there is a free tier available, how many queries does it allow for?

    - No limit currently

10.  What would be the cost of sending 15,000 queries?

     - $0

** intention will be to update UMIP with new markets as ibBTC expands liquidity in the cross-chain universe.**

# Price Feed Implementation
The price feed configuration is shown [insert here]. These price identifiers use the ExpressionPriceFeed.

# Technical Specifications
## ibBTC/USD
**1. Price Identifier Name** - ibBTC/USD

**2. Base Currency** - ibBTC

**3. Quote currency** - USD

**4. Rounding** - Round to 6 decimal places. (seventh decimal place digit >= 5 rounds up and < 5 rounds down)
 
<br>

## ibBTC/BTC

**1. Price Identifier Name** - ibBTC/BTC

**2. Base Currency** - ibBTC

**3. Quote currency** - BTC

**4. Rounding** - Round to 8 decimal places. (ninth decimal place digit >= 5 rounds up and < 5 rounds down)
 
<br>

# Rationale

**Why this implementation of the identifier as opposed to other implementation designs?**

This implementation is due to ibBTC's main sources of liquidity being on Sushiswap. Currently, there are no centralized exchanges with ibBTC listed, and most liquidity will remain on DEXs as it is incentivized.

**What analysis can you provide on where to get the most robust prices? (Robust as in legitimate liquidity, legitimate volume, price discrepancies between exchanges, and trading volume between exchanges)**

Sushiswap on Ethereum and Polygon networks has the vast majority of ibBTC volume and depth. These should be used over all other sources.

**What is the potential for the price to be manipulated on the chosen exchanges?**

The potential risk for this is low. Ethereum and Polygon are reliable networks, and TWAP is used to hedge short term price manipulation.

**Should the prices have any processing (e.g., TWAP)?**

A 30 minute TWAP was chosen to help smooth out price changes and give sponsors time to react before becoming undercollateralized. A 30 minute TWAP will also mitigate risk of attempted price manipulation attempts on the market price of the synthetic. To meaningfully manipulate the price that token sponsors’ collateralization is calculated with, an attacker would have to manipulate the trading price of a token for an extended amount of time.

<br>

# Implementation

For all implementations, a block number will need to be used. The block number should be the block that is closest to and before the timestamp that the price request timestamp.

For ibBTC/BTC and ibBTC/USD TWAP implementations, the TWAP start time should be determined by the latest block 30 minutes before requested timestamp.

**For ibBTC/BTC and BTC/ibBTC**

    1. Query ibBTC/WBTC Price from Sushiswap (Ethereum) using 30 minute TWAP (0x18d98D452072Ac2EB7b74ce3DB723374360539f1).
    2. Query ibBTC/WBTC Price from Sushiswap (Polygon) using 30 minute TWAP (0x8F8e95Ff4B4c5E354ccB005c6B0278492D7B5907).
    3. Take the mean of steps 1 and 2 to get the ibBTC/BTC price. This result should have 8 decimals, rounding the closest 0.5 up.
    4. (for BTC/ibBTC) Take the inverse of the before-rounding result of step 3 to retain precision.
    5. (for BTC/ibBTC) Round result from step 4 to 8 decimals to get the BTC/ibBTC price.

**For ibBTC/USD and USD/ibBTC**

    1. Query ibBTC/WBTC Price from Sushiswap (Ethereum) using 30 minute TWAP (0x18d98D452072Ac2EB7b74ce3DB723374360539f1).
    2. Query ibBTC/WBTC Price from Sushiswap (Polygon) using 30 minute TWAP (0x8F8e95Ff4B4c5E354ccB005c6B0278492D7B5907).
    3. Query the BTC/USD Price as per UMIP-7
    4. Take the mean of steps 1 and 2 to get the ibBTC/BTC price.
    5. Multiply ibBTC/WBTC price acquired from step 4 by BTC/USD price acquired in step 3 and round to 6 decimals to get the final ibBTC/USD price
    6. (for USD/ibBTC) Take the inverse of the before-rounding result of step 5 to retain precision.
    7. (for USD/ibBTC) Round result from step 6 to 6 decimals to get the USD/ibBTC price.

<br>

# Security Considerations

Adding this new identifier by itself poses little security risk to the DVM or priceless financial contract users. However, anyone deploying a new priceless token contract referencing this identifier should take care to parameterize the contract appropriately to the reference asset’s volatility and liquidity characteristics to avoid the loss of funds for synthetic token holders. Additionally, the contract deployer should ensure that there is a network of liquidators and disputers ready to perform the services necessary to keep the contract solvent.

Token price manipulation - Under illiquid market conditions, an attacker could attempt to drive prices down to withdraw more collateral than normally allowed or drive prices up to trigger liquidations. However, it is important to note that almost all attacks that have been performed on DeFi projects are executed with flash loans, which allows the attacker to obtain leverage and instantaneously manipulate a price and extract collateral. Additionally, flash loans will have no effect on a tradeable token price because the TWAP calculation is measured based on the price at the end of each block. Collateralization based off of a TWAP should make these attacks ineffective and would require attackers to use significantly more capital and take more risk to exploit any vulnerabilities.

Collateralization Requirements - All three of these identifiers are very volatile which brings on a higher risk of undercollateralized positions in the case of a massive ibBTC price increase. Minimum collateral ratios should be higher compared with other price identifiers with ~1.5 being the minimum.

$UMA-holders should evaluate the ongoing cost and benefit of supporting price requests for this identifier and also contemplate de-registering this identifier if security holes are identified. As noted above, $UMA-holders should also consider re-defining this identifier as liquidity in the underlying asset changes, or if added robustness are necessary to prevent market manipulation.

## Headers
| UMIP-#    |                                                                                                                                          |
|------------|------------------------------------------------------------------------------------------------------------------------------------------|
| UMIP Title | Add WBTCUSD, USDWBTC as price identifiers              |
| Authors    | Logan (Logan@opendao.io)                               |
| Status     | Draft                                                                                                                                 |
| Created    | February 2, 2021                                                                                                                           |

## Summary (2-5 sentences)
The DVM should support price requests for the WBTC/USD and USD/WBTC price index. These price identifiers will serve to support future developments involving WBTC. 

## Motivation
The DVM currently does not support the WBTC/USD or USD/WBTC price index.
Supporting the WBTCUSD price identifier would enable UMA partners (like OpenDAO or others) to provide access to the asset via the UMA architecture. 

There is little cost associated with adding this price identifier, as there are multiple free and easily accessible data sources available.

At the time of writing, WBTC is trading at $33,767.47 with a 24-hour trading volume of $346,285,873. There is a circulating supply of 117,000 WBTC coins with a max supply of 117,000. Uniswap is currently the most active market trading it. 

More information on the WBTC network can be found on the website: https://wbtc.network/

## Technical Specification
The definition of this identifier should be:
- Identifier name: WBTCUSD
- Base Currency: WBTC
- Quote Currency: USD
- Exchanges: Coinbase Pro, FTX, Crypto.com
- Result Processing: Median.
- Intended collateral currency: USD(C)
- Input Processing: None. Human intervention in extreme circumstances where the result differs from broad market consensus.
- Price Steps: 8 decimals

- Rounding: Closest, 0.5 up
- Pricing Interval: 60 seconds
- Dispute timestamp rounding: down

The definition of this identifier should be:
- Identifier name: USDWBTC
- Base Currency: USD
- Quote Currency: WBTC
- Intended collateral currency: WBTC
- Exchanges: Coinbase Pro, FTX, Crypto.com
- Result Processing: 1/WBTCUSD.
- Input Processing: None. Human intervention in extreme circumstances where the result differs from broad market consensus.
- Price Steps: 8 decimals

- Rounding: Closest, 0.5 up
- Pricing Interval: 60 seconds
- Dispute timestamp rounding: down



## Rationale

Prices are primarily used by Priceless contracts to calculate a synthetic token’s redemptive value in case of liquidation or expiration. Contract counterparties also use the price index to ensure that sponsors are adequately collateralized. More complex computations (like incorporating additional exchanges, calculating a TWAP or VWAP, or imposing price bands, etc.) have the potential to add a greater level of precision and robustness to the definition of this identifier, particularly at settlement of each expiring synthetic token.

The addition of WBTCUSD and USDWBTC will serve users at projects that are partnered with companies (such as OpenDAO) which are able to utilize the UMA architecture. More directly, this furthers adoption of the protocol by encouraging a convergence of capital from different projects and by potentially increasing TVL significantly.

Currently the most liquid exchange with USD or stablecoin markets for WBTC is [FTX.us](https://ftx.us/trade/WBTC/USD) (~0.13% volume) while most overall trade involving WBTC is on Uniswap (~30% volume). It can currently be traded on a wide variety of exchanges, including what are widely considered to be several top tier platforms.

In the current setting, there will need to be a significant event that erodes confidence in WBTC and the token for it to be a security or PR concern. 


## Implementation

The value of this identifier for a given timestamp should be determined by querying the price from WBTCUSDT pair (https://ftx.us/trade/WBTC/USD) on FTX.us or by the dollar price based on the ETH/WBTC pair at Uniswap (https://info.uniswap.org/pair/0xbb2b8038a1640196fbe3e38816f3e67cba72d940) for that timestamp. Most of the WBTC/USDX trading volume happens on FTX, which forms the broad market consensus. However, Uniswap claims the lion’s share of WBTC trade in the form of the ETH/WBTC pair (30% volume.) 


While it's important for tokenholders to have redundancy in their sources, bots and users that interact with the system in real-time need fast sources of price information. In these cases, it can be assumed that the price on FTX and Uniswap prices are accurate enough.



## Security considerations

Adding this new identifier by itself poses little security risk to the DVM or priceless financial contract users. However, anyone deploying a new priceless token contract referencing this identifier should take care to parameterize the contract appropriately to the reference asset’s volatility and liquidity characteristics to avoid the loss of funds for synthetic token holders. Additionally, the contract deployer should ensure that there is a network of liquidators and disputers ready to perform the services necessary to keep the contract solvent.

$UMA-holders should evaluate the ongoing cost and benefit of supporting price requests for this identifier and also contemplate de-registering this identifier if security holes are identified. As noted above, $UMA-holders should also consider re-defining this identifier as liquidity in the underlying asset changes, or if added robustness (eg via TWAPs) are necessary to prevent market manipulation.

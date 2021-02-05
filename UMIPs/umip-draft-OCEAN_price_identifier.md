## Headers
| UMIP-#    |                                                                                                                                          |
|------------|------------------------------------------------------------------------------------------------------------------------------------------|
| UMIP Title | Add OCEANUSD, USDOCEAN as price identifiers              |
| Authors    | Logan (Logan@opendao.io)|
| Status     | Draft                                                                                                                                 |
| Created    | January 28, 2021                                                                                                                           |
| Link to Discourse    | https://discourse.umaproject.org/t/adding-oceanusd-as-a-price-identifier/118                                                     |

## Summary (2-5 sentences)
The DVM should support price requests for the OCEAN/USD and USD/OCEAN price index. These price identifiers will serve to support OCEAN token as collateral.


## Motivation
The DVM currently does not support the OCEAN/USD or USD/OCEAN price index.
Supporting the OCEANUSD price identifier would enable the creation of the OceanO stablecoin, backed by OCEAN as collateral. Ocean token holders can utilize this as a hedging tool, and could go long, or use OceanO for other purposes.

There is little cost associated with adding this price identifier, as there are multiple free and easily accessible data sources available.

The supply of Ocean is capped at 1.41 billion tokens. 51% of this supply is disbursed according to a Bitcoin-like schedule over decades, to fund community projects curated by OceanDAO. At the time of writing, the Ocean token market cap is $243,700,423 in the top 100 projects with a 24-hour trading volume of $137,565,116. 

More information on the Ocean Protocol can be found on the website: https://oceanprotocol.com


## Technical Specification
The definition of this identifier should be:
- Identifier name: OCEANUSD
- Base Currency: OCEAN
- Quote Currency: USD
- Exchanges: Binance, Digifinex, MXC
- Result Processing: Median.
- Intended collateral currency: USDC
- Input Processing: None. Human intervention in extreme circumstances where the result differs from broad market consensus.
- Price Steps: 18 decimals

- Rounding: Closest, 0.5 up
- Pricing Interval: 60 seconds
- Dispute timestamp rounding: down

The definition of this identifier should be:
- Identifier name: USDOCEAN
- Base Currency: USD
- Quote Currency: OCEAN
- Intended collateral currency: OCEAN
- Exchanges: Binance, Digifinex, MXC
- Result Processing: 1/OCEANUSD.
- Input Processing: None. Human intervention in extreme circumstances where the result differs from broad market consensus.
- Price Steps: 18 decimals

- Rounding: Closest, 0.5 up
- Pricing Interval: 60 seconds
- Dispute timestamp rounding: down


## Rationale

Prices are primarily used by Priceless contracts to calculate a synthetic token’s redemptive value in case of liquidation or expiration. Contract counterparties also use the price index to ensure that sponsors are adequately collateralized. More complex computations (like incorporating additional exchanges, calculating a TWAP or VWAP, or imposing price bands, etc.) have the potential to add a greater level of precision and robustness to the definition of this identifier, particularly at settlement of each expiring synthetic token.

The addition of OCEANUSD  and USDOCEAN fits into a larger goal of advancing the adoption of the UMA protocol by allowing OCEAN to be used as collateral for minting a stable coin among a suite of [OpenDAO](https://opendao.io) stable coins. This furthers adoption of the protocol by encouraging a convergence of capital from different projects and increasing TVL.

Currently the most liquid exchange with USD or stablecoin markets for OCEAN is [Binance](https://www.binance.com/en/trade/OCEAN_USDT) (~17% volume). It can currently be traded on more than two dozen exchanges, including what are widely considered to be several top tier platforms.

In the current setting, there will need to be a significant event that erodes confidence in Ocean and the token for it to be a security or PR concern. 


## Implementation

The value of this identifier for a given timestamp should be determined by querying the price from OCEANUSDT pair https://www.binance.com/en/trade/OCEAN_USDT on Binance for that timestamp. Most of the OCEAN trading volume happens on Binance, which forms the broad market consensus. 
While it's important for tokenholders to have redundancy in their sources, bots and users that interact with the system in real-time need fast sources of price information. In these cases, it can be assumed that the price on Binance is accurate enough.

Ocean provides the live price feed on their main website publicly as well.


## Security considerations

Adding this new identifier by itself poses little security risk to the DVM or priceless financial contract users. However, anyone deploying a new priceless token contract referencing this identifier should take care to parameterize the contract appropriately to the reference asset’s volatility and liquidity characteristics to avoid the loss of funds for synthetic token holders. Additionally, the contract deployer should ensure that there is a network of liquidators and disputers ready to perform the services necessary to keep the contract solvent.
$UMA-holders should evaluate the ongoing cost and benefit of supporting price requests for this identifier and also contemplate de-registering this identifier if security holes are identified. As noted above, $UMA-holders should also consider re-defining this identifier as liquidity in the underlying asset changes, or if added robustness (eg via TWAPs) are necessary to prevent market manipulation.

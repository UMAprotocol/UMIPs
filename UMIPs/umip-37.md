## Headers
| UMIP-37    |                                                                                                                                          |
|------------|------------------------------------------------------------------------------------------------------------------------------------------|
| UMIP Title | Add DSDUSD, USDDSD as price identifiers              |
| Authors    | John (dsdravage@gmail.com), Sean (sean@opendao.io) |
| Status     | Last Call                                                                                                                                    |
| Created    | January 14, 2021                                                                                                                           |

## Summary (2-5 sentences)
The DVM should support price requests for the DSD/USD and USD/DSD price index.

## Motivation
The DVM currently does not support the DSDUSD or USDDSD price index.
Supporting the DSDUSD price identifier would enable the creation of the DSDO stablecoin, backed by DSD as collateral. DSD token holders can utilize this as a hedging tool, and could go long or use DSDO for functional purposes.
There is little cost associated with adding this price identifier, as there are multiple free and easily accessible data sources available.

More information on the Dynamic Set Dollar can be found on the website: https://dsd.finance/

## Technical Specification
The definition of this identifier should be:
- Identifier name: DSDUSD
- Base Currency: DSD
- Quote Currency: USD
- Exchanges: Uniswap
- Result Processing: Median.
- Intended collateral currency: USDC
- Input Processing: None. Human intervention in extreme circumstances where the result differs from broad market consensus.
- Price Steps: 6 decimals
- Rounding: Closest, 0.5 up
- Pricing Interval: 60 seconds
- Dispute timestamp rounding: down

The definition of this identifier should be:
- Identifier name: USDDSD
- Base Currency: USD
- Quote Currency: DSD
- Intended collateral currency: DSD
- Exchanges: Uniswap
- Result Processing: 1/DSDUSD.
- Input Processing: None. Human intervention in extreme circumstances where the result differs from broad market consensus.
- Price Steps: 18 decimals
- Rounding: Closest, 0.5 up
- Pricing Interval: 60 seconds
- Dispute timestamp rounding: down

Note :- We are assuming that the price of 1 USDC is approximately equal to 1 USD.



## Rationale

Prices are primarily used by Priceless contracts to calculate a synthetic token’s redemptive value in case of liquidation or expiration. Contract counterparties also use the price index to ensure that sponsors are adequately collateralized. More complex computations (like incorporating additional exchanges, calculating a TWAP or VWAP, or imposing price bands, etc.) have the potential to add a greater level of precision and robustness to the definition of this identifier, particularly at settlement of each expiring synthetic token.

The addition of DSDUSD  and USDDSD fits into a larger goal of advancing the adoption of the UMA protocol by allowing DSD to be used as collateral for minting a stable coin among a suite of [OpenDAO](https://opendao.io) stable coins. This furthers adoption of the protocol by encouraging a convergence of capital from different projects and increasing TVL.

Currently the largest exchange with USD or stablecoin markets for DSD is [Uniswap](https://info.uniswap.org/pair/0x66e33d2605c5fb25ebb7cd7528e7997b0afa55e8) (~90% volume). If liquidity is withdrawn too fast there may be a risk in the price peg, and therefore the integrity of the system.

In the current setting, there will need to be a significant event that erodes confidence in DSD and the token, at the same time where Uniswap liquidity is withdrawn too quickly en masse. However this may pose a security issue depending on the depth of DSDUSD liquidity on Uniswap. This may be improved by listing on additional exchanges with genuine volume.
Over time, as liquidity in the DSD token migrates across platforms, this identifier can be re-defined to add exchanges, remove exchanges, or change the way that the price is calculated. Any re-definition would be done via off-chain social consensus by $UMA-holders, and ultimately reflected in the way that $UMA-holders vote upon the price of DSDUSD and USDDSD when called to do so by disputers, or at settlement.



## Implementation

The value of this identifier for a given timestamp should be determined by querying the price from DSDUSDC pair https://info.uniswap.org/pair/0x66e33d2605c5fb25ebb7cd7528e7997b0afa55e8 on Uniswap for that timestamp. Most of the DSD trading volume happens on Uniswap, which forms the broad market consensus. 
While it's important for tokenholders to have redundancy in their sources, bots and users that interact with the system in realtime need fast sources of price information. In these cases, it can be assumed that the price on Uniswap is accurate enough.

Dynamic Set Dollar will provide the live price feed on the website publicly, and may offer API access in the future.

## Security considerations
Adding this new identifier by itself poses little security risk to the DVM or priceless financial contract users. However, anyone deploying a new priceless token contract referencing this identifier should take care to parameterize the contract appropriately to the reference asset’s volatility and liquidity characteristics to avoid the loss of funds for synthetic token holders. Additionally, the contract deployer should ensure that there is a network of liquidators and disputers ready to perform the services necessary to keep the contract solvent.
$UMA-holders should evaluate the ongoing cost and benefit of supporting price requests for this identifier and also contemplate de-registering this identifier if security holes are identified. As noted above, $UMA-holders should also consider re-defining this identifier as liquidity in the underlying asset changes, or if added robustness (eg via TWAPs) are necessary to prevent market manipulation.
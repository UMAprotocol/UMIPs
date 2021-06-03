
 

## Headers
- **UMIP #** -  
- **UMIP title:**  - Add *DFX* as collateral 
- **Author**   -  Adrian Li (adrian@dfx.finance), Michael Bogan (michael.bogan@gmail.com)
- **Status: Draft**
- **Created:** 05/27/2021
- **Discourse Link:** https://discourse.umaproject.org/t/add-dfx-as-approved-collateral-currency/1144

## Summary (2-5 sentences)
[DFX](https://dfx.finance/) is a decentralized exchange protocol with a dynamically tuned bonding curve optimized for fiat-backed stablecoins like [USDC](https://www.circle.com/en/usdc), [CADC](https://www.getcadc.com/), [EURS](https://eurs.stasis.net/), and [XSGD](https://xfers.com/sg/straitsx#XSGDsection).   

The DFX token is the governance token of the DFX exchange. This UMIP will add [DFX ](https://etherscan.io/token/0x888888435fde8e7d4c54cab67f206e4199454c60) to the supported collateral currencies on the global whitelist contract, allowing the usage of the DFX token as collateral currency. This serves as an important step to allow for the creation of KPI options for DFX.

## Motivation
DFX is an AMM with a bonding curve that continually shifts to allow for the most efficient trades. This means you can get extremely close to spot prices while taking advantage of Ethereum's quick settlement finality. The DFX team and community are interested in implementing KPI options for the DFX community. Specifically, KPIs related to TVL.

The DFX token is a governance token that will be used to decide on fees, tweak bonding curve parameters for different pools (i.e. EUR pool might be more flat and lower fees whereas a NGN pool will be less flat and the fees higher), decide on new stablecoin additions, determine rewards for different pools, etc.

The DFX token has a circulating supply of about 10,000,000 with a max supply of 100,000,000. [Sushiswap](https://app.sushi.com/swap?outputCurrency=0x888888435fde8e7d4c54cab67f206e4199454c60) is the most active market. At the time of writing DFX has a market cap of ~$13.6m with a 24 hour trading volume of around $30,000. Current liquidity is low as the exchange is currently in a guarded 0.5 beta launch. Liquidity is expected to greatly increase with the 1.0 launch scheduled for the beginning of June.

## Technical Specification

To accomplish this upgrade, the following changes need to be made:

The DFX token [https://etherscan.io/token/0x888888435fde8e7d4c54cab67f206e4199454c60](https://etherscan.io/token/0x888888435fde8e7d4c54cab67f206e4199454c60) needs to be added to the collateral currency whitelist introduced in UMIP-8.

A final fee of 500 DFX needs to be added for DFX in the Store contract.

## Rationale
Adding the DFX token as collateral (and thereby allowing the DFX community to take advantage of KPI options) advances the goal of further adoption of the UMA protocol.

A final fee of 400 DFX was chosen, slightly higher than recommended, to account for price volatility of the token.

## Implementation

This UMIP requires proposing the two governor transactions detailed in the above Technical Specification section.

This change has no implementation other than adding the DFX token address to the collateral currency whitelist.

## Security considerations
There would need to be a significant event that erodes confidence in DFX and the DFX token for it to be a security or PR concern. Since DFX is an AMM, we don’t expect low liquidity or volume of our token to be a factor in the success of this endeavor and should not impact UMA negatively.

Liquidity is expected to rise after the launch of v1 in early June. Liquidity will be incentivized on other DeFi AMMs, and the token will be added to CEXs (timeline still TBD). As of now, however, the main source of the DFX token is liquidity mining.

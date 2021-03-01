# Headers
| UMIP-58     |                                                                                                                                          |
|------------|------------------------------------------------------------------------------------------------------------------------------------------|
| UMIP Title | Add UNI-V2 LP tokens WBTC-ETH, USDC-ETH, UNI-ETH, and UMA-ETH, as whitelisted collateral currencies              |
| Authors    | Dev-1 (dev-1-lp-dollar), Dev-2 (dev-2-lp-dollar) |
| Status     | Approved                                                                                                                                    |
| Created    | February 09, 2021                                                                                                                        |
| Link to Discourse | [Discourse](https://discourse.umaproject.org/t/add-uni-v2-wbtc-eth-as-a-supported-collateral-currency/149)                        |
 
## Summary
This UMIP will add the following UNI-V2 LP tokens as approved collateral currencies: WBTC-ETH, USDC-ETH, UNI-ETH, and UMA-ETH. 

This will involve adding the currencies to the whitelist and adding a flat final fee to charge per-request. The proposed final fees equal $400, and calculations are detailed in the table below.

Final Fee Calculations and Currency Prices as of February 14, 2021:

```
BTC = $48,659.32  
ETH = $1,803.90  
UNI = $21.05  
UMA = $28.98
```
 
| Currency (LP token) |  Total Reserves | LP Token Supply | LP Token in Dollars | Final Fee in LP token |
| ------------------- | --------------- | --------------- | ------------------- | -------------------- |
| WBTC-ETH | WBTC: 4,004.25660 <br /> ETH: 108,354.69868 | 0.183766117503018792 | ```((4,004.25660 * 48,659.32) + (108,354.69868 * 1,803.90)) / 0.183766117503018792``` = $2,123,924,962.41 | 0.0000002 (~$425)
| USDC-ETH | USDC: 176,760,773.71622 <br /> ETH: 97,320.84342 | 2.961635437353718411 | ```((176,760,773.71622 * 1) + (97,320.84342 * 1,803.90)) / 2.961635437353718411``` = $118,960,571.14 | 0.0000035 (~$415)
| UNI-ETH  | UNI: 6,619,997.29037 <br /> ETH: 77,263.63438 | 362,909.728355933628948352 | ```((6,619,997.29037 * 21.05) + (77,263.63438 * 1,803.90)) / 362,909.728355933628948352``` = $768.03 | 0.55 (~$425)
| UMA-ETH  | UMA: 81,710.86344 <br /> ETH: 1,310.95349 | 8,717.786395937747945885 | ```((81,710.86344 * 28.98) + (1,310.95349 * 1,803.90)) / 8,717.786395937747945885``` = $542.89 | 0.8 (~$430)



## Motivation
UNI-V2 LP tokens represent ownership in CFMM (constant function market maker) positions on Uniswap. 

The underlying assets include ETH, WBTC - a currency pegged to Bitcoin, USDC - a USD stablecoin, UNI - Uniswap's governance, and UMA - this projects own governance token. All tokens are widely used across the cryptocurrency space, and account for a large amount of activity in the decentralized finance space.
 
UNI-V2 LP tokens as a collateral type are expected to have a variety of deployments. They will open the door for the creation of synthetic assets with CFMM positions.

## Technical Specification
To accomplish this upgrade, two changes need to be made for each UNI-V2 pair:

*WBTC-ETH*
- The UNI-V2 WBTC-ETH LP address, 0xBb2b8038a1640196FbE3e38816F3e67Cba72D940, needs to be added to the collateral currency whitelist.
- A final fee of 0.0000002 needs to be added for UNI-V2 WBTC-ETH LP in the Store contract.

*USDC-ETH*
- The UNI-V2 USDC-ETH LP address, 0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc, needs to be added to the collateral currency whitelist.
- A final fee of 0.0000035 needs to be added for UNI-V2 USDC-ETH LP in the Store contract.

*UNI-ETH*
- The UNI-V2 UNI-ETH LP address, 0xd3d2E2692501A5c9Ca623199D38826e513033a17, needs to be added to the collateral currency whitelist.
- A final fee of 0.55 needs to be added for UNI-V2 UNI-ETH LP in the Store contract.

*UMA-ETH*
- The UNI-V2 UMA-ETH LP address, 0x88D97d199b9ED37C29D846d00D443De980832a22, needs to be added to the collateral currency whitelist.
- A final fee of 0.8 needs to be added for UNI-V2 UMA-ETH LP in the Store contract.


## Rationale
The rationale behind this change is giving deployers more useful collateral currency options. This is an advancement into a better type of collateral.

$400 USD equivalent was chosen as the final fee because it is equal to or above the mimimum of already approved coins.

## Implementation

This change has no implementation other than proposing the two aforementioned governance transactions that will be proposed.

## Security Considerations
Since the underlying tokens are persistently valuable tokens, including the packaged version from the Uniswap product as supported collateral currencies should impose no additional risk to the protocol.

The main implication is for contract deployers and users who are considering using contracts with these assets as the collateral currency. They should recognize and accept the volatility risk of using this, and ensure appropriate required collateralization rations (120%+), as well as a network of liquidator and support bots to ensure solvency.

As mentioned above, the asset is packaged from Uniswap, a decentralized protocol on the Ethereum blockchain. Uniswap is one of the most popular, proven, and secure smart contract protocols to exist in decentralized finance and beyond. They've succesfully locked up and handled billions of dollars over the course of multiple years, with multiple extensive auditing from top names in the industry. There is the theoretical risk that the pools on Uniswap could be exploited and lead to a rapid loss of value in the currency proposed here which would require fast response to ensure solvency for any financial products built using this as a collateral type. However, due to the nature of Uniswap's long-proven track record around quality and security this is extremely unlikely. 

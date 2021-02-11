# Headers
| UMIP-#     |                                                                                                                                          |
|------------|------------------------------------------------------------------------------------------------------------------------------------------|
| UMIP Title | Add UNI V2 USDC-ETH LP as a whitelisted collateral currency              |
| Authors    | Dev-1 (dev-1-lp-dollar), Dev-2 (dev-2-lp-dollar) |
| Status     | Draft                                                                                                                                    |
| Created    | February 10, 2021                                                                                                                        |
 
## Summary
This UMIP will add UNI V2 USDC-ETH LP tokens as an approved collateral currency. This will involve adding the currency to the whitelist and adding a flat final fee to charge per-request. The proposed final fee is 0.0000000465 UNI V2 USDC/ETH LP per request, as the USD price of UNI V2 USDC/ETH is ~$8655321480, this roughly translates to a little over $400 USD.

## Motivation
UNI V2 USDC-ETH LP tokens represent ownership in one of the largest CFMM (constant function market maker) pools with $301 million in liquidity. The underlying assets of this currency are ETH and USDC. Both are widely used across the cryptocurrency space, and the pair account for a large share of trading volume in decentralized finance.
 
UNI V2 LP tokens as a collateral type are expected to have a variety of deployments. They will open the door for the creation of synthetic assets with CFMM positions. This is a progressive step for UMA as it enables capital efficiency for already existing whitelisted collateral currencies (ETH and USDC).

## Technical Specification
To accomplish this upgrade, two changes need to be made:

- The UNI V2 USDC/ETH LP address, 0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc, needs to be added to the collateral currency whitelist introduced in UMIP-usd-uni-v2-usdc-eth.md.
- A final fee of 0.0000000465 needs to be added for UNI V2 USDC/ETH LP in the Store contract.


## Rationale
The rationale behind this change is giving deployers more useful collateral currency options. This is an advancement into a better type of collateral.

A $400 USD equivalent was chosen as the final fee because it is equal to already approved coins ($400 USD).

## Implementation

This change has no implementation other than proposing the two aforementioned governance transactions that will be proposed.

## Security Considerations
Since the underlying tokens ETH and USDC are persistently valuable tokens, including the packaged version from the Uniswap product as supported collateral currencies should impose no additional risk to the protocol.

The main implication is for contract deployers and users who are considering using contracts with this asset as the collateral currency. They should recognize and accept the volatility risk of using this, and ensure appropriate required collateralization rations (120%+), as well as a network of liquidator and support bots to ensure solvency.

As mentioned above, the asset is packaged from Uniswap, a decentralized protocol on the Ethereum blockchain. Uniswap is one of the most popular, proven, and secure smart contract protocols to exist in decentralized finance and beyond. They've succesfully locked up and handled billions of dollars over the course of multiple years, with multiple extensive auditing from top names in the industry. There is the theoretical risk that the USDC/ETH pool on Uniswap could be exploited and lead to a rapid loss of value in the currency proposed here which would require fast response to ensure solvency for any financial products built using this as a collateral type. However, due to the nature of Uniswap's long-proven track record around quality and security this is extremely unlikely. 

The new price identifier that is intended to be used with this collateral currency will need to be specified to 18 decimals of precision in order to comply with UNI V2 USDC-ETH LP's precision.
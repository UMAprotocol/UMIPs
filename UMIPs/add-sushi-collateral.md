## Headers
| UMIP-xyz    |                                                                                                                                          |
|------------|------------------------------------------------------------------------------------------------------------------------------------------|
| UMIP Title | Add SUSHI and xSUSHI as approved collateral currencies              |
| Authors    | Sean Brown (@smb2796) |
| Status     | Draft                                                                                                                                    |
| Created    | March 10, 2021                                                                                                                           |

## Summary (2-5 sentences)
This UMIP will add Sushi and xSushi as approved collateral currencies. This will involve adding these to the whitelist and adding a flat final fee to charge per-request. The proposed final fee is 25 SUSHI and 25 xSUSHI per request.

## Motivation

TBA

## Technical Specification
To accomplish this upgrade, two changes for each currency need to be made:

### SUSHI
- The SUSHI address, [0x6B3595068778DD592e39A122f4f5a5cF09C90fE2](https://etherscan.io/address/0x6b3595068778dd592e39a122f4f5a5cf09c90fe2), needs to be added to the collateral currency whitelist introduced in UMIP-8.
- A final fee of 0.1 needs to be added for SUSHI in the Store contract.

### xSUSHI
- The xSUSHI address, [0x8798249c2E607446EfB7Ad49eC89dD1865Ff4272](https://etherscan.io/address/0x8798249c2E607446EfB7Ad49eC89dD1865Ff4272), needs to be added to the collateral currency whitelist introduced in UMIP-8.
- A final fee of 25 needs to be added for xSUSHI in the Store contract.

## Rationale

The rationale behind this change is giving deployers more useful collateral currency options.  WETH needs to be used instead of ETH due to it being an ERC20, whereas native ETH is not.

0.1 was chosen because 0.1 WETH is about twice as large as the current DAI final fee (10 DAI). This accounts for the fact that WETH is a much more volatile asset. Voters cannot change the final fees immediately when the price changes on collateral assets, so this additional cushioning helps protect the system from DoS attacks in times of volatility.

## Implementation

This change has no implementation other than the two aforementioned governor transactions that will be proposed.

## Security considerations
Since WETH is a persistently valuable ERC20 token, including it as a collateral currency should impose no additional risk to the protocol.

The only security implication is for contract deployers and users who are considering using EMP contracts with SUSHI or xSUSHI as collateral currencies. Contract deployers and users of SUSHI and xSUSHI should be aware that these are both volatile currencies and sponsors should take care to keep their positions over-collateralized when using these.

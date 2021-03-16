## Headers
| UMIP-67    |                                                                                                                                          |
|------------|------------------------------------------------------------------------------------------------------------------------------------------|
| UMIP Title | Add SUSHI and xSUSHI as approved collateral currencies              |
| Authors    | Sean Brown (@smb2796) |
| Status     | Last Call                                                                                                                                   |
| Created    | March 10, 2021                                                                                                                           |
| [Discourse Link](https://discourse.umaproject.org/t/add-sushi-and-xsushi-as-collateral-types/335)    |                                                                                                                     |

## Summary (2-5 sentences)
This UMIP will add Sushi and xSushi as approved collateral currencies. This will involve adding these to the whitelist and adding a flat final fee to charge per-request. The proposed final fee is 25 SUSHI and 22 xSUSHI per request.

## Motivation

SUSHI and xSUSHI are both ERC-20 tokens used by the SushiSwap community. SUSHI is the governance token of SushiSwap and is also used for staking. When SUSHI holders stake SUSHI, they receive xSUSHI in return. Each xSUSHI is thus exchangeable for a certain amount of staked SUSHI tokens.

Adding SUSHI and xSUSHI as collateral types will allow for a variety of contract deployments. These could be used with the SUSHI/xSUSHI price identifiers that are also being proposed, to create SUSHI/xSUSHI backed yield dollars, or SUSHI/xSUSHI covered calls. 

## Technical Specification
To accomplish this upgrade, two changes for each currency need to be made:

### SUSHI
- The SUSHI address, [0x6B3595068778DD592e39A122f4f5a5cF09C90fE2](https://etherscan.io/address/0x6b3595068778dd592e39a122f4f5a5cf09c90fe2), needs to be added to the collateral currency whitelist introduced in UMIP-8.
- A final fee of 25 needs to be added for SUSHI in the Store contract.

### xSUSHI
- The xSUSHI address, [0x8798249c2E607446EfB7Ad49eC89dD1865Ff4272](https://etherscan.io/address/0x8798249c2E607446EfB7Ad49eC89dD1865Ff4272), needs to be added to the collateral currency whitelist introduced in UMIP-8.
- A final fee of 22 needs to be added for xSUSHI in the Store contract.

## Rationale

The rationale behind this change is giving deployers more useful collateral currency options.

25 was chosen as the final fee for SUSHI, because this is approximately ~$500 at current SUSHI prices whcih is approximately equivalent to other collateral currencies. A slightly lower xSUSHI final fee of 22 was chosen, because xSUSHI will always trade slightly higher than SUSHI and this results in the same approximate dollar value.

## Implementation

This change has no implementation other than the two aforementioned governor transactions that will be proposed.

## Security considerations

The only security implication is for contract deployers and users who are considering using EMP contracts with SUSHI or xSUSHI as collateral currencies. Contract deployers and users of SUSHI and xSUSHI should be aware that these are both volatile currencies and sponsors should take care to keep their positions over-collateralized when using these.

Since xSUSHI primarily functions as a SUSHI LP token, it does not have many liquid markets available. Contract creators should be aware that it could be more difficult for liquidators to get xSUSHI when needed. 

# Add Punk Basic (PUNK-BASIC) as approved collateral currency 

## Headers
| UMIP-tbd   |                                                                                                                                          |
|------------|------------------------------------------------------------------------------------------------------------------------------------------|
| UMIP Title | Add PUNK-BASIC as approved collateral currency          |
| Authors    | John Shutt (john@umaproject.org), Deepanshu Hooda (deepanshuhooda2000@gmail.com) |
| Status     | Draft                                                                                                                                    |
| Created    | April 16, 2021                                                                                                                           |
| [Discourse Link](TBD)    |       
# Summary (2-5 sentences)
This UMIP will add PUNK-BASIC as approved collateral currency. This will involve adding PUNK-BASIC to the whitelist and adding flat final fees to charge per-request.
# Motivation

Punk-Basic is a single fund token, which is backed 1:1 by any CryptoPunks NFT. Because this fund allows any CryptoPunk to be deposited as collateral, it acts as a floor price tracker for Ethereum’s original digital collectibles.


Punk-Basic can be used as collateral for synthetics, including punk call and KPI options, or a synthetic tracking an actual index of CryptoPunk sales.

# Proposed Collateral Currency


## PUNK-BASIC (Punk Basic)

### Technical Specification
To accomplish this upgrade, two changes need to be made:

 * The PUNK-BASIC address, [0x69bbe2fa02b4d90a944ff328663667dc32786385][PUNK-BASIC], needs to be added to the collateral currency whitelist introduced in UMIP-8.
 * A final fee of 0.0094 PUNK-BASIC needs to be added for PUNK-BASIC in the Store contract. 

 [PUNK-BASIC]: https://etherscan.io/token/0x69bbe2fa02b4d90a944ff328663667dc32786385

# Rationale
0.0094 PUNK-BASIC was chosen for the fee because this sits around $400, which we have seen other collateral tokens use in the past.

# Security considerations

The only security implication is for contract deployers and users who are considering using EMP contracts with this token as the collateral currency. They should recognize that, relative to most fiat currencies, these assets are much more volatile. This volatility should be taken into account when parameterizing or using these EMP contracts.



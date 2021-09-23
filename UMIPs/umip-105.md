## Headers
| UMIP-105                |                                                               |
| ------------------- | ------------------------------------------------------------- |
| UMIP Title          | Add BASK as a supported collateral type |
| Authors             | Shawn C. Hagenah (Hagz48)shawnhagenah99@yahoo.com                                                    |
| Status              | Approved                                                         |
| Created             | 6/2/2021                                              |
| Discourse Link      | https://discourse.umaproject.org/t/add-dfx-as-approved-collateral-currency/1144            |


## Summary (2-5 sentences)
The BASK token is the Governance token for the Basket DAO Protocol. Adding BASK as a price collateral currency for the creation of synthetic tokens is the purpose of this collateral UMIP.

## Motivation
Adding BASK as a collateral currency would give Basket DAO community members the ability to create synthetic tokens for the creation of KPI options. The creation of these tokens using the UMA protocol, will not only allow for growth in the Basket DAO community but would also raise the current TVL of the UMA protocol thus benefitting both communities.  Basket DAO has also expressed interest in other UMA protocol products as well.

## Technical Specification

To accomplish this upgrade, the following changes need to be made:
- The [BASK address](https://etherscan.io/address/0x44564d0bd94343f72e3c8a0d22308b7fa71db0bb) needs to be added to the collateral currency whitelist introduced in UMIP-8.
- A final fee of 4 BASK in the proposed collateral currency needs to be added for BASK in the Store contract.

## Rationale
Adding BASK as a collateral type would give the Basket DAO community the ability to create the KPI options that it has expressed it would like to mint. These options will not only help in the growth to the Basket DAO community, but the adding BASK as a collateral currency would also increase the UMA protocols TVL, thus benefitting both communities. The Basket DAO community has also expressed interest in creating Call options in the future. Thus adding the Basket DAO governance token BASK as a collateral type will benefit UMA both now, and into the future. Basket DAO while fairly new shows good liquidity and its value keeps on par with other similar coins.  

## Implementation

This change has no implementations  other than the afore mentioned governor transactions

## Security considerations
BASK is the governance token of the Basket DAO protocol. Its implementation as a collateral currency should pose no security threats other than normal market volatility. That being said $UMA holders should evaluate the ongoing cost and benefit of supporting this asset as collateral if liquidity concerns are identified. UMA holders should take note of the collaterals nature as liquidity if the collateral changes or if added robustness(Eg. via TWAPs are necessary to prevent market manipulation.
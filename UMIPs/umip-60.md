## Headers
| UMIP-60   |   |
|------------|---|
| UMIP Title | Add INDEX & DPI as collateral |
| Authors    | Gottlieb Freudenreich (gottlieb.freudenreich@gmail.com)
| Status     | Proposed |
| Created    | 2020-03-08 |
| Discourse Link | https://discourse.umaproject.org/t/add-aave-link-snx-uma-uni-as-collateral/246
<br>

# Summary

This UMIP will add INDEX and DPI to the supported collateral currencies on the global whitelist contract, allowing the usage of these 2 assets as collateral currencies.


# Proposed Collateral Currencies

## INDEX (Index Cooperative Token)
### Motivation 

INDEX is the governance token which presides over the Index Cooperative which is the curater of the DeFi Pulse Index. 
The Index Cooperative has 130 million TVL and could utilize its governance token and/or treasury funds as collateral within the UMA ecosystem.  


### Technical Specification
To accomplish this upgrade, two changes need to be made:

 * The INDEX address, [0x0954906da0bf32d5479e25f46056d22f08464cab][index], needs to be added to the collateral currency whitelist introduced in UMIP-8.
 * A final fee of 24 INDEX needs to be added for the INDEX in the Store contract. (~$414 at time of writing)

 [index]: https://etherscan.io/token/0x0954906da0Bf32d5479e25f46056d22f08464cab

---

## DPI (DeFi Pulse Index Token)
### Motivation

The DeFi Pulse Index is a digital asset index designed to track the performance of token within the Decentralized Finance industry. The index is weighted based on the value of each token’s circulating supply.
The DPI Set is rebalanced monthly to realign to its market cap weighted index. As the index provides a broad exposure to different DeFi tokens there is plenty of potential to utilize DPI as collateral within the UMA ecosystem. 

### Technical Specification

To accomplish this upgrade, two changes need to be made:

 * The DPI address, [0x1494ca1f11d487c2bbe4543e90080aeba4ba3c2b][dpi], needs to be added to the collateral currency whitelist introduced in UMIP-8.
 * A final fee of 1 DPI needs to be added for the LINK in the Store contract. (~$466 at time of writing)

 [dpi]: https://etherscan.io/token/0x1494CA1F11D487c2bBe4543E90080AeBa4BA3C2b

---

## Rationale
The rationale behind this change is giving deployers more useful collateral currency options. This is an advancement into a better type of collateral.

$400 USD equivalent was chosen as the final fee because it is equal to or above the mimimum of already approved coins.

## Implementation

This change has no implementation other than proposing the two aforementioned governance transactions that will be proposed.

### Security Considerations

Since the underlying tokens are persistently valuable tokens, including the token should impose no additional risk to the protocol.

The main implication is for contract deployers and users who are considering using contracts with these assets as the collateral currency. They should recognize and accept the volatility risk of using this, and ensure appropriate required collateralization rations (140%+), as well as a network of liquidator and support bots to ensure solvency.

The DPI Token was created by the DeFI Pulse Index team on top of the Set Protocol. There is the theoretical risk that the underlying smart contracts get exploited which leads to a rapid loss of value in the currency proposed here which would require fast response to ensure solvency for any financial products built using this as a collateral type. 
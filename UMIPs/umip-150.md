**UMIP-150**

-   **UMIP title:** Add UMA as collateral currency on Polygon 
-   **Author:**  Geoff (stadnykgeoff1@gmail.com)
-   **Status:** Last Call
-   **Created:**  15 February 2022
-   **Discourse Link:** https://discourse.umaproject.org/t/create-add-uma-as-collateral-currency-to-polygon-md/1408 

## Summary (2-5 sentences)

This UMIP proposes adding UMA on Polygon for use as collateral in UMA contracts.

## Motivation

The addition of this collateral currency offers additional functionality to the UMA protocol and increases the range of contracts that can be built.

## Technical Specification

To accomplish this upgrade, the following changes need to be made:

-   The UMA address https://polygonscan.com/token/0x3066818837c5e6ed6601bd5a91b0762877a6b731 needs to be added to the collateral currency whitelist introduced in UMIP-8.
-   A final fee of 250 UMA needs to be added in the Store contract.
-   A final fee for the UMA Mainnet address https://etherscan.io/token/0x04Fa0d235C4abf4BcF4787aF4CF447DE572eF828 needs to be updated from 90 to 250. 


## Rationale

This store fee was chosen as it is approximately equivalent to $1500 in line with other collateral currencies as determined by CoinGecko

## Implementation


This change has no implementations other than the aforementioned governor transactions

## Security considerations

Adding a collateral currency introduces a level of risk into the UMA Ecosystem.  This collateral type should be monitored to ensure that the proposed collateral continues to have value.

Contract deployers considering using this collateral in an UMA contract should refer to the [guidelines on collateral type usage](https://docs.umaproject.org/uma-tokenholders/guidence-on-collateral-currency-addition) to ensure appropriate use.

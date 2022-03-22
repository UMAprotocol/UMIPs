**UMIP #**  - tbd

-   **UMIP title:** Add **wsVSQ** as collateral currency 
-   **Author:**  Geoff (stadnykgeoff1@gmail.com)
-   **Status:** Draft
-   **Created:**  22 March 2022
-   **Discourse Link:**  Insert link to discourse topic after it has been moved into draft UMIPs

## Summary (2-5 sentences)

This UMIP proposes adding **wsVSQ** for use as collateral in UMA contracts.

## Motivation

The addition of this collateral currency offers additional functionality to the UMA protocol and increases the range of contracts that can be built.

## Technical Specification

To accomplish this upgrade, the following changes need to be made:

-   The **wsVSQ** address on Polygon **https://polygonscan.com/token/0x05B33f816d2C0C2D20F0777a75ad549df05bF24D** needs to be added to the collateral currency whitelist introduced in UMIP-8.
-   A final fee of **100,000,000** needs to be added for **wsVSQ** in the Store contract. 

## Rationale

This store fee was chosen as an enormous amount and placeholder as wsVSQ has yet to show a market value. Once a value can be determined, this contract will be updated so that the final fee is approximately equivalent to $1500 in line with other collateral currencies along with the data source.

## Implementation

This change has no implementations other than the aforementioned governor transactions

## Security considerations

Adding a collateral currency introduces a level of risk into the UMA Ecosystem.  This collateral type should be monitored to ensure that the proposed collateral continues to have value.

Contract deployers considering using this collateral in an UMA contract should refer to the [guidelines on collateral type usage](https://docs.umaproject.org/uma-tokenholders/guidence-on-collateral-currency-addition) to ensure appropriate use.

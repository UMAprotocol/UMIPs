**UMIP #**  - tbd

-   **UMIP title:** Add **miMATIC** as collateral currency 
-   **Author**  Chandler (chandler@umaproject.org)
-   **Status: Draft**
-   **Created:**  13 September 2021


## Summary (2-5 sentences)

This UMIP proposes adding **miMATIC** for use as collateral in UMA contracts.

## Motivation

The addition of this collateral currency offers additional functionality to the UMA protocol and increases the range of contracts that can be built.

miMATIC also known as MAI is a soft pegged stablecoin that is backed by other assets in the Polygon network.

## Technical Specification

To accomplish this upgrade, the following changes need to be made:

-   The **miMATIC** Polygon [token address](https://polygonscan.com/token/0xa3fa99a148fa48d14ed51d610c367c61876997f1): 0xa3fa99a148fa48d14ed51d610c367c61876997f1 needs to be added to the collateral currency whitelist introduced in UMIP-8.
-   A final fee of **400 MAI** needs to be added in the Store contract.
    

## Rationale

This store fee was chosen as it is approximately equivalent to $400 in line with other collateral currencies as determined by assuming that the MIA token will hold its peg to $1 per token.

## Implementation


This change has no implementations other than the aforementioned governor transactions

## Security considerations

Adding a collateral currency introduces a level of risk into the UMA Ecosystem.  This collateral type should be monitored to ensure that the proposed collateral continues to have value.

Contract deployers considering using this collateral in an UMA contract should refer to the [guidelines on collateral type usage](https://docs.umaproject.org/uma-tokenholders/guidence-on-collateral-currency-addition) to ensure appropriate use.



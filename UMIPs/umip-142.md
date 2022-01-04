**UMIP-142**

-   **UMIP title:** Add **AthleteX** as collateral currency 
-   **Author:**  athletexmarkets@gmail.com
-   **Status: Last Call**
-   **Created:**  12/31/2021
-   **Discourse Link:**  https://discourse.umaproject.org/t/whitelist-ax-as-collateral/1250

## Summary (2-5 sentences)

This UMIP proposes adding **AthleteX** for use as collateral in UMA contracts.

## Motivation

The addition of this collateral currency offers additional functionality to the UMA protocol and increases the range of contracts that can be built.

## Technical Specification

To accomplish this upgrade, the following changes need to be made:

-   The **AX** address **https://polygonscan.com/address/0x5617604BA0a30E0ff1d2163aB94E50d8b6D0B0Df** needs to be added to the collateral currency whitelist introduced in UMIP-8.
-   A final fee of **22000AX** needs to be added for **AthleteX** in the Store contract.
    

## Rationale

This store fee was chosen as it is approximately equivalent to $1500 in line with other collateral currencies as determined by **https://www.coingecko.com/en/coins/athletex**

## Implementation


This change has no implementations other than the aforementioned governor transactions

## Security considerations

Adding a collateral currency introduces a level of risk into the UMA Ecosystem.  This collateral type should be monitored to ensure that the proposed collateral continues to have value.

Contract deployers considering using this collateral in an UMA contract should refer to the [guidelines on collateral type usage](https://docs.umaproject.org/uma-tokenholders/guidence-on-collateral-currency-addition) to ensure appropriate use.


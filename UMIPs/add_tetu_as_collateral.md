**UMIP #**  - tbd

-   **UMIP title:** Add **TETU** as collateral currency 
-   **Author**  Gregory Tumbiola (Tumbiola@gmail.com)
-   **Status: Draft**
-   **Created:**  May 10 2022
-   **Discourse Link:**  Insert link to discourse topic after it has been moved into draft UMIPs

## Summary (2-5 sentences)

This UMIP proposes adding **TETU** for use as collateral in UMA contracts.

## Motivation

The addition of this collateral currency offers additional functionality to the UMA protocol and increases the range of contracts that can be built.

## Technical Specification

To accomplish this upgrade, the following changes need to be made:

-   The **TETU** address **0x255707B70BF90aa112006E1b07B9AeA6De021424** on Polygon needs to be added to the collateral currency whitelist introduced in UMIP-8.
-   A final fee of **100,000** needs to be added for **TETU** in the Store contract.
    

## Rationale

This store fee was chosen as it is approximately equivalent to $1500 in line with other collateral currencies as determined by **(https://www.coingecko.com/en/coins/tetu)**

## Implementation


This change has no implementations other than the aforementioned governor transactions

## Security considerations

Adding a collateral currency introduces a level of risk into the UMA Ecosystem.  This collateral type should be monitored to ensure that the proposed collateral continues to have value.

Contract deployers considering using this collateral in an UMA contract should refer to the guidelines on collateral type usage available here (https://docs.umaproject.org/uma-tokenholders/guidence-on-collateral-currency-addition) to ensure appropriate use.
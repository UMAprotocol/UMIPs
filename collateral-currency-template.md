**UMIP #**  - tbd

-   **UMIP title:** Add **token** as collateral currency 
-   **Author:**  Name (email)
-   **Status:** Draft
-   **Created:**  Date
-   **Discourse Link:**  Insert link to discourse topic after it has been moved into draft UMIPs

## Summary (2-5 sentences)

This UMIP proposes adding **token** for use as collateral in UMA contracts.

## Motivation

The addition of this collateral currency offers additional functionality to the UMA protocol and increases the range of contracts that can be built.

## Technical Specification

To accomplish this upgrade, the following changes need to be made:

-   The **token** address **token address (etherscan link)** needs to be added to the collateral currency whitelist introduced in UMIP-8.
-   A final fee of **amount token** needs to be added for **token** in the Store contract.
    

## Rationale

This store fee was chosen as it is approximately equivalent to $1500 in line with other collateral currencies as determined by **insert how the value of $1500 was determined**

## Implementation


This change has no implementations other than the aforementioned governor transactions

## Security considerations

Adding a collateral currency introduces a level of risk into the UMA Ecosystem.  This collateral type should be monitored to ensure that the proposed collateral continues to have value.

Contract deployers considering using this collateral in an UMA contract should refer to the [guidelines on collateral type usage](https://docs.umaproject.org/uma-tokenholders/guidence-on-collateral-currency-addition) to ensure appropriate use.


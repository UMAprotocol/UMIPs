**UMIP #**  - tbd

-   **UMIP title:** Add **token** as collateral currency 
-   **Author**  Name (email)
-   **Status: Draft**
-   **Created:**  Date
-   **Discourse Link:**  Insert link to discourse topic  after  it has been moved into draft UMIPs

## [](https://discourse.umaproject.org/t/add-tokens-as-approved-collateral-currencies-through-upps/1173#summary-2-5-sentences-1)Summary (2-5 sentences)

This UMIP proposes adding **token** for use as collateral in UMA contracts

## Motivation

The addition of this collateral currency offers additional functionality to the UMA protocol and increases the range of contracts that can be built.

## Technical Specification

To accomplish this upgrade, the following changes need to be made:

-   The  **token** address  **token address (etherscan link)**  needs to be added to the collateral currency whitelist introduced in UMIP-8.
-   A final fee of **amount token**  needs to be added for **token** in the Store contract.
    

## Rationale

This store fee was chosen as it is approximately equivalent to $400 in line with other collateral currencies

## Implementation


This change has no implementations other than the afore mentioned governor transactions

## Security considerations

Adding a collateral currency introduces a level of risk into the UMA Ecosystem.  This collateral type should be monitored to ensure that the proposed collateral continues to have value.

Contract deployers considering using this collateral in an UMA contract should refer to the guidelines on collateral type usage available here (insert docs link) to ensure appropriate use.



**UMIP #**  - tbd

-   **UMIP title:** Add BANK as collateral currency 
-   **Author**  chandler@umaproject.org 
-   **Status: Draft**
-   **Created:**  11 August 2021

## Summary (2-5 sentences)

This UMIP proposes adding **BANK** for use as collateral in UMA contracts.

## Motivation

The addition of this collateral currency offers additional functionality to the UMA protocol and increases the range of contracts that can be built.

## Technical Specification

To accomplish this upgrade, the following changes need to be made:

-   The Bankless DAO (BANK) **[token address](https://etherscan.io/address/0x2d94aa3e47d9d5024503ca8491fce9a2fb4da198) 0x2d94aa3e47d9d5024503ca8491fce9a2fb4da198** needs to be added to the collateral currency whitelist introduced in UMIP-8.
-   A final fee of **5500 BANK** needs to be added for **token** in the Store contract.

## Implementation


This change has no implementations other than the aforementioned governor transactions

## Security considerations

Adding a collateral currency introduces a level of risk into the UMA Ecosystem.  This collateral type should be monitored to ensure that the proposed collateral continues to have value.

Contract deployers considering using this collateral in an UMA contract should refer to the [guidelines on collateral type usage](https://docs.umaproject.org/uma-tokenholders/guidence-on-collateral-currency-addition) to ensure appropriate use.



UMIP-115

-   **UMIP title:** Add **BPRO** as collateral currency 
-   **Author**  yaron@bprotocol.org
-   **Status: Last call**
-   **Created:**  7.7.2021
-   **Discourse Link:**  https://discourse.umaproject.org/t/add-bpro-as-approved-collateral/1236

## Summary

This UMIP proposes adding **BPRO** for use as collateral in UMA contracts.

## Motivation

The addition of this collateral currency offers additional functionality to the UMA protocol and increases the range of contracts that can be built.

## Technical Specification

To accomplish this upgrade, the following changes need to be made:

-   The **BPRO** address **[0xbbbbbbb5aa847a2003fbc6b5c16df0bd1e725f61](https://etherscan.io/token/0xbbbbbbb5aa847a2003fbc6b5c16df0bd1e725f61)** needs to be added to the collateral currency whitelist introduced in UMIP-8.
-   A final fee of **200 BPRO** needs to be added for **BPRO** in the Store contract.
    

## Rationale

This store fee was chosen as it is approximately equivalent to $400 in line with other collateral currencies as determined by **[coingecko price display](https://www.coingecko.com/en/coins/b-protocol)**

## Implementation


This change has no implementations other than the aforementioned governor transactions

## Security considerations

Adding a collateral currency introduces a level of risk into the UMA Ecosystem.  This collateral type should be monitored to ensure that the proposed collateral continues to have value.

Contract deployers considering using this collateral in an UMA contract should refer to the [guidelines on collateral type usage](https://docs.umaproject.org/uma-tokenholders/guidence-on-collateral-currency-addition) to ensure appropriate use.


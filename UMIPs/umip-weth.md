**UMIP #**  - tbd

-   **UMIP title:** Add WETH as collateral currency on Optimism
-   **Author:**  John Shutt (john@umaproject.org)
-   **Status:** Draft
-   **Created:**  September 11, 2022
-   **Discourse Link:**  https://discourse.umaproject.org/t/add-weth-as-collateral-currency-on-optimism/1803

## Summary (2-5 sentences)

This UMIP proposes adding WETH for use as collateral in UMA contracts on Optimism.

## Motivation

WETH is already approved as a collateral currency within UMA's system but has not been approved on Optimism. This UMIP will correct that.

## Technical Specification

To accomplish this upgrade, the following changes need to be made:

-   The Optimism **WETH** address **[0x4200000000000000000000000000000000000006](https://optimistic.etherscan.io/token/0x4200000000000000000000000000000000000006)** needs to be added to the collateral currency whitelist introduced in UMIP-8.
-   A final fee of **0.35** needs to be added for **WETH** in the Store contract.
    

## Rationale

This store fee matches the fee for WETH on mainnet.

## Implementation

This change has no implementations other than the aforementioned governor transactions.

## Security considerations

Adding a collateral currency introduces a level of risk into the UMA Ecosystem.  This collateral type should be monitored to ensure that the proposed collateral continues to have value.

Contract deployers considering using this collateral in an UMA contract should refer to the [guidelines on collateral type usage](https://docs.umaproject.org/uma-tokenholders/guidence-on-collateral-currency-addition) to ensure appropriate use.


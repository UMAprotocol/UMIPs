## Status

Draft

## Summary

This UPP proposes adding WETH for use as collateral in UMA contracts on Optimism.

## Rationale

WETH is already approved as a collateral currency within UMA's system but has not been approved on Optimism. This UPP will correct that.

## Specifics

To accomplish this upgrade, the following changes need to be made:

-   The Optimism **WETH** address **[0x4200000000000000000000000000000000000006](https://optimistic.etherscan.io/token/0x4200000000000000000000000000000000000006)** needs to be added to the collateral currency whitelist introduced in UMIP-8.
-   A final fee of **0.35** needs to be added for **WETH** in the Store contract on Optimism.

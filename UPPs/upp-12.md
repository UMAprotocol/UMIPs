## Status

Last Call

## Summary

This UPP proposes to update the final fee for WETH on Optimism.

## Rationale

UPP-11 registered WETH on Optimism with a proposed final fee of `0.35` WETH. Mistakingly the final fee was actually set to 0.35 * 10^18 instead. This UPP is proposed to correct the Optimism WETH final fee.

## Specifics

To accomplish this upgrade, the following changes need to be made:

-   The final fee for Optimism **WETH** **[0x4200000000000000000000000000000000000006](https://optimistic.etherscan.io/token/0x4200000000000000000000000000000000000006)** needs to be updated to **0.35** in the Store contract on Optimism.
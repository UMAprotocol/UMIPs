## Status

Draft

## Summary

This UPP will increase the final fees for DAI and WETH to be around $200. This will increase the cost of initiating disputes for the DVM. The renBTC fee is already 0.018, which is close to the target of $200, so it should not need to be changed.

## Rationale

It is extremely expensive, in terms of gas, for the DVM voters to vote on a price request. The DVM also pays out a relatively large number of rewards on each vote.
To ensure that price requests remain rare, they need to be more expensive to discourage any sort of purposeful triggering.

While this does make the capital requirements for liquidators and disputers higher, the increased size of the final fee lockup is unlikely to deter honest participants.

## Specifics

The WETH final fee will be increased to 0.5 WETH.
The DAI final fee will be increased to 200 DAI.
The renBTC final fee will remain 0.018 renBTC.

## Status

Draft

## Summary

This UPP will increase the final fees for DAI, WETH, and renBTC to be around $400. This will increase the cost of initiating disputes for the DVM.

## Rationale

It is extremely expensive, in terms of gas, for the DVM voters to vote on a price request. The DVM also pays out a relatively large number of rewards on each vote.
To ensure that price requests remain rare, they need to be more expensive to discourage any sort of purposeful triggering.

While this does make the capital requirements for liquidators and disputers higher, the increased size of the final fee lockup is unlikely to deter honest participants.

## Specifics

The WETH final fee will be increased to 1 WETH.
The DAI final fee will be increased to 400 DAI.
The renBTC final fee will be changed to 0.035 renBTC.

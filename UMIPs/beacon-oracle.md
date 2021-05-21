## Headers
| UMIP-XX     |                                                                                                                                          |
|------------|------------------------------------------------------------------------------------------------------------------------------------------|
| UMIP Title | Register Beacon Oracle              |
| Authors    | Nick Pai (nick@umaproject.org) |
| Status     | Draft                                                                                                                                    |
| Created    | May 21, 2021                                                                                                                           |

## Summary (2-5 sentences)
This UMIP will have the effect of introducing a new "beacon" oracle contract that will allow communication of price request data across EVM networks. There are two types of beacon oracles: the `SinkOracle` and the `SourceOracle`, deployed on L2 and L1 respectively.

## Motivation
The security of the DVM depends on UMA token holders voting on mainnet, rendering any price resolutions on mainnet as the final "source of truth". Therefore, any non-mainnet EVM network that wants to either submit or resolve price requests must be able to communicate with the mainnet DVM. 

## Implementation
We have implemented and deployed a [trusted bridge system](https://chainbridge.chainsafe.io/) on other EVM networks so that registered contracts, like `OptimisticOracles`, can submit price requests to "beacon" oracles that will ultimately relay the requests to mainnet via off-chain relayers. The bridge contract system was conceived by Chainbridge and has been cloned into the `UMAprotocol/protocol` repository [here](https://github.com/UMAprotocol/protocol/tree/master/packages/core/contracts/chainbridge).

There are no DVMs (`Voting.sol` contracts) deployed to L2; instead we deploy a "beacon" contract called a [`SinkOracle`](https://github.com/UMAprotocol/protocol/blob/master/packages/core/contracts/chainbridge/SinkOracle.sol). The purpose of the `SinkOracle` is to receive price resolution data from the DVM on L1, and it can also send price requests to the DVM. A corresponding `SourceOracle` is deployed on L1 that parses price request information before communicating directly with the DVM. Generally, price resolution data flows from `SourceOracle` to `SinkOracle`, while price requests are bubbled up from the `SinkOracle` to the `SourceOracle`.

The relationship between `SinkOracle` and `SourceOracle` is "N-to-1":
- We anticipate that there will be 1 `SourceOracle` deployed to mainnet, and 1 `SinkOracle` deployed to each L2 network that needs to securely obtain prices from L1.
- Each `SinkOracle` will have a unique `chainId` that it will submit with price requests to the `SourceOracle`. This effectively enables a unique communication channel between each `SinkOracle` and the 1 `SourceOracle`.

## Technical Example: bridging a price request from L2 to L1: 
- If an `OptimisticOracle` on L2 makes a price request, it will send it to the `SinkOracle`, which will submit a "deposit" to the `Bridge` contract on L2 that will emit a "Deposit" event containing the price request metadata if the deposit is successful. A trusted off-chain "relayer" will detect this "Deposit" event and submit a "deposit" to the `Bridge` contract on L1 with the same price request metadata. The L1 `Bridge` now has the price request information it needs to pass on to the DVM to submit a normal price request.
- The `Bridge` passes the price request data to a "beacon" oracle called a `SourceOracle` which makes note of the L2 that submitted the request, before submitting a price request to the DVM.
- Once the DVM resolves the price request, anyone can "publish" the result to the `SourceOracle` and specify which L2 it should communicate the resolved price to. This call simply queries the DVM for the price resolved and copies it to the `SourceOracle`, and therefore it cannot publish a different price than the one resolved.
- On this same publish call, the `SourceOracle` submits a "deposit" to the `Bridge` and will emit a "Deposit" event containing price resolution metadata if the deposit is successful. Again, a trusted off-chain "relayer" will detect the "Deposit" event and submit a deposit to the `Bridge` contract on L2 with the resolved price metadata.
- The `Bridge` on L2 will finally publish the resolved price to the `SinkOracle`, which means that the `OptimisticOracle` on L2 can now fetch a DVM-resolved price.

## Technical Specification
To accomplish this upgrade, one governance action must be taken:
- The `SourceOracle` will need to be registered with the `Registry` so that it can make price requests to the DVM.
- The currently deployed `SourceOracle` can be found [here](https://etherscan.io/address/0x3811A29571c9912f15fEFF0747d2F34Aa48f6721).

## Rationale
As described in the "Technical Example" section, the `SourceOracle` needs to be able to submit price requests to the DVM and only registered contracts in the `Registry` can do this.

## Security considerations
Please see the individual PRs below for details on how each affects the security of the UMA ecosystem. This repo is undergoing audit, and the final audit report will be added here once complete. We are comfortable deploying and using these contracts before the audit is complete because the off-chain relayer is trusted.

The main security risk introduced is that the off-chain relayer has the power to:
- modify price request data before sending from L2 to L1
- modify price resolution data before sending from L1 to L2
- submit spam price requests to the DVM on L1 by calling `Bridge.deposit`

The secondary security risk is that anyone can trigger spam "Deposit" events and induce unneccessary relayer actions by:
- calling `SourceOracle.publishPrice` repeatedly. This method can be called an unlimited amount of times so that if a publish process fails for any reason on L2, then the L1 caller can restart the process. We are still considering constraining the amount of times this method can be called.
- calling `SinkOracle.requestPrice` repeatedly. This method will revert only after a price is published from L1 to the `SinkOracle`.
- The reason why we enable this right now is so as a fallback measure in case a cross-network communication fails on the second leg for some reason, and we need to restart the process beginning from emitting a "Deposit" event.

Notably, the ChainBridge system enables the relayer system to eventually grow into a more decentralized federation of trusted relayers.

Relevant pull requests:
- Adding the `Bridge` contract: [PR](https://github.com/UMAprotocol/protocol/pull/2894)
- Adding the beacon contracts: [PR](https://github.com/UMAprotocol/protocol/pull/2903)
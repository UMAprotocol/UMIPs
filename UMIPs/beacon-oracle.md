## Headers
| UMIP-XX     |                                                                                                                                          |
|------------|------------------------------------------------------------------------------------------------------------------------------------------|
| UMIP Title | Configure Cross Chain Oracle Bridge              |
| Authors    | Nick Pai (nick@umaproject.org) |
| Status     | Draft                                                                                                                                    |
| Created    | May 21, 2021                                                                                                                           |

## Summary (2-5 sentences)
This UMIP will have the effect of introducing a new "beacon" oracle contract that will allow communication of price request data across EVM-compatible networks. There are two types of beacon oracles: the `SinkOracle` and the `SourceOracle`, deployed on L2 and L1 respectively.

The oracle contracts use Chainbridge to send messages between different chains. In particular, DVM price requests are passed from a `SinkOracle` on L2 to the `SourceOracle` on L1, which communicates with the DVM and resolves the price request via the standard mechanism. Once resolved, the price is pushed back to the `SinkOracle` chain where it can be utilized. This allows UMA financial contracts to be deployed in multiple different chains but still use the Ethereum mainnet DVM to resolve prices as required.

The cross-chain infrastructure also includes contracts that pass governance proposals from the `Governor` contract on L1 to a `SinkGovernor` on L2. Governance proposals are similarly sent through the Chainbridge message bridge.

## Motivation
The security of the DVM depends on UMA token holders voting on mainnet, rendering any price resolutions on mainnet as the final "source of truth". Therefore, any non-mainnet EVM network that wants to either submit or resolve price requests must be able to communicate with the mainnet DVM. 

## Implementation
We have implemented and deployed a [trusted bridge system](https://chainbridge.chainsafe.io/) on other EVM networks so that registered contracts, like `OptimisticOracles`, can submit price requests to "beacon" oracles that will ultimately relay the requests to mainnet via off-chain relayers. The bridge contract system was conceived by Chainbridge and has been cloned into the `UMAprotocol/protocol` repository [here](https://github.com/UMAprotocol/protocol/tree/master/packages/core/contracts/chainbridge).

There are no DVMs (`Voting.sol` contracts) deployed to L2; instead we deploy a "beacon" contract called a [`SinkOracle`](https://github.com/UMAprotocol/protocol/blob/master/packages/core/contracts/chainbridge/SinkOracle.sol). The purpose of the `SinkOracle` is to send price requests to the L1 DVM and receive corresponding price resolution data from the L1 DVM. A corresponding `SourceOracle` is deployed on L1 that parses price request information before communicating directly with the DVM. Generally, price resolution data flows from `SourceOracle` to `SinkOracle`, while price requests are bubbled up from the `SinkOracle` to the `SourceOracle`.

The relationship between `SinkOracle` and `SourceOracle` is "N-to-1":
- We anticipate that there will be 1 `SourceOracle` deployed to mainnet, and 1 `SinkOracle` deployed to each L2 network that needs to securely obtain prices from L1.
- Each `SinkOracle` will have a unique `chainId` that it will submit with price requests to the `SourceOracle`. This effectively enables a unique communication channel between each `SinkOracle` and the 1 `SourceOracle`.

## Technical Example: bridging a price request from L2 to L1: 
- If an `OptimisticOracle` on L2 makes a price request, it will send it to the `SinkOracle`, which will submit a "deposit" to the `Bridge` contract on L2 that will emit a "Deposit" event containing the price request metadata if the deposit is successful. A trusted off-chain "relayer" will detect this "Deposit" event and submit a "deposit" to the `Bridge` contract on L1 with the same price request metadata. The L1 `Bridge` now has the price request information it needs to pass on to the DVM to submit a normal price request.
- The `Bridge` passes the price request data to the `SourceOracle` which makes note of the L2 that submitted the request, before submitting a price request to the DVM.
- Once the DVM resolves the price request, anyone can "publish" the result to the `SourceOracle` and specify which L2 it should communicate the resolved price to. This call simply queries the DVM for the price resolved and copies it to the `SourceOracle`, and therefore it cannot publish a different price than the one resolved.
- On this same publish call, the `SourceOracle` submits a "deposit" to the `Bridge` and will emit a "Deposit" event containing price resolution metadata if the deposit is successful. Again, a trusted off-chain "relayer" will detect the "Deposit" event and submit a deposit to the `Bridge` contract on L2 with the resolved price metadata.
- The `Bridge` on L2 will finally publish the resolved price to the `SinkOracle`, which means that the `OptimisticOracle` on L2 can now fetch a DVM-resolved price.

## Technical Specification
To accomplish this upgrade, three governance actions must be taken:
- The `SourceOracle` will need to be registered with the `Registry` so that it can make price requests to the DVM. The currently deployed `SourceOracle` can be found [here](https://etherscan.io/address/0xa37001be797637bb27f88f079607db2fdf264c24).
- The `Bridge` contract address [here](https://etherscan.io/address/0xBA26bC014c4c889431826C123492861e886408b9) will need to be added to the `Finder` under the name "Bridge". This is how the `SourceOracle` will know which contract to call in order to relay messages to L2.
- The `GenericHandler` contract address [here](https://etherscan.io/address/0x60E6140330F8FE31e785190F39C1B5e5e833c2a9) will need to be added to the `Finder` under the name "GenericHandler". This contract is a required middle layer for use by the `Bridge` to relay messages from L2 to the `SourceOracle`.

## Rationale
As described in the "Technical Example" section, the `SourceOracle` needs to be able to submit price requests to the DVM and only registered contracts in the `Registry` can do this.

## Security considerations
Please see the individual PRs below for details on how each affects the security of the UMA ecosystem. This repo is undergoing audit, and the final audit report will be added here once complete. We are comfortable deploying and using these contracts before the audit is complete because the off-chain relayer is trusted.

The main security risk introduced is that the off-chain relayer has the power to:
- modify price request data before sending from L2 to L1
- modify price resolution data before sending from L1 to L2
- submit spam price requests to the DVM on L1 by calling `Bridge.deposit`
- submit false price resolutions to L2 that did not originate from an L1 price resolution.
- modify governance proposals before sending from L1 to L2

Notably, the ChainBridge system enables the relayer system to eventually grow into a more decentralized federation of trusted relayers, but we anticipate the relayer set to be small to bootstrap the system.

Relevant pull requests:
- Adding the `Bridge` contract: [PR](https://github.com/UMAprotocol/protocol/pull/2894)
- Adding the beacon contracts: [PR](https://github.com/UMAprotocol/protocol/pull/2903)
- Adding cross chain governor conracts: [PR](https://github.com/UMAprotocol/protocol/pull/2969)
- Patching the beacon contracts to prevent spam `Deposit` events: [PR](https://github.com/UMAprotocol/protocol/pull/3032)
- Responding to OpenZeppelin audit on beacon oracle contracts: [PR](https://github.com/UMAprotocol/protocol/pull/3037)
## Headers
| UMIP-115    |                                                                                                                                          |
|------------|------------------------------------------------------------------------------------------------------------------------------------------|
| UMIP Title | Register Polygon Oracle Root Tunnel             |
| Authors    | Nick Pai (nick@umaproject.org) |
| Status     | Draft                                                                                                                                    |
| Created    | July 8, 2021                                                                                                                           |

## Summary (2-5 sentences)
This UMIP will have the effect of registering an oracle root tunnel contract that will enable the optimistic oracle deployed on Polygon to make cross-chain price requests to the DVM on mainnet Ethereum.

## Motivation
[This document](https://github.com/UMAprotocol/protocol/blob/master/packages/core/contracts/polygon/README.md) describes a two way tunnel architecture that is built on top of the [canonical state transfer mechanism](https://docs.matic.network/docs/develop/l1-l2-communication/state-transfer) between Polygon and Ethereum. Data is sent between the networks through the tunnel using the same public infrastructure that you use to deposit ERC20 tokens from Ethereum to Polygon and vice versa. The only trusted third parties are the Polygon validators.

In order for price requests to be relayed from Polygon to Ethereum, there must be a "root tunnel" contract deployed to Ethereum which can make price requests to the DVM. This UMIP registers such a contract.

Note that this "root tunnel" contains reference to a "child tunnel" deployed on Polygon, whose address can only be set once. This means that the "root tunnel" will only relay price requests originated from its `fxChildTunnel()` return value.

## Technical Specification
To accomplish this upgrade, the following actions need to be taken:
- The `OracleRootTunnel` will need to be registered with the `Registry` so that it can make requests to the DVM.

## Rationale
Currently, the optimistic oracle deployed on Polygon can make price requests to the "child tunnel" oracle on Polygon, but the child tunnel cannot relay price requests to the DVM via the root tunnel, which is unregistered. This was intended to enable developers to test out their optimistic oracle integrations on Polygon.

This UMIP will productionize the optimistic oracle infrastructure on Polygon and secure it by the canonical DVM on Ethereum.

## Implementation

The Polygon tunnel contract implementations can be found [here](https://github.com/UMAprotocol/protocol/tree/master/packages/core/contracts/polygon) and they have been audited (relevant audit response PR can be found in following section). Note that the directory contains Governor tunnel contracts as well, which are built on the same state transfer mechanism as the oracle tunnel. There are no governance actions neccessary at this time involving the governor tunnel contracts, but they are deployed to both Mainnet and Polygon and will enable UMA voters on Ethereum to execute governance actions on Polygon.

The following PR's implemented the contract:
- [Introduce Polygon Oracle tunnel architecture](https://github.com/UMAprotocol/protocol/pull/3054)
- [Added unit tests to tunnel contracts](https://github.com/UMAprotocol/protocol/pull/3082)
- [Add Governor tunnel achitecture and unit tests](https://github.com/UMAprotocol/protocol/pull/3089)
- [Small changes made to contracts after integration testing](https://github.com/UMAprotocol/protocol/pull/3092)
- [Response to audit on all Polygon tunnel contracts](https://github.com/UMAprotocol/protocol/pull/3188)
- [Response to audit of PR's #3089 and #3188](https://github.com/UMAprotocol/protocol/pull/3208)

Contract addresses can be found here:
- [OracleRootTunnel](https://etherscan.io/address/0xe7b0d6a9943bb8cd8cd323368450ad74474bb1b7#code)
- [OracleChildTunnel](https://polygonscan.com/address/0x7f08B770E52e80ad418A90038FbcDf10DC7CD62F#code)
- [GovernorRootTunnel](https://etherscan.io/address/0x4F490F4835B3693A8874aee87D7CC242c25DCCAf#code)
- [GovernorChildTunnel](https://polygonscan.com/address/0xb4AeaD497FCbEAA3C37919032d42C29682f46376#code)

## Security considerations
Please see the individual PRs for details on how each affects the security of the UMA ecosystem. This repo has been audited by OpenZeppelin and the audit feedback can be found in this [PR](https://github.com/UMAprotocol/protocol/pull/3188) specifically in the section on PRs #3054, #3082, and #3092.

This tunnel system relies on the [Polygon consensus mechanism](https://docs.matic.network/docs/home/architecture/security-models/#proof-of-stake-security) secured by validators in a Proof of Stake system. The validator set enforces the integrity of data passed between networks (i.e. downstream users need to trust that the validators are not modifying the arbitrary messages that are being sent between networks).

Moreover, downstream users also rely on off-chain actors to relay messages in a timely fashion. Historically messages are sent once per hour.

More details about the tunnel can be found [here](https://github.com/UMAprotocol/protocol/tree/master/packages/core/contracts/polygon#readme).

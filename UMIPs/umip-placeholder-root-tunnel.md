## Headers
| UMIP-PLACEHOLDER    |                                                                                                                                          |
|------------|------------------------------------------------------------------------------------------------------------------------------------------|
| UMIP Title | Upgrade Polygon Oracle Root Tunnel             |
| Authors    | Nick Pai (nick@umaproject.org) |
| Status     | Draft                                                                                                                                    |
| Created    | March 28, 2022                                                                                                                           |

## Summary (2-5 sentences)
This UMIP will have the effect of upgrading the oracle root tunnel contract that will enable the optimistic oracle deployed on Polygon to make cross-chain price requests to the DVM on mainnet Ethereum.

## Motivation
The utility of the oracle root tunnel system is described in [UMIP-113](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-113.md) and the explanation still holds true.

The motivation for upgrading the `OracleRootTunnel` is out of necessity. Polygon changed the `FxBaseRootTunnel` implementation in September 2021 to be able to accept proofs generated on type 1 (i.e. EIP1559/London) transactions submitted on the Polygon network. 

The reason why this contract bug took so long to be unearthed was that there was no type 1 price request sent from Polygon to Mainnet until [March 27th](https://polygonscan.com/tx/0xc1890ef479579b0da6daeb67ec2522f0e865d2f977096980a98ca38c13526c94). A proof for this transaction can be generated at this [Polygon proof API endpoint](https://apis.matic.network/api/v1/matic/exit-payload/0xc1890ef479579b0da6daeb67ec2522f0e865d2f977096980a98ca38c13526c94?eventSignature=0x8c5261668696ce22758910d05bab8f186d6eb247ceac2af2e82c7dc17669b036), but it cannot be submitted to the current `OracleRootTunnel` [here](0xe7b0d6a9943bb8cd8cd323368450ad74474bb1b7).

 As described in UMIP-113, in order to send a message from Polygon to Ethereum, a transaction on Polygon must be executed that emits a `MessageSent` event. Once the Polygon block containing the transaction that emitted this event is included on Ethereum, it can be relayed to its target on Ethereum. In order to relay it, a proof must be constructed off-chain that alleges that the `MessageSent` event was included in a block that was checkpointed to Ethereum. The logic that validates this proof is contained in the `OracleRootTunnel` contract, and specifically in the base `FxBaseRootTunnel` contract. This proof-validation logic needs to be upgraded to handle proofs constructed on type 1 transactions.

## Technical Specification
To accomplish this upgrade, the following actions need to be taken:
- The newly deployed `OracleRootTunnel` will need to be registered with the `Registry` so that it can make requests to the DVM.

## Rationale
This UMIP will enable type 1 transactions on Polygon to be able to relay messages to Ethereum, which is critical for Polygon price requests to be able to be secured by the Ethereum DVM.

## Implementation

The changes to the root tunnel contract can be found [here](https://github.com/UMAprotocol/protocol/pull/3863) and they have not been audited. 

Contract addresses can be found here:
- [OracleRootTunnel](https://etherscan.io/address/0x34dF79AB1F3Cb70445834e71D725f83A6d3e03eb)

## Security considerations
Please see the individual PRs for details on how each affects the security of the UMA ecosystem. 

As stated in UMIP-113, this tunnel system relies on the [Polygon consensus mechanism](https://docs.polygon.technology/docs/home/architecture/security-models#proof-of-stake-security) secured by validators in a Proof of Stake system. The validator set enforces the integrity of data passed between networks (i.e. downstream users need to trust that the validators are not modifying the arbitrary messages that are being sent between networks).

Moreover, downstream users also rely on off-chain actors to relay messages in a timely fashion. Historically messages are sent once per hour.

More details about the tunnel can be found [here](https://github.com/UMAprotocol/protocol/tree/master/packages/core/contracts/polygon#readme).
## Headers
| UMIP-PLACEHOLDER    |                                                                                                                                          |
|------------|------------------------------------------------------------------------------------------------------------------------------------------|
| UMIP Title | Upgrade Polygon Root Tunnel System            |
| Authors    | Nick Pai (nick@umaproject.org) |
| Status     | Draft                                                                                                                                    |
| Created    | March 28, 2022                                                                                                                           |

## Summary (2-5 sentences)
This UMIP will have the effect of upgrading the oracle root tunnel contract that will enable the optimistic oracle deployed on Polygon to make cross-chain price requests to the DVM on mainnet Ethereum. `OracleRootTunnel`s are permanently linked to `OracleChildTunnel`s deployed on Polygon so this UMIP will atomically set up a new `OracleChildTunnel` on Polygon by setting it as the "Oracle" in the Polygon `Finder`, and register the linked `OracleRootTunnel` on Ethereum to make price requests to the DVM.

## Motivation
The utility of the oracle root tunnel system is described in [UMIP-113](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-113.md) and the explanation still holds true.

The motivation for upgrading the `OracleRootTunnel` is out of necessity. Polygon changed the `FxBaseRootTunnel` implementation in September 2021 to be able to accept proofs generated on type 2 (i.e. EIP1559/London) transactions submitted on the Polygon network. 

The `OracleChildTunnel` contract implementation will not be changed and it just needs to be redeployed on Polygon and the Finder needs to point to this newly deployed contract as the "Oracle".

The reason why this contract bug took so long to be unearthed was that there was no type 2 price request sent from Polygon to Mainnet until [March 27th](https://polygonscan.com/tx/0xc1890ef479579b0da6daeb67ec2522f0e865d2f977096980a98ca38c13526c94). A proof for this transaction can be generated at this [Polygon proof API endpoint](https://apis.matic.network/api/v1/matic/exit-payload/0xc1890ef479579b0da6daeb67ec2522f0e865d2f977096980a98ca38c13526c94?eventSignature=0x8c5261668696ce22758910d05bab8f186d6eb247ceac2af2e82c7dc17669b036), but it cannot be submitted to the current `OracleRootTunnel` [here](0xe7b0d6a9943bb8cd8cd323368450ad74474bb1b7).

 As described in UMIP-113, in order to send a message from Polygon to Ethereum, a transaction on Polygon must be executed that emits a `MessageSent` event. Once the Polygon block containing the transaction that emitted this event is included on Ethereum, it can be relayed to its target on Ethereum. In order to relay it, a proof must be constructed off-chain that alleges that the `MessageSent` event was included in a block that was checkpointed to Ethereum. The logic that validates this proof is contained in the `OracleRootTunnel` contract, and specifically in the base `FxBaseRootTunnel` contract. This proof-validation logic needs to be upgraded to handle proofs constructed on type 2 transactions.

## Technical Specification
To accomplish this upgrade, the following actions need to be taken:
- The newly deployed `OracleRootTunnel` on Ethereum will need to be registered with the `Registry` so that it can make requests to the DVM.
- The newly deployed `OracleChildTunnel` will need to be set as the "Oracle" in hex (i.e. `0x4f7261636c65`) in the Polygon `Finder`. The specific function data that needs to be sent to Polygon is `polygonFinder.changeImplementationAddress(0x4f7261636c65, newOracleChildTunnelAddress)` so that the `OptimisticOracle` on Polygon can fetch price resolution data through the new child tunnel.

## Rationale
This UMIP will enable type 2 transactions on Polygon to be able to relay messages to Ethereum, which is critical for Polygon price requests to be able to be secured by the Ethereum DVM.

## Implementation

The changes to the root tunnel contract can be found [here](https://github.com/UMAprotocol/protocol/pull/3863) and they have not been audited. The reason why I believe an audit is not necessary is because the only changed part of the contract is
the logic imported from the polygon [`fx-portal` repo](https://github.com/fx-portal/contracts/blob/baed24d22178201bca33140c303e0925661ec0ac/contracts/tunnel/FxBaseRootTunnel.sol). This is external code that was also not
audited as part of [UMIP-113](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-113.md).

In an ideal world we would like to have audited the polygon fx-portal contracts ourselves but this is outside the scope
of our usual auditing responsibility. We treat these contracts the same as other imported contracts that we rely on
such as the `openzeppelin` contracts. 

N.B. it does appear that the [`fx-portal`](https://github.com/fx-portal/contracts/tree/baed24d22178201bca33140c303e0925661ec0ac#fx-portalflexible-portal) contracts has a Halborn audit but the link is broken
currently.

Contract addresses can be found here:
- [OracleRootTunnel](https://etherscan.io/address/0x34dF79AB1F3Cb70445834e71D725f83A6d3e03eb)
- [OracleChildTunnel](https://polygonscan.com/address/0xbed4c1fc0fd95a2020ec351379b22d8582b904e3)

## Security considerations
Please see the individual PRs for details on how each affects the security of the UMA ecosystem. 

As stated in UMIP-113, this tunnel system relies on the [Polygon consensus mechanism](https://docs.polygon.technology/docs/home/architecture/security-models#proof-of-stake-security) secured by validators in a Proof of Stake system. The validator set enforces the integrity of data passed between networks (i.e. downstream users need to trust that the validators are not modifying the arbitrary messages that are being sent between networks).

Moreover, downstream users also rely on off-chain actors to relay messages in a timely fashion. Historically messages are sent once per hour.

More details about the tunnel can be found [here](https://github.com/UMAprotocol/protocol/tree/master/packages/core/contracts/polygon#readme).
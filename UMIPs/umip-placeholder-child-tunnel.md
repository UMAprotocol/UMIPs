## Headers
| UMIP-PLACEHOLDER    |                                                                                                                                          |
|------------|------------------------------------------------------------------------------------------------------------------------------------------|
| UMIP Title | Upgrade Polygon Oracle Child Tunnel             |
| Authors    | Nick Pai (nick@umaproject.org) |
| Status     | Draft                                                                                                                                    |
| Created    | March 28, 2022                                                                                                                           |

## Summary (2-5 sentences)
This UMIP is a companion to [TODO]() which would upgrade the `OracleRootTunnel` on Mainnet in order to bridge price requests from Ethereum to Polygon and back. `OracleRootTunnel`s are permanently linked to `OracleChildTunnel`s deployed on Polygon so this UMIP simply deploys a new `OracleChildTunnel` on Polygon and sets it as the "Oracle" in the Polygon `Finder`.

## Motivation
The utility of the oracle root + child tunnel system is described in [UMIP-113](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-113.md) and the explanation still holds true.

See [here](TODO) for details on why upgrading the `OracleRootTunnel` is necessary for the Polygon `OptimisticOracle` system to continue functioning.

The `OracleChildTunnel` contract implementation will not be changed and it just needs to be redeployed on Polygon and the Finder needs to point to this newly deployed contract as the "Oracle".

## Technical Specification
To accomplish this upgrade, the following actions need to be taken:
- The newly deployed `OracleChildTunnel` will need to be set as the "Oracle" in hex (i.e. `0x4f7261636c65`) in the Polygon `Finder`. The specific function data that needs to be sent to Polygon is `polygonFinder.changeImplementationAddress(0x4f7261636c65, newOracleChildTunnelAddress)` so that the `OptimisticOracle` on Polygon can fetch price resolution data through the new child tunnel.

## Rationale
This UMIP will enable type 1 transactions on Polygon to be able to relay messages to Ethereum, which is critical for Polygon price requests to be able to be secured by the Ethereum DVM.

## Implementation

The changes to the root tunnel contract can be found [here](https://github.com/UMAprotocol/protocol/pull/3863) and they have not been audited. The child tunnel is not changed.

Contract addresses can be found here:
- [OracleChildTunnel](https://polygonscan.com/address/0xbed4c1fc0fd95a2020ec351379b22d8582b904e3)

## Security considerations
Please see the individual PRs for details on how each affects the security of the UMA ecosystem. 

As stated in UMIP-113, this tunnel system relies on the [Polygon consensus mechanism](https://docs.polygon.technology/docs/home/architecture/security-models#proof-of-stake-security) secured by validators in a Proof of Stake system. The validator set enforces the integrity of data passed between networks (i.e. downstream users need to trust that the validators are not modifying the arbitrary messages that are being sent between networks).

Moreover, downstream users also rely on off-chain actors to relay messages in a timely fashion. Historically messages are sent once per hour.

More details about the tunnel can be found [here](https://github.com/UMAprotocol/protocol/tree/master/packages/core/contracts/polygon#readme).
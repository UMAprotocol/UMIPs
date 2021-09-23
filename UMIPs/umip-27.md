## Headers
| UMIP-27    |                                                                                                                                          |
|------------|------------------------------------------------------------------------------------------------------------------------------------------|
| UMIP Title | Approve Patched EMP Financial Contract Template              |
| Authors    | Matt Rice (matt@umaproject.org) |
| Status     | Approved                                                                                                                             |
| Created    | December 14, 2020                                                                                                                           |

## Summary
This UMIP will have the effect of introducing an updated ExpiringMultiParty contract template that matches the one introduced in UMIP-14, but with [this](https://github.com/UMAprotocol/protocol/pull/2203) bug fix.

## Motivation & Rationale

This UMIP was motivated by a bug report that revealed that the liveness-reset feature introduced in UMIP-14 did not work as intended due to a reversed inequality.

## Technical Specification
To accomplish this upgrade, a new financial contract template must be deployed.

Deployment address: https://etherscan.io/address/0xB3De1e212B49e68f4a68b5993f31f63946FCA2a6.

After deployment, this new `ExpiringMutltiPartyCreator` contract should be approved as a ContractCreator in the Registry.

Note: the voters only vote for the approval -- the deployment has no effect on the protocol until added as a ContractCreator.

## Implementation

Please see this [directory](https://github.com/UMAprotocol/protocol/tree/master/core/contracts/financial-templates/expiring-multiparty). The directory contains both the [implementation](https://github.com/UMAprotocol/protocol/blob/master/core/contracts/financial-templates/expiring-multiparty/ExpiringMultiParty.sol) of the `ExpiringMultiParty` template and the [deployer contract](https://github.com/UMAprotocol/protocol/blob/master/core/contracts/financial-templates/expiring-multiparty/ExpiringMultiPartyCreator.sol) that will be registered with the DVM to allow users to deploy their own `ExpiringMultiParty` contract.

The only change included in this deployment is this PR: https://github.com/UMAprotocol/protocol/pull/2203.

## Security considerations

This patch is in the process of being audited.

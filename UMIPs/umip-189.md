| UMIP-189   |                                                                                                                         |
| ---------- | ----------------------------------------------------------------------------------------------------------------------- |
| UMIP Title | Approve new ManagedOptimisticOracleV2 Deployment                                                                        |
| Authors    | Lee Poettcker                                                                                                           |
| Created    | July 29, 2025                                                                                                           |
| Snapshot   |                                                                                                                         |
| Discussion |                                                                                                                         |

## Summary
This proposal introduces the ManagedOptimisticOracleV2, which is a modified version of the OptimisticOracleV2 intended to be deployed for a single integration. This allows the integration to have easier access to functionality already present in OptimisticOracleV2 without diminishing the role of UMA governance over the new contract. If passed, this UMIP will approve a ManagedOptimisticOracleV2 managed by Polymarket to send disputes to UMA’s Data Verification Mechanism (DVM) for UMA stakers to resolve.

## Motivation
The current OptimisticOracleV2 contract allows integrations to revise a request’s bond amount, liveness, and who can propose, but requires these changes to be made through the integration’s requesting contract. This requirement has made it more difficult for integrations to manage their requests as easily as they would like. 

The new ManagedOptimisticOracleV2 contract is designed to be used by a single integration and gives the integrator admin access to easily modify the bond, liveness, and who can propose for all of their requests.

## Technical Specification
All new oracle deployments must be given permission by the UMA DAO to send their disputes to the DVM for resolution. If this proposal passes, this would be done by the following transactions:
- Call `addMember` on the [Polygon Registry](https://polygonscan.com/address/0x5f25b1647fa8eaea0e15edd413c7afcbe613b6f4) granting the [GovernorChildTunnel](https://polygonscan.com/address/0xb4AeaD497FCbEAA3C37919032d42C29682f46376) the contract creator role.
- Call `registerContract` on the [Polygon Registry](https://polygonscan.com/address/0x5f25b1647fa8eaea0e15edd413c7afcbe613b6f4) with empty `parties` array and the new [ManagedOptimisticOracleV2](https://polygonscan.com/address/0xac60353a54873c446101216829a6a98cdbbc3f3d) as the `contractAddress`.
- Call `removeMember` on the [Polygon Registry](https://polygonscan.com/address/0x5f25b1647fa8eaea0e15edd413c7afcbe613b6f4) to remove the [GovernorChildTunnel](https://polygonscan.com/address/0xb4AeaD497FCbEAA3C37919032d42C29682f46376) contract creator role.

## Implementation
The ManagedOptimisticOracleV2 contract can be reviewed [here](https://github.com/UMAprotocol/managed-oracle/blob/master/src/optimistic-oracle-v2/implementation/ManagedOptimisticOracleV2.sol). A summary of the changes from OptimisticOracleV2 is given below.

The ManagedOptimisticOracleV2 is intended to only serve a single integration. The integrator can more easily access functionality that is already supported in OptimisticOracleV2 via two new roles:  
- **owner**: a high security address that can:
  - add and remove request managers 
  - set the default proposer whitelist which applies all new requests
  - set the requester whitelist which controls who can make requests
  - set the minimum liveness and minimum / maximum bond that the request manager can set a request to

- **requestManager**: address used more frequently to:
  - revise an unproposed request’s bond size, liveness and set the proposer whitelist 

The newly deployed ManagedOptimistOracleV2 contract to be approved by this UMIP will be upgradable via a 2/2 multisig consisting of Polymarket and Risk Labs. 

UMA DAO governance will still have all the same parameter controls it has over the standard OptimisticOracleV2 contract, such as approving new bond collaterals and price identifiers, and setting final fees for a given bond collateral. 

## Security Considerations
ManagedOptimisticOracleV2 includes minor changes to the long running and previously audited OptimisticOracleV2 contract. ManagedOptimisticOracleV2 is undergoing an internal audit that will be completed before this UMIP proceeds to an onchain vote with an OpenZeppelin audit to follow ASAP. If this UMIP passes, this contract should only be used for low risk use cases until the OpenZeppelin audit has been completed. 

## Voting
**YES**: approve the ManagedOptimisticOracleV2 at `0x2C0367a9DB231dDeBd88a94b4f6461a6e47C58B1` managed by Polymarket to send disputes to the DVM.  
**NO**: do NOT approve the ManagedOptimisticOracleV2 at `0x2C0367a9DB231dDeBd88a94b4f6461a6e47C58B1` managed by Polymarket to send disputes to the DVM.

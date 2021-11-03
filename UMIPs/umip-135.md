## Headers
| UMIP-135   |                                 |
|------------|---------------------------------|
| UMIP Title | Add Skinny Optimistic Oracle    |
| Authors    | Matt Rice (matt@umaproject.org) |
| Status     | Last Call                       |
| Created    | October 18, 2021                |

## Summary (2-5 sentences)
This UMIP will have the effect of introducing a new, slimmed down optimistic oracle contract that will allow optimistic settlement of prices with lower gas costs. This will reduce the cost for end-users of UMA's oracle infrastructure.

## Motivation
Prior to addition of this Optimistic Oracle, it could cost millions of gas to complete an Optimistic Oracle request lifecycle.

## Technical Specification
To accomplish this upgrade, a few actions will need to be taken:
- A new `SkinnyOptimisticOracle` contract has been deployed at [0x4060dba72344da74edaeeae51a71a57f7e96b6b4](https://etherscan.io/address/0x4060dba72344da74edaeeae51a71a57f7e96b6b4).
- A transaction will need to be proposed to add this new address to the `Finder` contract under the name `SkinnyOptimisticOracle`. This is how other contracts will find the optimistic oracle and reference it.
- The `SkinnyOptimisticOracle` will need to be registered with the `Registry` so that it can make requests to the DVM.

Note: this change will only add the skinny optimistic oracle. New financial contracts that utilize the optimistic oracle will need to be deployed for it to become useful. Until all steps above are performed, the deployed SkinnyOptimisticOracle _should not_ be used in production since it will not be able to raise disputes to the DVM.

## Implementation

The `SkinnyOptimisticOracle` contract can be found [here](https://github.com/UMAprotocol/protocol/blob/master/packages/core/contracts/oracle/implementation/SkinnyOptimisticOracle.sol). It is in the process of being audited. If the audit requires changes, a follow-up proposal can remove this implementation and add the updated one with little-to-no risk to the DVM.

The mainnet contract address:

*SkinnyOptimisticOracle* - [0x4060dba72344da74edaeeae51a71a57f7e96b6b4](https://etherscan.io/address/0x4060dba72344da74edaeeae51a71a57f7e96b6b4)


## Security considerations

The Optimistic Oracle only has the ability to send price requests to the DVM, so in the event of a serious bug, the biggest security implication would be that end-users would be able to send requests to the DVM without paying the final fee.

## Headers
| UMIP-52     |                                                                                                                                          |
|------------|------------------------------------------------------------------------------------------------------------------------------------------|
| UMIP Title | Add Optimistic Oracle              |
| Authors    | John Shutt (john@umaproject.org) |
| Status     | Draft                                                                                                                                    |
| Created    | February 16, 2021                                                                                                                           |

## Summary (2-5 sentences)
This UMIP will have the effect of introducing a new optimistic oracle contract that will allow optimistic settlement of prices and funding rates without a vote from the DVM. This will reduce the number of votes required from the DVM and is a pre-requisite for use of the new Perpetual (UMIP-53) and EMP (UMIP-54) contracts.

## Motivation
Prior to addition of the optimistic oracle, every expiring multi-party contract would require a vote from the DVM to establish a final settlement price. The optimistic oracle allows for optimistic settlement of expiring contracts with a liveness window for disputes, similar to how liquidations and withdrawals happen today. The optimistic oracle also allows for optimistic proposals of funding rates, allowing the implementation of a perpetual contract that does not expire.

## Technical Specification
To accomplish this upgrade, a few actions will need to be taken:
- A new `OptimisticOracle` contract will need to be deployed. Once deployed, the contract address will be added to this UMIP.
- A transaction will need to be proposed to add this new address to the `Finder` contract under the name `“OptimisticOracle”`. This is how other contracts will find the optimistic oracle and reference it.
- The `OptimisticOracle` will need to be registered with the `Registry` so that it can make requests to the DVM.

Note: this change will only create the optimistic oracle. New financial contracts that utilize the optimistic oracle will need to be deployed for it to become useful. Until all steps above are performed, the deployed OptimisticOracle _should not_ be used in production since it will not be able to raise disputes to the DVM.

## DVM Upgrade

- For the optimistic oracle to be compatible with the DVM, the DVM will need to be upgraded to handle ancillary data (UMIP-55).

## Rationale

This new contract allows the optimistic settlement of prices, reducing the number of DVM votes required for expiring multi-party contracts. It also allows for funding rate proposals, a pre-requisite for perpetual multi-party contracts.

## Implementation

The `OptimisticOracle` contract can be found [here](https://github.com/UMAprotocol/protocol/blob/master/packages/core/contracts/oracle/implementation/OptimisticOracle.sol). It has been audited and will require no changes.

## Security considerations
Please see the individual PRs for details on how each affects the security of the UMA ecosystem. This repo has been audited by OpenZeppelin, and the final audit report can be reviewed [here](https://blog.openzeppelin.com/uma-audit-phase-4/)

This contract introduces the idea of a DVM trial because Optimistic Oracle users don't need to be explicitly registered with the DVM. Users of the Optimistic Oracle are encouraged to pay fees to the store as approved contracts do. However, they are also able to use the Optimistic Oracle without doing so on a trial basis. Each contracts' requests are distinguished at the DVM-level so the voters _can_ choose to reject requests if contracts are abusing this trial. The voters are expected to develop a consensus off-chain about what acceptable trial usage, but user contracts should be aware that using the Optimistic Oracle without paying fees and following DVM rules will be subject them to the voters' trial terms.

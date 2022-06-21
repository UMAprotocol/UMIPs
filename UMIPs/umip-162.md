## Headers
| UMIP-162   |                                 |
|------------|---------------------------------|
| UMIP Title | Add OptimisticOracleV2          |
| Authors    | Pablo Maldonado (pablo@umaproject.org) |
| Status     | Last Call                       |
| Created    | June 21, 2022                    |

## Summary (2-5 sentences)
This UMIP will result in the creation of a new optimistic oracle contract with enhanced control over pricing request callbacks, which will only be executed if the requester has declared its readiness to receive them. This modification also eliminates the use of try-catch structures, which were vulnerable to gas griefing. Additionally, the contract includes a new event-based price request, which is suitable for requests that depend on events without a fixed date, thereby evaluating pricing requests at the time of proposal. This will enable the implementation of a more robust and adaptable price requests.

## Motivation
Prior to the addition of this Optimistic Oracle, callbacks were executed whenever they were present in the requester contract, without the ability to control when this occurred. Additionally, the use of try-catch posed a risk. Similarly, there was no price request type that could be adapted to the request requirements associated with unscheduled, spontaneous events.

## Technical Specification
To accomplish this upgrade, a few actions will need to be taken:
- A new `OptimisticOracleV2` contract has been deployed in the following networks:
    * Mainnet: [0xA0Ae6609447e57a42c51B50EAe921D701823FFAe](https://etherscan.io/address/0xA0Ae6609447e57a42c51B50EAe921D701823FFAe)
    * Polygon: [0xee3afe347d5c74317041e2618c49534daf887c24](https://polygonscan.com/address/0xee3afe347d5c74317041e2618c49534daf887c24)
    * Optimism: [0x255483434aba5a75dc60c1391bB162BCd9DE2882](https://optimistic.etherscan.io/address/0x255483434aba5a75dc60c1391bB162BCd9DE2882)
    * Arbitrum: [0x88Ad27C41AD06f01153E7Cd9b10cBEdF4616f4d5](https://arbiscan.io/address/0x88Ad27C41AD06f01153E7Cd9b10cBEdF4616f4d5)
    * Boba: [0xb2b5C1b17B19d92CC4fC1f026B2133259e3ccd41](https://blockexplorer.boba.network/address/0xb2b5C1b17B19d92CC4fC1f026B2133259e3ccd41/transactions)


- Transactions will need to be proposed to add this new addresses to the `Finder` contract under the name `OptimisticOracleV2` in each network. This is how other contracts will find the optimistic oracle and reference it.
- The `OptimisticOracleV2` will need to be registered with the `Registry` in each network so that it can make requests to the DVM.

Note: this change will only add the optimistic oracle v2 to the networks mentioned above. New financial contracts that utilize the optimistic oracle v2 will need to be deployed for it to become useful. Until all steps above are performed, the deployed OptimisticOracleV2 _should not_ be used in production since it will not be able to raise disputes to the DVM.

## Implementation

The `OptimisticOracleV2` contract can be found [here](https://github.com/UMAprotocol/protocol/tree/master/packages/core/contracts/oracle/implementation). It is in the process of being audited. If the audit requires changes, a follow-up proposal can remove this implementation and add the updated one with little-to-no risk to the DVM.

## Security considerations

The Optimistic Oracle V2 only has the ability to send price requests to the DVM, so in the event of a serious bug, the biggest security implication would be that end-users would be able to send requests to the DVM without paying the final fee.
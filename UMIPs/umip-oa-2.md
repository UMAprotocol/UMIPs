## Headers

| UMIP-172       |                                                                 |
| -------------- | --------------------------------------------------------------- |
| UMIP Title     | Update OptimisticAsserter                                       |
| Authors        | Pablo Maldonado (pablo@umaproject.org)                          |
| Status         | Approved                                                        |
| Created        | February 9, 2023                                                |
| Discourse Link | https://discourse.umaproject.org/t/add-optimistic-asserter/1905 |

## Summary (2-5 sentences)

This UMIP proposes to update the `OptimisticAsserter` to include a new parameter in the AssertionMade event. The objective of the update is to enhance the functionality of the `OptimisticAsserter` by adding this new parameter, allowing it to transmit more information about the assertions being made. The process of redeploying the `OptimisticAsserter` will involve updating its code and re-publishing it to the networks listed below.

## Motivation

The UMIP aims to improve the `OptimisticAsserter` by adding the assertion identifier to the `AssertionMade` event, thereby facilitating the tracking and management of off-chain interactions. This will improve the user experience and make it easier to manage assertion-created events, leading in a more efficient and streamlined workflow. The identifier will simplify complex event settings and ensure accurate management and recording.

## Technical Specification

To accomplish this upgrade, a few actions will need to be taken:

- A new `OptimisticAsserter` contract has been re-deployed in the following networks:

  - Mainnet: [0x1234567890abcdefghijklmonpqrstuvwxyzzzzz](https://etherscan.io/address/0x1234567890abcdefghijklmonpqrstuvwxyzzzzz)
  - Polygon: [0x1234567890abcdefghijklmonpqrstuvwxyzzzzz](https://polygonscan.com/address/0x1234567890abcdefghijklmonpqrstuvwxyzzzzz)
  - Optimism: [0x1234567890abcdefghijklmonpqrstuvwxyzzzzz](https://optimistic.etherscan.io/address/0x1234567890abcdefghijklmonpqrstuvwxyzzzzz)
  - Arbitrum: [0x1234567890abcdefghijklmonpqrstuvwxyzzzzz](https://arbiscan.io/address/0x1234567890abcdefghijklmonpqrstuvwxyzzzzz)
  - Boba: [0x1234567890abcdefghijklmonpqrstuvwxyzzzzz](https://bobascan.com/address/0x1234567890abcdefghijklmonpqrstuvwxyzzzzz)

- Transactions will need to be proposed to replace this new addresses to the `Finder` contract under the name `OptimisticAsserter` in each network. This is how other contracts will find the Optimistic Asserter and reference it.
- The new `OptimisticAsserter` will need to be registered with the `Registry` in each network so that it can make requests to the DVM.

Note: this change will only add the `OptimisticAsserter` to the networks mentioned above. New contracts that utilize the `OptimisticAsserter` will need to be deployed for it to become useful. Until all steps above are performed, the deployed `OptimisticAsserter` _should not_ be used in production since it will not be able to raise disputes to the DVM.

This [script](https://github.com/UMAprotocol/protocol/blob/master/packages/scripts/src/upgrade-tests/register-new-contract/1_Propose.ts) will generate the mainnet transactions required to register the aforementioned contracts in their respective Registry and Finder, and will include them in the UMIP proposal.

## Implementation

The `OptimisticAsserter` contract can be found [here](https://github.com/UMAprotocol/protocol/blob/master/packages/core/contracts/optimistic-asserter/implementation/OptimisticAsserter.sol). The contract has already been audited by OpenZeppelin and the audit report can be found [here](https://blog.openzeppelin.com/uma-optimistic-asserter-audit/).

The code updates necessary for this update can be found in the following pull request on GitHub: https://github.com/UMAprotocol/protocol/pull/4413.

Due to the nature of this modification, it was determined that a new audit was not necessary as the change only adds an identifier to the event and does not impact the existing functionality of the code. The update has been thoroughly reviewed and tested, and is ready for deployment.

## Security considerations

The `OptimisticAsserter` only has the ability to send price requests to the DVM, so in the event of a serious bug, the biggest security implication would be that end-users would be able to send requests to the DVM without paying the final fee.

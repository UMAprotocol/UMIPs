## Headers

| UMIP-172       |                                                                        |
| -------------- | ---------------------------------------------------------------------- |
| UMIP Title     | Update OptimisticOracleV3                                              |
| Authors        | Pablo Maldonado (pablo@umaproject.org)                                 |
| Status         | Approved                                                               |
| Created        | February 9, 2023                                                       |
| Discourse Link | https://discourse.umaproject.org/t/add-optimistic-asserter-update/1914 |

## Summary (2-5 sentences)

This UMIP proposes to rename the `OptimisticAsserter` to `OptimisticOracleV3` and to include a new argument in the AssertionMade event. The purpose of the update is to increase the functionality of the `OptimisticOracleV3` (old `OptimisticAsserter`) by introducing this additional parameter, allowing it to send more information about the assertions being made. The procedure of redeploying the `OptimisticOracleV3` will require changing its code and re-publishing it to the networks specified below.

## Motivation

In addition to renaming the `OptimisticAsserter` to `OptimisticOracleV3`, the UMIP aims to improve the `OptimisticOracleV3` by adding the assertion identifier to the `AssertionMade` event, thereby facilitating the tracking and management of off-chain interactions. This will improve the user experience and make it easier to manage assertion-created events, leading in a more efficient and streamlined workflow. The identifier will simplify complex event settings and ensure accurate management and recording.

## Technical Specification

To accomplish this upgrade, a few actions will need to be taken:

- A new `OptimisticOracleV3` contract has been re-deployed in the following networks:

  - Mainnet: [0xfb55F43fB9F48F63f9269DB7Dde3BbBe1ebDC0dE](https://etherscan.io/address/0xfb55F43fB9F48F63f9269DB7Dde3BbBe1ebDC0dE)
  - Polygon: [0x5953f2538F613E05bAED8A5AeFa8e6622467AD3D](https://polygonscan.com/address/0x5953f2538F613E05bAED8A5AeFa8e6622467AD3D)
  - Optimism: [0x072819Bb43B50E7A251c64411e7aA362ce82803B](https://optimistic.etherscan.io/address/0x072819Bb43B50E7A251c64411e7aA362ce82803B)
  - Arbitrum: [0xa6147867264374F324524E30C02C331cF28aa879](https://arbiscan.io/address/0xa6147867264374F324524E30C02C331cF28aa879)
  - Boba: [0xe1C2587C1789f7D00F22931D4DBAD537405DFe1f](https://bobascan.com/address/0xe1C2587C1789f7D00F22931D4DBAD537405DFe1f)

- Transactions will need to be proposed to add this new addresses to the `Finder` contract under the name `OptimisticOracleV3` in each network. This is how other contracts will find the optimistic oracle and reference it.
- The new `OptimisticOracleV3` will need to be registered with the `Registry` in each network so that it can make requests to the DVM.
- The old `OptimisticAsserter` contract will need to be unregistered in the `Finder` in each network. This will prevent it from being used in the future.

Note: this change will only add the `OptimisticOracleV3` to the networks mentioned above. New contracts that utilize the `OptimisticOracleV3` will need to be deployed for it to become useful. Until all steps above are performed, the deployed `OptimisticOracleV3` _should not_ be used in production since it will not be able to raise disputes to the DVM.

This [script](https://github.com/UMAprotocol/protocol/blob/master/packages/scripts/src/upgrade-tests/register-new-contract/1_Propose.ts) will generate the mainnet transactions required to register the aforementioned contracts in their respective Registry and Finder, and will include them in the UMIP proposal.

## Implementation

The `OptimisticOracleV3` contract can be found [here](https://github.com/UMAprotocol/protocol/blob/master/packages/core/contracts/optimistic-oracle-v3/implementation/OptimisticOracleV3.sol). The `OptimisticOracleV3` contract, previously known as `OptimisticAsserter`, has been audited by OpenZeppelin. The audit report can be found [here](https://blog.openzeppelin.com/uma-optimistic-asserter-audit/).

The code updates necessary for this update can be found in the following pull requests on GitHub:

- https://github.com/UMAprotocol/protocol/pull/4413
- https://github.com/UMAprotocol/protocol/pull/4440

Due to the nature of this modification, it was determined that a new audit was not necessary as the change only renames the contract to `OptimisticOracleV3` and adds an identifier to the event and does not impact the existing functionality of the code . The update has been thoroughly reviewed and tested, and is ready for deployment.

## Security considerations

The `OptimisticOracleV3` only has the ability to send price requests to the DVM, so in the event of a serious bug, the biggest security implication would be that end-users would be able to send requests to the DVM without paying the final fee.

## Headers

| UMIP-1XX   |                                        |
| ---------- | -------------------------------------- |
| UMIP Title | Add OptimisticAsserter                 |
| Authors    | Pablo Maldonado (pablo@umaproject.org) |
| Status     | Approved                               |
| Created    | January 25, 2023                       |
|Discourse Link|https://discourse.umaproject.org/t/add-optimistic-asserter/1905|

## Summary (2-5 sentences)

This UMIP proposes the introduction of the `OptimisticAsserter` contract, which allows for the assertion of truths about the world using an optimistic escalation game. The contract utilizes the UMA Data Verification Mechanism (DVM) to arbitrate disputes, and allows for the use of Escalation Managers to define their own security properties and tradeoffs.

## Motivation

The `OptimisticAsserter` is a new form of Optimisitic Oracle which existing mechanics have been streamlined in order to simplify the creation of world-truth assertions. To this end, the result of an assertion can only be true or false, and an assertion is resolved only after the liveness period has expired or, in the case of a dispute, after it has been settled in the Oracle. In addition, the `OptimisticAsserter` permits the use of Escalation Managers to provide better control and setting over the escalation game and, ultimately, to disconnect from the UMA DVM in order to arbitrate conflicts in the specified Oracle. This disconnection logic is left up to the integrating project and is disabled by default.

## Technical Specification

To accomplish this upgrade, a few actions will need to be taken:

- A new `OptimisticAsserter` contract has been deployed in the following networks:

  - Mainnet: [0xFEc7C6AA64fDD17f456028e0B411f5c3877ADa5e](https://etherscan.io/address/0xFEc7C6AA64fDD17f456028e0B411f5c3877ADa5e)
  - Polygon: [0x1a3cF7c0f99256431Fd6e8163FF8748A4aE50b6F](https://polygonscan.com/address/0x1a3cF7c0f99256431Fd6e8163FF8748A4aE50b6F)
  - Optimism: [0xCd5FE81278FEbf3a9323eFC9F68AEcCAeAE8BE2C](https://optimistic.etherscan.io/address/0xCd5FE81278FEbf3a9323eFC9F68AEcCAeAE8BE2C)
  - Arbitrum: [0x211AD7adEf4d4348408B43da49D99bA117ADD8D1](https://arbiscan.io/address/0x211AD7adEf4d4348408B43da49D99bA117ADD8D1)
  - Boba: [0x17d02b5CDb6fe2c681A447B119e9f6F5AB4E3018](https://bobascan.com/address/0x17d02b5CDb6fe2c681A447B119e9f6F5AB4E3018)

- Transactions will need to be proposed to add this new addresses to the `Finder` contract under the name `OptimisticAsserter` in each network. This is how other contracts will find the Optimistic Asserter and reference it.
- The `OptimisticAsserter` will need to be registered with the `Registry` in each network so that it can make requests to the DVM.

Note: this change will only add the `OptimisticAsserter` to the networks mentioned above. New contracts that utilize the `OptimisticAsserter` will need to be deployed for it to become useful. Until all steps above are performed, the deployed `OptimisticAsserter` _should not_ be used in production since it will not be able to raise disputes to the DVM.

This [script](https://github.com/UMAprotocol/protocol/blob/master/packages/scripts/src/upgrade-tests/register-new-contract/1_Propose.ts) will generate the mainnet transactions required to register the aforementioned contracts in their respective Registry and Finder, and will include them in the UMIP proposal.

## Implementation

The `OptimisticAsserter` contract can be found [here](https://github.com/UMAprotocol/protocol/blob/master/packages/core/contracts/optimistic-asserter/implementation/OptimisticAsserter.sol). The contract has already been audited by Open Zeppelin and the audit report can be found [here](https://blog.openzeppelin.com/uma-optimistic-asserter-audit/).

## Security considerations

The `OptimisticAsserter` only has the ability to send price requests to the DVM, so in the event of a serious bug, the biggest security implication would be that end-users would be able to send requests to the DVM without paying the final fee.

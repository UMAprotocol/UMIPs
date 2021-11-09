## Headers
| UMIP-138   |                                     |
|------------|-------------------------------------|
| UMIP Title | Upgrade Skinny Optimistic Oracle    |
| Authors    | Nick Pai (nick@umaproject.org)      |
| Status     | Last Call                           |
| Created    | November 3, 2021                    |

## Summary (2-5 sentences)
This UMIP should be viewed exactly as UMIP-135 but with an updated contract address to account for security upgrades in the `SkinnyOptimisticOracle`.

## Motivation
UMIP-135 registered a new `SkinnyOptimisticOracle` for use in the [Across](https://medium.com/across-protocol/announcing-across-protocol-the-fastest-cheapest-and-most-secure-l2-to-l1-bridge-b64c66700e59) closed beta. However, this contract was always going have to be upgraded eventually since it was deployed pre-audit. This UMIP upgrades the `SkinnyOptimisticOracle` to a contract that includes some important fixes found during an external audit with OpenZeppelin.

## Technical Specification
To accomplish this upgrade, a few actions will need to be taken:
- A new `SkinnyOptimisticOracle` contract has been deployed at [0xeE3Afe347D5C74317041E2618C49534dAf887c24](https://etherscan.io/address/0xeE3Afe347D5C74317041E2618C49534dAf887c24).
- A transaction will need to be proposed to add this new address to the `Finder` contract under the name `SkinnyOptimisticOracle`. This is how other contracts will find the optimistic oracle and reference it.
- The `SkinnyOptimisticOracle` will need to be registered with the `Registry` so that it can make requests to the DVM.

Note: this change will only add the skinny optimistic oracle. New financial contracts that utilize the optimistic oracle will need to be deployed for it to become useful. Until all steps above are performed, the deployed SkinnyOptimisticOracle _should not_ be used in production since it will not be able to raise disputes to the DVM.

## Implementation

The `SkinnyOptimisticOracle` contract can be found [here](https://github.com/UMAprotocol/protocol/blob/master/packages/core/contracts/oracle/implementation/SkinnyOptimisticOracle.sol). It has been audited and the audit report will be released soon. The changes to this contract from UMIP-135 are now described:
- `proposePriceFor` call back was incorrectly made to `msg.sender` instead of `requester`, [PR](https://github.com/UMAprotocol/protocol/pull/3531). 
- `bond` amount in `requestAndProposePriceFor` should default to `finalFee` similar to `requestPrice`, [PR](https://github.com/UMAprotocol/protocol/pull/3534)
- `requestAndProposePriceFor` should be reentrancy guarded, [PR](https://github.com/UMAprotocol/protocol/pull/3539)

The mainnet contract address:

*SkinnyOptimisticOracle* - [0xeE3Afe347D5C74317041E2618C49534dAf887c24](https://etherscan.io/address/0xeE3Afe347D5C74317041E2618C49534dAf887c24)


## Security considerations

The Optimistic Oracle only has the ability to send price requests to the DVM, so in the event of a serious bug, the biggest security implication would be that end-users would be able to send requests to the DVM without paying the final fee.

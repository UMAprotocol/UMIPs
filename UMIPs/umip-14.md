## Headers
| UMIP-14    |                                                                                                                                          |
|------------|------------------------------------------------------------------------------------------------------------------------------------------|
| UMIP Title | Approve Updated EMP Financial Contract Template              |
| Authors    | Nick Pai (nick@umaproject.org) |
| Status     | Draft                                                                                                                                    |
| Created    | September 16, 2020                                                                                                                           |

## Summary
This UMIP will have the effect of introducing an upgraded expiring financial contract template that:
1. Updates the `ExpiringMultiPartyCreator` factory contract's restrictions on liveness periods and the expiration timestamp.
2. Relaxes `ExpiringMultiParty`'s token creation collateralization requirements.
3. Adds additional power for under-funded liquidators to deter malicious sponsors with large position sizes.
4. Supports collateral currencies that accumulate interest, like [aTokens](https://docs.aave.com/developers/developing-on-aave/the-protocol/atokens#redirectintereststream) which redirect interest to a target address.
5. Enables redemptions post-expiry and most importantly, during the two day expiry price resolution pricess.

## Motivation & Rationale

This UMIP was motivated by a combination of user comments and economic attack surface considerations.

## Technical Specification
To accomplish this upgrade, a new financial contract template must be deployed.

After deployment, this new `ExpiringMutltiPartyCreator` contract should be approved as a ContractCreator in the Registry.

Note: the voters only vote for the approval -- the deployment has no effect on the protocol until added as a ContractCreator.

**The specific changes in detail comprise:**

1. Updating EMPCreator restructions:
    - The EMPCreator should explicitly enforce that expiration times are in the future. The EMP itself already enforces this, but the creator's `deploy` function should revert earlier if the deployer attempts to pass an expiration time in the past.
    - This update also places a hard-cap on the liquidation liveness and withdrawal liveness parameters. Currently, the applied changes allow setting arbitrarily large values, which could cause undesired reverts due to overflows.

2. Relaxing token creation collateralization requirements:
    - The UMA price oracle requires a novel mechanism to guarantee user collateralization despite not having direct access to the real-time price of the collateral. The Global Collateralization Ratio (GCR) is used as a substitute, since it would be an overestimate of the required value under some reasonable economic assumptions. Whenever a new position is opened, the user is required to match this GCR with the corresponding new collateral.
    - However, this may be unnecessarily restrictive, since the collateralization ratio of each change in the position is not individually relevant. Users have criticized, rightfully, the bad UX requiring an over-collateralized sponsor to always create new tokens in a ratio above the GCR, even if their existing position is already well above the GCR. **This update relaxes the requirement to ensure that either the final user position matches the GCR, or the new collateral and minted tokens match the GCR (as before)**.

3. Empowering under-funded liquidators:
    - When a withdrawal that would put a position below the Global Collateralization Ratio is requested, liquidators have a time window to liquidate the position if the withdrawal is invalid. However, if the position is sufficiently large, it may be difficult for liquidators to (collectively) obtain enough synthetic tokens within the allotted time window.
    - This update resets the withdrawal time window whenever a partial liquidation that is sufficiently large occurs within the window. It should be noted that although this mechanism can be used to delay valid withdrawals, potentially until expiration, it does not remove the usual penalty associated with false liquidations, which would have to be paid for every delaying transaction.

4. Supporting new collateral currency types:
    - Developers want to be able to deploy EMP's collataralized by aTokens. A new `trimExcess()` method is added to the EMP so that aToken interest can be redirected to an external contract.

5. Enabling redemptions post-expiry:
    - After an EMP contract expires, collateral is locked within the contract while an expiry price is resolved by the UMA oracle voters. This places extra price risk on sponsors.
    - This pull request removes the time restriction on the `redeem` function so it can be called even after the contract expires and enables them to redeem a proportional amount of collateral to their synthetic tokens burned. It also allows the `cancelWithdrawal` function to be called after expiration, so that a pending slow withdrawal will not stall the token redemption.

## Implementation

Please see this [directory](https://github.com/UMAprotocol/protocol/tree/master/core/contracts/financial-templates/expiring-multiparty). The directory contains both the [implementation](https://github.com/UMAprotocol/protocol/blob/master/core/contracts/financial-templates/expiring-multiparty/ExpiringMultiParty.sol) of the `ExpiringMultiParty` template and the [deployer contract](https://github.com/UMAprotocol/protocol/blob/master/core/contracts/financial-templates/expiring-multiparty/ExpiringMultiPartyCreator.sol) that will be registered with the DVM to allow users to deploy their own `ExpiringMultiParty` contract.

The following PR's implemented the changes described and numbered in the Summary and Motivation sections:
1. [Changes in ExpiringMultiParty.sol](https://github.com/UMAprotocol/protocol/pull/1971).
2. [Original PR](https://github.com/UMAprotocol/protocol/pull/1844) and [modification to the error message in PricelessPositionManager.sol](https://github.com/UMAprotocol/protocol/pull/1971).
3. [Original PR](https://github.com/UMAprotocol/protocol/pull/1859) and [modifications recommended by our auditor, OpenZeppelin, in Liquidatable.sol](https://github.com/UMAprotocol/protocol/pull/1971).
4. [PR](https://github.com/UMAprotocol/protocol/pull/1975).
5. [Original PR](https://github.com/UMAprotocol/protocol/pull/1968).

## Security considerations
These changes *have* been audited by OpenZeppelin and the full audit report can be read [here](https://blog.openzeppelin.com/uma-audit-phase-3/).

As before, anyone deploying a new priceless token contract should take care to parameterize the contract appropriately to avoid the loss of funds for users. Additionally, the contract deployer should ensure that there is a network of liquidators and disputers ready to perform the services necessary to keep the contract solvent. Anyone planning to use a synthetic token (as a sponsor or tokenholder) should validate that the token is solvent and well-parameterized before using since there are configurations and states that make the proposed contract unsafe.

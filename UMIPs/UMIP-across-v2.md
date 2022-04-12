## Headers

| UMIP-Across-v2      |                                                                                               |
| ------------------- | --------------------------------------------------------------------------------------------- |
| UMIP Title          | Add **ACROSS-V2** as a supported price identifier                                             |
| Authors             | Matt Rice                                                                                     |
| Status              | Draft                                                                                         |
| Created             | 03/30/2022                                                                                    |
| Discourse Link      |                                                                                               |

# Summary 

The DVM should support the ACROSS-V2 price identifier.

# Motivation

The ACROSS-V2 price identifier is intended to be used by the Across v2 contracts to verify whether a bundle of bridge
transactions submitted to mainnet is valid.


# Data Specifications and Implementation

Note 1: the following details will often refer to the [Across V2](https://github.com/across-protocol/contracts-v2) repo
at commit hash: aac42df9192145b5f4dc17162ef229c66f401ebe. This allows the UMIP to have a constant reference rather than
depending on a changing repository.

Note 2: when referencing "later" or "earlier" events, the primary sort should be on the block number, the secondary
sort should be on the transactionIndex, and the tertiary sort should be on the logIndex.

Note 3: wherever unspecified, sorting should be ascending by default, not descending.

## Ancillary Data Specifications

The ancillary data only needs a single field: ooRequester, which should be the contract requesting the price from the
OO. Because that contract should contain enough information about the request for voters to resolve the validity of the
relay, no additional ancillary data is needed.

Example:

```
ooRequester:0x69CA24D3084a2eea77E061E2D7aF9b76D107b4f6
```

## Constants

The following constants are currently specified in this UMIP directly, but should be moved to an on-chain
configuration in the future. Once that happens, this UMIP can be amended to specify where to pull them from.

```
MAX_POOL_REBALANCE_LEAF_SIZE = 25
MAX_RELAYER_REPAYMENT_LEAF_SIZE = 25
TOKEN_TRANSFER_THRESHOLD = 1%
CHAIN_ID_LIST=[1,10,137,288,42161] # Mainnet, Optimism, Polygon, Boba, Arbitrum
```

## Preliminary Information

The ooRequester address is expected to be an instance of the
[HubPool contract](https://github.com/across-protocol/contracts-v2/blob/aac42df9192145b5f4dc17162ef229c66f401ebe/contracts/HubPool.sol).

If any of the expected details in the ooRequester are not available in the expected form because the HubPool does not
match the expected interface, the identifier should return 0.

To get the proposal data, the voter should find events that matches
[this signature](https://github.com/across-protocol/contracts-v2/blob/aac42df9192145b5f4dc17162ef229c66f401ebe/contracts/HubPool.sol#L149-L157)
on the ooRequester. The event that describes this proposal is the matching event with the highest block number whose
timestamp is less than or equal to the timestamp of the price request. If there are two matching events that both
satisfy this criteria, then it can be resolved in one of two ways. If the timestamp matches the request timestamp,
then the event with the lower transaction index (or log index if the transaction indices are equal) is the one to be
used. If the timestamp is earlier than the request timestamp, the event with the higher transaction index (or log index
if the transaction indices are identical) should be used.

## Proposal Information

From the selected event, one should be able to glean the following information:
- `bundleEvaluationBlockNumbers`
- `poolRebalanceRoot`
- `relayerRefundRoot`
- `slowRelayRoot`

The `bundleEvaluationBlockNumbers` is an ordered array of block numbers for each destination chain. Which index
corresponds to which chain is denoted by the `CHAIN_ID_LIST` above.

To determine the start block number for each chainId, search for the latest
[RootBundleExecuted event](https://github.com/across-protocol/contracts-v2/blob/aac42df9192145b5f4dc17162ef229c66f401ebe/contracts/HubPool.sol#L158-L167)
with a matching chainId while still being earlier than the timestamp of the request. Once that event is found, search
for the
[ProposeRootBundle](https://github.com/across-protocol/contracts-v2/blob/aac42df9192145b5f4dc17162ef229c66f401ebe/contracts/HubPool.sol#L149-L157)
event that is as late as possible, but earlier than the RootBundleExecuted event we just identified. Once this proposal event is found, determine its
mapping of indices to chainId in its `bundleEvaluationBlockNumbers` array using TBD config at its block number. For
each chainId, their starting block number is that chain's bundleEvaluationBlockNumber + 1 in this past proposal event.
Use this mechanism to determine the starting block numbers for each chainId represented in the original
`bundleEvaluationBlockNumbers`.

Evaluate the
[crossChainContracts](https://github.com/across-protocol/contracts-v2/blob/aac42df9192145b5f4dc17162ef229c66f401ebe/contracts/HubPool.sol#L60)
method on the HubPool contract (passing each chainId) at the block number of the proposal to determine the addresses
for the
[SpokePool contract](https://github.com/across-protocol/contracts-v2/blob/aac42df9192145b5f4dc17162ef229c66f401ebe/contracts/SpokePool.sol)
for each destination chain.

## Finding Valid Relays

For each destination chain, find all
[FilledRelay events](https://github.com/across-protocol/contracts-v2/blob/aac42df9192145b5f4dc17162ef229c66f401ebe/contracts/SpokePool.sol#L84-L100)
on its `SpokePool` between the starting block number and ending block number for that chain. For this query, exclude
any `FilledRelay` events that have `isSlowRelay` set to true.

For all FilledRelay events, you can find the `SpokePool` for the origin chain by querying
[CrossChainContractsSet](https://github.com/across-protocol/contracts-v2/blob/aac42df9192145b5f4dc17162ef229c66f401ebe/contracts/HubPool.sol#L120)
and finding all matching events where the `l2ChainId` matches the `originChainId` value in the FilledRelay event. The
`spokePool` values in these events are all possible spoke pools that this deposit could have been from. Note: old
`SpokePool`s must be considered so upgrades don't block old deposits from being relayed.

Note: in the sections below, if the relay is considered to be invalid at any point, that relay must not be considered
when constructing the bundle.

For each `FilledRelay` event found earlier, a
[FundsDeposited](https://github.com/across-protocol/contracts-v2/blob/aac42df9192145b5f4dc17162ef229c66f401ebe/contracts/SpokePool.sol#L67-L77)
event should be found in one of the spoke pools for the originChainId where the following parameters match:

- `amount`
- `originChainId`
- `destinationChainId`
- `relayerFeePct`
- `depositId`
- `recipient`
- `depositor`

Additionally, matching relays should have their `destinationToken` set such that the following process is satisfied:

1. Find the latest
   [SetRebalanceRoute](https://github.com/across-protocol/contracts-v2/blob/3676377398714bd8f734485deead75afbcd8e8c4/contracts/HubPool.sol#L138-L142)
   events with a block timestamp at or before the `quoteTimestamp` in the associated `FundsDeposited` event where the
   `originChainId` and `originToken` match the `destinationChainId` and `destinationToken`. Pull the `l1Token` value
   from the matching event. If there is no matching event, the relay is invalid.
2. Search the `SetPoolRebalanceRoute` events for the same `l1Token` and `destinationChainId` before or at the
   `quoteTimestamp`. If there are any matching events later than the one found in step 1, the relay is invalid.
3. Using the `l1Token` value found in step 1, search for the latest `SetRebalanceRoute` event at or before the
   `quoteTimestamp` with that `l1Token` and with the `destinationChainId` that matches the `destinationChainId` value
   from the `FundsDeposited` event. If a match is found, the `destinationToken` should match the `destinationToken`
   value in the `FilledRelay` event. If they don't match or if no matching event is found, the relay is invalid.


To determine the validity of the `realizedLPFeePct` in the `FilledRelay` event, the exact same process is used as in
the identifier `IS_RELAY_VALID`, specified in UMIP 136. The same `RateModelStore` contract should be used as the
configuration. The only difference is that instead of calling `liquidityUtilizationCurrent` and
`liquidityUtilizationPostRelay` on the `BridgePool` contract passing no arguments, the exact same methods would be
called on the `HubPool` contract, passing in a single argument, the `l1Token` derived in the 3 step process above.

If the `realizedLPFeePct` that is computed using those means does not match the `realizedLPFeePct` in the
`FilledRelay` event, then the relay is considered invalid.

All valid `FilledRelay` events should then be stored for the construction of the bundle.

## Finding Slow Relays

To determine all slow relays, follow the following process:

1. For all valid `FilledRelay` events above, group them by `originChainId` and `depositId`.
2. Remove all groups that contain a `FilledRelay` event where `totalFilledAmount` equals `amount`.
3. Remove all groups that do not contain an event where `filledAmount` is nonzero and equal to `totalFilledAmount`.

For all remaining groups, they should be stored in a list of slow relay groups.

## Constructing the PoolRebalanceRoot

To construct the `poolRebalanceRoot`, you need to form a list of rebalances.

For all valid `FilledRelay` events above, group them by `repaymentChainId` and their associated `l1Token` found above.

For each group, sum the `fillAmount` values to get the total relay repayments for that group.

Similarly, sum the `fillAmount * relayerFeePct / 1e18` to get the total LP fees for that group.

To determine the amount to modify the running balances:

1. For each `FilledRelay` group above, initialize a running balance value at 0 and add the total relay repayments to
   it. Each running balance value is defined by its `chainId` and `l1Token`.
2. Find all `FundsDeposited` events on all `SpokePool`s from earlier within each `SpokePool`'s block range. Using the
   `originChainId`, `originToken`, the `quoteTimestamp`, and the `SetPoolRebalanceRoute` event on the HubPool, use a
   similar process as the 3 step one above to map this back to an `l1Token`. For that `l1Token` and `originChainId`,
   initialize a running balance value if one doesn't exist already and subtract the `amount` from it.
3. For all slow relay groups found above, they are bucketed into their `originChainId` and the associated `l1Token` of
   their associated `FilledRelay` events. If a running balance doesn't exist for this combination, initialize it at 0.
   Subtract the max `totalFilledAmount` of this group from the `amount` in the event to determine the slow relay
   shortfall. This amount should be subtracted from the running balance.


For each running balance value, past
[RootBundleExecuted](https://github.com/across-protocol/contracts-v2/blob/3676377398714bd8f734485deead75afbcd8e8c4/contracts/HubPool.sol#L158-L167)
should be queried to find a matching element for the `chainId` and `l1Token` (they would need to be at matching indices
in the array). Once these values are found at matching indices, that index can be used to find the associated running
balance value. That most recent running balance value should be added to the one computed above.

For each tuple of `l1Token` and `chainId`, we should have computed a total running balance value. Determine if the
absolute value of this running balance is > `TOKEN_TRANSFER_THRESHOLD` of the total value of all LP tokens for this
`l1Token` at the `ProposeRootBundle` event that came before the one being evaluated (process described above).
If this passes the threshold, then set net send amount to the running balance value and set the running balance value
to 0.

Find all `FilledRelay` events in the block range that have `isSlowRelay` set to true. For each, use a similar method
as above to map this event back to an `l1Token` at the `quoteTimestamp`. Use the `destinationChainId` as the `chainId`
to determine which running balance that this event should apply to. If there is no running balance initialized for this
`l1Token` and `chainId`, then do a historical lookup as above to determine the previous running balance value and add
this value to it. If there is no historical running balance, initialize it to 0. Add `fillAmount` to this running
balance value.

Take the above running balances and net send amounts and group them by only `chainId` and sort by `chainId`. Within
each group, sort by `l1Token`. If there are more than `MAX_LEAF_ARRAY_SIZE` `l1Tokens`, a particular chain's leaf will
need to be broken up into multiple leaves, starting at `groupIndex` 0 and each subsequent leaf incrementing the
`groupIndex` value by 1.

Now that we have ordered leaves, we can assign each one a unique `leafId` starting from 0.

With all of that information, each leaf should be possible to construct in the format given
[here](https://github.com/across-protocol/contracts-v2/blob/3676377398714bd8f734485deead75afbcd8e8c4/contracts/HubPoolInterface.sol#L13-L42).

Once the leaves are constructed, the merkle root can be constructed by hashing each leaf data structure using
Solidity's standard process of `keccak256(abi.encode(poolRebalanceLeaf))`. Once the leaves are hashed, the tree should
be constructed in the standard way such that it is verifyable using
[OpenZeppelin's MerkleProof](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/742e85be7c08dff21410ba4aa9c60f6a033befb8/contracts/utils/cryptography/MerkleProof.sol)
library. See examples [here](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/742e85be7c08dff21410ba4aa9c60f6a033befb8/test/utils/cryptography/MerkleProof.test.js)
for how to construct these types of trees.

## Constructing RelayerRefundRoot

For each grouping in the section above that either a) has relayer refunds or b) has a negative net send amount, a
RelayerRefundRoot must be constructed.

The data structure is shown [here](https://github.com/across-protocol/contracts-v2/blob/3676377398714bd8f734485deead75afbcd8e8c4/contracts/SpokePoolInterface.sol#L9-L23).

The `amountToReturn` should be set to `max(-netSendAmount, 0)`.

The `l2TokenAddress` is the corresponding L2 token address for the `l1Token` in the previous section. Note: see above
sections for how to map L1 and L2 tokens via events on L1. This mapping should be done according to the highest
`quoteTimestamp` of any relays in the group. If no relays are present, then as of the previous successful proposal.

`refundAmounts` and `refundAddresses` are just computed by grouping the relays in this group by the `relayer` and
summing the `amount - (amount * lpFeePct / 1e18)` for each relay. These should be sorted in descending order of
`refundAmounts`. If two `refundAmounts` are equal, then they should be sorted by `relayer` address.

If there are more than `MAX_LEAF_ARRAY_SIZE` `refundAddresses` for a particular `l2TokenAddress` then these should be
split up into `MAX_LEAF_ARRAY_SIZE` element leaves (sorted as described above) with only the first leaf for a
particular `l2TokenAddress` able to contain a nonzero amountToReturn.

Once these are computed for all relays, the leaves (or groups of leaves for > 25 elements) should be sorted by
`chainId` as the primary index, then `l2TokenAddress` as the secondary index, and then the individual sorting
of > `MAX_LEAF_ARRAY_SIZE` element groups as the tertiary sorting. Once these are sorted, each leaf can be given a
`leafId` based on its index in the group, starting at 0.

Once these leaves are constructed, they can be used to form a merkle root as described in the previous section.


## Constructing SlowRelayRoot

To construct the SlowRelayRoot leaves as described
[here](https://github.com/across-protocol/contracts-v2/blob/3676377398714bd8f734485deead75afbcd8e8c4/contracts/SpokePoolInterface.sol#L29-L49),
just form leaves based on all the slow relays found in the "Finding Slow Relays" section above. The information in the
relays should map directly to the leaf data structure.

Their primary sorting index should be `originChainId` and the secondary sorting index should be `depositId`.

You can then construct a merkle root similar to how it's done in the previous two sections.

## Determing the Result

Three conditions must be met for the proposal to be deemed valid:
1. The roots computed above match the ones in the proposal.
2. The poolRebalanceLeafCount specified in the proposal event matches the number of pool rebalance leaves computed in
   the PoolRebalanceRoot above.
3. `bundleEvaluationBlockNumbers` must be reasonably recent (up-to-date within 30 minutes of the proposal transaction)
   and include all `chainIds` that have a nonzero
   [CrossChainContractsSet](https://github.com/across-protocol/contracts-v2/blob/3676377398714bd8f734485deead75afbcd8e8c4/contracts/HubPool.sol#L120)
   at the time of proposal.
4. No obvious griefing or manipulation of the system is being performed via this proposal.

If the proposal is deemed invalid, return 0. If valid, return 1. Note: these values are scaled by `1e18`.
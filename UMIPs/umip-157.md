## Headers

| UMIP-157            |                                                                                               |
| ------------------- | --------------------------------------------------------------------------------------------- |
| UMIP Title          | Add **ACROSS-V2** as a supported price identifier                                             |
| Authors             | Matt Rice                                                                                     |
| Status              | Approved                                                                                    |
| Created             | 03/30/2022                                                                                    |
| Discourse Link      |                                                                                               |

# Summary 

The DVM should support the ACROSS-V2 price identifier.

# Across V2 Architecture

The basic architecture of Across V2 is a single LP ("Liquidity Provider") pool sitting on Ethereum mainnet connected to many "spoke pools" deployed on
various chains to facilitate user "deposits". A deposit is a cross-chain transfer request from an "origin" chain to a different "destination" chain, which is fulfilled when a "relayer" sends the depositor their desired transfer amount (less fees) on their desired destination chain.

Relayers lend capital to the Across V2 system by fulfilling users' deposits via the spokes and are eventually repaid by the LP pool. "Bundles" containing many of these repayments are validated together by the [Optimistic Oracle ("OO")](https://docs.umaproject.org/protocol-overview/how-does-umas-oracle-work). In addition to validating individual repayment instructions, the OO also validates rebalance instructions that tell the LP pool how to transfer funds to and from the spoke pools in order to execute the repayments and pull deposited funds from the spoke to the LP pool.


If there is no relayer who can provide all the capital for a given deposit request, a "slow relay" (or "slow fill") is performed where the funds are sent from the
LP pool to the destination spoke to fulfill the deposit. These slow fill requests are also included in the aforementioned bundles.

Bundles are implemented on-chain as [Merkle Roots](https://www.youtube.com/watch?v=JXn4GqyS7Gg) which uniquely identify the set of all repayments and rebalance instructions over a specific block range. Therefore, Across V2 moves capital to repay relayers and fulfil bridge requests through periodic bundles, all validated by the OO.

This UMIP explains exactly how to construct and verify a bundle.

![](./images/across-architecture.png?raw=true "Across V2 Architecture")

# Motivation

The ACROSS-V2 price identifier is intended to be used by the Across v2 contracts to verify whether a bundle of bridge-related
transactions submitted to mainnet is valid.


# Data Specifications and Implementation

Note 1: the following details will often refer to the [Across V2](https://github.com/across-protocol/contracts-v2) repo
at commit hash: a8ab11fef3d15604c46bba6439291432db17e745. This allows the UMIP to have a constant reference rather than
depending on a changing repository.

Note 2: when referencing "later" or "earlier" events, the primary sort should be on the block number, the secondary
sort should be on the `transactionIndex`, and the tertiary sort should be on the `logIndex`. See the section on [comparing events](#comparing-events-chronologically) for more details.

Note 3: wherever unspecified, sorting should be ascending by default, not descending.

# Definitions

## Comparing events chronologically
Smart contract transactions can emit events that conform to the specifications described in the "Returns" section of these [docs](https://web3js.readthedocs.io/en/v1.2.11/web3-eth-contract.html#contract-events). Specifically, an event is expected to have a `blockNumber`, `transactionIndex` and `logIndex`. To compare events `e1` and `e2` chronologically, we can say
that `e1` is "earlier" than `e2` if `e1.blockNumber < e2.blockNumber` OR if `e1.blockNumber == e2.blockNumber && e1.transactionIndex < e2.transactionIndex` OR if `e1.blockNumber == e2.blockNumber && e1.transactionIndex == e2.transactionIndex && e1.logIndex < e2.logIndex`.

So, "earlier" events have a lower block number, transaction index, or log index, and we should compare event properties in that order.

## Valid bundle proposals
A valid root bundle submitted by calling `HubPool.proposeRootBundle()` will emit a [`ProposedRootBundle`](https://github.com/across-protocol/contracts-v2/blob/a8ab11fef3d15604c46bba6439291432db17e745/contracts/HubPool.sol#L148-L156) event.

The root bundle is valid once *all* of its `PoolRebalanceLeaves` are executed via `HubPool.executeRootBundle()`, which can only be called after the proposed root bundle's `challengePeriodEndTimestamp` is passed. 

## Comparing deposit events chronologically for different origin chains
Each deposit emits a [`quoteTimestamp`](https://github.com/across-protocol/contracts-v2/blob/aac42df9192145b5f4dc17162ef229c66f401ebe/contracts/SpokePool.sol#L73) parameter. This timestamp should be evaluated within the context of the Ethereum network, and should be mapped to the Ethereum block who's [`timestamp`](https://ethereum.org/en/developers/docs/data-and-analytics/block-explorers/#blocks) is closest to the `deposit.quoteTimestamp` but not greater (i.e. `block.timestamp` closest to and `<= deposit.quoteTimestamp`).

# Ancillary Data Specifications

The ancillary data only needs a single field: `ooRequester`, which should be the contract requesting the price from the
OO. Because that contract should contain enough information about the request for voters to resolve the validity of the
relay, no additional ancillary data is needed.

Example:

```
ooRequester:0x69CA24D3084a2eea77E061E2D7aF9b76D107b4f6
```

# Configuration Constants

## Global Constants
The following constants should reflect what is stored in the [`AcrossConfigStore`](https://etherscan.io/address/0x3b03509645713718b78951126e0a6de6f10043f5#code) contract deployed on Etherscan. This contract is owned by Across governance and acts as the source of truth for the following variables. The global variables currently stored in the above contract for this UMIP are:
- "MAX_POOL_REBALANCE_LEAF_SIZE"
- "MAX_RELAYER_REPAYMENT_LEAF_SIZE"

To query the value for any of the above constants, the `AcrossConfigStore` contract's `globalConfig(bytes32)` function should be called with the hex value of the variable name. For example, the "MAX_POOL_REBALANCE_LEAF_SIZE" can be queried by calling `globalConfig(toHex("MAX_POOL_REBALANCE_LEAF_SIZE"))` which is equivalent to `globalConfig("0x4d41585f504f4f4c5f524542414c414e43455f4c4541465f53495a45")`. For example, this might return 
>"25"

The following constants are currently specified in this UMIP directly, but should be moved to the `AcrossConfigStore` in the future. Once that happens, this UMIP can be amended to move the following constants in to the above section.
- "CHAIN_ID_LIST"=[1,10,137,288,42161] # Mainnet, Optimism, Polygon, Boba, Arbitrum

## Token Constants
The following constants are also stored in the `AcrossConfigStore` contract but are specific to an Ethereum token address. Therefore, they are fetched by querying the config store's `tokenConfig(address)` function.
- "rateModel"
- "transferThreshold"

For example, querying `tokenConfig("0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2")` might return:
> "{"rateModel":{"UBar":"750000000000000000","R0":"50000000000000000","R1":"0","R2":"600000000000000000"},"transferThreshold":"100000000000000000"}"

_This UMIP will explain later how global and token-specific configuration settings are used._

# Preliminary Information

The ooRequester address is expected to be an instance of the
[HubPool contract](https://github.com/across-protocol/contracts-v2/blob/a8ab11fef3d15604c46bba6439291432db17e745/contracts/HubPool.sol).

If any of the expected details in the ooRequester are not available in the expected form because the HubPool does not
match the expected interface, the identifier should return `0`.

To get the proposal data, the voter should find events that match
[this signature](https://github.com/across-protocol/contracts-v2/blob/a8ab11fef3d15604c46bba6439291432db17e745/contracts/HubPool.sol#L148-L156)
on the ooRequester. The event that describes this proposal is the matching event with the highest block number whose
timestamp is less than or equal to the timestamp of the price request. If there are two matching events that both
satisfy this criteria, then it can be resolved in one of two ways. If the timestamp matches the request timestamp,
then the [earlier event](#comparing-events-chronologically) is the one to be
used. If the timestamp is earlier than the request timestamp, the [later event](#comparing-events-chronologically) should be used.

# Proposal Information

From the selected event, one should be able to glean the following information:
- `bundleEvaluationBlockNumbers`
- `poolRebalanceRoot`
- `relayerRefundRoot`
- `slowRelayRoot`

The `bundleEvaluationBlockNumbers` is an ordered array of block numbers for each destination chain. Which index
corresponds to which chain is denoted by the "CHAIN_ID_LIST" in the [global config](#global-constants).

To determine the start block number for each chainId, search for the latest
[RootBundleExecuted event](https://github.com/across-protocol/contracts-v2/blob/a8ab11fef3d15604c46bba6439291432db17e745/contracts/HubPool.sol#L157-L166)
with a matching `chainId` while still being earlier than the timestamp of the request. Once that event is found, search
for the
[ProposeRootBundle](https://github.com/across-protocol/contracts-v2/blob/a8ab11fef3d15604c46bba6439291432db17e745/contracts/HubPool.sol#L148-L156)
event that is as late as possible, but earlier than the RootBundleExecuted event we just identified. Once this proposal event is found, determine its
mapping of indices to `chainId` in its `bundleEvaluationBlockNumbers` array using "CHAIN_ID_LIST". For
each `chainId`, their starting block number is that chain's `bundleEvaluationBlockNumber + 1` in this previous [valid proposal](#valid-bundle-proposals) event.
Use this mechanism to determine the starting block numbers for each `chainId` represented in the original
`bundleEvaluationBlockNumbers`.

Evaluate the
[crossChainContracts](https://github.com/across-protocol/contracts-v2/blob/a8ab11fef3d15604c46bba6439291432db17e745/contracts/HubPool.sol#L59)
method on the HubPool contract (passing each `chainId`) at the block number of the proposal to determine the addresses
for the
[SpokePool contract](https://github.com/across-protocol/contracts-v2/blob/a8ab11fef3d15604c46bba6439291432db17e745/contracts/SpokePool.sol)
for each destination chain. We'll use these SpokePool addresses to query correct event data in the next section.

# Finding Valid Relays

For each destination chain, find all
[FilledRelay events](https://github.com/across-protocol/contracts-v2/blob/a8ab11fef3d15604c46bba6439291432db17e745/contracts/SpokePool.sol#L84-L100)
on its `SpokePool` between the starting block number and ending block number for that chain. For this query, exclude
any `FilledRelay` events that have `isSlowRelay` set to `true`.

For all `FilledRelay` events, you can find the `SpokePool` address for the deposit's origin chain by querying
[CrossChainContractsSet](https://github.com/across-protocol/contracts-v2/blob/a8ab11fef3d15604c46bba6439291432db17e745/contracts/HubPool.sol#L119)
and finding all matching events where the `l2ChainId` matches the `originChainId` value in the FilledRelay event. The
`spokePool` values in these events are all possible spoke pools that this deposit could have been from. 

We can't assume the latest
`SpokePool`s are used so that we don't block old deposits from being relayed. The actual spoke pool to use is the address in the last `CrossChainContractsSet` event emitted on Ethereum before the deposit on the origin chain was sent. (We can use [this methodology](#comparing-deposit-events-chronologically-for-different-origin-chains) to identify the `CrossChainContractsSet` Ethereum `block.timestamp` with the deposit's `quoteTimestamp`). 

Note: in the sections below, if the relay is considered to be invalid at any point, that relay must not be considered
when constructing the bundle.

For each `FilledRelay` event found earlier, a
[FundsDeposited](https://github.com/across-protocol/contracts-v2/blob/a8ab11fef3d15604c46bba6439291432db17e745/contracts/SpokePool.sol#L67-L77)
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
   [SetRebalanceRoute](https://github.com/across-protocol/contracts-v2/blob/a8ab11fef3d15604c46bba6439291432db17e745/contracts/HubPool.sol#L137-L141)
   events [with a block timestamp at or before the `quoteTimestamp`](#comparing-deposit-events-chronologically-for-different-origin-chains) in the associated `FundsDeposited` event where the
   `originChainId` and `originToken` match the `destinationChainId` and `destinationToken`. Pull the `l1Token` value
   from the matching event. If there is no matching event, the relay is invalid.
2. Search the `SetPoolRebalanceRoute` events for the same `l1Token` and `destinationChainId` before or at the
   `quoteTimestamp`. If there are any matching events later than the one found in step 1, the relay is invalid.
3. Using the `l1Token` value found in step 1, search for the latest `SetRebalanceRoute` event at or before the
   `quoteTimestamp` with that `l1Token` and with the `destinationChainId` that matches the `destinationChainId` value
   from the `FundsDeposited` event. If a match is found, the `destinationToken` should match the `destinationToken`
   value in the `FilledRelay` event. If they don't match or if no matching event is found, the relay is invalid.


To determine the validity of the `realizedLPFeePct` in the `FilledRelay` event, the exact same process is used as in
the identifier [`IS_RELAY_VALID`, specified in UMIP 136](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-136.md). However, instead ofing a `RateModelStore` contract to look up a deposit's rate model, we can use the `AcrossConfigStore`'s `tokenConfig` to [look up the rate model](#token-constants) for a deposit. The deposited `originToken` can be mapped to an `l1Token` by following step 2 above which can be used to query a `rateModel`. 

Moreover, instead of calling `liquidityUtilizationCurrent` and
`liquidityUtilizationPostRelay` on the `BridgePool` contract (passing no arguments) to compute the rate model, identically-named methods would be
called on the `HubPool` contract, passing in a single argument, the `l1Token` derived in the 3 step process above.

If the `realizedLPFeePct` that is computed using those means does not match the `realizedLPFeePct` in the
`FilledRelay` event, then the relay is considered invalid.

All valid `FilledRelay` events should then be stored for the construction of the bundle.

# Finding Slow Relays

To determine all slow relays, follow the following process:

1. For all valid `FilledRelay` events above, group them by `originChainId` and `depositId`.
2. Remove all groups that contain a `FilledRelay` event where `totalFilledAmount` equals `amount`. This removes deposits that have been 100% filled.
3. Remove all groups that do not contain an event where `filledAmount` is nonzero and equal to `totalFilledAmount`. This keeps only deposits whose earliest fill is in this time range.

For all remaining groups, they should be stored in a list of slow relay groups.

## Computing Slow Relay payment amounts

For a given slow relay identified [above](#finding-slow-relays), we can compute the associated deposit's "unfilled amount" as `deposit.amount - latestFill.totalFilledAmount`, where `latestFill` is the last fill chronologically for a deposit. Since each fill increments `totalFilledAmount`, the `latestFill` can also be identified by sorting all fills associated wiht a deposit and keeping the fill with the largest `totalFilledAmount`. 

Note: Since  we eliminated all fills where `totalFilledAmount == deposit.amount`, the remaining "last fill" should have `totalFilledAmount < deposit.amount` AND have `totalFilledAmount > [all other fills for deposit].totaFilledAmount`.

# Constructing the PoolRebalanceRoot

To construct the `poolRebalanceRoot`, you need to form a list of rebalances.

For all valid `FilledRelay` events above, group them by `repaymentChainId` and their associated `l1Token` found above.

For each group, sum the `fillAmount` values to get the total relay repayments for that group.

Similarly, sum the `fillAmount * realizedLPFeePct / 1e18` to get the total LP fees for that group.

To determine the amount to modify the running balances:

1. For each `FilledRelay` [group](#finding-valid-relays), initialize a running balance value at 0 and add the total relay repayments to
   it. Each running balance value is defined by its `chainId` and `l1Token`.
2. For each [slow relay group](#finding-slow-relays), add each slow relay's [unfilled deposit amount](#computing-slow-relay-payment-amounts) to the group's running balance.
3. Find all `FundsDeposited` events on all `SpokePool`s from earlier within each `SpokePool`'s block range. Using the
   `originChainId`, `originToken`, the `quoteTimestamp`, and the `SetPoolRebalanceRoute` event on the HubPool, use a
   similar process as the 3 step one above to map this back to an `l1Token`. For that `l1Token` and `originChainId`,
   initialize a running balance value if one doesn't exist already and subtract the `amount` from it.
4. Find all `FilledRelay` events in the block range that have `isSlowRelay` set to true. For each, use a similar method
   as above to map this event back to an `l1Token` at the `quoteTimestamp`. Use the `destinationChainId` as the `chainId`
   to determine which running balance that this event should apply to. If the `fillAmount` on the `FilledRelay` event is
   `0`, perform a historical event lookup to determine if this slow relay has been executed before by searching for past
   `FilledRelay` events with `isSlowRelay` equal to `true`, matching `originChainId` and `depositId`. If any are found,
   ignore this slow relay. If the slow relay is not ignored, follow the steps in the "Finding Slow Relays" section above
   for this `originChainId` and `depositId`, but remove the block range and only look for slow relays with a matching
   `originChainId` and `depositId`. This should reveal the `FilledRelay` event that triggered this slow relay to be sent.
   Once that is found, pull the block number for that event. Search through past `ProposeRootBundle` events to find the
   proposal for this `destinationChainId` whose ending block number is the closest to this block number without being
   smaller. Search for all `FilledRelay` events that have matching `amount`, `originChainId`, `destinationChainId`,
   `relayerFeePct`, `depositId`, `recipient`, and `depositor` values before that ending block number. Grab the
   `totalFillAmount` and `amount` from the latest of these events. Subtract the `totalFillAmount` from the `amount` to
   compute `sentAmount`. For the original event we found where `isSlowRelay` was set to true, grab the `fillAmount` and
   compute `sentAmount - fillAmount` to determine the extra funds that were sent. Subtract the result from the running
   balance for the associated `l1Token` and `destinationChainId`.


For each running balance value, past
[RootBundleExecuted](https://github.com/across-protocol/contracts-v2/blob/a8ab11fef3d15604c46bba6439291432db17e745/contracts/HubPool.sol#L157-L166)
should be queried to find a matching element for the `chainId` and `l1Token` (they would need to be at matching indices
in the array). Once these values are found at matching indices, that index can be used to find the associated running
balance value. That most recent running balance value should be added to the one computed above.

For each tuple of `l1Token` and `chainId`, we should have computed a total running balance value. Determine if the
absolute value of this running balance is > [`TOKEN_TRANSFER_THRESHOLD`](#global-constants) of the total value of all LP tokens for this
`l1Token` at the `ProposeRootBundle` event that came before the one being evaluated (process described above).
If this passes the threshold, then set net send amount to the running balance value and set the running balance value
to 0.

Take the above running balances and net send amounts and group them by only `chainId` and sort by `chainId`. Within
each group, sort by `l1Token`. If there are more than [`MAX_POOL_REBALANCE_LEAF_SIZE`](#global-constants) `l1Tokens`, a particular chain's leaf will
need to be broken up into multiple leaves, starting at `groupIndex` 0 and each subsequent leaf incrementing the
`groupIndex` value by 1.

Now that we have ordered leaves, we can assign each one a unique `leafId` starting from 0.

With all of that information, each leaf should be possible to construct in the format given
[here](https://github.com/across-protocol/contracts-v2/blob/a8ab11fef3d15604c46bba6439291432db17e745/contracts/HubPoolInterface.sol#L13-L42).

Once the leaves are constructed, the merkle root can be constructed by hashing each leaf data structure using
Solidity's standard process of `keccak256(abi.encode(poolRebalanceLeaf))`. Once the leaves are hashed, the tree should
be constructed in the standard way such that it is verifyable using
[OpenZeppelin's MerkleProof](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/742e85be7c08dff21410ba4aa9c60f6a033befb8/contracts/utils/cryptography/MerkleProof.sol)
library. See examples [here](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/742e85be7c08dff21410ba4aa9c60f6a033befb8/test/utils/cryptography/MerkleProof.test.js)
for how to construct these types of trees.

# Constructing RelayerRefundRoot

In the previous section, groups of relays were found for each `destinationChainId` and `l1Token`. Then, the rebalance
parameters were determined for each group. All `FillRelay` events found for a particular `destinationChainId` and
`l1Token` that were found in the previous section that also have `isSlowRelay` set to false will be referred to as
"fast relays" in this section. For each `destinationChainId` and `l1Token` grouping in the previous section, a net send
amount was found. This value will be used in this section as well.

For each group from the previous section defined by a `destinationChainId` and `l1Token` that either a) has fast relays
or b) has a negative net send amount, a RelayerRefundRoot must be constructed. The data structure is shown
[here](https://github.com/across-protocol/contracts-v2/blob/a8ab11fef3d15604c46bba6439291432db17e745/contracts/SpokePoolInterface.sol#L9-L23).
One or more (in the case of leafs with more than [`MAX_RELAYER_REPAYMENT_LEAF_SIZE`](#global-constants) refunds) `RelayerRefundLeaf` will be
constructed for each of these applicable groups. The following defines how to construct each of these leaves given the
information about each group determined in the previous section.

The `amountToReturn` should be set to `max(-netSendAmount, 0)`.

The `l2TokenAddress` is the corresponding L2 token address for the `l1Token` in the previous section. Note: see above
sections for how to map L1 and L2 tokens via events on L1. This mapping should be done according to the highest
`quoteTimestamp` of any relays in the group. If no relays are present, then as of the previous successful proposal.

`refundAmounts` and `refundAddresses` are just computed by grouping the relays in this group by the `relayer` and
summing the `amount - (amount * lpFeePct / 1e18)` for each relay. These should be sorted in descending order of
`refundAmounts`. If two `refundAmounts` are equal, then they should be sorted by `relayer` address.

If there are more than [`MAX_RELAYER_REPAYMENT_LEAF_SIZE`](#global-constants) `refundAddresses` for a particular `l2TokenAddress` then
these should be split up into [`MAX_RELAYER_REPAYMENT_LEAF_SIZE`](#global-constants) element leaves (sorted as described above) with only
the first leaf for a particular `l2TokenAddress` able to contain a nonzero amountToReturn.

Once these are computed for all relays, the leaves (or groups of leaves for > 25 elements) should be sorted by
`chainId` as the primary index, then `l2TokenAddress` as the secondary index, and then the individual sorting
of > [`MAX_RELAYER_REPAYMENT_LEAF_SIZE`](#global-constants) element groups as the tertiary sorting. Once these are sorted, each leaf can be
given a `leafId` based on its index in the group, starting at 0.

Once these leaves are constructed, they can be used to form a merkle root as described in the previous section.


# Constructing SlowRelayRoot

To construct the SlowRelayRoot leaves as described
[here](https://github.com/across-protocol/contracts-v2/blob/a8ab11fef3d15604c46bba6439291432db17e745/contracts/SpokePoolInterface.sol#L29-L49),
just form leaves based on all the slow relays found in the "Finding Slow Relays" section above. The information in the
relays should map directly to the leaf data structure.

Their primary sorting index should be `originChainId` and the secondary sorting index should be `depositId`.

You can then construct a merkle root similar to how it's done in the previous two sections.

# Determing the Result

Three conditions must be met for the proposal to be deemed valid:
1. The roots computed above match the ones in the proposal.
2. The poolRebalanceLeafCount specified in the proposal event matches the number of pool rebalance leaves computed in
   the PoolRebalanceRoot above.
3. `bundleEvaluationBlockNumbers` must be reasonably recent (up-to-date within 30 minutes of the proposal transaction)
   and include all `chainIds` that have a nonzero
   [CrossChainContractsSet](https://github.com/across-protocol/contracts-v2/blob/a8ab11fef3d15604c46bba6439291432db17e745/contracts/HubPool.sol#L119)
   at the time of proposal.
4. No obvious griefing or manipulation of the system is being performed via this proposal.

If the proposal is deemed invalid, return 0. If valid, return 1. Note: these values are scaled by `1e18`.
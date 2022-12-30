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

Note 4: all event data should be identically returned by at least two RPC providers to give confidence in the integrity of the data.

# Definitions

## Comparing events chronologically
Smart contract transactions can emit events that conform to the specifications described in the "Returns" section of these [docs](https://web3js.readthedocs.io/en/v1.2.11/web3-eth-contract.html#contract-events). Specifically, an event is expected to have a unique combination of `blockNumber`, `transactionIndex` and `logIndex`. To compare events `e1` and `e2` chronologically, we can say
that `e1` is "earlier" than `e2` if `e1.blockNumber < e2.blockNumber` OR if `e1.blockNumber == e2.blockNumber && e1.transactionIndex < e2.transactionIndex` OR if `e1.blockNumber == e2.blockNumber && e1.transactionIndex == e2.transactionIndex && e1.logIndex < e2.logIndex`.

So, "earlier" events have a lower block number, transaction index, or log index, and we should compare event properties in that order.

## Valid bundle proposals
A root bundle can be proposed by calling `HubPool.proposeRootBundle()`, which will will emit a [`ProposedRootBundle`](https://github.com/across-protocol/contracts-v2/blob/a8ab11fef3d15604c46bba6439291432db17e745/contracts/HubPool.sol#L148-L156) event.

The root bundle is valid once *all* of its `PoolRebalanceLeaves` are executed via `HubPool.executeRootBundle()`, which can only be called after the proposed root bundle's `challengePeriodEndTimestamp` is passed. 

## Comparing deposit events chronologically for different origin chains
Each deposit emits a [`quoteTimestamp`](https://github.com/across-protocol/contracts-v2/blob/aac42df9192145b5f4dc17162ef229c66f401ebe/contracts/SpokePool.sol#L73) parameter. This timestamp should be evaluated within the context of the Ethereum network, and should be mapped to the Ethereum block who's [`timestamp`](https://ethereum.org/en/developers/docs/data-and-analytics/block-explorers/#blocks) is closest to the `deposit.quoteTimestamp` but not greater (i.e. `block.timestamp` closest to and `<= deposit.quoteTimestamp`).

## Matching L1 tokens to Running Balances or Net Send Amounts
The [`RootBundleExecuted`](https://github.com/across-protocol/contracts-v2/blob/a8ab11fef3d15604c46bba6439291432db17e745/contracts/HubPool.sol#L157-L166) event and [`PoolRebalanceLeaf`] structure both contain equal length arrays: `l1Tokens`, `netSendAmounts`, `bundleLpFees`, and `runningBalances`. Each `l1Token` value in `l1Tokens` is an address correspondingto an ERC20 token deployed on Ethereum Mainnet. It should be mapped to the value in any of the other three arrays (`netSendAmounts`, `bundleLpFees`, and `runningBalances`) that shares the same index within the array.

For example, if `l1Tokens` is "[0x123,0x456,0x789]" and `netSendAmounts` is "[1,2,3]", then the "net send amount" for token with address "0x456" is equal to "2".

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
  - This is a JSON struct of rate model parameters.
  - These parameters should fully specify the rate model for this token as described in
    [UMIP 136](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-136.md).
  - Each field in this struct should be an integer represented as a string (to allow unlimited precision).
  - The rateModel struct is only valid if it contains all of the following parameters: `UBar`, `R0`, `R1`, and `R2`.
- "spokeTargetBalances"
  - This is contains a JSON mapping from chainId to JSON structs.
  - Each struct contains two sub-fields, "target" and "threshold".
  - Each is an integer represented as a string (to allow unlimited precision).
  - These integers should both be positive values. If either is negative, it should be treated as "0" when used.
  - The "target" integer should be < the "threshold" integer. If not, the "theshold" integer should be treated as if
    it contained the same value as the "target" integer when used.
  - If "spokeTargetBalances", a particular chainId is missing from the mapping, or "target" or "threshold" is missing,
    the missing "target" and "threshold" should be defaulted to 0.
- "transferThreshold"
  - This field should be a single integer value represented as a string (to allow unlimited precision).

For example, querying `tokenConfig("0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2")` might return:
> "{"rateModel":{"UBar":"750000000000000000","R0":"50000000000000000","R1":"0","R2":"600000000000000000"},"transferThreshold":"100000000000000000","spokeTargetBalances":{"1":{"threshold":"200000000000000000000","target":"100000000000000000000"},"42161":{"threshold":"400000000000000000000","target":"200000000000000000000"}}}"

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

## Determining block range for root bundle proposal
The `bundleEvaluationBlockNumbers` is an ordered array of end block numbers for each destination chain for this bundle. Which index
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

Note that the above rules require that the `bundleEvaluationBlockNumbers` for each `chainId` are strictly greater than the preceding [valid proposal's](#valid-bundle-proposals) `bundleEvaluationBlockNumbers` for the same `chainId`. The block range for each proposal starts at the preceding proposal's `bundleEvaluationBlockNumbers` plus 1 and go to the next `bundleEvaluationBlockNumbers`.

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
any `FilledRelay` events that have `isSlowRelay` set to `true` or have `fillAmount` equal to `0`.

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

## Matching L2 tokens and L1 tokens

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

## Validating realizedLpFeePct
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

1. _Add relayer refunds_: For each `FilledRelay` [group](#finding-valid-relays), initialize a running balance value at 0 and add the total relay repayments to
   it. Each running balance value is defined by its `repaymentChainId` and `l1Token`.
2. _Add slow fills_: For each [slow relay group](#finding-slow-relays), add each slow relay's [unfilled deposit amount](#computing-slow-relay-payment-amounts) to the group's running balance.
3. _Subtract deposits_: Find all `FundsDeposited` events on all `SpokePool`s from earlier within each `SpokePool`'s block range. Using the
   `originChainId`, `originToken`, the `quoteTimestamp`, and the `SetPoolRebalanceRoute` event on the HubPool, use a
   similar process as the 3 step one above to map this back to an `l1Token`. For that `l1Token` and `originChainId`,
   initialize a running balance value if one doesn't exist already and subtract the `amount` from it.
4. _Subtract excesses from partially executed slow fills_: In the case that a previous slow fill payment was sent to a `SpokePool`, but before the slow fill leaf could be executed, a relayer partially "fast" filled the deposit. Afterwards, the slow fill leaf was executed to complete the remainder of the deposit. The `SpokePool` now has a surplus amount of tokens because the original slow fill payment was not fully used to complete the deposit, so this excess must be returned to Mainnet. This step therefore explains how to identify excesses and determine how much to send back (i.e. subtract from running balances). Find all `FilledRelay` events in the block range that have `isSlowRelay` set to true. For each, use a similar method
   as above to [map this event back to an `l1Token` at the `quoteTimestamp`](#matching-l2-tokens-and-l1-tokens). Use the `destinationChainId` as the `repaymentChainId`
   to determine which running balance that this event should apply to. For each previously [validated bundle](#valid-bundle-proposals), follow the steps in the ["Finding Slow Relays"](#finding-slow-relays) section
   for this `originChainId` and `depositId`, and look for slow relays with a matching
   `originChainId` and `depositId`. There should be exactly one slow relay payment matching the `FilledRelay` in question. This is the slow fill that was included in a previous bundle that added to the `runningBalance` and ultimately led the bundle to send a slow fill payment to the `SpokePool` on the `destinationChainId`. Compute the [slow fill amount](#computing-slow-relay-payment-amounts) sent in the older root bundle. The excess amount remaining in the `SpokePool` after this current `FilledRelay` (with `isSlowRelay = true`) is equal to `slow fill amount` minus `FilledRelay.fillAmount`. In other words, if the `FilledRelay.fillAmount` is less than the `slow fill amount` originally sent over in a prior bundle, then send back the difference. Subtract the result from the running
   balance for the associated `l1Token` and `destinationChainId`.
5. _Subtract excesses from unexecuted slow fills_: This section is similar to the one above but deals with cases where the slow fill leaf can never be executed. Find all `FilledRelay` events in the block range that have `totalFilledAmount` equal to `amount` (i.e. fills that completed a deposit) and that have `fillAmount` less than `amount` (i.e. fills that were not the first fill for a deposit). If the first fill for a deposit completed a deposit (`fillAmount == amount` and `totalFilledAmount == amount`), then there can be no excess left in the spoke pool because this would not have triggered a slow fill payment to be sent to the spoke. First we need to see if the first fill for this current fill triggered a slow fill. In previously [validated bundles](#valid-bundle-proposals), identify all matching fills for the same `originChainId` and `depositId`. Find the earliest such fill. Determine the block range of the root bundle proposal that contained this fill using [this logic](#determining-block-range-for-root-bundle-proposal) for the `ProposeRootBundle` event with a `bundleEndBlock` for the `FilledRelay.destinationChainId` greater than or equal to the `FilledRelay` block number. Find the last fill in this same bundle block range. The slow fill payment for the bundle should have been `FilledRelay.amount - FilledRelay.totalFilledAmount`, same as [this calculation](#computing-slow-relay-payment-amounts). Since we know that the current `FilledRelay` in this upcoming proposal 100% filled the deposit, we know that the slow fill leaf cannot be executed, so the entire slow fill payment must be sent back to mainnet. Subtract this (the preceiding slow fill payment from a valid root bundle that this fill ultimately completed) from the running balance.

We now need to add the preceding running balance value to the current one for a given `repaymentChainId` and `l1Token`.
For each `repaymentChainId` and `l1Token` combination, older
[RootBundleExecuted](https://github.com/across-protocol/contracts-v2/blob/a8ab11fef3d15604c46bba6439291432db17e745/contracts/HubPool.sol#L157-L166) events
should be queried to find the preceding `RootBundleExecuted` event. This means identifying the most recent `RootBundleExecuted` event with a `chainId` matching the `repaymentChainId` and [identifying the `runningBalanceValue` at the index of the `l1Token`](#matching-l1-tokens-to-running-balances-or-net-send-amounts).

For each tuple of `l1Token` and `repaymentChainId`, we should have computed a total running balance value. The
following algorithm describes the process of computing running balance and net send amount:

```
transfer_threshold = the transfer threshold for this token
spoke_balance_threshold = the "threshold" value in `spokeTargetBalances` for this token
spoke_balance_target = the "threshold" value in `spokeTargetBalances` for this token

net_send_amount = 0
if running_balance >= 0 && running_balance >= transfer_threshold:
  net_send_amount = running_balance
  running_balance = 0
else if abs(running_balance) >= spoke_balance_threshold:
  desired_transfer_amount = min(running_balance + spoke_balance_target, 0)
  net_send_amount = abs(desired_transfer_amount) >= transfer_threshold ? desired_transfer_amount : 0
  running_balance = running_balance - net_send_amount
```

Take the above running balances and net send amounts and group them by only `repaymentChainId` and sort by `repaymentChainId`. Within
each group, sort by `l1Token`. If there are more than [`MAX_POOL_REBALANCE_LEAF_SIZE`](#global-constants) `l1Tokens`, a particular chain's leaf will
need to be broken up into multiple leaves, starting at `groupIndex` 0 and each subsequent leaf incrementing the
`groupIndex` value by 1.

Now that we have ordered leaves, we can assign each one a unique `leafId` starting from 0.

With all of that information, each leaf should be possible to construct in the format given
[here](https://github.com/across-protocol/contracts-v2/blob/a8ab11fef3d15604c46bba6439291432db17e745/contracts/HubPoolInterface.sol#L13-L42).
Importantly, the `l1Tokens`, `bundleLpFees`, `netSendAmounts` and `runningBalances` arrays should all be the same length. The latter three arrays are values mapped to the `l1Tokens` entry of the same index. See [this section](#matching-l1-tokens-to-running-balances-or-net-send-amounts) to better explain how to map `l1Tokens` to the other three arrays.

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

The `l2TokenAddress` is the corresponding L2 token address for the `l1Token` in the previous section. Note: see [above section](#matching-l2-tokens-and-l1-tokens) for how to map L1 and L2 tokens via events on L1. This mapping should be done according to the highest
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
3. `bundleEvaluationBlockNumbers` must include all `chainIds` that have a nonzero
   [CrossChainContractsSet](https://github.com/across-protocol/contracts-v2/blob/a8ab11fef3d15604c46bba6439291432db17e745/contracts/HubPool.sol#L119)
   at the time of proposal.
4. No obvious griefing or manipulation of the system is being performed via this proposal.

If the proposal is deemed invalid, return 0. If valid, return 1. Note: these values are scaled by `1e18`.

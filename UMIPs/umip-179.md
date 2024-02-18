# Headers
- UMIP 179
- Title: Update the **ACROSS-V2** price identifier to support Across v3
- Author paul@across.to
- Status: Last Call
- Created: 2023-02-17
- Discourse Link: N/A

# Summary
This UMIP defines the updated protocol specification for Across V3. It deprecates specific sections of the existing Across protocol specification as described in [UMIP-157](https://github.com/UMAprotocol/UMIPs/blob/7b1a046098d3e2583abd0372c5e9c6003b46ad92/UMIPs/umip-157.md).

# Motivation
Across v3 is a major refinement of the Across v2 specification, adding support for new features whilst simplifying the existing protocol.

# Rationale
The Across Protocol proposes an update to its specification to better support the intent-based future of cross-chain bridging. This includes:
 - Supporting enforceable time-limited agreements between users and relayers for intent execution.
 - Enabling Across to be used by third-parties as an efficient, modular cross-chain settlement system.
 - Permitting depositors to be refunded directly on the origin chain in the event that their relay is not completed within a timeframe specified at deposit time.
 - Reducing relayer risk exposure by eliminating the need for onchain publication of the `realizedLpFeePct` component of a bridge transfer.
 - Supporting relayer exclusivity to mitigate onchain gas auctions.

Updating the specification of the ACROSS-V2 price identifier is required in order for the UMA DVM to verify whether Across v3 proposed settlement bundles are valid.

# Technical Specification
## Overview
The following sections from UMIP-157 are explicitly retained for use in Across v3:
- [Across v2 Architecture](https://github.com/UMAprotocol/UMIPs/blob/7b1a046098d3e2583abd0372c5e9c6003b46ad92/UMIPs/umip-157.md#across-v2-architecture)
- [Definitions](https://github.com/UMAprotocol/UMIPs/blob/7b1a046098d3e2583abd0372c5e9c6003b46ad92/UMIPs/umip-157.md#definitions)
- [Ancillary Data Specifications](https://github.com/UMAprotocol/UMIPs/blob/7b1a046098d3e2583abd0372c5e9c6003b46ad92/UMIPs/umip-157.md#ancillary-data-specifications)
- [Configuration Constants](https://github.com/UMAprotocol/UMIPs/blob/7b1a046098d3e2583abd0372c5e9c6003b46ad92/UMIPs/umip-157.md#configuration-constants)
- [Preliminary Information](https://github.com/UMAprotocol/UMIPs/blob/7b1a046098d3e2583abd0372c5e9c6003b46ad92/UMIPs/umip-157.md#preliminary-information)
- [Proposal Information](https://github.com/UMAprotocol/UMIPs/blob/7b1a046098d3e2583abd0372c5e9c6003b46ad92/UMIPs/umip-157.md#proposal-information)
- [Determining the Result](https://github.com/UMAprotocol/UMIPs/blob/7b1a046098d3e2583abd0372c5e9c6003b46ad92/UMIPs/umip-157.md#determining-the-result)

## Data Types
Across v3 introduces the following new data types:

### V3RelayData
The V3RelayData type underpins the transfer of funds in or out of a SpokePool instance. V3RelayData is defined as follows:
| Name | Type | Description |
| :--- |:---- | :---------- |
| depositor | address | The address that made the deposit on the origin chain. |
| recipient | address | The recipient address on the destination chain. |
| exclusiveRelayer | address | The optional exclusive relayer who can fill the deposit before the exclusivity deadline. |
| inputToken | address | The token that is deposited on the origin chain by the depositor. |
| outputToken | address | The token that is received on the destination chain by the recipient. |
| inputAmount | uint256 | The amount of inputToken that is deposited by the depositor. |
| outputAmount | uint256 | The amount of outputToken that is received by the recipient. |
| originChainId | uint256 | The chain ID of the origin SpokePool. |
| depositId | uint32 | The ID uniquely identifying a deposit on the origin chain. |
| fillDeadline | uint32 | The Unix timestamp on the destination chain after which the deposit can no longer be filled. |
| exclusivityDeadline | uint32 | The optional Unix timestamp on the destination chain after which any relayer can fill the deposit. |
| message | bytes | Optional data that is forwarded to the recipient as part of a relay. |

### FillStatus
A mapping of `RelayData` -> `FillStatus` is stored within each SpokePool instance. This mapping can be queried with the hashed `V3RelayData` for a deposit, allowing the status for the corresponding fill to be queried.

| Name | Value | Description |
| :--- | :---- | :---------- |
| Unfilled | 0 | The SpokePool has no known state for the corresponding `V3RelayData` hash. |
| RequestedSlowFill | 1 | A SlowFill request has been made for this V3RelayData hash. A corresponding `RequestedV3SlowFill` event has been previously emitted. |
| Filled | 2 | A fill (fast or slow) for this `V3RelayData` hash has been completed. |

### FillType
A FillType instance is emitted with each `FilledV3Relay` event (see below).

| Name | Value | Description |
| :--- | :---- | :---------- |
| FastFill | 0 | The relay was completed by a relayer as a fast fill. |
| ReplacedSlowFill | 1 | The relay was initially requested to be completed via slow fill, but was subsequently fast-filled by a relayer. |
| SlowFill | 2 | The relay was completed via slow fill. |

### V3RelayExecutionEventInfo
A V3RelayExecutionEventInfo instance is emitted with each `FilledV3Relay` event (see below).

| Name | Type | Description |
| :--- |:---- | :---------- |
| updatedRecipient | address | The recipient of the funds being transferred. This may be the `recipient` identified in the original deposit, or an updated `recipient` following a `RequestedSpeedUpV3Deposit` event. |
| updatedOutputAmount | uint256 | The amount sent to `updatedRecipient` by the relayer completing the fill. |
| updatedMessage | bytes | Data that is forwarded to the recipient as part of a relay. |
| repaymentChainId | uint256 | The chain specified by the depositor for fill repayment. |
| fillType | FillType | Type of fill completed (see `FillType` above). |

### V3SlowFill
A V3SlowFill instance is emitted with each `FilledV3Relay` event (see below).

| Name | Type | Description |
| :--- |:---- | :---------- |
| relayData | V3RelayData | `V3RelayData` instance to uniquely associate the SlowFill with `V3FundsDeposited` and `RequestedV3SlowFill` events. |
| chainId | uint256 | The chain ID of the SpokePool completing the SlowFill. |
| updatedOutputAmount | uint256 | The amount sent to `recipient` as part of a SlowFill. This should typically be equal to or greater than the `V3FundsDeposited` `outputAmount`. |
| repaymentChainId | uint256 | The chain specified by the depositor for fill repayment. |
| fillType | FillType | Type of fill completed. |

#### Notes
The `updatedRecipient` field is normally set to the `recipient` from the corresponding `V3FundsDeposited` event. In the event that the relayer completes the fill with an accompanying `RequestedSpeedUpV3Deposit` event, `updatedRecipient` will be set to the address approved by the update.

## Events
Across V3 defines the following new events:
- V3FundsDeposited
- RequestedSpeedUpV3Deposit
- RequestedV3SlowFill
- FilledV3Relay

### V3FundsDeposited
The `V3FundsDeposited` event emits the unique `V3RelayData` for an individual deposit. No additional fields are defined. Consumers of this event should append the `originChainId` in order to avoid unintentioanlly mixing events from different chains.

Note:
- The `V3FundsDeposited` `outputToken` is not required to be a known HubPool `l1Token`. In-protocol arbitrary token swaps are technically supported by Across v3.

### RequestedSpeedUpV3Deposit
The `RequestedSpeedUpV3Deposit` emits specifies the following fields:
| Name | Type | Description |
| :--- | :--- | :---------- |
| depositId | uint32 | The depositId of the corresponding `V3FundsDeposited` event to be updated. |
| depositor | address | The depositor of the corresponding `V3FundsDeposited` event to be updated. |
| updatedOutputAmount | uint256 | The new outputAmount approved by the depositor. This should be _lower_ than the original deposit `outputAmount`. |
| updatedRecipient | address | The new recipient to receive the funds. |
| updatedMessage | bytes | The new message to be supplied to the recipient. |
| depositorSignature | bytes | A signature by the depositor authorizing the above updated fields. |

Note:
- Relayers may optionally append the updated request from a `RequestedSpeedUpV3Deposit` when filling a relay, but have no obligation to use the updated request.
- The address identified by `exclusiveRelayer` has exclusive right to complete the relay on the destination chain until `exclusivityDeadline` has elapsed.
- If `exclusivityDeadline` is set to a past timestamp, any address is eligible to fill the relay.
- Any attempted fill that occurs after `fillDeadline` has elapsed shall be rejected by the destination SpokePool. The corresponding deposit shall be refunded via the origin SpokePool in the relevant settlement bundle.

### RequestedV3SlowFill
The `RequestedV3SlowFill` event emits `V3RelayData`. This event is emitted on the destination chain and is intended to signal to proposers that a slow fill has been requested.

Note:
- `RequestedV3SlowFill` events cannot occur until the `exclusivityDeadline` timestamp has elapsed on the destination chain.
- `RequestedV3SlowFill` events cannot be emitted once the `fillDeadline` timestamp has elapsed on the destination chain.

### FilledV3Relay
The `FilledV3Relay` event extends the `V3RelayData` type by adding the following fields:
| Name | Type | Description |
| :--- | :--- | :---------- |
| relayer | address | The address completing relay on the destination SpokePool. |
| repaymentChainId | uint256 | The depositId of the corresponding `V3FundsDeposited` event to be updated. |
| relayExecutionInfo | V3RelayExecutionInfo | The effective `recipient`, `message` and `outputAmount`, as well as the `FillType` performed (FastFill, ReplacedSlowFill, SlowFill). |

Note:
- Consumers of this event should append the `destinationChainId` attribute in order to avoid unintentioanlly mixing events from different chains.

# Root Bundle Proposals

## Requirements
A Root Bundle Proposal shall consist of the following:
| Name | Type | Description |
| :--- | :--- | :---------- |
| bundleEvaluationBlockNumbers | uint256[] | The ordered array of block numbers signifying the end block of the proposal for each respective `chainId`. |
| poolRebalanceLeafCount | uint8 | The number of `PoolRebalanceLeaf` instances represented by the `poolRebalanceRoot`. |
| poolRebalanceRoot | bytes32 | The Merkle Root of the tree representing the ordered array of `PoolRebalanceLeaf` objects comprising the proposal. |
| relayerRefundRoot | bytes32 | The Merkle Root of the tree representing the ordered array of `RelayerRefundLeaf` objects comprising the proposal. |
| slowRelayRoot | bytes32 | The Merkle Root of the tree representing the ordered array of `SlowFillLeaf` objects comprising the proposal. |

### Pool Rebalance Leaves
A `PoolRebalanceLeaf` shall consist of the following:

| Name | Type | Description |
| :--- | :--- | :---------- |
| chainId | uint256 | The SpokePool `chainId` referenced by the `PoolRebalanceLeaf`. |
| bundleLpFees | uint256[] | Ordered array of `bungleLpFee` values for the corresponding `l1Token`. |
| netSendAmounts | uint256[] | Ordered array of `netSendAmount` values for the corresponding `l1Token`. |
| runningBalances | uint256[] | Ordered array of `runningBalance` values for the corresponding `l1Token`. |
| groupIndex | uint256 | Indicates whether the corresponding `RelayerRefund` and `SlowRelay` roots shall be relayed to the corresponding SpokePool. |
| leafId | uint8 | Index of the `PoolRebalanceLeaf` within the ordered array of `PoolRebalanceLeaves`. |
| l1Tokens | address[] | Ordered array of HubPool `l1Token` addresses.

Note:
- The format of Pool Rebalance leaves is unchanged from Across v2.

### Relayer Refund Leaves
| Name | Type | Description |
| :--- | :--- | :---------- |
| chainId | uint256 | The SpokePool `chainId` referenced by the `RelayerRebalanceLeaf`. |
| leafId | uint8 | Index of the `RelayerRefundLeaf` within the ordered array of `RelayerRefundLeaves`. |
| l2TokenAddress | address[] | The SpokePool token used by this `RelayerRefundLeaf`.
| amountToReturn | uint256 | Amount of `l2TokenAddress` to return to the HubPool. |
| refundAddresses | uint256[] | Ordered array of addresses to be refunded by this `RelayerRefundLeaf`. |
| refundAmounts | uint256[] | Ordered array of amounts of `l2TokenAddress`to be refunded to the corresponding `refundAddress`. |

Note:
- The format of Relayer Refund leaves is unchanged from Across v2.
- Across v3 expands the utility of the `RelayerRefundLeaf` to include issuing depositor refunds on origin chains in the event of an expired `V3FundsDeposited` `fillDeadline`.

### Slow Relay Leaves
Across v3 `SlowRelayLeaf` objects are defined by the `V3SlowFill` [data type](#data-types).

Note:
- The format of Slow Relay leaves is updated from Across v2.

## Method
### Identifying SpokePool Contracts
The current SpokePool address for a specific chain is available by querying `HubPool.crossChainContracts()`. The chainId must be specified in the query. In case of SpokePool migations, historical SpokePool addresses can be identified by scraping HubPool `CrossChainContractsSet` events.

### Resolving SpokePool tokens to their HubPool equivalent
For the purpose of identifying the equivalent HubPool token given a SpokePool token, the following shall be followed:
1. Find the latest `SetRebalanceRoute` event with a block timestamp at or before the relevant HubPool block number, where the relevant SpokePool chain ID and token address  match the `SetRebalanceRoute` `destinationChainId` and `destinationToken` fields.
    - In the case of a `V3FundsDeposited` event, the relevant HubPool block number is identified by resolving the `quoteTimestamp` to a HubPool block number.
3. From the resulting `SetRebalanceRoute` event, select the associated `l1Token` field.
4. Search the `SetPoolRebalanceRoute` events for the same `l1Token` and `destinationChainId` at or before the applicable HubPool block number.
5. Using the `l1Token` value found in step 2, search for the latest `SetRebalanceRoute` event at or before the applicable HubPool block number where `l1Token` and `destinationChainId` that match the extracted `l1Token` and SpokePool chain ID. If a match is found, the addresses match and are considered cross-chain equivalents.

### Identifying Bundle Block Ranges
In addition to the description [UMIP-157](https://github.com/UMAprotocol/UMIPs/blob/pxrl/umip179/UMIPs/umip-157.md#determining-block-range-for-root-bundle-proposal):
- Proposers may opt to reduce the size of the proposal block range for each chain in the event that RPC provider data inconsistencies are detected, and
- A "soft pause" of a chain is permitted in the event that the proposer cannot safely increment the bundle block range, or has no events to propose beyond the previous bundle block range. In this case, the proposer may repeat the procedure for
  DISABLED_CHAINS by proposing from and to the previous bundle end block.

### Finding Valid Relays
For the purpose of computing relayer repayments, each `FilledV3Relay` event emitted within the target block range on a destination SpokePool shall be considered valid by verifying that:
1. The `FilledV3Relay` `FillType` field is not set to `SlowFill`,
2. The component `V3RelayData` maps exactly to a corresponding `V3FundsDeposited` event emitted on the relevant `originChainId`. This may be compared by comparing the hashes of the two objects.

If the `V3FundsDeposited` event specifies `outputToken` 0x0 (i.e. the Zero Address), the equivalent SpokePool token on the destination chain shall be substituted in. For the purpose of determining `V3RelayData` equivalency, the updated/substituted `outputToken` shall be used in place of 0x0.

### Finding Expired Deposits
For the purpose of computing depositor refunds, each `V3FundsDeposited` event shall be considered expired by verifying that:
1. The `fillDeadline` timestamp elapsed within the target block range on the destination SpokePool (i.e. the `fillDeadline` expired between the `block.timestamp` of the destination chain's bundle start and end block),
2. The `FillStatus` on the destination SpokePool is set to `Unfilled` or `SlowFillRequested`.

Note:
- Expired deposits shall be refunded to the `depositor` address on the origin SpokePool.
- Depositor refunds are to be issued as part of the relayer refund procedure.
- The `fillDeadline` timestamp shall be resolved to a block number on the destination chain in order to determine inclusion within the target block range.

### Finding Slow Fill Requests
For the purpose of computing slow fills to be issued to recipients, each `RequestedV3SlowFill` event emitted within the target block range on a destination SpokePool shall be considered valid by verifying that:
1. The `inputToken` and `outputToken` addresses are equivalent at the deposit `quoteTimestamp`,
2. The `fillDeadline` has not already elapsed relative to the `destinationChainId` bundle end block number,
3. The destination SpokePool `FillStatus` mapping for the relevant `V3RelayData` hash is `SlowFillRequested`,
4. The `RequestedV3SlowFill` `V3RelayData` is matched by a corresponding `V3FundsDeposited` event on the origin SpokePool,

Note:
- A slow fill request is made by supplying a complete copy of the relevant `V3RelayData` emitted by a `V3FundsDeposited` event.
- The resulting set of validated `RequestedV3SlowFill` events shall be included as SlowFills in the subsequent root bundle proposal.

### Computing LP Fees
Each valid `FilledV3Relay` event is subject to an LP fee. The procedure for computing LP fees is as defined in [UMIP-136 Add IS_RELAY_VALID as a supported price identifier](https://github.com/UMAprotocol/UMIPs/blob/7b1a046098d3e2583abd0372c5e9c6003b46ad92/UMIPs/umip-136.md), with the following amendments:
- The AcrossConfigStore contract shall be used to identify the correct rate model, instead of a `RateModelStore` contract.
- The `HubPool` `liquidityUtilizationCurrent()` and `liquidityUtilizationPostRelay()` functions shall be used instead of the `BridgePool` variant.
- The event `inputToken` shall be mapped from the SpokePool address to a HubPool `l1Token` address by following the matching procedure outlined above.
- The LP fee is computed between the `originChainId` and `FilledV3Relay.repaymentChainId` where the `relayExecutionInfo.FillType != SlowFill` and `FilledV3Relay.destinationChainId` otherwise.

Note:
- The LP fee is typically referenced as a multiplier of the `V3FundsDeposited` `inputAmount`, named `realizedLpFeePct` elsewhere in this document.

### Computing Bundle LP Fees
The bundle LP fee for a target block range on a SpokePool and token pair shall be determined by summing the applicable LP fees for each of the following validated events:
- `FilledV3Relay`

### Computing Relayer Repayments
For a validated `FilledV3Relay` event, the relayer repayment amount shall be computed as follows:
- `(inputAmount * (1 - realizedLpFeePct)) / 1e18`, where `realizedLpFeePct` is computed over the set of HubPool `l1Token`, `originChainId` and `repaymentChainId` at the HubPool block number corresponding to the relevant `V3FundsDeposited` `quoteTimestamp`.
- The applicable rate model shall be sourced from the AcrossConfigStore contract for the relevant `l1Token`.

### Computing Deposit Refunds
For an expired `V3FundsDeposited` event, the depositor refund amount shall be computed as `inputAmount` units of `inputToken`.

### Computing Slow Fill updated output amounts
For the purpose of computing the amount to issue to a recipient for a SlowFill, the relayer fee shall be nulled by applying the following procedure:
- `updatedOutputAmount = (inputAmount * (1 - realizedLpFeePct)) / 1e18`, where `realizedLpFeePct` is computed at the deposit `quoteTimestamp` between `originChainId` and `destinationChainId`.

Constraint:
- The `V3FundsDeposited` `outputAmount` shall _not_ be considered when determining SlowFill amounts.

Note:
- The `V3FundsDeposited` `outputAmount` specifies the exact amount to be received by the `recipient` for a standard fill, and is therefore exclusive of any relayer or LP fees paid.

### Finding the Opening Running Balance
The Opening Running Balance is defined as the cumulative running balance as at the previous successful (undisputed) Root Bundle Proposal.

The Opening Running Balance for each unique `l1Token` and `repaymentChainId` pair shall be determined as follows:
1. Search for the preceding [RootBundleExecuted](https://github.com/across-protocol/contracts-v2/blob/a8ab11fef3d15604c46bba6439291432db17e745/contracts/HubPool.sol#L157-L166) event where:
    1. The `RootBundleExecuted` `chainId` matches `repaymentChainId`, and
    2. The `l1Token` address appears in the `l1Tokens` array.
2. For the preceding event, identify the index of `l1Token` in the `l1Tokens` array, and lookup the corresponding index in the `runningBalances` array.
3. In the event that no preceding runningBalance is idenfied, the Opening Running Balance shall default to 0.

### Computing Running Balances & Net Send Amounts
The procedure for computing running balances for an `l1Token` and `chainId` pair shall implement the follows steps:
1. Initialize the running balance to 0.

2. Add relayer refunds:
    - For each group of validated `FilledV3Relay` events, initialize a running balance at 0 and add the add the relayer repayment.

3. Add deposit refunds:
    - For each group of `V3FundsDeposited` events that expired within the target block range, sum the total deposit refunds on the origin chain. Add the amount to the exsting relayer refunds for that chain.

4. Add slow fills:
    - For each group of validated `RequestedV3SlowFill` events, add each slow relay's `updatedOutputAmount` to the group's running balance.

5. Subtract excesses from unexecuted slow fills:
    - For each group of validated `FilledV3Relay` events where the `FillType` is `ReplacedSlowFill` and where there is no valid `RequestedV3SlowFill` event with an identical relay data hash in the current bundle data, subtract the SlowFill `updatedOutputAmount` from the running balance in recognition that the SlowFill will never be executed because the fill amount has already been transferred.
    - For each expired deposit refund identified above where the `FillStatus` on the deposit destination chain for the deposit's relay data is `RequestedSlowFill` and the matching slow fill request is not in the current bundle range, subtract the associated SlowFill `updatedOutputAmount` from the running balance in recognition that the SlowFill cannot be executed past the `fillDeadline`.

6. Add the Opening Running Balance for the selected `l1Token` and `chainId` pair.

8. Set the Net Send Amount and update the Running Balance  for each `l1Token` and `chainId` pair subject to the outcome of `Computing Net Send Amounts` as described by the following algorithm:
```
spoke_balance_threshold = the "threshold" value in `spokeTargetBalances` for this token
spoke_balance_target = the "target" value in `spokeTargetBalances` for this token

net_send_amount = 0
# If running balance is positive, then the hub owes the spoke funds.
if running_balance > 0:
  net_send_amount = running_balance
  running_balance = 0
# If running balance is negative, withdraw enough from the spoke to the hub to return the running balance to its target
else if abs(running_balance) >= spoke_balance_threshold:
  net_send_amount = min(running_balance + spoke_balance_target, 0)
  running_balance = running_balance - net_send_amount
```

Note:
The referenced `SpokeTargetBalances` is as specified by [UMIP-157 Token Constants](https://github.com/UMAprotocol/UMIPs/blob/pxrl/umip179/UMIPs/umip-157.md#token-constants):

## Constructing Root Bundles

### Constructing the Pool Rebalance Root
One Pool Rebalance Leavef shall be produced per unique `chainId` & `l1Token` pair, where the corresponding SpokePool emitted `V3FundsDeposited`, `FilledV3Relay` or`RequestedV3SlowFill` events within the target block range.

Each Pool Rebalance Leaf shall be constructed as follows:
1. For each unique `chainId` and `l1Token` pair:
    1. Compute the arrays `runningBalances`, `netSendAmounts` and `bundleLpFees` according to the procedures outlined above.
    2. Set the `groupIndex` to 0.
2. Within each `PoolRebalanceLeaf` instance, the arrays `l1Tokens`, `runningBalances`, `netSendAmounts` and `bundleLpFees` shall be:
    1 Ordered by `l1Token`, and
    2 Of the same (on-zero length.

In the event that the number of `l1Token` entries contained within a single Pool Rebalance Leaf exceeds [`MAX_POOL_REBALANCE_LEAF_SIZE`](#global-constants):
1. Additional `PoolRebalanceLeaf` instanes shall be produced to accomodate the excess.
2. The ordering of `l1Tokens`, `bundleLpFees`, `runningBalance` and `neSendAmounts,` shall be maintained across the ordered array of leaves.
3. `groupIndex` shall be incremented for each subsequent leaf.

The set of PoolRebalanceLeaf objects shall be ordered by:
1, `chainId`, then
2. `l1Tokens`.

The PoolRebalanceLeaf `leafId` shall be set to indicate its position with the ordered array, starting at 0.

The hash for each `PoolRebalanceLeaf` shall be constructed by using Solidity's standard process of `keccak256(abi.encode(poolRebalanceLeaf))`.

The PoolRebalance Merkle Tree shall be constructed such that it is verifyable using [OpenZeppelin's MerkleProof](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/742e85be7c08dff21410ba4aa9c60f6a033befb8/contracts/utils/cryptography/MerkleProof.sol) library.

Note:
- See examples [here](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/742e85be7c08dff21410ba4aa9c60f6a033befb8/test/utils/cryptography/MerkleProof.test.js) for how to construct these types of trees.

### Constructing the RelayerRefundRoot
At least one `RelayerRefundLeaf` shall be produced for each unique combination of SpokePool and `l1Token` for any of the following conditions:
- Valid `FilledV3Relay` events, OR
- Expired `V3Fundsdeposited` events, OR
- A negative running balance net send amount.

Each Relayer Refund Leaf shall be constructed as follows:
- `amountToReturn` shall be set to `max(-netSendAmount, 0)`.
- `l2TokenAddress` shall be set to the L2 token address for the corresponding `l1Token` considered in PoolRebalanceRoot production.
    - HubPool and SpokePool token mappings shall done according to the highest `quoteTimestamp` of any relays in the group.
    - If no relays are present, then the relevant token mapping from the previous successful proposal shall be used.
- Each element of the `refundAddresses` and `refundAmounts` arrays shall be produced according to the defined procedure for computing relayer repayments.
    - One entry shall exist per unique address, containing the sum of any outstanding:
        - Relayer repayments, and/or
        - Expired deposits.
- The `refundAddresses` and `refundAmounts` arrays shall be ordered according to the following criteria:
    1. `refundAmount` descending order, then
    2. `relayerAddress`ascending order (in case of duplicate `refundAmount` values).

In the event that the number of refunds contained within a Relayer Refund leaf should exceed [`MAX_RELAYER_REPAYMENT_LEAF_SIZE`](#global-constants) refunds:
1. Additional `RelayerRefundLeaf` instanes shall be produced to accomodate the excess.
2. The ordering of `refundAddresses` and `refundAmounts` shall be maintained across the ordered array of leaves.
3. Only the first leaf for a given `l2TokenAddress` shall contain a non-zero `amountToReturn`.

The set of relayer refund leaves shall be ordered according to:
- chainId, then
- `l2TokenAddress`, then
- leaf sub-index (in case of > [`MAX_RELAYER_REPAYMENT_LEAF_SIZE`](#global-constants) repayments).

The Relayer Refund Leaf `leafId` field shall be numbered according to the ordering established above, starting at 0.

Note:
- Once these leaves are constructed, they can be used to form a merkle root as described in the previous section.

### Constructing the SlowRelayRoot
One `V3SlowRelayLeaf` shall be produced per valid `RequestedV3SlowRelay` event emitted within the target block range for a destination SpokePool.

Each `V3SlowRelayLeaf` shall be constructed as follows:
1. Set `relayData` to the `V3RelayData` data emitted by the validated `RequestedV3SlowFill` event.
2. Set `chainId` to `destinationChainId` from the corresponding validated `RequestedV3SlowFill` event.
3. Set `updatedOutputAmount` to the updated amount computed for the SlowFill.

The array of `V3SlowRelayLeaf` instances shall be sorted according to;
1. `originChainId`, then
2. `depositId`.

Note:
- Once these leaves are constructed, they can be used to form a merkle root as described in the previous section.
- Deposits with disparate output tokens (i.e. where the outputToken is not the equivalent of inputToken on the destination chain) are explicitly not eligible for slow fills. Any instances of `RequestedV3SlowFill` events for non-equivalent tokens shall be ignored.

# Recommendations
- Proposers are responsible for detecting and mitigating incorrect or inconsistent RPC data. Proposers should take steps to validate the correctness of their RPC data before proposing.
- Proposers should avoid relying on the deposit `outputAmount`, even for deposits where the `outputToken` is a known HubPool token. When computing fees, ensure that the `realizedLpFee` is _always_ subtracted from the `inputAmount`, rather than trying to infer them based on the spread between `inputAmount` and `outputAmount`.
- Relayers are advised to factor in origin chain finality guarantees when making fills on destination chains. Origin chain re-organisation can lead to deposit re-ordering and can thus invalidate fills.

# Across v2 -> V3 Transition
Across v3 is supplementary to Across v2, adding extra logic support new types of deposits, fills and slow fill requests. At the point of upgrading to Across v3, it will no longer be possible for Across v2 `FundsDeposited` events to be emitted. In order to support continuity of service and to minimise disruption for third-party integrators, it will be possible for pre-existing `FundsDeposited` events to be filled via `FilledRelay` events. During this period, RootBundleProposals will contain relayer repayment and slow fill leaves for both Across v2 and v3.

The V3 rules defined in this UMIP will apply beginning when the VERSION field in the ConfigStore is updated to 3 or higher. The ability for Across bundles to support V2 events may cease in a future VERSION increment.

# Implementation
The Across v3 implementation is available in the Across [contracts-v2](https://github.com/across-protocol/contracts-v2) repository.

# Security considerations
Across v3 has been audited by OpenZeppelin.

Note:
- If a particular relayer refund is known to be unexecutable, it can be removed from the bundle by the proposer if a sufficient public justification is made before the proposal. This is intended to deal with unlikely situations, such as ag centralized token issuer blacklisting an address that is due a refund. If this leaf were to remain unaltered, this blacklisted address could block other addresses from recieving refunds.

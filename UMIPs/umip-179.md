# Headers
- UMIP 179
- UMIP title: Update the **ACROSS-V2** price identifier to support Across v3
- Author paul@across.to
- Status: Draft
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
 - Reducing relayer risk exposure by elimintating the need for onchain publication of the `realizedLpFeePct` component of a bridge transfer.
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
| exclusivityDeadline | uint32 | The Unix timestamp on the destination chain after which any relayer can fill the deposit. |
| message | bytes | Data that is forwarded to the recipient as part of a relay. |

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
A V3RelayExecutionEventInfo instanace is emitted with each `FilledV3Relay` event (see below).

| Name | Type | Description |
| :--- |:---- | :---------- |
| updatedRecipient | address | The recipient of the funds being transferred. May have been the `recipient` identified in the original deposit, or an updated `recipient` following a `RequestedSpeedUpV3Deposit` event. |
| updatedOutputAmount | uint256 | The amount sent to `updatedRecipient` by the relayer completing the fill. |
| updatedMessage | bytes | Data that is forwarded to the recipient as part of a relay. |
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

Notes:
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

Consumers of this event should append the `destinationChainId` attribute in order to avoid unintentioanlly mixing events from different chains.

# Root Bundle Proposals

## Requirements
A Root Bundle Propopsal shall contain:
- One array of bundle evaluation block numbers, where each entry represents the end block of the proposal for the corresponding chain ID. The array shall be sorted such that each entry corresponds to the chain ID configured in the AcrossConfigStore `CHAIN_ID_INDICES` configuration item.
- One poolRebalanceRoot.
- One relayerRefundRoot.
- One slowRelayRoot. 

### Pool Rebalance Roots
Each Pool Rebalance Root shall be the Merkle Root of an array of 

### Relayer Refund Roots
The _format_ of Relayer Refund leaves is unchanged from Across v2, as described in [UMIP-157 Constructing RelayerRefundRoot](https://github.com/UMAprotocol/UMIPs/blob/pxrl/umip179/UMIPs/umip-157.md#constructing-relayerrefundroot). Across v3 expands Relayer Refund leaves to include depositor refunds on origin chains in the event of an expired deposit `fillDeadline`.

### Slow Relay Roots

## Method
### Finding Valid Relays
For each enabled destination chain, find all `FilledV3Relay` events emitted by its SpokePool between the starting block number and ending block number for that chain. Exclude any `FilledV3Relay` events where `FillType` is set to `SlowFill`.

For each `FilledV3Relay` event found, search the relevant SpokePool contract on the origin chain for a matching `V3FundsDeposited` event. Events can be reliably matched by directly comparing their component `V3RelayData` (or derivative hashes).

Note:
- If a fill is considered to be invalid at any point due to a `V3RelayData` mismatch (or no corresponding `V3FundsDeposited` event having been emitted via the origin SpokePool), that fill must be excluded from the resulting bundle.

### Finding Expired Deposits
For each `V3FundsDeposited` event containing a `fillDeadline` that expires within the proposal block range on the destination SpokePool, where the destination `FillStatus` is `Unfilled`, it shall be refunded to the `depositor` address on the origin SpokePool. The `fillDeadline` timestamp shall be resolved to a block number on the destination chain in order to determine inclusion. Depositor refunds are issued as part of the relayer refund procedure.

### Finding Slow Fill Requests
A slow fill is requested a when a _destination_ SpokePool contract emits a `RequestedV3SlowFill` event. A slow fill request is made by supplying a complete copy of the relvant `V3RelayData` emitted by a `V3FundsDeposited` event.

1. For each `RequestedV3SlowFill` event emitted within the target block range on the destination SpokePool, identify whether the request is eligible for a slow fill by determining whether the `inputToken` and `outputToken` addresses are equivalent.
2. For each resulting `RequestedV3SlowFill` event, determine whether it has been completed by either of the following methods:
   - Querying the destination SpokePool `FillStatus` mapping with the corresponding `V3RelayData` hash, OR
   - Searching for a corresponding `FilledV3Relay` event.
3. For each `RequestedV3SlowFill` event, apply filtering on the basis of its destination SpokePool `FillStatus`, such that only `RequestedV3SlowFill` fills are retained.
4. Each resulting `RequestedV3SlowFill` event shall be matched against a corresponding `V3FundsDeposited` event on the origin SpokePool. Any events that cannot be matched shall be dropped.
6. The resulting set of matched and validated `RequestedV3SlowFill` events shall be included as SlowFills in the subsequent RootBundle.

### Matching SpokePool & HubPool tokens
1. Find the latest `SetRebalanceRoute` event with a block timestamp at or before the `quoteTimestamp` in the associated `V3FundsDeposited` event, where `originChainId` and `inputToken` match the `destinationChainId` and `destinationToken`. Pull the `l1Token` value from the resulting event. If there is no matching event, the relay is invalid.
2. Search the `SetPoolRebalanceRoute` events for the same `l1Token` and `destinationChainId` before or at the `quoteTimestamp`. If there are any matching events later than the one found in step 1, the relay is invalid.
3. Using the `l1Token` value found in step 1, search for the latest SetRebalanceRoute event at or before the quoteTimestamp with that l1Token and with the destinationChainId that matches the destinationChainId value from the FundsDeposited event. If a match is found, the destinationToken should match the destinationToken value in the FilledRelay event. If they don't match or if no matching event is found, the relay is invalid.

### Computing LP Fees
<!-- todo: Check that the link to `Matching SpokePool & HubPool tokens` is working -->
Each valid `FilledV3Relay` event is subject to an LP fee. The procedure for computing LP fees is as defined in [UMIP-136 Add IS_RELAY_VALID as a supported price identifier](https://github.com/UMAprotocol/UMIPs/blob/7b1a046098d3e2583abd0372c5e9c6003b46ad92/UMIPs/umip-136.md), with the following amendments:
- The AcrossConfigStore contract is used to identify the correct rate model, instead of a `RateModelStore` contract.
- The `FilledV3Relay` inputToken can be mapped from a SpokePool token to a HubPool token `l1Token` by following the matching procedure outlined above.
- The LP fee is computed between the `FilledV3Relay` `originChainId` and `repaymentChainId`.
- The `HubPool` `liquidityUtilizationCurrent()` and `liquidityUtilizationPostRelay()` functions are used instead of the `BridgePool` variant.

The LP fee is typically referenced as a multiplier of the `V3FundsDeposited` `inputAmount`, named `realizedLpFeePct` elsewhere in this document. 

### Computing Relayer Repayments
For a given `FilledV3Relay` event that has been matched with a `V3FundsDeposited` event, relayer repayment amount is computed as follows: `inputAmount * (1 - realizedLpFeePct)`, where `realizedLpFeePct` is computed over the set of l1Token, originChainId and destinationChainId at the HubPool block number corresponding to the deposit `quoteTimestamp`. The applicable rate model is sourced from the AcrossConfigStore contract for the relevant `l1Token`.

### Computing Slow Fill updated output amounts
`V3FundsDeposited` `outputAmount` specifies the exact amount to be received by the `recipient` for a standard fill, and is therefore exclusive of any relayer or LP fees paid. In the event of a Slow Fill, the relayer fee is effectively nulled. Therefore, the amount to be received by the recipient in the event of a SlowFill shall be increased by the relayer fee, assuming the relayer would take repayment on the destination chain. The SlowFill `updatedOutputAmount` is computed as follows: `updatedOutputAmount = inputAmount * (1 - realizedLpFeePct)`, where `realizedLpFeePct` is computed at the deposit `quoteTimestamp` between `originChainId` and `destinationChainId`.

### Computing Running Balances
1. Add relayer refunds

     For each group of validated `FilledV3Relay` events, initialize a running balance at 0 and add the add the relayer repayment.

2. Add deposit refunds
   
    For each group of `V3FundsDeposited` events that expired within the target block range, sum the total deposit refunds on the origin chain. Add the amount to the exsting relayer refunds for that chain. 

3. Add slow fills
   
    For each group of validated `RequestedV3SlowFill` events, add each slow relay's `updatedOutputAmount` to the group's running balance.

4. Subtract excesses from unexecuted slow fills
   
    For each group of validated `FilledV3Relay` events where the `FillType` is `ReplacedSlowFill`, subtract the SlowFill `updatedOutputAmount` from the running balance in recognition that the SlowFill will never be executed.

### Identifying SpokePool Contracts
The current SpokePool address for a specific chain is available by querying `HubPool.crossChainContracts()`. The chainId must be specified in the query. In case of SpokePool migations, historical SpokePool addresses can be identified by scraping HubPool `CrossChainContractsSet` events.

### Constructing the PoolRebalanceRoot
<!-- todo: Can the v2 description be used here? -->

### Constructing the RelayerRefundRoot
Relayer Refund leaves are produced by aggregating the set of eligible repayment events:
- Repayment amounts for valid fills.
- Deposit amounts for expired deposits.

The above items are sorted and ordered according to:
1. Repayment amount.
2. Repayment address (relayer or depositor).

### Constructing the SlowRelayRoot
<!-- todo: Complete this section -->

Note:
- Deposits with disparate output tokens (i.e. where the outputToken is not the equivalent of inputToken on the destination chain) are explicitly not eligible for slow fills. Any instances of `RequestedV3SlowFill` events for non-equivalent tokens shall be ignored. 

# Recommendations
- Proposers are responsible for detecting and mitigating incorrect or inconsistent RPC data. Proposers should take steps to validate the correctness of their RPC data before proposing.
- Proposers should avoid relying on the deposit `outputAmount`, even for deposits where the `outputToken` is a known HubPool token. When computing fees, ensure that the `realizedLpFee` is _always_ subtracted from the `inputAmount`, rather than trying to infer them based on the spread between `inputAmount` and `outputAmount`.
- Relayers are advised to factor in origin chain finality guarantees when making fills on destination chains. Origin chain re-organisation can lead to deposit re-ordering and can thus invalidate fills.

# Across v2 -> V3 Transition
Across v3 is supplementary to Across v2, adding extra logic support new types of deposits, fills and slow fill requests. At the point of upgrading to Across v3, it will no longer be possible for Across v2 `FundsDeposited` events to be emitted. In order to support continuity of service and to minimise disruption for third-party integrators, it will be possible for pre-existing `FundsDeposited` events to be filled via `FilledRelay` events. During this period, RootBundleProposals will contain relayer repayment and slow fill leaves for both Across v2 and v3.
<!-- todo: Should the end of this dual-operation period be signalled by a bump in the ConfigStore VERSION flag? -->

# Implementation
<!-- todo: add SHA256 hash (or git tag?) for the relevant repository state -->
The Across v3 implementation is available in the Across [contracts-v2](https://github.com/across-protocol/contracts-v2) repository.

# Security considerations
<!-- todo: add audit reference -->
Across v3 has been audited by OpenZeppelin.

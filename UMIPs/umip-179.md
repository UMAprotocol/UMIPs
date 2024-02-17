## Headers
- UMIP 179
- UMIP title: Update the **ACROSS-V2** price identifier to support Across v3
- Author paul@across.to
- Status: Draft
- Created: 2023-02-17
- Discourse Link: N/A

## Summary
This UMIP defines the updated protocol specification for Across V3. It deprecates specific sections of the existing Across protocol specification as described in [UMIP-157](https://github.com/UMAprotocol/UMIPs/blob/7b1a046098d3e2583abd0372c5e9c6003b46ad92/UMIPs/umip-157.md).

## Motivation
Across v3 is a major refinement of the Across v2 specification, adding support for new features whilst simplifying the existing protocol.

## Rationale
The Across Protocol proposes an update to its specification to better support the intent-based future of cross-chain bridging. This includes:
 - Supporting enforceable time-limited agreements between users and relayers for intent execution.
 - Enabling Across to be used by third-parties as an efficient, modular cross-chain settlement system.
 - Permitting depositors to be refunded directly on the origin chain in the event that their relay is not completed within a timeframe specified at deposit time. 
 - Reducing relayer risk exposure by elimintating the need for onchain publication of the `realizedLpFeePct` component of a bridge transfer.
 - Supporting relayer exclusivity to mitigate onchain gas auctions.

Updating the specification of the ACROSS-V2 price identifier is required in order for the UMA DVM to verify whether Across v3 proposed settlement bundles are valid.

## Technical Specification
### Overview
The following sections from UMIP-157 are explicitly retained for use in Across v3:
- [Across v2 Architecture](https://github.com/UMAprotocol/UMIPs/blob/7b1a046098d3e2583abd0372c5e9c6003b46ad92/UMIPs/umip-157.md#across-v2-architecture)
- [Definitions](https://github.com/UMAprotocol/UMIPs/blob/7b1a046098d3e2583abd0372c5e9c6003b46ad92/UMIPs/umip-157.md#definitions)
- [Ancillary Data Specifications](https://github.com/UMAprotocol/UMIPs/blob/7b1a046098d3e2583abd0372c5e9c6003b46ad92/UMIPs/umip-157.md#ancillary-data-specifications)
- [Configuration Constants](https://github.com/UMAprotocol/UMIPs/blob/7b1a046098d3e2583abd0372c5e9c6003b46ad92/UMIPs/umip-157.md#configuration-constants)
- [Preliminary Information](https://github.com/UMAprotocol/UMIPs/blob/7b1a046098d3e2583abd0372c5e9c6003b46ad92/UMIPs/umip-157.md#preliminary-information)
- [Proposal Information](https://github.com/UMAprotocol/UMIPs/blob/7b1a046098d3e2583abd0372c5e9c6003b46ad92/UMIPs/umip-157.md#preliminary-information)
- [Determining the Result](https://github.com/UMAprotocol/UMIPs/blob/7b1a046098d3e2583abd0372c5e9c6003b46ad92/UMIPs/umip-157.md#determining-the-result)

### Data Types
Across v3 introduces the following new data types:

#### V3RelayData
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

#### FillStatus
| Name | Value | Description |
| :--- | :---- | :---------- |
| Unfilled | 0 | The SpokePool has no known state for the corresponding `V3RelayData` hash. |
| RequestedSlowFill | 1 | A SlowFill request has been made for this V3RelayData hash. A corresponding `RequestedSlowFill` event has been previously emitted. |
| Filled | 2 | A fill (fast or slow) for this `V3RelayData` hash has been completed. |

#### FillType
| Name | Value | Description |
| :--- | :---- | :---------- |
| FastFill | 0 |  |
| ReplacedSlowFill | 1 |  |
| SlowFill | 2 | |

#### V3RelayExecutionEventInfo
| Name | Type | Description |
| :--- |:---- | :---------- |
| updatedRecipient | address | The recipient of the funds being transferred. May have been the `recipient` identified in the original deposit, or an updated `recipient` following a `RequestedSpeedUpV3Deposit` event. |
| updatedOutputAmount | uint256 | The amount sent to `updatedRecipient` by the relayer completing the fill. |
| updatedMessage | bytes | Data that is forwarded to the recipient as part of a relay. |
| repaymentChainId | uint256 | The chain specified by the depositor for fill repayment. |
| fillType | FillType | Type of fill completed. |

##### Notes
The `updatedRecipient` field is normally set to the `recipient` from the corresponding `V3FundsDeposited` event. In the event that the relayer completes the fill with an accompanying `RequestedSpeedUpV3Deposit` event, `updatedRecipient` will be set to the address approved by the update.

### Events
Across V3 defines the following new events:
- V3FundsDeposited
- RequestedSpeedUpV3Deposit
- RequestedV3SlowFill
- FilledV3Relay

#### V3FundsDeposited
The `V3FundsDeposited` event emits the unique `V3RelayData` for an individual deposit. No additional fields are defined. Consumers of this event should append the `originChainId` in order to avoid unintentioanlly mixing events from different chains.

#### RequestedSpeedUpV3Deposit
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

#### RequestedV3SlowFill
The `RequestedV3SlowFill` event emits `V3RelayData`. This event is emitted on the destination chain and is intended to signal to proposers that a slow fill has been requested.

Note:
- `RequestedV3SlowFill` events cannot occur until the `exclusivityDeadline` timestamp has elapsed on the destination chain.
- `RequestedV3SlowFill` events cannot be emitted once the `fillDeadline` timestamp has elapsed on the destination chain.

#### FilledV3Relay
The `FilledV3Relay` event extends the `V3RelayData` type by adding the following fields:
| Name | Type | Description |
| :--- | :--- | :---------- |
| relayer | address | The address completing relay on the destination SpokePool. |
| repaymentChainId | uint256 | The depositId of the corresponding `V3FundsDeposited` event to be updated. |
| relayExecutionInfo | V3RelayExecutionInfo | The effective `recipient`, `message` and `outputAmount`. | 

Consumers of this event should append the `destinationChainId` attribute in order to avoid unintentioanlly mixing events from different chains.

## Method
### Finding Valid Relays
For each enabled destination chain, find all `FilledV3Relay` events emitted by its SpokePool between the starting block number and ending block number for that chain. Exclude any FilledV3Relay events that have `FillType` set to `SlowFill`.

For each `FilledV3Relay` event found, search the relevant SpokePool contract on the origin chain for a matching `V3FundsDeposited` event. Events can be reliably matched by directly comparing their component `V3RelayData` (or comparing their hashes).

Note:
- If fill is considered to be invalid at any point due to a `V3RelayData` mismatch (or no corresponding `V3FundsDeposited` event being located), that fill must be excluded from the resulting bundle.

### Finding Slow Fill Requests
A slow fill is requested a when a _destination_ SpokePool contract emits a `RequestedV3SlowFill` event. A slow fill request is made by supplying a complete copy of the relvant `V3RelayData` emitted by a `V3FundsDeposited` event.

1. For each `SlowFillRequested` event, identify whether the request is eligible for a slow fill by determining whether the `inputToken` and `outputToken` addresses are equivalent.
2. For each resulting `SlowFillRequested` event, determine whether it has been completed by either of the following methods:
   - Querying the destination SpokePool `FillStatus` mapping with the corresponding `V3RelayData` hash, OR
   - Searching for a corresponding `FilledV3Relay` event.
3. For each of `SlowFillRequested` event, apply filtering on the basis of its destination SpokePool `FillStatus`, such that only `SlowFillRequested` fills are retained.
4. Each resulting `SlowFillRequested` shall be matched against a corresponding `V3FundsDeposited` event on the origin SpokePool. Any events that cannot be matched shall be dropped.
6. The resulting set of matched and validated `SlowFillRequested` events shall be included as SlowFills in the subsequent RootBundle.

### Computing Slow Fill payment amounts
`V3FundsDeposited` `outputAmount` values specify the exact amount to be received by the `recipient`, and therefore exclude any relayer or LP fees paid. In the event of a Slow Fill, the relayer portion of the implicit fee is effectively nulled. Therefore, the outputAmount shall be increased by the amount corresponding 

#### Identifying SpokePool Contracts
The current SpokePool address for a specific chain is available by querying `HubPool.crossChainContracts()`. The chainId must be specified in the query. In case of SpokePool migations, historical SpokePool addresses can be identified by scraping HubPool `CrossChainContractsSet` events.

### Matching SpokePool & HubPool tokens
1. Find the latest `SetRebalanceRoute` event with a block timestamp at or before the `quoteTimestamp` in the associated `V3FundsDeposited` event, where `originChainId` and `inputToken` match the `destinationChainId` and `destinationToken`. Pull the `l1Token` value from the resulting event. If there is no matching event, the relay is invalid.
2. Search the `SetPoolRebalanceRoute` events for the same `l1Token` and `destinationChainId` before or at the `quoteTimestamp`. If there are any matching events later than the one found in step 1, the relay is invalid.
3. Using the `l1Token` value found in step 1, search for the latest SetRebalanceRoute event at or before the quoteTimestamp with that l1Token and with the destinationChainId that matches the destinationChainId value from the FundsDeposited event. If a match is found, the destinationToken should match the destinationToken value in the FilledRelay event. If they don't match or if no matching event is found, the relay is invalid.

### Computing LP Fees
Each `FilledV3Relay` event is subject to an LP fee. The procedure for computing LP fees is as defined in [UMIP-136 Add IS_RELAY_VALID as a supported price identifier](https://github.com/UMAprotocol/UMIPs/blob/7b1a046098d3e2583abd0372c5e9c6003b46ad92/UMIPs/umip-136.md), with the following amendments:
- The AcrossConfigStore contract is used to identify the correct rate model, instead of a `RateModelStore` contract.
- The `FilledV3Relay` inputToken can be mapped to a HubPool token `l1Token` by following [step 2](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-179.md#Matching-SpokePool-&-HubPool-tokens) above.
- The LP fee is computed between the `FilledV3Relay` `originChainId` and `repaymentChainId`.
- The `HubPool` `liquidityUtilizationCurrent()` and `liquidityUtilizationPostRelay()` functions are used instead of the `BridgePool` variant.

### Constructing the PoolRebalanceRoot
<!-- todo: Can the v2 description be used here? -->

### Constructing the RelayerRefundRoot
<!-- todo: Complete this section-->
<!-- todo: Placeholder for subsection on refunding expired deposits -->

### Constructing the SlowRelayRoot
<!-- todo: Complete this section -->

Note:
- Deposits with disparate output tokens (i.e. where the outputToken is not the equivalent of inputToken on the destination chain) are explicitly not eligible for slow fills. Any instances of `RequestedV3SlowFill` for non-equivalent tokens shall be ignored. 

## Recommendations
- Proposers are responsible for detecting and mitigating incorrect or inconsistent RPC data. Proposers should take steps to validate the correctness of their RPC data before proposing.
- Relayers are advised to factor in origin chain finality guarantees when making fills on destination chains. Origin chain re-organisation can lead to deposit re-ordering and can thus invalidate fills.

## Across v2 -> V3 Transition
Across v3 is supplementary to Across v2, adding extra logic support new types of deposits, fills and slow fill requests. At the point of upgrading to Across v3, it will no longer be possible for Across v2 `FundsDeposited` events to be emitted. In order to support continuity of service and to minimise disruption for third-party integrators, it will be possible for pre-existing `FundsDeposited` events to be filled via `FilledRelay` events. During this period, RootBundleProposals will contain relayer repayment and slow fill leaves for both Across v2 and v3.
<!-- todo: Should the end of this dual-operation period be signalled by a bump in the ConfigStore VERSION flag? -->

## Implementation
<!-- todo: add SHA256 hash (or git tag?) for the relevant repository state -->
The Across v3 implementation is available in the Across [contracts-v2](https://github.com/across-protocol/contracts-v2) repository.

## Security considerations
<!-- todo: add audit reference -->
Across v3 has been audited by OpenZeppelin.

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

## Global Constants
All global constants from UMIP-157 will be retained for use in Across v3. The global variables stored in addition to UMIP-157 in the [AcrossConfigStore](https://etherscan.io/address/0x3b03509645713718b78951126e0a6de6f10043f5#code) are:
* "LITE_CHAIN_ID_INDICES"
    * This shall be a stringified list of chain ID numbers. Each chain in this list shall also appear in the `CHAIN_ID_INDICES` list. There shall be no duplicates in this list; any `LITE_CHAIN_ID_INDICES` update containing duplicates may be ignored. Chains may be removed from the `LITE_CHAIN_ID_INDICES` list in order to remove their "Lite" chain designation.

As Solana Virtual Machine (SVM) does not have a concept of chain IDs it should be derived by using the 48 least significant bits of `keccak256` hashed value of the chain name. As an illustration, the chain ID for Solana mainnet is `34268394551451` that can be derived as:

```bash
cast to-dec $(cast shr $(cast shl $(cast keccak solana-mainnet) $((256-48))) $((256-48)))
```

## Data Types
Across v3 defines the following data types listed in the sections below.

Only selected data types are supported on SVM chains as indicated in the relevant SVM subsections. The supported data structures hold the same items as their EVM counterparts with their type adjusted to what is natively supported on SVM:

| EVM Type | SVM Type | Comment |
| :--- |:---- | :---------- |
| bytes32 | Pubkey | Used only when representing addresses and their underlying byte representation should be the same. |
| uint256 | u64 | Used only for numbers that should fit into 64 bits. SVM numbers are encoded as little-endian, so the byte order is reversed compared to EVM. |
| uint256 | [u8; 32] | Used for numbers that cannot possibly fit into 64 bits. This is used for deposit IDs and foreign token amounts. Here the byte order is big-endian matching the EVM representation. |
| uint32 | u32 | Used for numbers that fit into 32 bits. SVM numbers are encoded as little-endian, so the byte order is reversed compared to EVM. |
| bytes | Vec&lt;u8&gt; | Used for arbitrary byte arrays. In SVM this is encoded as the first 4 bytes holding the length of the array (little-endian encoded) followed by the array byte items. |

Also note that SVM uses snake case for struct field names compared to camel case in EVM.

### V3RelayData
The `V3RelayData` type underpins the transfer of funds in or out of a SpokePool instance. `V3RelayData` is defined as follows:
| Name | Type | Description |
| :--- |:---- | :---------- |
| depositor | bytes32 | The address that made the deposit on the origin chain. |
| recipient | bytes32 | The recipient address on the destination chain. |
| exclusiveRelayer | bytes32 | The optional exclusive relayer who can fill the deposit before the exclusivity deadline. |
| inputToken | bytes32 | The token that is deposited on the origin chain by the depositor. |
| outputToken | bytes32 | The token that is received on the destination chain by the recipient. |
| inputAmount | uint256 | The amount of inputToken that is deposited by the depositor. |
| outputAmount | uint256 | The amount of outputToken that is received by the recipient. |
| originChainId | uint256 | The chain ID of the origin SpokePool. |
| depositId | uint256 | The ID identifying a deposit on the origin chain. |
| fillDeadline | uint32 | The Unix timestamp on the destination chain after which the deposit can no longer be filled. |
| exclusivityDeadline | uint32 | The optional Unix timestamp on the destination chain after which any relayer can fill the deposit. |
| message | bytes | Optional data that is forwarded to the recipient as part of a relay. |

#### Note
- `V3RelayData` specifies `bytes32` representation for addresses (`depositor`, `recipient`, ...) in order to interface with non-EVM chains. The EVM address supplied shall be promoted to type `bytes32` with the upper 12 bytes zeroed. 

#### SVM support

`RelayData` in SVM represents the same data as `V3RelayData` in EVM:

| Name | Type |
| :--- |:---- |
| depositor | Pubkey |
| recipient | Pubkey |
| exclusive_relayer | Pubkey |
| input_token | Pubkey |
| output_token | Pubkey |
| input_amount | u64 / [u8; 32] |
| output_amount | u64 / [u8; 32] |
| origin_chain_id | u64 |
| deposit_id | [u8; 32] |
| fill_deadline | u32 |
| exclusivity_deadline | u32 |
| message | Vec&lt;u8&gt; |

`input_amount` and `output_amount` types depend on their use case:
- little-endian encoded `u64` for native token amounts (`input_amount` for deposits and `output_amount` for fills)
- big-endian encoded `[u8; 32]` for foreign token amounts (`output_amount` for deposits and `input_amount` for fills)

### V3RelayDataLegacy
The `V3RelayDataLegacy` type is supported for backwards compatibility, but is slated for deprecation. `V3RelayDataLegacy` has the following delta to the `V3RelayData` type:
| Name | Type |
| :--- |:---- |
| depositor | address |
| recipient | address |
| exclusiveRelayer | address |
| inputToken | address |
| outputToken | address |
| depositId | uint32 |

### FillStatus
A mapping of `RelayData` -> `FillStatus` is stored within each SpokePool instance. This mapping can be queried with the hashed `V3RelayData` for a deposit, allowing the status for the corresponding fill to be queried.

| Name | Value | Description |
| :--- | :---- | :---------- |
| Unfilled | 0 | The SpokePool has no known state for the corresponding `V3RelayData` hash. |
| RequestedSlowFill | 1 | A SlowFill request has been made for this V3RelayData hash. A corresponding `RequestedV3SlowFill` event has been previously emitted. |
| Filled | 2 | A fill (fast or slow) for this `V3RelayData` hash has been completed. |

#### SVM support

`RelayData` and its destination `chain_id` are mapped to a `FillStatus` via `FillStatusAccount` that is a PDA (Program Derived Address) derived from `svm_spoke` program ID using the string `fills` and 32 byte `relay_hash` as the seeds. `relay_hash` is computed using `solana_program::keccak` over the `RelayData` and `destination_chain_id` as described in SVM support of [Computing RelayData Hashes](#computing-relaydata-hashes).

`FillStatusAccount` stores following fields:

| Name | Type | Description |
| :--- |:---- | :---------- |
| status | FillStatus | The status of the mapped fill, see below. |
| relayer | Pubkey | Address of the relayer that made the fill to control who can close this PDA. |
| fill_deadline | u32 | Fill deadline to control when this PDA can be safely closed. |

`FillStatus` is an enum with the same values as in EVM, but one should consider the fact that on SVM it is only useful for internal program logic as the `FillStatusAccount` can be closed by the relayer after the fill deadline has passed, so the status is not persisted onchain indefinitely. In order to reconstruct the status of a fill, one should look for `FilledRelay` and `RequestedSlowFill` events in all transactions where the `FillStatusAccount` was involved (`getSignaturesForAddress` RPC method can be useful). If there are no such events, then the fill can be considered `Unfilled`. If the `FilledRelay` is found as the last event, then the fill is considered `Filled`. If there is only a `RequestedSlowFill` event, then the fill is considered `RequestedSlowFill`.

### FillType
A FillType instance is emitted with each `FilledV3Relay` event (see below).

| Name | Value | Description |
| :--- | :---- | :---------- |
| FastFill | 0 | The relay was completed by a relayer as a fast fill. |
| ReplacedSlowFill | 1 | The relay was initially requested to be completed via slow fill, but was subsequently fast-filled by a relayer. |
| SlowFill | 2 | The relay was completed via slow fill. |

#### SVM support

`FillType` enum is emitted with each `FilledRelay` event on SVM with the same interpretation as when emitted with `FilledV3Relay` events on EVM.

### V3RelayExecutionEventInfo
A V3RelayExecutionEventInfo instance is emitted with each `FilledV3Relay` event (see below).

| Name | Type | Description |
| :--- |:---- | :---------- |
| updatedRecipient | bytes32 | The recipient of the funds being transferred. This may be the `recipient` identified in the original deposit, or an updated `recipient` following a `RequestedSpeedUpV3Deposit` event. |
| updatedMessageHash | bytes32 | The hash of the updated message sent to the recipient. This is computed as `keccak256(message)` where `message` is the `message` bytes in the `RelayData`. If the updated `message` field is empty, this will be set to `bytes32(0)`. |
| updatedOutputAmount | uint256 | The amount sent to `updatedRecipient` by the relayer completing the fill. |
| fillType | FillType | Type of fill completed (see `FillType` above). |

#### SVM support

`RelayExecutionEventInfo` instance is emitted with each `FilledRelay` event on SVM similar as `V3RelayExecutionEventInfo` in `FilledV3Relay` events on EVM:

| Name | Type | Description |
| :--- |:---- | :---------- |
| updated_recipient | Pubkey | The recipient of the funds being transferred. This always matches the original recipient as there is no speedup functionality in the `svm_spoke` program. |
| updated_message_hash | [u8; 32] | The hash of the message sent to the recipient. This is computed as `solana_program::keccak::hash(message)` where `message` is the `message` bytes in the `RelayData`. If the `message` field is empty, this will be set to `[0u8; 32]`. |
| updated_output_amount | u64 | The amount of the tokens being transferred. This always matches the original amount as there is no speedup functionality in the `svm_spoke` program. |
| fill_type | FillType | Type of fill completed (see `FillType` above). |

### V3SlowFill
A `V3SlowFill` instance is used to calculate slow relay root when proposing and verifying the root bundle. It is also passed as `slowFillLeaf` parameter to the SpokePool `executeSlowRelayLeaf` call upon executing a slow fill:

| Name | Type | Description |
| :--- |:---- | :---------- |
| relayData | V3RelayData | `V3RelayData` instance to uniquely associate the SlowFill with `V3FundsDeposited` and `RequestedV3SlowFill` events. |
| chainId | uint256 | The chain ID of the SpokePool completing the SlowFill. This is used only when proposing and verifying the root bundle while on execution SpokePool overrides it with its actual chain ID. |
| updatedOutputAmount | uint256 | The amount sent to `recipient` as part of a SlowFill. This should typically be equal to or greater than the `V3FundsDeposited` `outputAmount`. |

#### Notes
The `updatedRecipient` field is normally set to the `recipient` from the corresponding `V3FundsDeposited` event. In the event that the relayer completes the fill with an accompanying `RequestedSpeedUpV3Deposit` event, `updatedRecipient` will be set to the address approved by the update.

#### SVM support

A `SlowFill` instance is used to calculate slow relay root when proposing and verifying the root bundle. It is also passed as `slow_fill_leaf` parameter to the `svm_spoke` `execute_slow_relay_leaf` instruction upon executing a slow fill:

| Name | Type | Description |
| :--- |:---- | :---------- |
| relay_data | RelayData | `RelayData` instance to uniquely associate the `SlowFill` with `FundsDeposited` and `RequestedSlowFill` events. |
| chain_id | u64 | The chain ID of the SpokePool completing the `SlowFill`. This is used only when proposing and verifying the root bundle while on execution `svm_spoke` overrides it with its configured chain ID similar as in EVM. |
| updated_output_amount | u64 | The amount sent to `recipient` as part of a `SlowFill`. |

## Events
Across V3 defines the following events:
- FundsDeposited
- V3FundsDeposited
- RequestedSpeedUpDeposit
- RequestedSpeedUpV3Deposit
- FilledRelay
- FilledV3Relay
- RequestedSlowFill
- RequestedV3SlowFill
- ClaimedRelayerRefund

`svm_spoke` program uses Anchor's [`emit_cpi`](https://www.anchor-lang.com/docs/features/events#emit_cpi) macro to emit events that are comparable with EVM events. On SVM Across supports only a subset of events as explicitly documented in the relevant subsections below.

### Event Deprecation
The following events are marked for deprecation. See [Migration](#migration) for more information.
- V3FundsDeposited
- RequestedSpeedUpV3Deposit
- FilledV3Relay
- RequestedV3SlowFill

### FundsDeposited, V3FundsDeposited
The `FundsDeposited` event extends the `V3RelayData` type and `V3FundsDeposited` event extends the `V3RelayDataLegacy` type by applying the following adjustments:

| Name | Type | Description |
| :--- | :--- | :---------- |
| originChainId | omitted | This field is omitted from the `FundsDeposited` and `V3FundsDeposited` events. |
| destinationChainId | uint256 | Chain ID indicating where this deposit should be filled. |
| quoteTimestamp | uint32 | Timestamp that determines the fee paid by the depositor. |

#### Note
- Consumers of these events should append the `originChainId` in order to avoid unintentionally mixing events from different chains.
- The `FundsDeposited` and `V3FundsDeposited` `outputToken` field is not required to be a known HubPool `l1Token`. In-protocol arbitrary token swaps are supported by Across v3.
- The address identified by `exclusiveRelayer` has exclusive right to complete the relay on the destination chain until `exclusivityDeadline` has elapsed.
- If `exclusivityDeadline` is set to a past timestamp, any address is eligible to fill the relay.
- Any deposit that remains unfilled after the specified `fillDeadline` shall be refunded to the `depositor` address via the origin SpokePool in a subsequent settlement bundle.

#### SVM support

The `FundsDeposited` event extends the `RelayData` type by applying the following adjustments:

| Name | Type | Description |
| :--- | :--- | :---------- |
| origin_chain_id | omitted | This field is omitted from the `FundsDeposited` event. |
| destination_chain_id | u64 | Same as `destinationChainId` on EVM. |
| quote_timestamp | u32 | Same as `quoteTimestamp` on EVM. |

### RequestedSpeedUpDeposit, RequestedSpeedUpV3Deposit
The `RequestedSpeedUpDeposit` event emits the following data.

| Name | Type | Description |
| :--- | :--- | :---------- |
| depositId | uint256 | The depositId of the corresponding `FundsDeposited` event to be updated. |
| depositor | bytes32 | The depositor of the corresponding `FundsDeposited` event to be updated. |
| updatedOutputAmount | uint256 | The new outputAmount approved by the depositor. This should be _lower_ than the original deposit `outputAmount`. |
| updatedRecipient | bytes32 | The new recipient to receive the funds. |
| updatedMessage | bytes | The new message to be supplied to the recipient. |
| depositorSignature | bytes | A signature by the depositor authorizing the above updated fields. |

The `RequestedSpeedUpV3Deposit` event emits the following data:

| Name | Type | Description |
| :--- | :--- | :---------- |
| depositId | uint32 | The depositId of the corresponding `V3FundsDeposited` event to be updated. |
| depositor | address | The depositor of the corresponding `V3FundsDeposited` event to be updated. |
| updatedOutputAmount | uint256 | The new outputAmount approved by the depositor. This should be _lower_ than the original deposit `outputAmount`. |
| updatedRecipient | address | The new recipient to receive the funds. |
| updatedMessage | bytes | The new message to be supplied to the recipient. |
| depositorSignature | bytes | A signature by the depositor authorizing the above updated fields. |

#### Note
- Relayers may optionally append the updated request from a `RequestedSpeedUpDeposit` or `RequestedSpeedUpV3Deposit` event when filling a relay, but have no obligation to use the updated request.

### RequestedSlowFill, RequestedV3SlowFill
The `RequestedSlowFill` event extends the `V3RelayData` type by applying the following adjustments:

| Name | Type | Description |
| :--- | :--- | :---------- |
| message | omitted | This field is omitted in favour of the `messageHash` field. |
| messageHash | bytes32 | The keccak256 hash of the `V3RelayData` message field where the message is non-empty, or `bytes32(0)` for an empty message. This field is included in place of the `V3RelayData` message field. |

The `RequestedV3SlowFill` event emits an `V3RelayDataLegacy` instance.

#### Note
- These events are emitted on the destination chain and signal to proposers that a slow fill has been requested for a specific deposit.

#### SVM support

The `RequestedSlowFill` event extends the `RelayData` type by applying the following adjustments:

| Name | Type | Description |
| :--- | :--- | :---------- |
| message | omitted | This field is omitted in favour of the `message_hash` field. |
| message_hash | [u8; 32] | The hash of the message sent to the recipient. This is computed as `solana_program::keccak::hash(message)` where `message` is the `message` bytes in the `RelayData`. If the `message` field is empty, this will be set to `[0u8; 32]`. |

### FilledRelay, FilledV3Relay

The `FilledRelay` event extends the `V3RelayData` type by applying the following adjustments:
| Name | Type | Description |
| :--- | :--- | :---------- |
| message | omitted | This field is omitted from the `FilledRelay` event in favour of the `messageHash` field. |
| messageHash | bytes32 | The keccak256 hash of the `V3RelayData` message field where the message is non-empty, or `bytes32(0)` for an empty message. This field is included in place of the `V3RelayData` message field. |
| relayer | bytes32 | The repayment address supplied by the relayer to be refunded on the applied repayment chain. |
| repaymentChainId | uint256 | The repayment chain ID requested by the relayer completing the fill. |
| relayExecutionInfo | V3RelayExecutionEventInfo | The effective `recipient`, `message` and `outputAmount`, as well as the `FillType` performed (FastFill, ReplacedSlowFill, SlowFill). |

The `FilledV3Relay` event extends the `V3RelayDataLegacy` type by adding the following fields:
| Name | Type | Description |
| :--- | :--- | :---------- |
| relayer | address | The address completing relay on the destination SpokePool. |
| repaymentChainId | uint256 | The repayment chain ID requested by the relayer completing the fill. |
| relayExecutionInfo | V3RelayExecutionEventInfo | The effective `recipient`, `message` and `outputAmount`, as well as the `FillType` performed (FastFill, ReplacedSlowFill, SlowFill). |

#### Note
- Consumers of these events should append the `destinationChainId` attribute in order to avoid unintentioanlly mixing events from different chains.

#### SVM support

The `FilledRelay` event extends the `RelayData` type by applying the following adjustments:

| Name | Type | Description |
| :--- | :--- | :---------- |
| message | omitted | This field is omitted from the `FilledRelay` event in favour of the `message_hash` field. |
| message_hash | [u8; 32] | The hash of the message sent to the recipient. This is computed as `solana_program::keccak::hash(message)` where `message` is the `message` bytes in the `RelayData`. If the `message` field is empty, this will be set to `[0u8; 32]`. |
| relayer | Pubkey | The repayment address supplied by the relayer to be refunded on the applied repayment chain, same as in EVM. |
| repayment_chain_id | u64 | The repayment chain ID requested by the relayer completing the fill, same as in EVM. |
| relay_execution_info | RelayExecutionEventInfo | See details in the SVM support for [RelayExecutionEventInfo](#v3relayexecutioneventinfo) section above. |

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

For SVM chains slot numbers are used instead of block numbers when specifying the start and end block of the root bundle proposal.

### Pool Rebalance Leaves
A `PoolRebalanceLeaf` shall consist of the following:

| Name | Type | Description |
| :--- | :--- | :---------- |
| chainId | uint256 | The SpokePool `chainId` referenced by the `PoolRebalanceLeaf`. |
| bundleLpFees | uint256[] | Ordered array of `bungleLpFee` values for the corresponding `l1Token`. |
| netSendAmounts | int256[] | Ordered array of `netSendAmount` values for the corresponding `l1Token`. |
| runningBalances | int256[] | Ordered array of `runningBalance` values for the corresponding `l1Token`. |
| groupIndex | uint256 | Indicates whether the corresponding `RelayerRefund` and `SlowRelay` roots shall be relayed to the corresponding SpokePool. |
| leafId | uint8 | Index of the `PoolRebalanceLeaf` within the ordered array of `PoolRebalanceLeaves`. |
| l1Tokens | address[] | Ordered array of HubPool `l1Token` addresses.

#### Note
- The format of Pool Rebalance leaves is unchanged from Across v2.

### Relayer Refund Leaves
| Name | Type | Description |
| :--- | :--- | :---------- |
| amountToReturn | uint256 | Amount of `l2TokenAddress` to return to the HubPool. |
| chainId | uint256 | The SpokePool `chainId` referenced by the `RelayerRebalanceLeaf`. |
| refundAmounts | uint256[] | Ordered array of amounts of `l2TokenAddress`to be refunded to the corresponding `refundAddress`. |
| leafId | uint32 | Index of the `RelayerRefundLeaf` within the ordered array of `RelayerRefundLeaves`. |
| l2TokenAddress | bytes32 | The SpokePool token used by this `RelayerRefundLeaf`. |
| refundAddresses | bytes32[] | Ordered array of addresses to be refunded by this `RelayerRefundLeaf`. |

#### Note
- The format of Relayer Refund leaves is unchanged from Across v2.
- Across v3 expands the utility of the `RelayerRefundLeaf` to include issuing depositor refunds on origin chains in the event of an expired `V3FundsDeposited` `fillDeadline`.

#### SVM support

| Name | Type | Description |
| :--- | :--- | :---------- |
| amount_to_return | u64 | Same as `amountToReturn` for EVM leaves. |
| chain_id | u64 | Same as `chainId` for EVM leaves. |
| refund_amounts | Vec&lt;u64&gt; | Same as `refundAmounts` for EVM leaves. |
| leaf_id | u32 | Same as `leafId` for EVM leaves. |
| mint_public_key | Pubkey | Same as `l2TokenAddress` for EVM leaves. |
| refund_addresses | Vec&lt;Pubkey&gt; | Same as `refundAddresses` for EVM leaves. |

When proposing and verifying the root bundle, `RelayerRefundLeaf` for SVM chains should be serialized using Borsh serialization format and keeping the SVM specific encoding as described in the SVM supported [Data Types](#data-types) section above. In addition, the encoded `RelayerRefundLeaf` must be prefixed with 64 bytes of zeroes to protect against any possibility of an EVM leaf being used on SVM or vice versa.

### Slow Relay Leaves
Across v3 `SlowRelayLeaf` objects are defined by the `V3SlowFill` [data type](#data-types).

#### Note
- The format of Slow Relay leaves is updated from Across v2.

#### SVM support

`SlowRelayLeaf` objects for SVM chains are defined by the `SlowFill` supported SVM [data type](#data-types).

When proposing and verifying the root bundle, `SlowFillLeaf` for SVM chains should be serialized using Borsh serialization format and keeping the SVM specific encoding as described in the SVM supported [Data Types](#data-types) section above. In addition, the encoded `SlowFillLeaf` must be prefixed with 64 bytes of zeroes to protect against any possibility of an EVM leaf being used on SVM or vice versa.

## Definitions

### Deposits
A `Deposit` is defined as an instance of either of the following events:
- `FundsDeposited`.
- `V3FundsDeposited`.

#### SVM support

On SVM chains a `Deposit` is defined as an instance of `FundsDeposited` event.

### Fills
A `Fill` is defined as an instance of either of the following events:
- `FilledRelay`.
- `FilledV3Relay`.

#### SVM support

On SVM chains a `Fill` is defined as an instance of `FilledRelay` event.

### Slow Fill Requests
A `Slow Fill` is defined as an instance of either of the following events:
- `RequestedSlowFill`.
- `RequestedV3SlowFill`.

#### SVM support

On SVM chains a `Slow Fill` is defined as an instance of `RequestedSlowFill` event.

### RelayData
`RelayData` is defined as an instance of etiher of the following data types:
- `V3RelayData`.
- `V3RelayDataLegacy`.

#### SVM support

On SVM chains, `RelayData` is defined as an instance of the `RelayData` data type as described in the supported SVM [Data Types](#data-types) section above.

### Bundle Block Range
The `Bundle Block Range` is the pair of start and end blocks for a given proposal. See [Identifying Bundle Block Ranges](#identifying-bundle-block-ranges) for guidance on identifying the `Bundle Block Range`.

#### SVM support

On SVM chains the `Bundle Block Range` is the pair of start and end slots.

### Fill Status
A `Deposit` is considered to be `Filled` on the destination chain when the destination `SpokePool` `FillStatus` mapping shows state `Filled` for the `Deposit` `RelayData` hash.

#### SVM support

A `Deposit` is considered to be `Filled` on the destination SVM chain when its `FillStatus` is resolved to `Filled` using `FillStatusAccount` as described in the supported SVM [Data Types](#data-types) section above.

## Method
### Identifying SpokePool Contracts
The current SpokePool address for a specific chain is available by querying `HubPool.crossChainContracts()`. The chainId must be specified in the query. In case of SpokePool migations, historical SpokePool addresses can be identified by scraping HubPool `CrossChainContractsSet` events.

#### SVM support

The procedure for identifying the current SpokePool program for a specific SVM chain is as follows:

1. Query the `HubPool` contract for the `crossChainContracts()` mapping using the `chainId` of the SVM chain to get the address of chain specific `adapter` contract.
2. Query the `adapter` contract for the `SOLANA_SPOKE_POOL_BYTES32()` method to get the `bytes32` representation of SVM program ID.
3. Convert the `bytes32` representation to a Base58 encoded `Pubkey` of SVM SpokePool program.

In case of SpokePool migrations, historical SpokePool addresses can be identified by scraping HubPool `CrossChainContractsSet` events and querying the previous `adapter` contract.

### Identifying "Lite" deployments
We consider a deposit to "originate" or be "destined for" a "Lite chain" if the `LITE_CHAIN_ID_INDICES` value in the AcrossConfigStore includes the deposit's origin chain or destination chain respectively as of the deposit's `quoteTimestamp` field. These chains impose constraints on relayer repayments and slow fills.

### Resolving SpokePool tokens to their HubPool equivalent
For the purpose of identifying the equivalent HubPool token given a SpokePool token, the following shall be followed:
1. Find the latest `SetRebalanceRoute` event with a block timestamp at or before the relevant HubPool block number, where the relevant SpokePool chain ID and token address  match the `SetRebalanceRoute` `destinationChainId` and `destinationToken` fields.
    - In the case of a `Deposit` event, the relevant HubPool block number is identified by resolving the `quoteTimestamp` to a HubPool block number.
3. From the resulting `SetRebalanceRoute` event, select the associated `l1Token` field.
4. Search the `SetPoolRebalanceRoute` events for the same `l1Token` and `destinationChainId` at or before the applicable HubPool block number.
5. Using the `l1Token` value found in step 2, search for the latest `SetRebalanceRoute` event at or before the applicable HubPool block number where `l1Token` and `destinationChainId` that match the extracted `l1Token` and SpokePool chain ID. If a match is found, the addresses match and are considered cross-chain equivalents.

#### SVM support

Convert Base58 encoded `Pubkey` of SVM chain SpokePool token to its `bytes32` representation and convert to EVM address by trimming off the first 12 bytes. Use this EVM token address representation as the `destinationToken` following the instructions in the generic [Resolving SpokePool tokens to their HubPool equivalent](#resolving-spokepool-tokens-to-their-hubpool-equivalent) section above. The integrators should be aware of this SVM address trimming and bear the responsibility to use the correct SVM token address that would correctly resolve to the `l1Token` address.

### Identifying Bundle Block Ranges
In addition to the description [UMIP-157](https://github.com/UMAprotocol/UMIPs/blob/pxrl/umip179/UMIPs/umip-157.md#determining-block-range-for-root-bundle-proposal):
- Proposers may opt to reduce the size of the proposal block range for each chain in the event that RPC provider data inconsistencies are detected, and
- A "soft pause" of a chain is permitted in the event that the proposer cannot safely increment the bundle block range, or has no events to propose beyond the previous bundle block range. In this case, the proposer may repeat the procedure for
  DISABLED_CHAINS by proposing from and to the previous bundle end block.

#### SVM support

Bundle block ranges for SVM chains are identified by their slot numbers. For the end slot, only such slot should be used that has a corresponding block produced for it.

### Reconstructing FilledRelay messages
The `FilledRelay` event emits the `messsageHash` field. This field is set as follows:
- When the `RelayData` `message` field is empty (`0x`): `bytes32(0)`, OR
- When the `RelayData` `message` field is non-empty (`0x...`): `keccak256(message)`.

#### SVM support

The `FilledRelay` event on SVM emits the `message_hash` field. This field is set as follows:
- When the `RelayData` `message` field is empty: `[0u8; 32]`, OR
- When the `RelayData` `message` field is non-empty: `solana_program::keccak::hash(message)`.

### Computing RelayData Hashes
A `RelayData` hash is computed as the `keccak256` hash over the ABI-encoded representation of the arguments `relayData`, `destinationChainId`, where:
- `relayData` is of type `V3RelayData` or `V3RelayDataLegacy`.
- `destinationChainId` is of type `uint256`.

- When the `FilledRelay` event data omits the `message` field, the `message` field shall be populated according to the procedure specified in [Reconstructing FilledRelay messages](#resonstructing-filledrelay-messages).

#### Note
- This method produces the identical hashes for `V3RelayData` and `V3RelayDataLegacy` for the same input data due to `address` promotion to `bytes32` prior to hashing.

#### SVM support

A `RelayData` hash on SVM is computed as the `solana_program::keccak` hash over the Borsh serialized representation of concatenated `relay_data` and `destination_chain_id`, where:
- `relay_data` is derived from `RelayData` replacing the `message` field (type Vec&lt;u8&gt;) with its `message_hash` (type [u8; 32]) as described in the SVM support for [Reconstructing FilledRelay messages](#reconstructing-filledrelay-messages) section above, and
- `destination_chain_id` is little-endian encoded `u64` representation of destination chain ID.

### Computing Relayer Repayments & Depositor Refunds
For the purpose of computing relayer repayments, the following procedures are completed:
- Validating Fills
- Validating Pre-Fills
- Finding Expired Deposits
- Finding Unfillable Deposits

#### Note
- Depositor refunds are issued via the Relayer Repayment workflow.

### Validating Fills
Each of the `Fills` emitted within the `Bundle Block Range` on a destination SpokePool shall be considered valid by verifying that:
1. The `Fill` event `FillType` field is not set to `SlowFill`, AND
2. The component `RelayData` maps exactly to one or more corresponding `Deposit` events emitted on the relevant `originChainId`, AND
3. The corresponding `Deposit` event occurred within or before the `Bundle Block Range` on the origin chain SpokePool.

#### Note
- If the `Deposit` event specifies `outputToken` `bytes32(0)` (i.e. the Zero Address), the equivalent SpokePool token on the destination chain shall be substituted in. For the purpose of determining `RelayData` equivalency, the updated/substituted `outputToken` shall be used in place of the Zero Address. If there is no equivalent SpokePool token on the destination chain at the `Deposit` `quoteTimestamp`, then any fill for this deposit will not be repaid regardless of whether it is fillable on the destination.
- `RelayData` equality can be determined by comparing the keccak256 hashes of two `RelayData` objects.
- Fills of type `SlowFill` are valid, but are not relevant for computing relayer repayments.

#### SVM support

When validating fills between EVM and SVM chains, one should consider the differences in the field naming, types and encodings used on SVM chains as described in the supported SVM [Data Types](#data-types) section above. In order to compare the `RelayData` one should be able to safely convert between EVM and SVM representations as in practice all amounts should fit into 64 bits.

### Validating Pre-fills
For each of the `Deposits` emitted within the `Bundle Block Range` where no corresponding `Fill` is identified on the destination chain within the `Bundle Block Range`, identify the valid `Fill` according to the following criteria:
1. Verify that the destination chain `FillStatus` for the `Deposit` `RelayData` is `Filled` as at the destination chain end block number for the proposal.
2. Resolve the corresponding `Fill` on the destination chain.
3. Verify that the `FillType` is `FastFill` or `ReplacedSlowFill` AND that the `Fill` occurred prior to the current the `Bundle Block Range` on the destination chain SpokePool.

#### Note
- No specific method is prescribed for resolving the `Fill` on the destination chain. An `eth_getLogs` request can facilitate this, and if required, the `Bundle Block Range` could be narrowed by a binary search over the `FillStatus` field. This is left as an implementation decision.

#### SVM support

In order to resolve the `Fill` on the destination SVM chain, one can inspect transactions where the `FillStatusAccount` PDA was involved (using `getSignaturesForAddress` RPC method) as described on the SVM supported [Data Types](#data-types) section above and looking for the emitted `FilledRelay` event.

### Finding Expired Deposits
For the purpose of computing depositor refunds, each `Deposit` shall be considered expired by verifying that:
1. The `fillDeadline` timestamp elapsed within the `Bundle Block Range` on the destination SpokePool (i.e. the `fillDeadline` expired between the `block.timestamp` of the destination chain's bundle start and end block),
2. The `FillStatus` on the destination SpokePool is set to `Unfilled` or `SlowFillRequested` as at the end of the `Bundle Block Range`.

#### Note
- Expired deposits shall be refunded to the `depositor` address on the origin SpokePool.
- Depositor refunds are to be issued as part of the relayer refund procedure.
- The `fillDeadline` timestamp shall be resolved to a block number on the destination chain in order to determine inclusion within the `Bundle Block Range`.

#### SVM support

When evaluating if the `fillDeadline` / `fill_deadline` timestamp elapsed within the `Bundle Block Range` on the SVM destination SpokePool, one can use `getBlock` RPC method for the destination chain's bundle start and end slot and use the `blockTime` field to compare against the `fillDeadline` / `fill_deadline` timestamp. End slot must always have a corresponding block produced, but if there is none for the start block, one should get the timestamp from the last produced block before such empty start slot.

### Finding Unfillable Deposits
For the purpose of computing depositor refunds, each duplicate `Deposit` shall be considered unfillable by verifying that:
1. The `Deposit` is identical with another `Deposit`.
2. The destination chain `FillStatus` for the `Deposit` is `Filled`.
3. The destination chain `Fill` `FillType` was `SlowFill`.
4. The destination chain `Fill` occurred within the current `BundleBlockRange` or the `Deposit` occurred within the current `BundleBlockRange`.

#### Note
- `Deposits` are considered identical when their `RelayData` matches.
- `Deposits` are considered duplicate when they are emitted after their initial identical instance.

### Finding Slow Fill Requests
For the purpose of computing slow fills to be issued to recipients, each `Slow Fill Request` emitted within the `Bundle Block Range` on a destination SpokePool shall be considered valid by verifying that:
1. The `fillDeadline` is greater than `destinationChainId` bundle end block's `block.timestamp`,
2. The `Slow Fill Request` `RelayData` is matched by one or more corresponding `Deposit` events that occurred within or before the `Bundle Block Range` on the origin SpokePool,
3. The `inputToken` and `outputToken` addresses are equivalent at the earliest matching deposit's `quoteTimestamp`,
4. The destination SpokePool `FillStatus` mapping for the relevant `RelayData` hash is `SlowFillRequested` at the end of the `Bundle Block Range`,
5. The `originChainId` and `destinationChainId` are not Lite chains.

#### Note
- A `Slow Fill Request` is made by supplying a complete copy of the relevant `RelayData` emitted by a `Deposit` event.
- The resulting set of validated `Slow Fill Requests` shall be included as SlowFills in the subsequent root bundle proposal.
- A `Slow Fill Request` may correspond to a `Deposit` from previous bundles.

#### SVM support

When evaluating if the `fillDeadline` / `fill_deadline` timestamp is greater than `destinationChainId` bundle end slot time, one can use `getBlock` RPC method for the destination chain's bundle end slot and use the `blockTime` field to compare against the `fillDeadline` / `fill_deadline` timestamp.

### Finding Early Slow Fill Requests
When an early `Slow Fill Request` is implied, the `Slow Fill Request` shall be validated as follows:
1. The `fillDeadline` has not already elapsed relative to the `destinationChainId` bundle end block number,
2. The `inputToken` and `outputToken` addresses are equivalent at the earliest matching deposit's `quoteTimestamp`,
3. Neither the`originChainId` nor the `destinationChainId` is a `Lite` chain.

#### Note
- An early `Slow Fill Request` is implied where a `Deposit` emitted within the current `Bundle Block Range` has a `FillStatus` of `SlowFillRequested` as at the end of the current `Bundle Block Range` on the destination chain, but where no `Slow Fill Request` is identified within the current `Bundle Block Range`. This may occur where the `Slow Fill Request` was submitted prior to the current bundle.

### Computing LP Fees
Each valid `Fill` is subject to an LP fee. The procedure for computing LP fees is as defined in [UMIP-136 Add IS_RELAY_VALID as a supported price identifier](https://github.com/UMAprotocol/UMIPs/blob/7b1a046098d3e2583abd0372c5e9c6003b46ad92/UMIPs/umip-136.md), with the following amendments:
- The AcrossConfigStore contract shall be used to identify the correct rate model, instead of a `RateModelStore` contract.
- The `HubPool` `liquidityUtilizationCurrent()` and `liquidityUtilizationPostRelay()` functions shall be used instead of the `BridgePool` variant.
- The event `inputToken` shall be mapped from the SpokePool address to a HubPool `l1Token` address by following the matching procedure outlined above.
- The LP fee is computed between the `originChainId` specified by the `Deposit` and `repaymentChainId` specified by the relayer, where the `relayExecutionInfo.FillType != SlowFill` and the Fill `destinationChainId` otherwise. If the `originChainId` is equal to the `repaymentChainId` then the LP fee should be 0%.

#### Note
- The LP fee is typically referenced as a multiplier of the `Deposit` `inputAmount`, named `realizedLpFeePct` elsewhere in this document.

### Computing Bundle LP Fees
The bundle LP fee for a `Bundle Block Range` on a SpokePool and token pair shall be determined by summing the applicable LP fees for each of the following validated events:
- `FilledRelay`.
- `FilledV3Relay`.

#### Note

Each `FilledRelay` or `FilledV3Relay` can have multiple associated deposit events. In the event of multiple matching deposit events, there will be multiple LP fees paid per event in the case of a non slow fill.

### Computing Relayer Repayments
For each validated matching `Deposit` event, the relayer repayment amount shall be computed as follows:
- `(inputAmount * (1 - realizedLpFeePct)) / 1e18`, where `realizedLpFeePct` is computed over the set of HubPool `l1Token`, `originChainId` and `repaymentChainId` at the HubPool block number corresponding to the relevant `Deposit` `quoteTimestamp`.
- The applicable rate model shall be sourced from the AcrossConfigStore contract for the relevant `l1Token`.
- For a given `Fill` that satisfies the requirements for relayer repayment, each matching `Deposit` generates a distinct repayment computed against its `quoteTimestamp`.

The applied `repaymentToken` will be equal to the [equivalent](#resolving-spokepool-tokens-to-their-hubpool-equivalent) token as the `inputToken` on the `repaymentChainId`, where the applied `repaymentChainId` shall be determined as follows (all at the time of the relevant bundle's hub chain end block):
- When the `originChainId` is a `Lite chain`: `originChainId`, ELSE
- When no `PoolRebalanceRoute` exists for the `inputToken` on the `Fill` `originChainId`: `originChainId`, ELSE
- When no `PoolRebalanceRoute` exists for the `repaymentToken` on the `Fill` `repaymentChainId`: `originChainId`, ELSE
- The `repaymentChainId` as specified in the `Fill`.

The applied `repayment address` shall be determined as follows:
- When the `Fill` `relayer` address is valid for the applied `repaymentChainId`: `relayer`, ELSE
- The `Fill` `msg.sender` address. In this case, change the applied `repaymentChainId` to the `destinationChainId` if a `PoolRebalanceRoute` exists for both the `outputToken` on the `destinationChainId` and the `inputToken` on the `originChainId` as at the bundle's hub chain end block

If the applied `repayment address` is not valid for the applied `repaymentChainId`, the repayment shall be discarded from the relayer refund root but still considered when [computing running balances & net send amounts](#computing-running-balances--net-send-amounts). That way they could still be refunded manually by relaying a separate refund bundle via spoke pool admin function once the affected relayer provides a valid refund address on the applied `repaymentChainId` (precise mechanism is out of protocol scope, but that can be done by signing a message from the fill sender address). Examples of an invalid `relayer` address include:
- An SVM address on an EVM chain.
- An EVM address on an SVM chain. Even though in theory one might hold a corresponding private key, Across would not support refunding a relayer on a SVM chain to an address that has zeroes in its first 12 bytes.

The rules above enforce that a `repaymentToken` for a successful relayer repayment is always equal to a token that is [equivalent](#resolving-spokepool-tokens-to-their-hubpool-equivalent) to the `inputToken` at the time of relevant bundle's hub chain end block.

#### SVM support

All the rules for computing relayer repayments as described in the generic [Computing Relayer Repayments](#computing-relayer-repayments) section above apply to SVM chains, except there is no `Fill` `msg.sender` address fallback logic when the `Fill` or resolved `repaymentChainId` is SVM chain. When the resolved `repaymentChainId` is SVM chain, the applied repayment token can be distributed to the associated token account derived from the `relayer` refund address. The relayer can also claim their refunds to any custom token account using the `Fill` `relayer` account as the signer. It is the responsibility of the relayer to ensure it passes the correct `Fill` `relayer` address that they control and that is valid for the resolved `repaymentChainId`.

### Computing Deposit Refunds
For an expired `Deposit` event, the depositor refund amount shall be computed as `inputAmount` units of `inputToken`.

### Computing Slow Fill updated output amounts
For the purpose of computing the amount to issue to a recipient for a SlowFill, the relayer fee shall be nulled by applying the following procedure:
- `updatedOutputAmount = (inputAmount * (1 - realizedLpFeePct)) / 1e18`, where `realizedLpFeePct` is computed at the earliest matching deposit's `quoteTimestamp` between `originChainId` and `destinationChainId`.

#### Constraint
- The `Deposit` `outputAmount` shall _not_ be considered when determining SlowFill amounts.

#### Note
- The `Deposit` `outputAmount` specifies the exact amount to be received by the `recipient` for a standard fill, and is therefore exclusive of any relayer or LP fees paid.

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
    - For each group of validated `Fill` and `Pre-fill` events, initialize a running balance at 0 and add the add the relayer repayment.

3. Add deposit refunds:
    - For each group of `Deposit` events that expired or were deemed unfillable within the `Bundle Block Range`, sum the total deposit refunds on the origin chain. Add the amount to the exsting relayer refunds for that chain.

4. Add slow fills:
    - For each group of validated `Slow Fill Requests`, add each slow relay's `updatedOutputAmount` to the group's running balance.

5. Subtract excesses from unexecuted slow fills:
    - For each group of validated `Fills` where the `FillType` is `ReplacedSlowFill` and where there is no valid `Slow Fill Request` with an identical relay data hash in the current bundle data, subtract the SlowFill `updatedOutputAmount` from the running balance in recognition that the SlowFill will never be executed because the fill amount has already been transferred.
    - For each expired deposit refund identified above where the `FillStatus` on the deposit destination chain is `RequestedSlowFill` and the matching slow fill request is not in the current bundle range, subtract the associated SlowFill `updatedOutputAmount` from the running balance in recognition that the SlowFill cannot be executed past the `fillDeadline`.

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

#### Note
The referenced `SpokeTargetBalances` is as specified by [UMIP-157 Token Constants](https://github.com/UMAprotocol/UMIPs/blob/pxrl/umip179/UMIPs/umip-157.md#token-constants):

## Constructing Root Bundles

### Constructing the Pool Rebalance Root
One Pool Rebalance Leaf shall be produced per unique `chainId` & `l1Token` pair, where the corresponding `Deposit`, `Fill` or`Slow Fill Request` events were emitted by the relevant SpokePool within the [Bundle Block Range](#identifying-bundle-block-ranges). The following events can be discarded because they have no impact on the Pool Rebalance Root:
- `Deposit` events whose `inputToken` does not [map](#resolving-spokepool-tokens-to-their-hubpool-equivalent) to an `l1Token`.
- `Fill` events whose `repaymentToken` on the `repaymentChainId` as computed [here](#computing-relayer-repayments) does not [map](#resolving-spokepool-tokens-to-their-hubpool-equivalent) to an `l1Token`.

Each Pool Rebalance Leaf shall be constructed as follows:
1. For each unique `chainId` and `l1Token` pair:
    1. Compute the arrays `runningBalances`, `netSendAmounts` and `bundleLpFees` according to the procedures outlined above.
    2. Set the `groupIndex` to 0.
2. Within each Pool Rebalance Leaf instance, the arrays `l1Tokens`, `runningBalances`, `netSendAmounts` and `bundleLpFees` shall be:
    1 Ordered by `l1Token`, and
    2 Of the same non-zero length.

In the event that the number of `l1Token` entries contained within a single Pool Rebalance Leaf exceeds [`MAX_POOL_REBALANCE_LEAF_SIZE`](https://github.com/UMAprotocol/UMIPs/blob/7b1a046098d3e2583abd0372c5e9c6003b46ad92/UMIPs/umip-157.md#global-constants):
1. Additional Pool Rebalance Leaf instances shall be produced to accomodate the excess.
2. The ordering of `l1Tokens`, `bundleLpFees`, `runningBalance` and `neSendAmounts,` shall be maintained across the ordered array of leaves.
3. `groupIndex` shall be incremented for each subsequent leaf.

The set of Pool Rebalance Leaf objects shall be ordered by:
1, `chainId`, then
2. `l1Tokens`.

The Pool Rebalance Leaf `leafId` shall be set to indicate its position with the ordered array, starting at 0.

The hash for each Pool Rebalance Leaf shall be constructed by using Solidity's standard process of `keccak256(abi.encode(poolRebalanceLeaf))`.

The Pool Rebalance Merkle Tree shall be constructed such that it is verifyable using [OpenZeppelin's MerkleProof](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/742e85be7c08dff21410ba4aa9c60f6a033befb8/contracts/utils/cryptography/MerkleProof.sol) library.

#### Note
- See examples [here](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/742e85be7c08dff21410ba4aa9c60f6a033befb8/test/utils/cryptography/MerkleProof.test.js) for how to construct these types of trees.

### Constructing the Relayer Refund Root
At least one Relayer Refund Leaf shall be produced for each unique combination of SpokePool and `repaymentToken` for any of the following conditions:
- Valid `Fills`, OR
- Expired `Deposits`, OR
- Unfillable `Deposits`, OR
- A negative running balance net send amount.

Where `repaymentToken` is determined as follows for
- `Fills`: the [equivalent](#resolving-spokepool-tokens-to-their-hubpool-equivalent) token address for the `repaymentChainId`, as computed [here](#computing-relayer-repayments), of the `Fill.
- `Deposits`: the `inputToken`
- negative running balance net send amounts: the token address for the corresponding `l1Token` considered in Pool Rebalance Root production

Each Relayer Refund Leaf shall be constructed as follows:
- `amountToReturn` shall be set to `max(-netSendAmount, 0)`.
- `l2TokenAddress` shall be set to the `repaymentToken` as computed previously
    - HubPool and SpokePool token mappings shall be made according to the highest `quoteTimestamp` of any relays in the group.
    - If no relays are present, then the relevant token mapping from the previous successful proposal shall be used.
- Each element of the `refundAddresses` and `refundAmounts` arrays shall be produced according to the defined procedure for computing relayer repayments.
    - One entry shall exist per unique address, containing the sum of any outstanding:
        - Relayer repayments, and
        - Expired deposits, and
        - Pre-filled deposits where the `FillType` is `SlowFill`.
- The `refundAddresses` and `refundAmounts` arrays shall be ordered according to the following criteria:
    1. `refundAmount` descending order, then
    2. `relayerAddress` ascending order (in case of duplicate `refundAmount` values).
- Remove any elements from `refundAmounts` where the amount is 0 and also remove the same indexed element from `refundAddresses`. These two arrays shall be the same length after this step.

In the event that the number of refunds contained within a Relayer Refund leaf should exceed [`MAX_RELAYER_REPAYMENT_LEAF_SIZE`](https://github.com/UMAprotocol/UMIPs/blob/7b1a046098d3e2583abd0372c5e9c6003b46ad92/UMIPs/umip-157.md#global-constants) refunds:
1. Additional `RelayerRefundLeaf` instances shall be produced to accomodate the excess.
2. The ordering of `refundAddresses` and `refundAmounts` shall be maintained across the ordered array of leaves.
3. Only the first leaf for a given `l2TokenAddress` shall contain a non-zero `amountToReturn`.

The set of relayer refund leaves shall be ordered according to:
- chainId, then
- `l2TokenAddress`, then
- leaf sub-index (in case of > [`MAX_RELAYER_REPAYMENT_LEAF_SIZE`](#global-constants) repayments).

The Relayer Refund Leaf `leafId` field shall be numbered according to the ordering established above, starting at 0.

#### Note
- Once these leaves are constructed, they can be used to form a merkle root as described in the previous section.

#### SVM support

When ordering the leaves by `l2TokenAddress` for SVM chains, one should decode `mint_public_key` field `Pubkey` to its `bytes32` representation.

### Constructing the Slow Relay Root
One Slow Relay Leaf shall be produced per valid `Slow Fill Request` emitted within the `Bundle Block Range` for a destination SpokePool.
One Slow Relay Leaf shall be produced per valid early `Slow Fill Request` where the corresponding `Deposit` was emitted within the `Bundle Block Range` for an origin SpokePool.

A Slow Relay Leaf shall not be produced if the relevant `Slow Fill Request` `inputAmount` is equal to 0 and the `message` is a zero bytes string.

When a `Slow Fill Request` corresponds to multiple identical `Deposits`, the applied `quoteTimestamp` shall be sourced from the earliest identical `Deposit`.

Each Slow Relay Leaf shall be constructed as follows:
1. Set `relayData` to the `RelayData` emitted by the validated `Slow Fill Request`.
2. Set `chainId` to `destinationChainId` from the corresponding validated `Slow Fill Request`.
3. Set `updatedOutputAmount` to the updated amount computed for the SlowFill.

The array of Slow Relay Leaf instances shall be sorted according to;
1. `originChainId`, then
2. `depositId`.

#### Note
- Once these leaves are constructed, they can be used to form a merkle root as described in the previous section.
- Deposits with disparate output tokens (i.e. where the outputToken is not the equivalent of inputToken on the destination chain) are explicitly not eligible for slow fills. Any instances of `Slow Fill Requests` for non-equivalent tokens shall be ignored.

#### SVM support

When ordering the leaves by `depositId` for SVM chains, one should convert `deposit_id` field `[u8; 32]` to `uint256` using big-endian encoding.

# Recommendations
- Proposers are responsible for detecting and mitigating incorrect or inconsistent RPC data. Proposers should take steps to validate the correctness of their RPC data before proposing.
- Proposers should avoid relying on the deposit `outputAmount`, even for deposits where the `outputToken` is a known HubPool token. When computing fees, ensure that the `realizedLpFee` is _always_ subtracted from the `inputAmount`, rather than trying to infer them based on the spread between `inputAmount` and `outputAmount`.
- Relayers are advised to factor in origin chain finality guarantees when making fills on destination chains. Origin chain re-organisation can lead to deposit re-ordering and can thus invalidate fills.

# Migration
- Support for the logic described above (BUT NOT the updated events with `bytes32` types, like `FundsDeposited`, `FilledRelay`, ...) is required as of ConfigStore [VERSION](https://github.com/UMAprotocol/UMIPs/blob/7b1a046098d3e2583abd0372c5e9c6003b46ad92/UMIPs/umip-157.md#versions) 5.
- To ensure pre-fills are not double-refunded, the `Bundle Block Range` containing the version bump from 4 to 5 will follow the rules of this UMIP, but will not consider any `Fill` events from prior bundles for the purposes of generating relayer repayments. Similarly, no `Slow Fill Request` that was included in any prior bundle will be considered for the generation of a `Slow Relay Leaf`. All subsequent bundles will perform the logic exactly as described above.
- Support for Across events with `bytes32` types (`FundsDeposited`, `FilledRelay`, ...) is required as of ConfigStore [VERSION](https://github.com/UMAprotocol/UMIPs/blob/7b1a046098d3e2583abd0372c5e9c6003b46ad92/UMIPs/umip-157.md#versions) 6. 
- The `Legacy` events defined in this UMIP are marked as deprecated 7 days after the ConfigStore [VERSION](https://github.com/UMAprotocol/UMIPs/blob/7b1a046098d3e2583abd0372c5e9c6003b46ad92/UMIPs/umip-157.md#versions) migration from 5 to 6.

# Implementation
The Across v3 implementation is available in the Across [contracts-v2](https://github.com/across-protocol/contracts) repository.

The SVM SpokePool implementation is available as the `svm_spoke` program in the Across [contracts](https://github.com/across-protocol/contracts/tree/master/programs/svm-spoke) repository.

# Security considerations
Across v3 has been audited by OpenZeppelin.

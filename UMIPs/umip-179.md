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

## Data Types
Across v3 defines the following data types:

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
- `V3RelayData` specifies `bytes32` representation for addresses (`depositor`, `recipient`, ...) in order to interface with non-EVM chains. EVM addressed supplied shall be promoted to type `bytes32` with the upper bytes zeroed. 

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

## V3RelayExecutionParams
The `V3RelayExecutionParams` type is supplied by a relayer or executor when completing a fill. `V3RelayExecutionParams` is defined as follows:
| Name | Type | Description |
| :--- |:---- | :---------- |
| relay | V3RelayData | The V3RelayData object corresponding to the origin chain deposit to be filled. |
| relayHash | bytes32 | The keccak256 hash of the V3RelayData object. See also [Computing RelayData hashes](#computing-relaydata-hashes). |
| updatedOutputAmount | uint256 | The effective amount to be received by the recipient. This may be different to the deposit outputAmount. |
| updatedRecipient | bytes32 | The effective recipient address. This may be different to the deposit recipient. |
| updatedMessage | bytes | The effective message (if any) to be executed by the destination SpokePool. |
| repaymentChainId | uint256 | The repayment chain ID requested by the relayer completing the fill. This field is not relevant for slow fills. |

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
| updatedRecipient | bytes32 | The recipient of the funds being transferred. This may be the `recipient` identified in the original deposit, or an updated `recipient` following a `RequestedSpeedUpV3Deposit` event. |
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

### Event Deprecation
The following events are marked for future deprecation. Deprecation will be announced in a future update to this specification.
- V3FundsDeposited
- RequestedSpeedUpV3Deposit
- FilledV3Relay
- RequestedV3SlowFill

### FundsDeposited, V3FundsDeposited
The `FundsDeposited` event emits the unique `V3RelayData` for an individual deposit. No additional fields are defined. 
The `V3FundsDeposited` event emits the unique `V3RelayDataLegacy` for an individual deposit. No additional fields are defined.

Consumers of these events should append the `originChainId` in order to avoid unintentionally mixing events from different chains.

Note:
- The `FundsDeposited` and `V3FundsDeposited` `outputToken` field is not required to be a known HubPool `l1Token`. In-protocol arbitrary token swaps are supported by Across v3.
- The address identified by `exclusiveRelayer` has exclusive right to complete the relay on the destination chain until `exclusivityDeadline` has elapsed.
- If `exclusivityDeadline` is set to a past timestamp, any address is eligible to fill the relay.
- Any deposit that remains unfilled after the specified `fillDeadline` shall be refunded to the `depositor` address via the origin SpokePool in a subsequent settlement bundle.

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

Note:
- Relayers may optionally append the updated request from a `RequestedSpeedUpDeposit` or `RequestedSpeedUpV3Deposit` event when filling a relay, but have no obligation to use the updated request.

### RequestedSlowFill, RequestedV3SlowFill
The `RequestedSlowFill` event emits an `V3RelayData` instance.
The `RequestedV3SlowFill` event emits an `V3RelayDataLegacy` instance.

These events are emitted on the destination chain and signal to proposers that a slow fill has been requested for a specific deposit.

Note:
- `RequestedV3SlowFill` events cannot be emitted until the `exclusivityDeadline` timestamp has elapsed on the destination chain.
- `RequestedV3SlowFill` events cannot be emitted once the `fillDeadline` timestamp has elapsed on the destination chain.

### FilledRelay, FilledV3Relay

The `FilledRelay` event extends the `V3RelayData` type by applying the following adjustments:
| Name | Type | Description |
| :--- | :--- | :---------- |
| message | omitted | This field is omitted from the `FilledRelay` event in favour of the `messageHash` field. |
| messageHash | bytes32 | The keccak256 hash of the `V3RelayData` message field. This field is included in place of the `V3RelayData` message field. See also [Computing RelayData hashes](#computing-relaydata-hashes). |
| relayer | bytes32 | The address completing relay on the destination SpokePool. |
| repaymentChainId | uint256 | The depositId of the corresponding `V3FundsDeposited` event to be updated. |
| relayExecutionInfo | V3RelayExecutionEventInfo | The effective `recipient`, `message` and `outputAmount`, as well as the `FillType` performed (FastFill, ReplacedSlowFill, SlowFill). |

The `FilledV3Relay` event extends the `V3RelayDataLegacy` type by adding the following fields:
| Name | Type | Description |
| :--- | :--- | :---------- |
| relayer | address | The address completing relay on the destination SpokePool. |
| repaymentChainId | uint256 | The depositId of the corresponding `V3FundsDeposited` event to be updated. |
| relayExecutionInfo | V3RelayExecutionEventInfo | The effective `recipient`, `message` and `outputAmount`, as well as the `FillType` performed (FastFill, ReplacedSlowFill, SlowFill). |

Note:
- Consumers of these events should append the `destinationChainId` attribute in order to avoid unintentioanlly mixing events from different chains.

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

## Definitions

### Deposits
A `Deposit` is defined as an instance of either of the following events:
- `FundsDeposited`.
- `V3FundsDeposited`.

### Fills
A `Fill` is defined as an instance of either of the following events:
- `FilledRelay`.
- `FilledV3Relay`.

### Slow Fill Requests
A `Slow Fill` is defined as an instance of either of the following events:
- `RequestedSlowFill`.
- `RequestedV3SlowFill`.

### RelayData
`RelayData` is defined as an instance of etiher of the following data types:
- `V3RelayData`.
- `V3RelayDataLegacy`.

## Method
### Identifying SpokePool Contracts
The current SpokePool address for a specific chain is available by querying `HubPool.crossChainContracts()`. The chainId must be specified in the query. In case of SpokePool migations, historical SpokePool addresses can be identified by scraping HubPool `CrossChainContractsSet` events.

### Identifying "Lite" deployments
We consider a deposit to "originate" or be "destined for" a "Lite chain" if the `LITE_CHAIN_ID_INDICES` value in the AcrossConfigStore includes the deposit's origin chain or destination chain respectively as of the deposit's `quoteTimestamp` field. These chains impose constraints on relayer repayments and slow fills.

### Resolving SpokePool tokens to their HubPool equivalent
For the purpose of identifying the equivalent HubPool token given a SpokePool token, the following shall be followed:
1. Find the latest `SetRebalanceRoute` event with a block timestamp at or before the relevant HubPool block number, where the relevant SpokePool chain ID and token address  match the `SetRebalanceRoute` `destinationChainId` and `destinationToken` fields.
    - In the case of a `Deposit` event, the relevant HubPool block number is identified by resolving the `quoteTimestamp` to a HubPool block number.
3. From the resulting `SetRebalanceRoute` event, select the associated `l1Token` field.
4. Search the `SetPoolRebalanceRoute` events for the same `l1Token` and `destinationChainId` at or before the applicable HubPool block number.
5. Using the `l1Token` value found in step 2, search for the latest `SetRebalanceRoute` event at or before the applicable HubPool block number where `l1Token` and `destinationChainId` that match the extracted `l1Token` and SpokePool chain ID. If a match is found, the addresses match and are considered cross-chain equivalents.

### Identifying Bundle Block Ranges
In addition to the description [UMIP-157](https://github.com/UMAprotocol/UMIPs/blob/pxrl/umip179/UMIPs/umip-157.md#determining-block-range-for-root-bundle-proposal):
- Proposers may opt to reduce the size of the proposal block range for each chain in the event that RPC provider data inconsistencies are detected, and
- A "soft pause" of a chain is permitted in the event that the proposer cannot safely increment the bundle block range, or has no events to propose beyond the previous bundle block range. In this case, the proposer may repeat the procedure for
  DISABLED_CHAINS by proposing from and to the previous bundle end block.

### Computing RelayData Hashes
#### V3RelayData
The `V3RelayData` hash is computed as the `keccak256` hash over the ABI-encoded representation of the arguments `relayData`, `destinationChainId`, where:
- `relayData` is of type `V3RelayData`.
- `destinationChainId` is of type `uint256`.

#### V3RelayDataLegacy
The `V3RelayDataLegacy` hash is computed as the `keccak256` hash over the ABI-encoded representation of the arguments `relayData`, `destinationChainId`, where:
- `relayData` is of type `V3RelayDataLegacy`
- `destinationChainId` is of type `uint256`.

### Computing Relayer Repayments & Depositor Refunds
For the purpose of computing relayer repayments, the following procedures are completed:
- Finding Valid Fills
- Finding Valid Pre-Fills
- Finding Expired Deposits

#### Note
- Depositor refunds are issued via the Relayer Repayment workflow.

#### Validating Fills
Each of the `Fills` emitted within the [Bundle Block Range](#identifying-bundle-block-ranges) on a destination SpokePool shall be considered valid by verifying that:
1. The `Fill` event `FillType` field is not set to `SlowFill`, AND
2. The component `RelayData` maps exactly to a corresponding `Deposit` event emitted on the relevant `originChainId`. This may be determined by comparing the hashes of the two objects, AND
3. The corresponding `Deposit` event occurred within or before the [Bundle Block Range](#identifying-bundle-block-ranges) on the origin chain SpokePool.

If the `Deposit` event specifies `outputToken` 0x0 (i.e. the Zero Address), the equivalent SpokePool token on the destination chain shall be substituted in. For the purpose of determining `RelayData` equivalency, the updated/substituted `outputToken` shall be used in place of 0x0.

#### Validating Pre-fills
For each of the `Deposits` emitted within the [Bundle Block Range](#identifying-bundle-block-ranges) where no corresponding `Fill` is identified on the destination chain, identify the valid `Fill` according to the following criteria:
1. Verify that the destination chain `FillStatus` for the `Deposit` `RelayData` is `Filled` as at the destination chain end block number for the proposal.
2. Resolve the corresponding `Fill` on the destination chain.

#### Note
- No specific method is prescribed for resolving the fill on the destination chain. An `eth_getLogs` request can facilitate this, and if required, the [Bundle Block Range](#identifying-bundle-block-ranges) could be narrowed by a binary search over the `FillStatus` field. This is left as an implementation decision.

#### Finding Expired Deposits
For the purpose of computing depositor refunds, each `Deposit` event shall be considered expired by verifying that:
1. The `fillDeadline` timestamp elapsed within the [Bundle Block Range](#identifying-bundle-block-ranges) on the destination SpokePool (i.e. the `fillDeadline` expired between the `block.timestamp` of the destination chain's bundle start and end block),
2. The `FillStatus` on the destination SpokePool is set to `Unfilled` or `SlowFillRequested`.

Note:
- Expired deposits shall be refunded to the `depositor` address on the origin SpokePool.
- Depositor refunds are to be issued as part of the relayer refund procedure.
- The `fillDeadline` timestamp shall be resolved to a block number on the destination chain in order to determine inclusion within the [Bundle Block Range](#identifying-bundle-block-ranges).

### Finding Slow Fill Requests
For the purpose of computing slow fills to be issued to recipients, each `Slow Fill Request` emitted within the [Bundle Block Range](#identifying-bundle-block-ranges) on a destination SpokePool shall be considered valid by verifying that:
1. The `inputToken` and `outputToken` addresses are equivalent at the deposit `quoteTimestamp`,
2. The `fillDeadline` has not already elapsed relative to the `destinationChainId` bundle end block number,
3. The destination SpokePool `FillStatus` mapping for the relevant `RelayData` hash is `SlowFillRequested`,
4. The `Slow Fill Request` `RelayData` is matched by a corresponding `Deposit` event on the origin SpokePool,
5. The `originChainId` and `destinationChainId` are not Lite chains.

Note:
- A slow fill request is made by supplying a complete copy of the relevant `RelayData` emitted by a `Deposit` event.
- The resulting set of validated `Slow Fill Requests` shall be included as SlowFills in the subsequent root bundle proposal.

### Computing LP Fees
Each valid `Fill` is subject to an LP fee. The procedure for computing LP fees is as defined in [UMIP-136 Add IS_RELAY_VALID as a supported price identifier](https://github.com/UMAprotocol/UMIPs/blob/7b1a046098d3e2583abd0372c5e9c6003b46ad92/UMIPs/umip-136.md), with the following amendments:
- The AcrossConfigStore contract shall be used to identify the correct rate model, instead of a `RateModelStore` contract.
- The `HubPool` `liquidityUtilizationCurrent()` and `liquidityUtilizationPostRelay()` functions shall be used instead of the `BridgePool` variant.
- The event `inputToken` shall be mapped from the SpokePool address to a HubPool `l1Token` address by following the matching procedure outlined above.
- The LP fee is computed between the `originChainId` specified by the `Deposit` and `repaymentChainId` specified by the relayer, where the `relayExecutionInfo.FillType != SlowFill` and the Fill `destinationChainId` otherwise.

Note:
- The LP fee is typically referenced as a multiplier of the `Deposit` `inputAmount`, named `realizedLpFeePct` elsewhere in this document.

### Computing Bundle LP Fees
The bundle LP fee for a [Bundle Block Range](#identifying-bundle-block-ranges) on a SpokePool and token pair shall be determined by summing the applicable LP fees for each of the following validated events:
- `FilledRelay`.
- `FilledV3Relay`.

### Computing Relayer Repayments
For a validated `Deposit` event, the relayer repayment amount shall be computed as follows:
- `(inputAmount * (1 - realizedLpFeePct)) / 1e18`, where `realizedLpFeePct` is computed over the set of HubPool `l1Token`, `originChainId` and `repaymentChainId` at the HubPool block number corresponding to the relevant `Deposit` `quoteTimestamp`.
- The applicable rate model shall be sourced from the AcrossConfigStore contract for the relevant `l1Token`.

The applied `repaymentChainId` shall be determined as follows:
- When the `originChainId` is a `Lite chain` as at the `Deposit` `quoteTimestamp`: `originChainId`, ELSE
- When no `PoolRebalanceRoute` exists for the `repaymentToken` on the `Fill` `repaymentChainId`: `destinationChainId`, ELSE
- The `repaymentChainId` as specified in the `Fill`.

The applied repayment address shall be determined as follows:
- When the `Fill` `relayer` address is valid for the applied `repaymentChainId`: `relayer`, ELSE
- The `Fill` `msg.sender` address.

#### Note
- Examples of an invalid `relayer` address include:
    - An SVM address on an EVM chain.

### Computing Deposit Refunds
For an expired `Deposit` event, the depositor refund amount shall be computed as `inputAmount` units of `inputToken`.

### Computing Slow Fill updated output amounts
For the purpose of computing the amount to issue to a recipient for a SlowFill, the relayer fee shall be nulled by applying the following procedure:
- `updatedOutputAmount = (inputAmount * (1 - realizedLpFeePct)) / 1e18`, where `realizedLpFeePct` is computed at the deposit `quoteTimestamp` between `originChainId` and `destinationChainId`.

Constraint:
- The `Deposit` `outputAmount` shall _not_ be considered when determining SlowFill amounts.

Note:
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
    - For each group of `Deposit` events that expired within the [Bundle Block Range](#identifying-bundle-block-ranges), sum the total deposit refunds on the origin chain. Add the amount to the exsting relayer refunds for that chain.

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

Note:
The referenced `SpokeTargetBalances` is as specified by [UMIP-157 Token Constants](https://github.com/UMAprotocol/UMIPs/blob/pxrl/umip179/UMIPs/umip-157.md#token-constants):

## Constructing Root Bundles

### Constructing the Pool Rebalance Root
One Pool Rebalance Leaf shall be produced per unique `chainId` & `l1Token` pair, where the corresponding `Deposit`, `Fill` or`Slow Fill Request` events were emitted by the relevant SpokePool within the [Bundle Block Range](#identifying-bundle-block-ranges).

Each Pool Rebalance Leaf shall be constructed as follows:
1. For each unique `chainId` and `l1Token` pair:
    1. Compute the arrays `runningBalances`, `netSendAmounts` and `bundleLpFees` according to the procedures outlined above.
    2. Set the `groupIndex` to 0.
2. Within each Pool Rebalance Leaf instance, the arrays `l1Tokens`, `runningBalances`, `netSendAmounts` and `bundleLpFees` shall be:
    1 Ordered by `l1Token`, and
    2 Of the same (on-zero length.

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

Note:
- See examples [here](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/742e85be7c08dff21410ba4aa9c60f6a033befb8/test/utils/cryptography/MerkleProof.test.js) for how to construct these types of trees.

### Constructing the Relayer Refund Root
At least one Relayer Refund Leaf shall be produced for each unique combination of SpokePool and `l1Token` for any of the following conditions:
- Valid `Fill` events, OR
- Expired `Deposit` events, OR
- A negative running balance net send amount.

Each Relayer Refund Leaf shall be constructed as follows:
- `amountToReturn` shall be set to `max(-netSendAmount, 0)`.
- `l2TokenAddress` shall be set to the L2 token address for the corresponding `l1Token` considered in Pool Rebalance Root production.
    - HubPool and SpokePool token mappings shall be made according to the highest `quoteTimestamp` of any relays in the group.
    - If no relays are present, then the relevant token mapping from the previous successful proposal shall be used.
- Each element of the `refundAddresses` and `refundAmounts` arrays shall be produced according to the defined procedure for computing relayer repayments.
    - One entry shall exist per unique address, containing the sum of any outstanding:
        - Relayer repayments, and/or
        - Expired deposits.
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

Note:
- Once these leaves are constructed, they can be used to form a merkle root as described in the previous section.

### Constructing the Slow Relay Root
One Slow Relay Leaf shall be produced per valid `Slow Fill Request` emitted within the [Bundle Block Range](#identifying-bundle-block-ranges) for a destination SpokePool.

A Slow Relay Leaf shall not be produced if the relevant `Slow Fill Request` `inputAmount` is equal to 0 and the `message` is a zero bytes string.

Each Slow Relay Leaf shall be constructed as follows:
1. Set `relayData` to the `RelayData` emitted by the validated `Slow Fill Request`.
2. Set `chainId` to `destinationChainId` from the corresponding validated `Slow Fill Request`.
3. Set `updatedOutputAmount` to the updated amount computed for the SlowFill.

The array of Slow Relay Leaf instances shall be sorted according to;
1. `originChainId`, then
2. `depositId`.

Note:
- Once these leaves are constructed, they can be used to form a merkle root as described in the previous section.
- Deposits with disparate output tokens (i.e. where the outputToken is not the equivalent of inputToken on the destination chain) are explicitly not eligible for slow fills. Any instances of `Slow Fill Requests` for non-equivalent tokens shall be ignored.

# Recommendations
- Proposers are responsible for detecting and mitigating incorrect or inconsistent RPC data. Proposers should take steps to validate the correctness of their RPC data before proposing.
- Proposers should avoid relying on the deposit `outputAmount`, even for deposits where the `outputToken` is a known HubPool token. When computing fees, ensure that the `realizedLpFee` is _always_ subtracted from the `inputAmount`, rather than trying to infer them based on the spread between `inputAmount` and `outputAmount`.
- Relayers are advised to factor in origin chain finality guarantees when making fills on destination chains. Origin chain re-organisation can lead to deposit re-ordering and can thus invalidate fills.

# Across v2 -> V3 Transition
Across v3 is supplementary to Across v2, adding extra logic support new types of deposits, fills and slow fill requests. At the point of upgrading to Across v3, it will no longer be possible for Across v2 `FundsDeposited` events to be emitted. In order to support continuity of service and to minimise disruption for third-party integrators, it will be possible for pre-existing `FundsDeposited` events to be filled via `FilledRelay` events. During this period, RootBundleProposals will contain relayer repayment and slow fill leaves for both Across v2 and v3.

The V3 rules defined in this UMIP will apply beginning when the VERSION field in the ConfigStore is updated to 3 or higher. The ability for Across bundles to support V2 events may cease in a future VERSION increment.

XXX Identify a transition point for the pending upgrade. This is likely to be handled via a `VERSION` bump.

# Implementation
The Across v3 implementation is available in the Across [contracts-v2](https://github.com/across-protocol/contracts-v2) repository.

# Security considerations
Across v3 has been audited by OpenZeppelin.

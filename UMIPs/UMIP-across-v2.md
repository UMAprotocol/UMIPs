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

## Ancillary Data Specifications

The ancillary data only needs a single field: ooRequester, which should be the contract requesting the price from the
OO. Because that contract should contain enough information about the request for voters to resolve the validity of the
relay, no additional ancillary data is needed.

Example:

```
ooRequester:0x69CA24D3084a2eea77E061E2D7aF9b76D107b4f6
```


# Data Specifications and Implementation

Note: the following details will often refer to the [Across V2](https://github.com/across-protocol/contracts-v2) repo
at commit hash: aac42df9192145b5f4dc17162ef229c66f401ebe. This allows the UMIP to have a constant reference rather than
depending on a changing repository.

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

From the selected event, one should be able to glean the following information:
- `bundleEvaluationBlockNumbers`
- `poolRebalanceRoot`
- `relayerRefundRoot`
- `slowRelayRoot`

The `bundleEvaluationBlockNumbers` is an ordered array of block numbers for each destination chain. Which index
corresponds to which chain is denoted by the config stored at TBD. From this, one should be able to determine a list
of chainIds and ending block numbers.

To determine the start block number for each chainId, search for the
[RootBundleExecuted event](https://github.com/across-protocol/contracts-v2/blob/aac42df9192145b5f4dc17162ef229c66f401ebe/contracts/HubPool.sol#L158-L167)
with a matching chainId with the highest block timestamp (and transactionIndex or logIndex if transactionIndices match)
while still being earlier than the timestamp of the request. Once that event is found, search for the
[ProposeRootBundle](https://github.com/across-protocol/contracts-v2/blob/aac42df9192145b5f4dc17162ef229c66f401ebe/contracts/HubPool.sol#L149-L157)
event that is as late as possible, but earlier than the RootBundleExecuted event. As above, use transactionIndex and
logIndex to sort if there are matching events in the same block. Once this proposal event is found, determine its
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

For each destination chain, find all
[FilledRelay events](https://github.com/across-protocol/contracts-v2/blob/aac42df9192145b5f4dc17162ef229c66f401ebe/contracts/SpokePool.sol#L84-L100)
on its SpokePool between the starting block number and ending block number for that chain.

For all FilledRelay events, you can find the SpokePool for the origin chain by querying
[CrossChainContractsSet](https://github.com/across-protocol/contracts-v2/blob/aac42df9192145b5f4dc17162ef229c66f401ebe/contracts/HubPool.sol#L120)
and finding all matching events where the l2ChainId matches the `originChainId` value in the FilledRelay event. The
`spokePool` values in these events are all possible spoke pools that this deposit could have been from. Note: old
SpokePools must be considered so upgrades don't block old deposits from being relayed.

For each FilledRelay event found earlier, a
[FundsDeposited](https://github.com/across-protocol/contracts-v2/blob/aac42df9192145b5f4dc17162ef229c66f401ebe/contracts/SpokePool.sol#L67-L77)
event should be found in one of the spoke pools for the originChainId where the following parameters match:

- `amount`
- `originChainId`
- `destinationChainId`
- `relayerFeePct`
- `depositId`
- `recipient`
- `depositor`



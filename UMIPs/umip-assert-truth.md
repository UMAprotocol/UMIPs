## Headers


| UMIP-XXX       |                                                                          |
| -------------- | ------------------------------------------------------------------------ |
| UMIP Title     | Add `ASSERT_TRUTH` as a supported price identifier                       |
| Authors        | Reinis Martinsons (reinis@umaproject.org)                                |
| Status         | Draft                                                                    |
| Created        | January 30th, 2023                                                       |
| Discourse Link | https://discourse.umaproject.org/t/feat-add-assert-truth-identifier/1900 |

# Summary

The DVM should support price requests for the `ASSERT_TRUTH` price identifier. `ASSERT_TRUTH` is intended to be used as
 a default price identifier for UMA's [Optimistic Asserter contract](https://github.com/UMAprotocol/protocol/blob/master/packages/core/contracts/optimistic-asserter/implementation/OptimisticAsserter.sol)
 that allows asserters to make claims about the state of the world. This UMIP does not attempt to put any restrictions
 on the types of claims that can be made, but rather focuses on the mechanics of how the DVM should be used to resolve
 disputes over such claims.

Price settlement can happen only in one of two ways:

- Return the `1` value if the claim is true.
- Return the `0` value if the claim is false or cannot be resolved.

# Motivation

Approving this price identifier will allow integrating partners to build their products on top of UMA's Optimistic
 Asserter contract. This will allow their users to make claims about the state of the world and resolve disputes over
 these claims in a trustless manner.

# Data Specifications

It is not possible to define specific data sources or markets for this identifier. Determination of data sources and
 results are left entirely up to potential disputers and voters as the best method of determining the results will
 depend on the claim being made.

# Price Feed Implementation

No price feed is needed (or possible) for this price identifier.

# Technical Specifications

- Price identifier name: ASSERT_TRUTH
- Base Currency: NA
- Quote Currency: NA
- Rounding: None, there is a predetermined set of results.
- Estimated current value of price identifier: NA

## Ancillary Data Specifications

Upon dispute the following ancillary data parameters will be available to the voter after converting it from bytes to
 UTF-8:

- `assertionId`: The ID of the assertion being disputed.
- `oaAsserter`: The address of the asserter that made the claim.

If the assertion was disputed on any other chain than Ethereum mainnet, additional `childChainId` parameter will be
 available to identify the chain where the dispute was raised.

# Rationale

This construction sacrifices assurances of determinism in favor of greater price identifier flexibility. This places the
 burden of correct construction on claims being asserted, but, in return, allows for quicker and easier development
 without needing to pass through UMA governance for each additional application that builds on top of Optimistic
 Asserter contract.

# Implementation

1. Voters should identify the Optimistic Asserter contract that was used to make and dispute the assertion. This can be
 done by calling `getImplementationAddress` on the `Finder` contract with the `OptimisticAsserter` identifier encoded as
 `bytes32` at the time of assertion. The address of the `Finder` contract depends on the network where the dispute was
 raised and is available in the `networks` directory of the UMA [protocol repository](https://github.com/UMAprotocol/protocol/tree/master/packages/core/networks).
2. Voters should decode the ancillary data of the request and determine its `assertionId` parameter.
3. Voters should search the `AssertionMade` event emitted by the Optimistic Asserter contract from Step 1 for an
 assertion with the matching `assertionId` parameter from Step 2. Take a note of the timestamp of this event and its
 `claim` parameter, as well as any other relevant fields needed to resolve the dispute.
4. Voters should attempt to decode the `claim` parameter from Step 3 as UTF-8 string. If the decoding fails, the claim
 is not a string that can be asserted truthful, and voters should return the `0` value.
5. The decoded `claim` string from Step 4 could include references to the timestamp that was used to make the assertion.
 If not present, voters should assume that the timestamp of the `AssertionMade` event from Step 3 should be used.
6. Voters should attempt to evaluate whether the decoded `claim` from Step 4 represents the true state of the world as
 of claim's timestamp determined from Step 5:
    - If the claim was true, voters should return the `1` value.
    - If the claim was false, voters should return the `0` value.
    - If the claim cannot be unambiguously resolved, voters should return the `0` value.

All resolved price values should be scaled by `1e18` when interacting with contracts directly (e.g. writing scripts,
 console access or interacting through block explorer). Optimistic Asserter and Voting dApps scale price response
 automatically or can abstract the price value with  simple `YES` or `NO` answer to the truthfulness of the claim for
 the convenience of the voter.

# Security Considerations

This construction sacrifices assurances of determinism in favor of greater price identifier flexibility. Users of this
 price identifier should be careful to ensure that claims being made through Optimistic Asserter contract can be
 evaluated to reach a deterministic outcome.

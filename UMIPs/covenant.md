##  Headers

| UMIP-<#>       |                                                               |
| ---------------| --------------------------------------------------------------|
| UMIP Title     | Add COVENANT_V1 as a supported price identifier               |
| Authors        | Reinis Martinsons (reinis@umaproject.org)                     |
| Status         | Draft                                                         |
| Created        | April 22, 2022                                                |
| Discourse Link | [UMA's Discourse](TBD)                                        |

# Summary

The COVENANT_V1 identifier is intended to be used with an [Optimistic Distributor contract](https://github.com/UMAprotocol/protocol/blob/master/packages/core/contracts/financial-templates/optimistic-distributor/OptimisticDistributor.sol) to verify Covenant bribing protocol payouts. Any address can propose distribution payouts of previously funded Covenant bribe through [Merkle Distributor contract](https://github.com/UMAprotocol/protocol/blob/master/packages/core/contracts/merkle-distributor/implementation/MerkleDistributor.sol) that follow previously posted bribe payout calculation methods and any address can dispute a proposal to UMA's [Optimistic Oracle](https://umaproject.org/products/optimistic-oracle) within a challenge window.

# Motivation

The COVENANT_V1 identifier, coupled with the Optimistic Distributor and Merkle Distributor contracts, will allow to build truly decentralized bribing protocol where bribers can create any creative bribe payouts scheme based on achieved vote results.

# Technical Specification

-----------------------------------------
- Price identifier name: COVENANT_V1
- Base Currency: NA
- Quote Currency: NA
- Rounding: 0

## Ancillary Data Specifications

When converting ancillary data to UTF8 string it must contain price request parameters expressed as a list of key-value pairs delimited by `,` (commas) and each key-value pair further delimited by `:` (colons). If a value should contain `,` or `:` characters, such value should be enclosed in double quotes. If required, stringified JSON objects and arrays are also supported as valid values. The below listed key parameters will be used to instruct voters how to resolve a given price request for this identifier and request timestamp:

- `VotingPlatform`: Allows identifying on which platform bribed voters should participate. This can be either direct link to voting platform or human readable description.
- `VoteProposal`: Includes all information required to identify the vote that is being bribed. This can be either direct link to specific voting page or human readable description in case the voting page is not yet available. If required bribers can reference the next vote relative to the timestamp when the bribe had been first funded.
- `BribedChoices`: Voting choices that are covered by the bribe. This can be either single value or an array of voting choices if the briber wants to sum their results as a group in a multiple choice type voting. Individual voting choices can be identified either by their fixed index positions (e.g. if known in advance in a snapshot proposal) or their human readable descriptions.
- `VoteMetric`: Method for quantifying bribed vote results (from `BribedChoices` parameter) as a non-negative number.
- `PayoutFunction`: Total payout function that defines how vote results value should be translated to total payout amount expressed as a multiplier to previously funded maximum bribe amount. This can be expressed either as formula or human readable instructions in case where more complex transformation logic is required.
- ``BribeDistribution`: Bribe distribution rules to individual bribers. This should provide full instructions on:
  - how to identify user addresses that have directly or indirectly (e.g. through delegation) voted on any of `BribedChoices` in the `VoteProposal`,
  - conditions for disqualifying voters (e.g. due to split-vote in multiple choice voting) or applying minimum qualifying thresholds to user voting power,
  - how to distribute total payout (before fees) among qualifying voters (e.g.  proportional to voting power, any maximum payout limits to individual users, equal to all qualifying voters, etc.),
  - if and what fee amount to delegates should be applied for voters having delegated their voting power,
  - rules for distributing any remainder from total payout in case any qualifying conditions or maximum payout limits to individual users have been applied (e.g. how to split it among other users or just reducing total payout amount).
- `Clawback`: Instructions on where to distribute the difference between maximum bribe amount and actual total payouts to voters. This can be either single recipient address or instructions on how to distribute it based on who has funded the bribe (e.g. only the first sponsor creating the bribe or proportional distribution among all sponsoring addresses if the bribing rewards had been topped).
- `ErrorMargin`: Numerical value representing the maximum allowed error margin when validating individual payouts.

Whenever any of the parameters above require longer descriptions they can be hosted on IPFS and their content hash string used as parameter value instead.

# Implementation

Voters should first resolve all ancillary data parameter values either directly or through the included IPFS content hash strings. In case any required parameters (all above except for `Clawback` and `ErrorMargin`) are missing or their values cannot be interpreted unambiguously bribe should be refunded to its sponsor and voters should validate such price request against refund instructions in the next section. Otherwise proceed to instructions below.

1. 

## Refund instructions

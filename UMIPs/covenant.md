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

When converting ancillary data to UTF8 string it **must** contain price request parameters expressed as a list of key-value pairs delimited by `,` (commas) and each key-value pair further delimited by `:` (colons). If a value should contain `,` or `:` characters, such value should be enclosed in double quotes. If required, stringified JSON objects and arrays are also supported as valid values. The below listed key parameters will be used to instruct voters how to resolve a given price request for this identifier and request timestamp:

- `votingPlatform`: Allows identifying on which platform bribed voters should participate. This can be either direct link to voting platform or human readable description.
- `voteProposal`: Includes all information required to identify the vote that is being bribed. This can be either direct link to specific voting page or human readable description in case the voting page is not yet available. If required bribers can reference the next vote relative to the timestamp when the bribe had been first funded.
- `expirationTimestamp`: Provides ability for sponsors to claw back bribe if there is no finalized vote results available on the `voteProposal` after the set expiration timestamp.
- `bribedChoices`: Voting choices that are covered by the bribe. This can be either single value or an array of voting choices if the briber wants to sum their results as a group in a multiple choice type voting. Individual voting choices can be identified either by their fixed index positions (e.g. if known in advance in a snapshot proposal) or their human readable descriptions.
- `voteMetric`: Method for quantifying bribed vote results (from `bribedChoices` parameter) as a non-negative number.
- `payoutFunction`: Total payout function that defines how vote results value should be translated to total payout amount expressed as a multiplier to previously funded maximum bribe amount. This can be expressed either as formula or human readable instructions in case where more complex transformation logic is required.
- `bribeDistribution`: Bribe distribution rules to individual bribers. This should provide full instructions on:
  - how to identify user addresses that have directly or indirectly (e.g. through delegation) voted on any of `bribedChoices` in the `voteProposal`,
  - conditions for disqualifying voters (e.g. due to split-vote in multiple choice voting) or applying minimum qualifying thresholds to user voting power,
  - how to distribute total payout (before fees) among qualifying voters (e.g.  proportional to voting power, any maximum payout limits to individual users, equal to all qualifying voters, etc.),
  - if and what fee amount to delegates should be applied for voters having delegated their voting power,
  - rules for distributing any remainder from total payout in case any qualifying conditions or maximum payout limits to individual users have been applied (e.g. how to split it among other users or just reducing total payout amount).
- `clawback`: Instructions on where to distribute the difference between maximum bribe amount and actual total payouts to voters. This can be either single recipient address or instructions on how to distribute it based on who has funded the bribe (e.g. only the first sponsor creating the bribe or proportional distribution among all sponsoring addresses if the bribing rewards had been topped).
- `errorMargin`: Numerical value representing the maximum allowed error margin when validating individual payouts.
- `rewardIndex`: Integer value allowing to identify `Reward` struct from the Optimistic Distributor contract that includes the maximum bribe payout.

Whenever any of the parameters above require longer descriptions they can be hosted on IPFS and their content hash string used as parameter value instead.

# Implementation

`COVENANT_V1` price responses represent whether the proposed bribe payout distribution is valid. If any of **must** conditions in this UMIP is not fulfilled the proposed payout should be considered invalid. If the proposed payout is invalid, the price should be `0`. If the proposed payout is valid, the price should be `1`. *Note*: all price values should be scaled by `1e18` if responding programmatically, but Optimistic Oracle and Voting dApps scales them for the users.

Price requests for `COVENANT_V1` price identifier should be only made through Optimistic Oracle since its resolvement requires verifying event data emitted by the Optimistic Distributor contract in the same transaction when the price is requested to the Optimistic Oracle. In case of dispute UMA voters would need to identify this original price request transaction through the stamped `ooRequester` and `childChainId` (in case of non-Ethereum deployments) parameters to the ancillary data.

Voters should first resolve all ancillary data parameter values either directly or through the included IPFS content hash strings. In case any of the required parameters (all listed in the Ancillary Data Specifications section except for `clawback` and `errorMargin`) is missing or their values cannot be interpreted unambiguously bribe should be refunded to its sponsor and voters should validate such price request against instructions in the following Refund instructions section. Otherwise proceed to instructions below.

1. Determine whether the voting proposal being bribed from the `votingPlatform` and `voteProposal` parameters had been irreversibly resolved at or before the cut-off time from the `expirationTimestamp` parameter. In case the vote was not resolved on time the bribe should be refunded to its sponsor and voters should validate such price request against Refund instructions section. Otherwise proceed to the steps below.
2. Collect data on the proposed bribe payout distribution by inspecting `rewardToken`, `maximumRewardAmount`, `merkleRoot` and `ipfsHash` parameters emitted by the Optimistic Distributor contract in the same transaction when price was requested on the Optimistic Oracle.
3. `ipfsHash` **must** represent a valid IPFS content hash for the IPFS hosted file listing actual bribe payouts.
4. Bribe payouts file referenced by `ipfsHash` **must** contain at least a list of bribe payout recipient addresses, individual bribe amounts and their Merkle proofs (array of `bytes32` values represented as hex strings) for each recipient.
5. Sum of individual bribe amounts in the bribe payout file **must** exactly match the `maximumRewardAmount` (as it also includes the remainder to be returned to the sponsor). It is expected that by default bribe payouts are raw amounts that do not need any scaling and can be directly compared to the value of `maximumRewardAmount`. Though, in case human readable payouts were provided voters should first scale them up to their raw representation using the `decimals` parameter from the `rewardToken` contract.
6. It is expected that the bribe payout file includes `accountIndex` parameter for each recipient and they **must** be unique non-negative integers across all payout set. If `accountIndex` is not provided then voters should assign it continuously for each recipient starting from 0.
7. Calculate leaf data for each individual bribe payout by taking Keccak-256 hash over the ABI converted and tightly packed parameters of recipient address, bribe amount and `accountIndex`. In `web3.js` this can be achieved by using:

   ```
   web3.utils.soliditySha3(
     { value: recipientAddress, type: "address" },
     { value: bribeAmount, type: "uint256" },
     { value: accountIndex, type: "uint256" }
   );
   ```
8. Verify each individual bribe payout by traversing a Merkle tree up from its leaf (calculated is Step 7 above) using its corresponding Merkle proofs:
  - The process should start by taking the leaf and the first element of the Merkle proofs array.
  - Order both above from lowest value to highest and concatenate them to get `bytes64` value.
  - Perform Keccak-256 hash on the concatenated `bytes64` to get the next Merkle branch. In `web3.js` one can use `web3.utils.soliditySha3` method.
  - Continue by taking the next element from the Merkle proofs array, pair it with the obtained Merkle branch from the previous step and Keccak-256 hash their ordered concatenation to get the next Merkle branch.
  - Repeat the above procedure for all elements of the provided Merkle proofs array. The last obtained hash **must** exactly match the `merkleRoot` for all individual bribe payments.
9. 

## Refund instructions

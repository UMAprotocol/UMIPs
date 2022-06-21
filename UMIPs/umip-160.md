##  Headers

| UMIP-160       |                                                                                             |
| ---------------| --------------------------------------------------------------------------------------------|
| UMIP Title     | Add COVENANT_V1 as a supported price identifier                                             |
| Authors        | Reinis Martinsons (reinis@umaproject.org)                                                   |
| Status         | Approved                                                                                  |
| Created        | April 22, 2022                                                                              |
| Discourse Link | [UMA's Discourse](https://discourse.umaproject.org/t/add-covenant-v1-price-identifier/1719) |

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
- `voteProposal`: Includes all information required to identify the vote that is being bribed (human readable description). If required bribers can reference the next vote relative to the timestamp when the bribe had been first funded.
- `expirationTimestamp`: Provides ability for sponsors to claw back bribe if there is no finalized vote results available on the `voteProposal` after the set expiration timestamp.
- `bribedChoice`: Single voting choice that is covered by the bribe (e.g. YES/NO, asset in gauge proposal, etc.).
- `voteMeasurement`: Method for quantifying relative vote results for the bribed choice (from the `bribedChoice` parameter) expressed as a number ranging from 0 to 1 where 0 represents no votes and 1 means all voters had voted for the bribed choice.
- `payoutFunction`: Total payout function that defines how vote results value should be translated to total payout amount expressed as a multiplier to previously funded maximum bribe amount. This can be expressed either as formula or human readable instructions in case where more complex transformation logic is required.
- `bribeDistribution`: Bribe distribution rules to individual bribers. This should provide full instructions on:
  - how to identify user addresses that have directly or indirectly (e.g. through delegation) voted on the `bribedChoice` in the `voteProposal`,
  - conditions for disqualifying voters or applying minimum qualifying thresholds to user voting power,
  - how to distribute bribe payout among qualifying voters,
  - if and what fee amount to delegates should be applied for voters having delegated their voting power.
- `clawback`: Instructions on where to distribute the difference between maximum bribe amount and actual total payouts to voters. This can be either single recipient address or instructions on how to distribute it based on who has funded the bribe (e.g. only the first sponsor creating the bribe or proportional distribution among all sponsoring addresses if the bribing rewards had been topped).
- `errorMargin`: Numerical value representing the maximum allowed error margin (expressed as coefficient) when validating individual payouts.
- `rewardIndex`: Integer value allowing to identify `Reward` struct from the Optimistic Distributor contract that includes the maximum bribe payout.

Whenever any of the parameters above require longer descriptions they can be hosted on IPFS and their content hash string used as parameter value instead.

### Example ancillary data

As an illustration one could construct bribe for QiDao Vault Incentives Gauge with following ancillary data parameters:

```
votingPlatform: "https://snapshot.org/#/qidao.eth",
voteProposal: "Next Vault Incentives Gauge round following the initial funding as emitted by requesting contract in RewardCreated event with matching rewardIndex. This is bi-weekly voting to allocate Qi rewards to vault collateral types established in QIP047 by QiDao.",
expirationTimestamp: 1653264000,
bribedChoice: vGHST (Polygon),
voteMeasurement: bafkreiepkdupeke462zpoj56xysihfh663q3v4aoxlltyixhy3lkn3qgb4,
payoutFunction: bafkreifupsisnlqi2264ze6rjih3b6cpgpomwpljtlb5qk376sjc7haijm,
bribeDistribution: bafkreidmvkovrgi2jvhxgjvn6b4d6wydhlvsab2742e7b5rpvedmvtifem
```

This would provide incentives to vote for vGHST vault collateral on Polygon for the upcoming QiDao Vault Incentives Gauge round. Sponsor would be able to recover its bribe if no voting takes place till May 23, 2022 12:00:00 AM UTC. The linked [voteMeasurement](https://ipfs.io/ipfs/bafkreiepkdupeke462zpoj56xysihfh663q3v4aoxlltyixhy3lkn3qgb4) document details how to resolve voting score for vGHST (Polygon) choice. [payoutFunction](https://ipfs.io/ipfs/bafkreifupsisnlqi2264ze6rjih3b6cpgpomwpljtlb5qk376sjc7haijm) instructions would insure that no bribe is paid below 8.33% threshold (as QI is allocated to other vaults above this minimum threshold) and constant bribe payout per 1% when above 10% score. [bribeDistribution](https://ipfs.io/ipfs/bafkreidmvkovrgi2jvhxgjvn6b4d6wydhlvsab2742e7b5rpvedmvtifem) document details how to distribute the payout among participating voters and also covering vote delegation with 20% delegate fee.

# Implementation

`COVENANT_V1` price responses represent whether the proposed bribe payout distribution is valid. If any of **must** conditions in this UMIP is not fulfilled the proposed payout should be considered invalid. If the proposed payout is invalid, the price should be `0`. If the proposed payout is valid, the price should be `1`. *Note*: all price values should be scaled by `1e18` if responding programmatically, but Optimistic Oracle and Voting dApps scales them for the users.

Price requests for `COVENANT_V1` price identifier should be only made through Optimistic Oracle since its resolvement requires verifying event data emitted by the Optimistic Distributor contract in the same transaction when the price is requested to the Optimistic Oracle. In case of dispute UMA voters would need to identify this original price request transaction through the stamped `ooRequester` and `childChainId` parameters to the ancillary data.

Since the functioning of `COVENANT_V1` price identifier relies on the hard-coded protocol fee recipient address the price request **must** originate only from Polygon deployment of the Optimistic Distributor contract.

Voters should first resolve all ancillary data parameter values either directly or through the included IPFS content hash strings. In case any of the required parameters (all listed in the Ancillary Data Specifications section except for `clawback` and `errorMargin`) is missing or their values/instructions cannot be interpreted unambiguously bribe should be refunded to its sponsor and voters should validate such price request against instructions in the Refund instructions section (though Technical verification still applies).

## Status of bribed vote proposal

1. Identify the voting proposal being bribed from the `votingPlatform` and `voteProposal` parameters.
2. Determine whether the voting proposal being bribed had been opened for voting and irreversibly resolved at or before the cut-off time from the `expirationTimestamp` parameter. In case the vote was not resolved on time the bribe should be refunded to its sponsor and voters should validate such price request (made after `expirationTimestamp`) against Refund instructions section.
3. If the price request was made at or before the cut-off time from the `expirationTimestamp` the voting proposal being bribed **must** have been irreversibly resolved at or before the `expirationTimestamp`. This condition also applies when the voting proposal had been withdrawn and the proposal to refund the briber can be made only after the `expirationTimestamp`.

## Technical verification

This section provides instructions to verify if the proposed payout distribution matches the provided bribe funding and all individual payouts include valid Merkle proofs verifying them against the proposed Merkle root.

1. Collect data on the proposed bribe payout distribution by inspecting `rewardToken`, `maximumRewardAmount`, `merkleRoot` and `ipfsHash` parameters emitted by the Optimistic Distributor contract in the same transaction when price was requested on the Optimistic Oracle.
2. `ipfsHash` **must** represent a valid IPFS content hash for the IPFS hosted file listing actual bribe payouts.
3. Bribe payouts file referenced by `ipfsHash` **must** contain at least a list of bribe payout recipient addresses, individual bribe amounts and their Merkle proofs (array of `bytes32` values represented as hex strings) for each recipient.
4. Sum of individual bribe amounts in the bribe payout file **must** exactly match the `maximumRewardAmount` (as it also includes the remainder to be returned to the sponsor). It is expected that by default bribe payouts are raw amounts that do not need any scaling and can be directly compared to the value of `maximumRewardAmount`. Though, in case human readable payouts were provided voters should first scale them up to their raw representation using the `decimals` parameter from the `rewardToken` contract.
5. It is expected that the bribe payout file includes `accountIndex` parameter for each recipient and they **must** be unique non-negative integers across all payout set. If `accountIndex` is not provided then voters should assign it continuously for each recipient starting from 0.
6. Calculate leaf data for each individual bribe payout by taking Keccak-256 hash over the ABI converted and tightly packed parameters of recipient address, bribe amount and `accountIndex`. In `web3.js` this can be achieved by using:

   ```
   web3.utils.soliditySha3(
     { value: recipientAddress, type: "address" },
     { value: bribeAmount, type: "uint256" },
     { value: accountIndex, type: "uint256" }
   );
   ```
7. Verify each individual bribe payout by traversing a Merkle tree up from its leaf (calculated is Step 6 above) using its corresponding Merkle proofs:
    - The process should start by taking the leaf and the first element of the Merkle proofs array.
    - Order both above from lowest value to highest and concatenate them to get `bytes64` value.
    - Perform Keccak-256 hash on the concatenated `bytes64` to get the next Merkle branch. In `web3.js` one can use `web3.utils.soliditySha3` method.
    - Continue by taking the next element from the Merkle proofs array, pair it with the obtained Merkle branch from the previous step and Keccak-256 hash their ordered concatenation to get the next Merkle branch.
    - Repeat the above procedure for all elements of the provided Merkle proofs array. The last obtained hash **must** exactly match the `merkleRoot` for all individual bribe payments.

## Economic verification

This section provides instructions to verify proposed payout amounts against expected bribe amounts following provided instructions from ancillary data except for cases when bribe should be refunded to the sponsor(s).

1. Follow instructions passed from the `voteMeasurement` parameter to quantify the voting results for the bribed choice (from `bribedChoice` parameter). If the voting proposal does not include the bribed choice the result should be resolved to 0. In any case the results of following `voteMeasurement` instructions should be floored at 0 and capped at 1.
2. Follow the instructions passed from the `payoutFunction` (or apply the formula) to convert obtained voting results to payout amount expressed as a multiplier to previously funded maximum bribe amount. In any case the results should be floored at 0 and capped at 1.
3. Multiply the obtained value above with the `maximumRewardAmount` and round it to the nearest integer to obtain gross payout (before fees) in raw units of `rewardToken`.
4. Subtract the calculated gross payout above from the `maximumRewardAmount` to obtain claw-back amount claimable by the bribe sponsor(s):
    - In case `clawback` parameter is provided in ancillary data and it contains a single address then assign the calculated claw-back amount to this address.
    - If `clawback` parameter provides other instructions, follow them to assign how claw-back amount should be distributed among sponsors.
    - If `clawback` parameter is missing or its value cannot be interpreted unambiguously then by default entire claw-back amount should be assigned to the original sponsor funding the the bribe. This can be obtained by calling `rewards` method on the Optimistic Distributor contract with the `rewardIndex` from ancillary data as input parameter. The obtained `Reward` struct will contain the `sponsor` address as its second element. Note that in case other sponsors have topped up the bribe by funding the same `rewardIndex` with the `increaseReward` method they would not receive any clawed-back bribe amounts.
5. Calculate protocol fee as 2% from gross payout amount in rounded raw units of `rewardToken`. Assign Covenant protocol fee collector address 0x104E3a4FbbDdf02843f30ADF145F661f68Afd1F4 on Polygon as its recipient.
6. Calculate total net payout to users by subtracting protocol fee amount from the gross bribe payout.
7. Follow the instructions passed from the `bribeDistribution` parameter to assign net bribe amount calculated above to individual recipients. This should involve:
    - Identify user addresses and their voting power that have directly voted for the `bribedChoice` in the bribed `voteProposal`.
    - If instructed, exclude any disqualifying recipients (e.g. due to split-vote or minimum voting threshold).
    - Assign part of net bribe payout to direct voters based on provided instructions (e.g.  proportional to voting power, any maximum payout limits to individual users, equal to all qualifying voters, etc.).
    - If instructed, identify users that had delegated their voting power and assign their net bribe amounts from the previously calculated delegate bribe. If instructed apply the provided delegation fee to be held by the delegates.
    - Apply any other instructions provided in the `bribeDistribution` parameter. This can involve rules for distributing any remainder from total payout in case any qualifying conditions or maximum payout limits to individual users have been applied (e.g. how to split it among other users or just reducing total payout amount and adding them to sponsor's claw-back amount).
8. Compile the expected bribe payout amount list by recipient addresses including sponsor(s) claw-back (Step 4), protocol fee recipient (Step 5) and voters/delegates (Step 7).
9. Validate proposed payouts (as verified in the Technical verification section) against expected payouts from Step 8:
    - All recipient addresses in the proposed payout file **must** have a matching recipient from expected payouts, though some of smaller expected payouts could be excluded in the proposed payout file due to rounding.
    - For each individual address recipient from the proposed payout file calculate the modulus for its proposed payout amount (in raw units of `rewardToken`) difference with the expected payout for the same address and divide it over its expected payout. This coefficient **must** not exceed the maximum allowed error margin passed as `errorMargin` parameter. If `errorMargin` is not provided in ancillary data then fall back to default allowed error margin of `0.0001` for this comparison.

## Refund instructions

In case required ancillary data parameters are missing or their values/instructions cannot be interpreted unambiguously the bribe  should be refunded to its sponsor(s). This also applies in cases when the bribed vote has not been resolved (or has been withdrawn altogether) at or before the `expirationTimestamp`. In these scenarios one should perform the instructions in the Economic verification section as if the `payoutFunction` in Step 2 resulted in value of 0 and entire `maximumRewardAmount` should be distributed only among bribe sponsor(s) (identified in Step 4). Also, such refund proposal should be verified against the Technical verification section.


## Security considerations

The security of this price identifier is highly dependent on bribers providing unambiguous instructions through ancillary data parameters. In order to mitigate this it is expected that Covenant bribing market operator would impose restrictions on standard allowed ancillary data parameters through its front-end.

In order to ensure right incentives for independent verifiers to check proposed bribe payouts the operator of Covenant bribing market should impose adequate Optimistic Oracle bond amounts and liveness periods that are consistent with the complexity of expected verification operation.

Users of this price identifier should be aware that IPFS storage on itself does not guarantee persistent data availability. Even though the operator of Covenant bribing market would attempt to ensure data availability within reasonable time period users can provide pinning of linked IPFS files on their nodes or at least save a local copies of files linked in ancillary data and Merkle proofs for claiming the payouts.

Bribers of Covenant protocol should be aware that not all voting platforms enforce that vote results directly translate to transaction execution on-chain and might require certain trust assumptions on the organizers of the vote to execute it properly. The execution risk hence is outside the scope of this price identifier that tracks only the resolved voting scores and payouts to individual voters.

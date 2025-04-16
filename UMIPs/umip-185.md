## Headers

| UMIP-185       |                                                                                                        |
| -------------- | ------------------------------------------------------------------------------------------------------ |
| UMIP Title     | Upgrade Oracle Request Bridging Contracts                                                              |
| Authors        | Reinis Martinsons (reinis@umaproject.org)                                                              |
| Status         | Approved                                                                                               |
| Created        | April 2, 2024                                                                                          |
| Discourse Link | [UMA's Discourse](https://discourse.uma.xyz/t/umip-185-upgrade-oracle-request-bridging-contracts/2178) |

## Summary

This UMIP proposes to register the upgraded `OracleRootTunnel` and `OracleChildTunnel` contracts for the Polygon network, as well as the upgraded `OracleSpoke` contracts on all the supported optimistic rollup networks.

## Motivation

This upgrade is focused on compressing ancillary data as Oracle requests are bridged to Ethereum mainnet, reducing the gas costs for the relayer bots and voting users. During the Q1 2025, the average length of the ancillary data was ~1200 bytes. The upgraded contracts will only post the hash of the acnillary data and necessary metadata. Based on our testing of disputes from Polygon, this decreases the size of the data posted to Ethereum mainnet to ~234 bytes and results in ~60% gas savings for UMA's bot and ~30% gas savings for individual voters.

## Technical Specification

As part of this upgrade, as per [PR 4816](https://github.com/UMAprotocol/protocol/pull/4816) to the `protocol` repo, the following contracts have been redeployed:

- [OracleRootTunnel](https://github.com/UMAprotocol/protocol/blob/master/packages/core/contracts/polygon-cross-chain-oracle/OracleRootTunnel.sol) at [0x9B40E25dDd4518F36c50ce8AEf53Ee527419D55d](https://etherscan.io/address/0x9B40E25dDd4518F36c50ce8AEf53Ee527419D55d) on Ethereum mainnet
- [OracleChildTunnel](https://github.com/UMAprotocol/protocol/blob/master/packages/core/contracts/polygon-cross-chain-oracle/OracleChildTunnel.sol) at [0xac60353a54873c446101216829a6A98cDbbC3f3D](https://polygonscan.com/address/0xac60353a54873c446101216829a6A98cDbbC3f3D) on Polygon
- [OracleSpoke](https://github.com/UMAprotocol/protocol/blob/master/packages/core/contracts/cross-chain-oracle/OracleSpoke.sol) at [0xa21FA31E58F0597c5F4ac7F9cd8ce2877010A14d](https://optimistic.etherscan.io/address/0xa21FA31E58F0597c5F4ac7F9cd8ce2877010A14d) on Optimism
- [OracleSpoke](https://github.com/UMAprotocol/protocol/blob/master/packages/core/contracts/cross-chain-oracle/OracleSpoke.sol) at [0x654a4E7338048Ca910591b134fe89Be42f865FcD](https://arbiscan.io/address/0x654a4E7338048Ca910591b134fe89Be42f865FcD) on Arbitrum
- [OracleSpoke](https://github.com/UMAprotocol/protocol/blob/master/packages/core/contracts/cross-chain-oracle/OracleSpoke.sol) at [0x7E01536F1B6Fd2201c2fD8e1A6143c987573c00F](https://basescan.org/address/0x7E01536F1B6Fd2201c2fD8e1A6143c987573c00F) on Base
- [OracleSpoke](https://github.com/UMAprotocol/protocol/blob/master/packages/core/contracts/cross-chain-oracle/OracleSpoke.sol) at [0x64ED7d2359b34BaEE07DacFAb429B4C526908768](https://blastscan.io/address/0x64ED7d2359b34BaEE07DacFAb429B4C526908768) on Blast

Even though the [OracleHub](https://github.com/UMAprotocol/protocol/blob/master/packages/core/contracts/cross-chain-oracle/OracleHub.sol) contract has also been changed, it is not being redeployed in order to reduce the complexity and potential risks of the migration. It is not strictly required to use the new `OracleHub` implementation as it only contains non-functional changes added more for the sake of clarity and consistency with the other contracts.

In addition, `OracleSpoke` contracts would also be redeployed on all the networks that use the [Admin_ChildMessenger](https://github.com/UMAprotocol/protocol/blob/master/packages/core/contracts/cross-chain-oracle/chain-adapters/Admin_ChildMessenger.sol), but they are not part of this UMIP as they can be upgraded using the existing multisig governance process.

In order to proceed with the migration to above redeployed contracts, the following governance transactions will need to be voted on and executed:

- Call `setOracleSpoke` on the [Arbitrum_ParentMessenger](https://etherscan.io/address/0x278c6e83876b6d7163a2141b0eb6404a07ebcab7) to update its `oracleSpoke` value to the new [OracleSpoke](https://arbiscan.io/address/0x654a4E7338048Ca910591b134fe89Be42f865FcD).
- Call `setChildOracleSpoke` on the [Arbitrum_ParentMessenger](https://etherscan.io/address/0x278c6e83876b6d7163a2141b0eb6404a07ebcab7) to relay updating the `oracleSpoke` value in the [Arbitrum_ChildMessenger](https://arbiscan.io/address/0xe0Fe15CF22B9b52B6aE309C7384e03244A6DD985) to the new [OracleSpoke](https://arbiscan.io/address/0x654a4E7338048Ca910591b134fe89Be42f865FcD).
- Call `relayGovernance` on the [GovernorHub](https://etherscan.io/address/0x94520d90a4ebaa98e5a7b8d6809463f65198c104) to relay following actions on Arbitrum:
  - update `Oracle` implementation address on the [Finder](https://arbiscan.io/address/0xB0b9f73B424AD8dc58156C2AE0D7A1115D1EcCd1) to the new [OracleSpoke](https://arbiscan.io/address/0x654a4E7338048Ca910591b134fe89Be42f865FcD).
  - update the `cachedOracle` value on the [OptimisticOracleV3](https://arbiscan.io/address/0xa6147867264374F324524E30C02C331cF28aa879) to the new [OracleSpoke](https://arbiscan.io/address/0x654a4E7338048Ca910591b134fe89Be42f865FcD).
- Call `setOracleSpoke` on the [Optimism_ParentMessenger](https://etherscan.io/address/0x6455d800d1dbf9b1c3a63c67ccf22b9308728dc4) to update its `oracleSpoke` value to the new [OracleSpoke](https://optimistic.etherscan.io/address/0xa21FA31E58F0597c5F4ac7F9cd8ce2877010A14d).
- Call `setChildOracleSpoke` on the [Optimism_ParentMessenger](https://etherscan.io/address/0x6455d800d1dbf9b1c3a63c67ccf22b9308728dc4) to relay updating the `oracleSpoke` value in the [Optimism_ChildMessenger](https://optimistic.etherscan.io/address/0x09AFD24Acc170c16f4fF64BDf2A4818C515440e8) to the new [OracleSpoke](https://optimistic.etherscan.io/address/0xa21FA31E58F0597c5F4ac7F9cd8ce2877010A14d).
- Call `relayGovernance` on the [GovernorHub](https://etherscan.io/address/0x94520d90a4ebaa98e5a7b8d6809463f65198c104) to relay following actions on Optimism:
  - update `Oracle` implementation address on the [Finder](https://optimistic.etherscan.io/address/0x278d6b1aA37d09769E519f05FcC5923161A8536D) to the new [OracleSpoke](https://optimistic.etherscan.io/address/0xa21FA31E58F0597c5F4ac7F9cd8ce2877010A14d).
  - update the `cachedOracle` value on the [OptimisticOracleV3](https://optimistic.etherscan.io/address/0x072819Bb43B50E7A251c64411e7aA362ce82803B) to the new [OracleSpoke](https://optimistic.etherscan.io/address/0xa21FA31E58F0597c5F4ac7F9cd8ce2877010A14d).
- Call `setOracleSpoke` on the [Base_ParentMessenger](https://etherscan.io/address/0x721ba6f9a0a44657f008f3d68c6dbddedbde831a) to update its `oracleSpoke` value to the new [OracleSpoke](https://basescan.org/address/0x7E01536F1B6Fd2201c2fD8e1A6143c987573c00F).
- Call `setChildOracleSpoke` on the [Base_ParentMessenger](https://etherscan.io/address/0x721ba6f9a0a44657f008f3d68c6dbddedbde831a) to relay updating the `oracleSpoke` value in the [Base_ChildMessenger](https://basescan.org/address/0x981A64547d2979510de5b409C7D107938Cc0885e) to the new [OracleSpoke](https://basescan.org/address/0x7E01536F1B6Fd2201c2fD8e1A6143c987573c00F).
- Call `relayGovernance` on the [GovernorHub](https://etherscan.io/address/0x94520d90a4ebaa98e5a7b8d6809463f65198c104) to relay following actions on Base:
  - update `Oracle` implementation address on the [Finder](https://basescan.org/address/0x7E6d9618Ba8a87421609352d6e711958A97e2512) to the new [OracleSpoke](https://basescan.org/address/0x7E01536F1B6Fd2201c2fD8e1A6143c987573c00F).
  - update the `cachedOracle` value on the [OptimisticOracleV3](https://basescan.org/address/0x2aBf1Bd76655de80eDB3086114315Eec75AF500c) to the new [OracleSpoke](https://basescan.org/address/0x7E01536F1B6Fd2201c2fD8e1A6143c987573c00F).
- Call `setOracleSpoke` on the [Blast_ParentMessenger](https://etherscan.io/address/0xe3C52FB4c395165b13f8184644D60357e7D3b995) to update its `oracleSpoke` value to the new [OracleSpoke](https://blastscan.io/address/0x64ED7d2359b34BaEE07DacFAb429B4C526908768).
- Call `setChildOracleSpoke` on the [Blast_ParentMessenger](https://etherscan.io/address/0xe3C52FB4c395165b13f8184644D60357e7D3b995) to relay updating the `oracleSpoke` value in the [Blast_ChildMessenger](https://blastscan.io/address/0x3Db06DA8F0a24A525f314eeC954fC5c6a973d40E) to the new [OracleSpoke](https://blastscan.io/address/0x64ED7d2359b34BaEE07DacFAb429B4C526908768).
- Call `relayGovernance` on the [GovernorHub](https://etherscan.io/address/0x94520d90a4ebaa98e5a7b8d6809463f65198c104) to relay following actions on Blast:
  - update `Oracle` implementation address on the [Finder](https://blastscan.io/address/0x3baD7AD0728f9917d1Bf08af5782dCbD516cDd96) to the new [OracleSpoke](https://blastscan.io/address/0x64ED7d2359b34BaEE07DacFAb429B4C526908768).
  - update the `cachedOracle` value on the [OptimisticOracleV3](https://blastscan.io/address/0xE8FF2a3d5Cc19DDcBd93328371E1Dd8995e7AfAA) to the new [OracleSpoke](https://blastscan.io/address/0x64ED7d2359b34BaEE07DacFAb429B4C526908768).
- Call `addMember` on the [Registry](https://etherscan.io/address/0x3e532e6222afe9bcf02dcb87216802c75d5113ae) to temporarily add `ContractCreator` role to the [GovernorV2](https://etherscan.io/address/0x7b292034084A41B9D441B71b6E3557Edd0463fa8).
- Call `registerContract` on the [Registry](https://etherscan.io/address/0x3e532e6222afe9bcf02dcb87216802c75d5113ae) to register the new [OracleRootTunnel](https://etherscan.io/address/0x9B40E25dDd4518F36c50ce8AEf53Ee527419D55d) contract.
- Call `removeMember` on the [Registry](https://etherscan.io/address/0x3e532e6222afe9bcf02dcb87216802c75d5113ae) to remove the `ContractCreator` role from the [GovernorV2](https://etherscan.io/address/0x7b292034084A41B9D441B71b6E3557Edd0463fa8).
- Call `relayGovernance` on the [GovernorRootTunnel](https://etherscan.io/address/0x4f490f4835b3693a8874aee87d7cc242c25dccaf) to relay the update of the `Oracle` implementation address on the Polygon [Finder](https://polygonscan.com/address/0x09aea4b2242abC8bb4BB78D537A67a245A7bEC64) to the new [OracleChildTunnel](https://polygonscan.com/address/0xac60353a54873c446101216829a6A98cDbbC3f3D).
- Call `relayGovernance` on the [GovernorRootTunnel](https://etherscan.io/address/0x4f490f4835b3693a8874aee87d7cc242c25dccaf) to relay the update of the `cachedOracle` value on the Polygon [OptimisticOracleV3](https://polygonscan.com/address/0x5953f2538F613E05bAED8A5AeFa8e6622467AD3D) to the new [OracleChildTunnel](https://polygonscan.com/address/0xac60353a54873c446101216829a6A98cDbbC3f3D).

## Rationale

The changes introduced in the upgraded `OracleSpoke` and `OracleChildTunnel` contracts are quite similar, so there might be an argument for using the same codebase for optimistic rollup networks and Polygon. Even if migrating Polygon contracts to use hub and spoke model is technically feasible, it is considered to add additional complexity and potential risks to the migration process, hence it is proposed to keep both bridging systems separate.

During the development process it was also considered to compress the ancillary data only when it exceeds certain threshold, so that the compressed version (including the additional metadata) never exceeds the original ancillary data size. Even if this would have saved some gas costs, it was decided to always use the same ancillary data format to simplify the implementation. Also, based on Q1 2025 data, this would have reduced the gas costs further only in ~2.5% of the cases.

## Implementation

When using the upgraded contracts, the ancillary data for bridged Oracle requests will include the following fields:

- `ancillaryDataHash` - the `keccak256` hash of the original ancillary data
- `childBlockNumber` - the block number on the child network when the Oracle request was originated
- `childOracle` - the address of the bridging contract on the child network (either `OracleChildTunnel` or `OracleSpoke`)
- `childRequester` - the address of the Oracle requester on the child network
- `childChainId` - the chain ID of the child network where the Oracle request was originated

When observing the `RequestAdded` events on the Ethereum mainnet `VotingV2` contract, if the indexed `requester` field is either the `OracleRootTunnel` or `OracleHub` contract and the `ancillaryData` has above specified fields, the original ancillary data will need to be resolved using the following steps:

1. Calculate the parent request ID by `keccak256` hashing the ABI encoded `bytes32 identifier`, `uint256 time` and `bytes ancillaryData` from the `RequestAdded` event.
2. Query the `OracleChildTunnel` or `OracleSpoke` contracts (using `childOracle` address) on the child network (referenced by `childChainId`) for the `PriceRequestBridged` event filtering it for the indexed `parentRequestId` field as calculated in the previous step. This log query can be further optimized by limiting the search to the block range from and to the `childBlockNumber` value.
3. Inspect the `ancillaryData` field from the matched `PriceRequestBridged` event from the previous step to obtain the original ancillary data.

## Security Considerations

When upgrading smart contracts, it is important to ensure that the new implementation is secure and the migration process is executed correctly. The proposed contract changes have been reviewed by the UMA team and audited by OpenZeppelin. In addition, OpenZeppelin has reviewed the proposed migration payload and UMA team has simulated its execution on the forked networks.

Following the upgrade, special attention should be taken to all unsettled disputes that were originated before the upgrade and used the old contracts when bridging the requests to Ethereum mainnet. Both `OracleSpoke` and `OracleChildTunnel` contracts have a dedicated `resolveLegacyRequest` function that will be used resolve these disputes after the upgrade.

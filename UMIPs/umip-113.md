## Headers
| UMIP-113    |                                                                                                                                          |
|------------|------------------------------------------------------------------------------------------------------------------------------------------|
| UMIP Title | Register updated Optimistic Oracle             |
| Authors    | Nick Pai (nick@umaproject.org) |
| Status     | Last call                                                                                                                                    |
| Created    | July 8, 2021                                                                                                                           |

## Summary (2-5 sentences)
This UMIP will have the effect of registering an updated optimistic oracle contract with improved ancillary data formatting logic.

## Motivation
DVM price requests are encouraged to take advantage of the ancillary data `bytes` parameter to specify how voters should resolve votes. For example, [this price request](https://etherscan.io/tx/0x9d7a592c2d5dcd72b638967efff008f208bc1e5b06a0fa02b50114accf459370#eventlog) for the `SPACEXLAUNCH` identifier specifies `"id0:Transporter-2,w0:1"` in hex format as the ancillary data to inform voters about which rocket launch (e.g. the rocket is "Transporter 2" in this case) they should be voting on.

Because ancillary data is a `bytes` data type, voter experience is enhanced if there is a soft standard for formatting the ancillary data. This is what the Risk Labs team has tried to do with [this document describing an ancillary data interface](https://docs.google.com/document/d/1zhKKjgY1BupBGPPrY_WOJvui0B6DMcd-xDR8-9-SPDw/edit?usp=sharing). In summary, the goal of this document is to encourage price requesters who use ancillary data to ensure that it can be decoded directly from `bytes` to `utf8` via standard client libraries such as `web3.js` and `ethers.js`, and that the `utf8`-encoded ancillary data is a comma-delimitted key-value dictionary just like the `SPACEXLAUNCH` example above.

The current supported optimistic oracle "stamps" data to the ancillary data informing voters that any price requests were sent by an optimistic oracle. This is useful information and gives voters more information, but the "stamping" does not conform with the above interface; it produces `bytes` data that cannot be directly decoded to `utf8` format. 

This UMIP proposes to register an updated optimistic oracle that "stamps" ancillary data according to the above standard.

## Technical Specification
To accomplish this upgrade, the following actions need to be taken:
- A new `OptimisticOracle` contract has been deployed. Address can be found in "Implementation" section.
- A transaction will need to be proposed to add this new address to the `Finder` contract under the name `“OptimisticOracle”`. This is how other contracts will find the optimistic oracle and reference it.
- The `OptimisticOracle` will need to be registered with the `Registry` so that it can make requests to the DVM.

## Rationale

This UMIP enhances voter experience by upgrading the optimistic oracle so that it will stamp ancillary data in such a way that any disputes that arise from it will include ancillary data that is easily translateable by UMA voters.

## Implementation

The `OptimisticOracle` contract implementation can be found [here](https://github.com/UMAprotocol/protocol/blob/master/packages/core/contracts/oracle/implementation/OptimisticOracle.sol). It has been audited.

The following changes have been introduced since the last deployment:
- [Upgrade from Solidity 0.6 to 0.8](https://github.com/UMAprotocol/protocol/pull/2924)
- [Remove abicoder v2](https://github.com/UMAprotocol/protocol/pull/2977)
- [Add override keyword to `stampAncillaryData` method](https://github.com/UMAprotocol/protocol/pull/3057)
- [Standardize optimistic oracle stamping of ancillary data](https://github.com/UMAprotocol/protocol/pull/3061)
- [Refactor ancillary data stamping logic to new AncillaryData library](https://github.com/UMAprotocol/protocol/pull/3054)
- [Fix typo in comment for `stampAncillaryData` method](https://github.com/UMAprotocol/protocol/pull/3092)
- [Response to audit of new `OptimisticOracle`](https://github.com/UMAprotocol/protocol/pull/3188)

The new `OptimisticOracle` uses a new `AncillaryData` library that manages converting different data types to `utf8`-decodable strings which can be found [here](https://github.com/UMAprotocol/protocol/blob/master/packages/core/contracts/common/implementation/AncillaryData.sol).

Contract addresses can be found here:
- [OptimisticOracle](https://etherscan.io/address/0xc43767f4592df265b4a9f1a398b97ff24f38c6a6#code)

## Security considerations
Please see the individual PRs for details on how each affects the security of the UMA ecosystem. This repo has been audited by OpenZeppelin and the audit feedback can be found in this [PR](https://github.com/UMAprotocol/protocol/pull/3188) specifically in the section on PR #3061.

The [original security concerns](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-52.md#security-considerations) with using the optimistic oracle still apply here.
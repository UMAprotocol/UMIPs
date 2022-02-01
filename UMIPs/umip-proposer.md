| UMIP                |                                                    |
| ------------------- | -------------------------------------------------- |
| UMIP Title          | Give Proposer DVM request permissions              |
| Authors             | Matt Rice                                          |
| Status              | Draft                                              |
| Created             | 2022-01-27                                         |

# Summary 

The Proposer contract should have permission to request and retrieve prices from the Voting contract (DVM).

# Motivation

The [Proposer contract](https://etherscan.io/address/0x226726Ac52e6e948D1B7eA9168F9Ff2E27DbcbB5) is already being used
as the method to propose governance actions to the DVM. It requires a bond to do so. That bond is repaid if the
proposal is successful. To determine whether the proposal is successful, it needs to read the result of the vote from
the DVM. To do this, it needs to be approved by the
[Registry contract](https://etherscan.io/address/0x3e532e6222afe9Bcf02DCB87216802c75D5113aE).

This governance action will allow bonds to be repaid to successful proposers.

# Data Specifications and Implementation

Three transactions are required to approve the Proposer contract:

1. The Governor must give itself the contract creator permission (role 1 in the Registry contract).
2. The Governor must call registerContract on the Registry contract, passing
`0x226726Ac52e6e948D1B7eA9168F9Ff2E27DbcbB5` as the `contractAddress` argument.
3. The Governor must remove its contract creator permission (role 1 in the Registry contract).

# Security Considerations

Approving registered contracts is low risk. The worst thing a malicious registered contract can do is spam the DVM with
price requests without paying final fees. In this unlikely event, the voters could choose to selectively ignore all
requests coming from that contract and they could be temporarily removed by any UI. Then the voters could choose to use
governance to rectify the permissions.

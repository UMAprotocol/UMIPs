## Headers

| UMIP-180   |                                                             |
| ---------- | ----------------------------------------------------------- |
| UMIP Title | Register Base Parent Messenger in OracleHub and GovernorHub |
| Authors    | Pablo Maldonado                                             |
| Status     | Draft                                                       |
| Created    | 03/28/24                                                    |

## Summary

This UMIP proposes to register the [Base Parent Messenger](https://etherscan.io/address/0x721bA6f9A0a44657f008f3d68C6dBdDeDBDE831A) with both the [Oracle Hub](https://etherscan.io/address/0x8fE658AeB8d55fd1F3E157Ff8B316E232ffFF372) and [Governor Hub](0x94520d90A4EBaA98e5A7B8D6809463f65198C104) to facilitate cross-chain communication and ensure the operational functionality of newly deployed Base contracts, including the Optimistic Oracle. Additionally, it aims to reduce the default gas limit for transactions on both Optimism and Base Parent Messengers from 5 million to 500,000, thus optimizing network efficiency by correcting previously excessive gas allocations.

## Motivation

The registration of the Base Parent Messenger with the Oracle and Governor Hubs is critical for enabling cross-chain communications, essential for the operation of Optimistic Oracles and governance processes on Base EVM-compatible network. Moreover, the proposed reduction in the default gas limit addresses inefficiencies in bridging resource usage, aligning gas allocations with actual transaction complexity and network capabilities, leading to optimized operation and lower transaction costs.

## Technical Specification

To achieve the goals outlined in this UMIP, the following technical steps will be undertaken:

- Register the [Base Parent Messenger](https://etherscan.io/address/0x721bA6f9A0a44657f008f3d68C6dBdDeDBDE831A) with the [Oracle Hub](https://etherscan.io/address/0x8fE658AeB8d55fd1F3E157Ff8B316E232ffFF372) and [Governor Hub](0x94520d90A4EBaA98e5A7B8D6809463f65198C104). This action enables the Base Parent Messenger to function as a message bridging component in the cross-chain communication infrastructure, facilitating message passing between Base and Mainnet networks.
- Adjust the default gas limit settings for the [Optimism Parent Messenger](https://etherscan.io/address/0x6455D800D1Dbf9B1C3a63c67CcF22B9308728dC4) and [Base Parent Messenger](https://etherscan.io/address/0x721bA6f9A0a44657f008f3d68C6dBdDeDBDE831A) from 5 million to 500,000. This adjustment reflects a more accurate estimation of gas required for typical transactions.

## Rationale

The registration of the Base Parent Messenger with the Oracle and Governor Hubs is a necessary step to ensure the operational functionality of the Optimistic Oracle and governance processes on Base EVM-compatible networks. By enabling cross-chain communication, the Base Parent Messenger can facilitate the transmission of messages between Base and Mainnet networks, supporting the seamless operation of the UMA protocol across multiple chains.

## Security Considerations

The Base Parent Messenger is an instance of the Optimism Parent Messenger, a contract that has been audited and functioning within UMA's cross-chain infrastructure for several years. The proposed registration of the Base Parent Messenger with the Oracle and Governor Hubs is a standard procedure that has been successfully implemented in previous UMIPs. The gas limit adjustment is a minor optimization that does not introduce new security risks.

The contracts targeted for registration have undergone thorough auditing. The audit details are available [here](https://blog.openzeppelin.com/uma-audit-phase-6/).

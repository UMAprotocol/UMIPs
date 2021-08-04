# Headers

|   |                                                                                                                                          |
|------------|------------------------------------------------------------------------------------------------------------------------------------------|
| UMIP Title | Add Polygon `DerivativeFactory` as `Creator` in DVM registry                                                                                                |
| Authors    | Iliyan Iliev (iliyan.iliev@jarvis.exchange)                 |
| Status     | Draft                                                |
| Created    | 28/07/2021   
| Discourse link    |  https://discourse.umaproject.org/t/register-polygon-derivativefactory-as-creator-in-dvm-registry/1267                               |

# Summary


Reminder: Synthereum is a protocol to issue multi-collateralized synthetic fiat assets against liquidity pools. Liquidity pools hold USD-stablecoin such as USDC and are the sole Token Sponsor: a mint is a transaction where the liquidity pool self-mints a synthetic fiat with a collateral in USDC, and sell this synthetic fiat for USDC to the end-user, at the Chainlink price.

The [UMIP-34](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-34.md) has been approved by the governance, allowing us to launch our synthetic assets collateralized by USDC on the mainnet ($1M TVL, $700k of synthetic assets minted; we have capped the amount of synthetic assets that can be minted until more audits are conducted; the protocol has received two full audit from Halborn and Ubik.) 

Later on we have made a redeployment of the `DerivativeFactory.sol` and it has been approved by the governance in [UMIP-101](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-101.md). In that version we have done a bit of code cleaning and removal of unnecessary code. All the changes done can be seen in the formentioned UMIP.

Now the time has come for Jarvis to expand to L2 solutions starting with a deployment on Polygon Mainnet. There are no changes done to the `DerivativeFactory.sol` contract since the previously approved version in [UMIP-101](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-101.md). 

# Motivation

A deployment on Polygon would allow for the protocol to scale as it would become more reachable for users in terms of fees. We expect that the low gas costs on L2 solutions, such as Polygon, would bring higher traffic to the protocol. This combined with other linked projects and activities such as farming could potentially create a low-gas cost financial infrastructure for our FX synthetic assets.

# Technical Specification

### Breakdown on the whole deployment process of a new derivative:

For reference on the deployment process you can check [[UMIP-101](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-101.md) as the process remains the same with the current version deployed on Polygon.

### Modifications done: 

The only modification done since the previous approved version of the `DerivativeFatory.sol` is the update from pragma solidity version 0.6.12 to 0.8.4. 

Apart from that the only modifications done, not concerning the `DerivativeFactory.sol` were to integrate UMA Bridge in order to access the DVM from Polygon. 

The previous version modifications can be seen in [UMIP-101](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-101.md).


# List of deployed contracts:

1. Contract [DerivativeFactory](https://polygonscan.com/address/0xD5ed74178Fa50EfD7d3E3f30EF5f0ACab56933Bc#code)

The above contract has four helper libraries, which are included in the contract, but links for separate review are provided below:

1. Library [FeePayerPartyLib](https://polygonscan.com/address/0xd0B5376b91E06Fb1296F803AE8879B49740cE89f#code)
2. Library [PerpetualPositionManagerPoolPartyLib](https://polygonscan.com/address/0x03BC653285f8527e1C877b18dF285E66898864b3#code)
3. Library [PerpetualLiquidatablePoolPartyLib](https://polygonscan.com/address/0x34f7fd5cD0Ddd4b27073475cD494dC74a9A4c8aB#code)
4. Library [PerpetualPoolPartyLib](https://polygonscan.com/address/0xa513A13Db767d4609eCe1c705dBeeFB0f5822224#code)

# Implementation and code base

The `DerivativeFactory.sol` contract as well as all supporting contracts for the `PerpetualPoolParty.sol` contract (including `PerpetualPoolParty.sol` contract) can be found here are available for a review by anyone [here](https://gitlab.com/jarvis-network/apps/exchange/mono-repo/-/tree/feature/polygon-integration/libs/contracts/contracts/derivative/v2).

The core contracts of the protocol like `Manager.sol` and `Deployer.sol` can be found and reviewed by anyone [here](https://gitlab.com/jarvis-network/apps/exchange/mono-repo/-/tree/feature/polygon-integration/libs/contracts/contracts/core).

# Security considerations

Two security audits have been conducted by Halborn: 

- The UMA's forked contract [December 27, 2020](https://gitlab.com/jarvis-network/apps/exchange/mono-repo/-/blob/dev/docs/security-audits/halborn/01-jarvis-perpetualpoolparty.pdf).
- The other parts of the protocol [March 09, 2021](https://gitlab.com/jarvis-network/apps/exchange/mono-repo/-/blob/dev/docs/security-audits/halborn/02-jarvis-v3-smart-contracts-report-v1.pdf).

We have published an answer to the audits [here](https://gitlab.com/jarvis-network/apps/exchange/mono-repo/-/blob/dev/docs/security-audits/halborn/02-response-to-jarvis-v3-smart-contracts-report-v1.md).

Another full security audit of the Synthereum protocol was done by Ubiq and can be found [here](https://gitlab.com/jarvis-network/apps/exchange/mono-repo/-/blob/dev/docs/security-audits/ubik/01-synthereum-v3.pdf).


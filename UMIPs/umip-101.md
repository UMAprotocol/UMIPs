# Headers

| UMIP-101  |                                                                                                                                          |
|------------|------------------------------------------------------------------------------------------------------------------------------------------|
| UMIP Title | Add `DerivativeFactory` as `Creator` in DVM registry                                                                                                |
| Authors    | Pascal Tallarida (pascal@jarvis.network)                 |
| Status     | Approved                                                |
| Created    | 12/05/2021   
| Discourse link    | https://discourse.umaproject.org/t/add-derivativefactory-as-creator-in-dvm-registry/1080                                  |

# Summary

Due to necessity and after discussing with the UMA team, their perpetual contract system was modified to fit the needs of our protocol. 

Reminder: Synthereum is a protocol to issue multi-collateralized synthetic fiat assets against liquidity pools. Liquidity pools hold USD-stablecoin such as USDC and are the sole Token Sponsor: a mint is a transaction where the liquidity pool self-mints a synthetic fiat with a collateral in USDC, and sell this synthetic fiat for USDC to the end-user, at the Chainlink price.

The [UMIP-34](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-34.md) has been approved by the governance, allowing us to launch our synthetic assets collateralized by USDC on the mainnet ($1M TVL, $700k of synthetic assets minted; we have capped the amout of synthetic assets that can be minted until more audits are conducted; the protocol has received one full audit from Halborn, and a second one is undergoing with Ubik).

In order to increase the liquidity, security and scalability of our synthetic assets we have decided to deploy a new `DerivativeFactory.sol` contract and re-deploy our existing Derivatives/Pools (jEUR/USDC, jGBP/USDC, jCHF/USDC) in order to lower some of the required parameters like starting GCR and Liquidation threshold. 

Earlier last year we have deployed a `Manager.sol` contract, which handles the assignment of Roles, instead of each pool having this functionality embeded. Also the `Manager.sol` contract is the only entry point for the `emergencyShutdown` functionality which can be called by Jarvis DAO and UMA DAO.

Since the handling of the roles has been passed to `Manager.sol` contract, this gave us a good opportunity to modify and clean up the current Pool/Derivative contracts from any unnecessary logic previously stored in them.

Once `DerivativeFactory.sol` receives the `Creator` role it will register every `PerpetualPoolParty.sol` that is deployed through it with `Registry.sol` so they can request prices from the DVM.

# Motivation

The changes in the collateral ratio and liquidation threshold for USDC-backed synthetic assets allow us to scale more without adding additional risks. Due to the redeployment of new `PerpetualPoolParty.sol` contracts and `PoolOnChainPriceFeed.sol` contracts in order to lower the initial GCR and liquidation thresholds for our current synthetic assets we've decide to clean up some of the unnecessary code and improve the security of our protocol with the modifications explained in this document.

By redeploying the `DerivativeFactory.sol` we'll be able to move forward with a more clean, secure and scalable infrastructure.

Giving `Creator` role to `DerivativeFactory.sol` would allow more scalable and liquid synthetic assets to be backed by the UMA liquidation/dispute system, since every newly deployed derivative (`PerpetualPoolParty.sol`) is registered with the DVM.

# Technical Specification

### Here is a breakdown on the whole deployment process of a new derivative:

1. Our DAO address (which is currently a team address until the DAO is set up) calls `deployPoolAndDerivative` or `deployOnlyDerivative` of `Deployer.sol`.
2. `Deployer.sol` calls `createPerpetual` function of `DerivativeFactory.sol` and this function will call `createPerpetual` function of the base contract `PerpetualPoolPartyCreator.sol` that will deploy the new `PerpetualPoolParty.sol`.

### Modifications done: 

The modifications described below correspond to V4 (Version 4) of the Synthereum protocol.  

- Removal of role management from the `PoolOnChainPriceFeed.sol` and `PerpetualPoolParty.sol`. This is an unnecessary feature since the role management is handled by the `Manager.sol` contract. 
- Removal of `emergencyShutdown` functionality from the `PoolOnChainPriceFeed.sol` contract. Initially the `emergencyShutdown` can be called by each `PoolOnChainPriceFeed.sol`. In order to improve security of the protocol we have moved the `emergencyShutdown` functionality to be called only from the `Manager.sol` contract and only by authorized addresses - in our case the UMA DAO and Jarvis DAO.


### Nesting of the contracts:

1. `PerpetualPoolParty.sol` is a derived contract that inherit from `PerpetualLiquidatablePoolParty.sol`.
2. `PerpetualLiquidatablePoolParty.sol` is derived contract that inherit from `PerpetualPositionManagerPoolParty.sol`.
3. `PerpetualPositionManagerPoolParty.sol` is derived contract that inherit from `FeePayerParty.sol`.

Each one of those contracts have its own library for gas optimization:
1. `PerpetualPoolPartyCreator.sol` uses `PerpetualPoolPartyLib.sol` for gas optimization.
2. `PerpetualLiquidatablePoolParty.sol` uses `PerpetualLiquidatablePoolPartyLib.sol` for gas optimization.
3. `PerpetualPositionManagerPoolParty.sol` uses `PerpetualPositionManagerPoolPartyLib.sol` for gas optimization.
4. `FeePayerParty.sol` uses `FeePayerPartyLib.sol` for gas optimization.

# List of deployed contracts:

1. Contract [DerivativeFactory](https://etherscan.io/address/0x811f78b7d6bcf1c0e94493c2ec727b50ee32b974)

The above contract has four helper libraries, which are included in the contract, but links for separate review are provided below:

1. Library [FeePayerPartyLib](https://etherscan.io/address/0x97d884d049cd705d681ae83b5cba3efaad0d2c32)
2. Library [PerpetualPositionManagerPoolPartyLib](https://etherscan.io/address/0x1418830ad554becaf76a4058eec6bee9ac002e19)
3. Library [PerpetualLiquidatablePoolPartyLib](https://etherscan.io/address/0xfbf14c09079e1aac83be279b6354da710b0cfc5e)
4. Library [PerpetualPoolPartyLib](https://etherscan.io/address/0x348e4b25077c5133450edad060ea4d8db667913d)

# Implementation and code base

The `DerivativeFactory.sol` contract as well as all supporting contracts for the `PerpetualPoolParty.sol` contract (including `PerpetualPoolParty.sol` contract) can be found here are available for a review by anyone [here](https://gitlab.com/jarvis-network/apps/exchange/mono-repo/-/tree/feature/derivative-v2/libs/contracts/contracts/contracts/derivative/v2).

The core contracts of the protocol like `Manager.sol` and `Deployer.sol` can be found and reviewed by anyone [here](https://gitlab.com/jarvis-network/apps/exchange/mono-repo/-/tree/feature/derivative-v2/libs/contracts/contracts/contracts/core).

# Security considerations

Two security audits have been conducted by Halborn: 

- The UMA's forked contract [December 27, 2020](https://gitlab.com/jarvis-network/apps/exchange/mono-repo/-/blob/dev/docs/security-audits/halborn/01-jarvis-perpetualpoolparty.pdf).
- The other parts of the protocol [March 09, 2021](https://gitlab.com/jarvis-network/apps/exchange/mono-repo/-/blob/dev/docs/security-audits/halborn/02-jarvis-v3-smart-contracts-report-v1.pdf).

We have published an answer to the audits [here](https://gitlab.com/jarvis-network/apps/exchange/mono-repo/-/blob/dev/docs/security-audits/halborn/02-response-to-jarvis-v3-smart-contracts-report-v1.md).

Another team (Ubik) is currently auditing our contracts as well. Based on their preliminary report we'll adjust any found vulnerabilities. The preliminary report will be shared here.

As of now any position opened through the broker derivative contract (`PerpetualPoolParty.sol`) could become undercapitalized, meaning that the CR could drop below 100%, thus making the position not profitable to be liquidated.Although, Forex pairs are not very volatile and rarely move by more than 10% a year, and we have set liquidation at 120% so it is quite unlikely to experience this situation. However by running liquidation bots the possible undercapitalization situation can be avoided. Another solution which can be implemented to avoid this situation is to have a reserve fund which will automatically deposit additional collateral in the derivative if the position becomes undercapitalized.

A vulnerability in the Synthereum protocol (as example a faulty PerpetualPoolParty derivative) can not affect in any negative way the DVM as the derivatives deployed by the DerivativeFactory are siloed and has not direct integration with the DVM apart from the dispute system.

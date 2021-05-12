# Headers

| UMIP-95  |                                                                                                                                          |
|------------|------------------------------------------------------------------------------------------------------------------------------------------|
| UMIP Title | Add `DerivativeFactory` as `Creator` in DVM registry                                                                                                |
| Authors    | Pascal Tallarida (pascal@jarvis.network)                 |
| Status     | Draft                                                 |
| Created    | 12/05/2021   
| Discourse link    |                                    |

# Summary

Due to necessity and after discussing with the UMA team, their perpetual contract system was modified to fit the needs of our protocol. 

Reminder:  is a protocol to issue multi-collateralized synthetic fiat assets against liquidity pools. Liquidity pools hold USD-stablecoin such as USDC and are the sole Token Sponsor: a mint is a transaction where the liquidity pool self-mints a synthetic fiat with a collateral in USDC, and sell this synthetic fiat for USDC to the end-user, at the Chainlink price.

The [UMIP-34](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-34.md) have been approved by the governance, allowing us to launch our synthetic assets collateralized by USDC on the mainnet ($1M TVL, $700k of synthetic assets minted; we have capped the amout of synthetic assets that can be minted until more audits are conducted; the protocol has received one full audit from Halborn, and a second one is undergoing with Ubik).

In order to increase the liquidity, security and scalability of our synthetic assets we have decided to deploy a new `DerivativeFactory.sol` contract and re-deploy our existing Derivatives/Pools (jEUR/USDC, jGBP/USDC, jCHF/USDC) in order to lower some of the required parameters like starting GCR and Liquidation treshold. 

Earlier last year we have deployed a `Manager.sol` contract, which handles the assignment of Roles, instead of each pool having this functionality embeded. Also the `Manager.sol` contract is the only entry point for the `emergencyShutdown` functionality which can be called by Jarvis DAO and UMA DAO.

Since the handling of the roles has been passed to `Manager.sol` contract, this gave us a good opportunity to modify and clean up the current Pool/Derivative contracts from any unnecessary logic previously stored in them.

Once `DerivativeFactory.sol` receives the `Creator` role it will register every `PerpetualPoolParty.sol` that is deployed through it with `Registry.sol` so they can request prices from the DVM.

# Motivation

The changes in the collateral ratio and liquidation treshold for USDC-backed synthetic assets allow us to scale more without adding additional risks. Due to the redeployment of new `PerpetualPoolParty.sol` contracts and `PoolOnChainPriceFeed.sol` contracts in order to lower the initial GCR and liquidation tresholds for our current synthetic assets we've decide to clean up some of the unnecessary code and improve the security of our protocol with the modifications explained in this document.

By redeploying the `DerivativeFactory.sol` we'll be able to move forward with a more clean, secure and scalable infrastructure.

Giving `Creator` role to `DerivativeFactory.sol` would allow more scalable and liquid synthetic assets to be backed by the UMA liquidation/dispute system, since every newly deployed derivative (`PerpetualPoolParty.sol`) is registered with the DVM.

# Technical Specification

### Here is a breakdown on the whole deployment process of a new derivative:

1. Our DAO address (which is currently a team address until the DAO is set up) calls `deployPoolAndDerivative` of `Deployer.sol`.
2. `Deployer.sol` calls `createPerpetual` function of `DerivativeFactory.sol` and this function will call `createPerpetual` function of the base contract `PerpetualPoolPartyCreator.sol` that will deploy the new `PerpetualPoolParty.sol`.
3. `Deployer.sol` calls `createPool` function of `PoolOnChainPriceFeedFactory.sol` and this function will call `createPool` function of the base contract `PoolOnChainPriceFeedCreator.sol` that will deploy the new `PoolOnChainPriceFeed.sol`.
4. `Deployer.sol` links the newly deployed `PoolOnChainPriceFeed.sol` to the newly deployed `PerpetualPoolParty.sol`.
5. Role assignment like `Maintainer` and `Admin` is done by the `Manager.sol` contract.

### Modifications done: 

- Removal of role management from the `PoolOnChainPriceFeed.sol` and `PerpetualPoolParty.sol`. This is an unnecessary feature since the role management is handled by the `Manager.sol` contract. 
- Removal of `emergencyShutdown` functionality from the `PoolOnChainPriceFeed.sol` contract. Initially the `emergencyShutdown` can be called by each `PoolOnChainPriceFeed.sol`. In order to improve security of the protocol we have moved the `emergencyShutdown` functionality to be called only from the `Manager.sol` contract and only by authorized addresses - in our case the UMA DAO and Jarvis DAO.


### Nesting of the contracts:

1. `Perpetual.sol`, now called `PerpetualPoolParty.sol` is a derived contract that inherit from `PerpetualLiquidatable.sol`, now called `PerpetualLiquidatablePoolParty.sol`.
2. `PerpetualLiquidatable.sol`, now called `PerpetualLiquidatablePoolParty.sol` is derived contract that inherit from `PerpetualPositionManager.sol`, now called `PerpetualPositionManagerPoolParty.sol`.
3. `PerpetualPositionManager.sol`, now called `PerpetualPositionManagerPoolParty.sol` is derived contract that inherit from `FeePayer.sol`, now called `FeePayerParty.sol`.

Each one of those contracts have its own library for gas optimization:
1. `PerpetualPoolPartyCreator.sol` uses `PerpetualPoolPartyLib.sol` for gas optimization.
2. `PerpetualLiquidatablePoolParty.sol` uses `PerpetualLiquidatablePoolPartyLib.sol` for gas optimization.
3. `PerpetualPositionManagerPoolParty.sol` uses `PerpetualPositionManagerPoolPartyLib.sol` for gas optimization.
4. `FeePayerParty.sol` uses `FeePayerPartyLib.sol` for gas optimization.

# List of deployed contracts:

- [Finder](https://etherscan.io/address/0xD451dE78E297b496ee8a4f06dCF991C17580B452) 
- [Deployer](https://etherscan.io/address/0x592108F92F6e570f1A47f32c459a03c90aCe05a7)
- [PoolRegistry](https://etherscan.io/address/0xefb040204CC94e49433FDD472e49D4f3538D5346)
- [FactoryVersioning](https://etherscan.io/address/0x1fBb59a3Fff02989342FD0761AE62f01334b5244)
- [SyntheticTokenFactory](https://etherscan.io/address/0xAb6EEDb096376a493E0e888D2738a6a0A493cC3e)
- [FeePayerPoolPartyLib](https://etherscan.io/address/0xB0d0A057060c266b76B110C762471C91a80eD292) 
- [PerpetualPositionManagerPoolPartyLib](https://etherscan.io/address/0xf953f99F6E3907D14658f906988EacDc08387AAd)
- [PerpetualLiquidatablePoolPartyLib](https://etherscan.io/address/0xA758F41c32dB16BF9354ca230a9eC73edd0AD4c0)
- [PerpetualPoolPartyLib](https://etherscan.io/address/0xd8C00bD1BD98D0880e0eA70af81a65348aE73Ef2) 
- [DerivativeFactory](https://etherscan.io/address/0x98c1f29A478fb4e5da14c2BcA0380e67ac2A964a#code) 
- [PoolLib](https://etherscan.io/address/0xDB026D6c3450F5F28f3a035E158E1B68AfCE8f9F) 
- [PoolFactory](https://etherscan.io/address/0x2097E7f338eB44C69a48c3f9eBea7dEeeb88f63F)
- [Manager]()

# Implementation and code base

The `DerivativeFactory.sol` contract as well as all supporting contracts for the `PerpetualPoolParty.sol` contract (including `PerpetualPoolParty.sol` contract) can be found here are available for a review by anyone [here](https://gitlab.com/jarvis-network/apps/exchange/mono-repo/-/tree/feature/derivative-v2/libs/contracts/contracts/contracts/derivative/v2).

The `PoolOnChainPriceFeed.sol` contract as well as all supporting contracts can be found and are available for a review by anyone [here](https://gitlab.com/jarvis-network/apps/exchange/mono-repo/-/tree/feature/derivative-v2/libs/contracts/contracts/contracts/synthereum-pool/v3).

The core contracts of the protocol like `Manager.sol` and `Deployer.sol` can be found and reviewed by anyone [here](https://gitlab.com/jarvis-network/apps/exchange/mono-repo/-/tree/feature/derivative-v2/libs/contracts/contracts/contracts/core).

# Security considerations

Two security audits have been conducted by Halborn: 

- The UMA's forked contract [December 27, 2020](https://gitlab.com/jarvis-network/apps/exchange/mono-repo/-/blob/dev/docs/security-audits/halborn/01-jarvis-perpetualpoolparty.pdf).
- The other parts of the protocol [March 09, 2021](https://gitlab.com/jarvis-network/apps/exchange/mono-repo/-/blob/dev/docs/security-audits/halborn/02-jarvis-v3-smart-contracts-report-v1.pdf).

We have published an answer to the audits [here](https://gitlab.com/jarvis-network/apps/exchange/mono-repo/-/blob/dev/docs/security-audits/halborn/02-response-to-jarvis-v3-smart-contracts-report-v1.md).

Another team (Ubik) is currently auditing our contracts as well. 

Currently there is no economical incentive for liquidating undercapitalized positions (positions where the CR drops below 100%). Although, Forex pairs are not very volatile and rarely move by more than 10% a year, and we have set liquidation at 120% so it is quite unlikely to experience this situation.
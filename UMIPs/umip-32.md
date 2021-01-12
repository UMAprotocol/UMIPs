# Headers

| UMIP-32  |                                                                                                                                          |
|------------|------------------------------------------------------------------------------------------------------------------------------------------|
| UMIP Title | Add `DerivativeFactory` as `Creator` in DVM registry                                                                                                |
| Authors    | Iliyan Iliev (iliyan.iliev@jarvis.exchange) |
| Status     | Draft                                                                                                                                    |
| Created    | December 29, 2020

# Summary

Due to necessity and after discussing with the UMA team, their perpetual contract system was modified to fit the needs of our protocol. The contracts that were modified: 

- `PerpetualCreator.sol` was modified to create`PerpetualPoolPartyCreator.sol`
- `Perpetual.sol` was modified to create `PerpetualPoolParty.sol`
- `DerivativeFactory.sol` is a new contract that is derived from `PerpetualPoolPartyCreator.sol` to restrict deployment access. 

Below is an overview of the modifications:

The deposit/withdraw and create/redeem functions in `PerpetualPoolParty.sol` can only be called by the Synthereum protocol.

All funding rate logic was removed from `PerpetualPoolParty.sol`. In Synthereum, the token sponsor is a contract and any synthetic asset bought/sold on the open market can be created/burned in exchange for its exact value in collateral based on a price feed, which guarantees a perfect arbitrage between Synthereum and DEXs, thus maintaining the peg.

Since our assets are perpetual, if we wanted to upgrade or change something in the derivative contract (change of collateral, for instance) it would require a new perpetual token to be deployed, which will create friction for end-users, liquidity providers, and protocols where our synthetic tokens are integrated. Thus, we wanted to be able to deploy a new derivative contract, but link it to the preexisting perpetual token. This upgradability was added in `PerpetualPoolPartyCreator.sol`.

`PerpetualPoolParty.sol` was split into separate libraries in order to optimize the gas consumption. Note: this is detailed below in the Technical Specification section.

The `emergencyShutdown` functionality in `PerpetualPoolParty.sol` has been modified to not only be callable by the UMA DVM, but also by the Jarvis DAO.

Once `DerivativeFactory.sol` receives the `Creator` role it will register every `PerpetualPoolParty.sol` that is deployed through it with `Registry.sol` so they can request prices from the DVM.

# Motivation

The forking of the UMA contracts was a necessary step in order to align the `DerivativeFactory.sol` with the needs of our project. It also allowed us to go faster with the development as otherwise we would have had to add tons of code and complexity to our code base.
Making some modifications to the contract allowed us to achieve lower gas consumption for deployment, add the functionality to link newly deployed derivatives to an already existing synthetic tokens and to also deploy new derivatives thus creating new synthetic tokens. Adding this functionality provides our users with a better UX, due to the fact that there won't be multiple versions of the same synthetic asset even if a new derivative contract is deployed for that synthetic asset, thus there won't be the need for users or liquidity providers to transfer their funds in order to back another synthetic asset.
Giving `Creator` role to `DerivativeFactory.sol` would allow our synthetic assets to be backed by the UMA liquidation/dispute system, since every newly deployed derivative (`PerpetualPoolParty.sol`) is registered with the DVM.

# Technical Specification

### Here is a breakdown on the whole deployment process of a new derivative:

1. Our DAO address (which is currently a team address until the DAO is set up) calls `deployPoolAndDerivative` of `Deployer.sol`.
2. `Deployer.sol` calls `createPerpetual` function of `DerivativeFactory.sol` and this function will call `createPerpetual` function of the base contract `PerpetualPoolPartyCreator.sol` that will deploy the new `PerpetualPoolParty.sol`.
3. `Deployer.sol` calls `createPool` function of `PoolFactory.sol` and this function will call `createPool` function of the base contract `PoolCreator.sol` that will deploy the new `Pool.sol`.
4. `Deployer.sol` links the newly deployed `Pool.sol` to the newly deployed `PerpetualPoolParty.sol` and assignes the roles in `PerpetualPoolParty.sol` to `Pool.sol`, which are `Admin` and `Pool`.

### Modifications done: 

-  The derivative contract (`PerpetualPoolParty.sol`) has a restricted access for deposit/withdraw and create/redeem, which prevents anyone but Synthereums pool (`Pool.sol`) to mint or redeem synthetic assets; this prevent an attacker to "spam" our protocol by increasing the Global Collateralization Ratio (GCR).
- `DerivativeFactory.sol` contract allow to deploy derivatives (create new synthetic tokens) or deploy a derivative and link it to an already existing synthetic token.
- `DerivativeFactory.sol` is the derived contract of `PerpetualPoolPartyCreator.sol`(that uses `PerpetualPoolPartyLib.sol` for gas optimization).  Adding this contract as Creator role in UMA registry, allow the derivatives deployed to integrate the DVM
- When deploying a new derivative contract (`PerpetualPoolParty.sol`) the `DerivativeFactory.sol` can set any ERC-20 token as collateral, meaning that it allows the support of multiple collateral tokens including those that accrue interest (inflationary). This adds additional flexibility to the contract in maintaining a collateral currency which is preferred by the community and also most stable in terms of technical risks. 
- The forked and updated version of `Perpetual.sol`, now called `PerpetualPoolParty.sol`, deployed by `DerivativeFactory.sol` is set with gas optimization in mind. Due to adding more functionalities to it the gas limit for deployment was overpassed, so the overall architecture was changed by using library contracts which hold some of the functionalities, thus significantly lowering the gas costs of deployment.
- Removing of `fundingRate` as a functionality from the `Perpetual.sol`(`PerpetualPoolParty.sol`), since we do not need such feature in order to maintain the peg; Synthereum's synthetic assets are always redeemable for their exact value in collateral tokens against a price feed, insuring constant arbitrage, and therefore a strong peg.
- Two types of roles were set-up in the `PerpetualPoolParty.sol` which is deployed by the `DerivativeFactory.sol` - Admin and Pool. The pools act as a token sponsors and they are attached to the corresponding derivative, thus allowing the calling of Mint,Exchange and Redeem functions. Admin role has the ability to add new pools to a derivative or remove it.
- `EmergencyShutdown` functionality was updated in order to allow both UMA DAO and Jarvis DAO to have access to it in the case of an issue that puts in danger the funds of users. 

### Nesting of the contracts:

1. `Perpetual.sol`, now called `PerpetualPoolParty.sol` is a derived contract that inherit from `PerpetualLiquidatable.sol`, now called `PerpetualLiquidatablePoolParty.sol`.
2. `PerpetualLiquidatable.sol`, now called `PerpetualLiquidatablePoolParty.sol` is derived contract that inherit from `PerpetualPositionManager.sol`, now called `PerpetualPositionManagerPoolParty.sol`.
3. `PerpetualPositionManager.sol`, now called `PerpetualPositionManagerPoolParty.sol` is derived contract that inherit from `FeePayer.sol`, now called `FeePayerPoolParty.sol`.

Each one of These has its own library for gas optimization:
1. `PerpetualPoolPartyCreator.sol` uses `PerpetualPoolPartyLib.sol` for gas optimization.
2. `PerpetualLiquidatablePoolParty.sol` uses `PerpetualLiquidatablePoolPartyLib.sol` for gas optimization.
3. `PerpetualPositionManagerPoolParty.sol` uses `PerpetualPositionManagerPoolPartyLib.sol` for gas optimization.
4. `FeePayerPoolParty.sol` uses `FeePayerPoolPartyLib.sol` for gas optimization.


# Implementation and code base

The `DerivativeFactory` contracts can be found here are available for a review by anyone [here](https://gitlab.com/jarvis-network/apps/exchange/mono-repo/-/tree/feature/uma-integration-part-2/libs/contracts/contracts).

The `PerpetualPoolParty` contracts can be found and are available for a review by anyone [here](https://gitlab.com/jarvis-network/apps/exchange/UMAprotocol/-/tree/jarvis-dev/for-publish/0.3.x/packages/core/contracts).

# Security considerations

The forked code has been officially audited by a third party company (Halborn), with whom we are working on security across our whole project. The security audit can be seen [here](https://gitlab.com/jarvis-network/apps/exchange/mono-repo/-/blob/dev/docs/security-audits/jarvis-perpetualpoolparty-halborn-audit.pdf)
Two low impact issues were found by the auditors and will be addressed as soon as possible. 

However the protocol itself (Synthereum) hasn't been audited yet, so there is still the chance of issues arrising.To mitigate all risks, we have opted for a very soft and capped launch (only 20k usd worth of asset will be able to be minted as well as having the `emergencyShutdown` functionality enabled. As example a possibility for an attacker to exploit our protocol, which could potentially drain capital from PerpetualPoolParty contract, thus rendering synthetic assets linked to those pools become undercapitalized (collateralization ratio to drop below 100%) and therefore becoming worthless. In order to mitigate this as we mentioned we'll cap the system until we are fully audited and have ran several whitehack test and also we'll be adding a daily withdraw limitation, so even in the worse case scenario we as a foundation can cover the losses of users. We'll also purchase cover on that limit using various protocols (Nexus, Unslashed) as well as setting up our own insurance fund. 

Currently there is no economical incentive for liquidating undercapitalized positions (positions where the CR drops below 100%). Although, Forex pairs are not very volatile and rarely move by more than 10% a year, and we have set liquidation at 120% so it is quite unlikely to experience this situation.

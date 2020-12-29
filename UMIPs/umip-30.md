# Headers

| UMIP-30  |                                                                                                                                          |
|------------|------------------------------------------------------------------------------------------------------------------------------------------|
| UMIP Title | Register new financial contract with DVM                                                                                                |
| Authors    | Iliyan Iliev (iliyan.iliev@jarvis.exchange) |
| Status     |                                                                                                                                     |
| Created    | December 29, 2020      

# Summary

Due to necessity and after discussing with the UMA team their protocol was forked. This fork allowed for addition of a few functionalities which were important building blocks of the project. Some of the unnecessary functionalities were removed and parts of the codebase were split in a helper library which allows gas optimization when deployment of the contracts without surpassing the gas limit. The newly updated DerivativeFactory contract inherits most of the original functionalities, but also adds specific ones for the needs of the project.

Once registered with the DVM, our `DerivativeFactory` contract will use the liquidation/dispute system set up by UMA, while maintaining the flexibility of deploying new derivative contracts (creating new synthetic assets) or deploying a derivative and linking it an already existing synthetic asset.

# Motivation

The forking of the UMA contracts was a neccessary step in order to align the `DerivativeFactory.sol` with the needs of our project. It also allowed us to go faster with the development as otherwise we would have had to add tons of code and complexity to our code base.
Making some modifications to the contract allowed us to achieve lower gas consumption for deployment, add the functionality to link newly deployed derivatives to an already existing synthetic tokens and to also deploy new derivatives thus creating new synthetic tokens.
Registering the `DerivativeFactory.sol` with the UMA DVM would allow our synthetic assets to be backed by the UMA liquidation/dispute system.


# Technical Specification

- `DerivativeFactory.sol` allows the deployment of `PerpetualPoolParty.sol`
- `DerivativeFactory.sol` contract allow  to deploy derivative contracts (create new synthetic tokens) or deploy  a derivative and link it to an already existing synthetic token.
- `DerivivaticeFactory.sol` is the derived contract of `PerpetualPoolPartyCreator.sol` (that uses `PerpeualPoolPartyLib.sol` for gas optmization).  Adding this contract as Creator role in UMA registry, allow the derivatives deployed to integrate the DVM
- When deploying a new derivative contract (`PerpetualPoolParty.sol`) the `DerivativeFactory.sol` can set any ERC-20 token as collateral, meaning that it allows the support of multiple collateral tokens including those that accrue interest (inflationary). This adds additional flexibility to the contract in maintaining a collateral currency which is preffered by the community and also most stable in terms of technical risks. 
- The forked and updated version of `PerpetualPoolParty.sol` deployed by `DerivativeFactory.sol` is set with gas optimization in mind. Due to adding more functionalities to it the gas limit for deployment was overpassed, so the overall architecture was changed by using library contracts which hold some of the functionalities, thus significantly lowering the gas costs of deployment.
- Removing of `fundingRate` as a functionality from the DerivativeFactory.sol, since we do not need such features in order to maintain the peg; Synthereum's synthetic assets are always redeemable for their exact value in collateral tokens against a price feed, insuring constant arbitrage, and therefore a strong peg.
- Two types of roles were set-up in the `PerpetualPoolParty.sol` which is deployed by the `DerivativeFactory.sol` - Admin and Pool. The pools act as a token sponsors and they are attached to the corresponding derivative, thus allowing the calling of Mint,Exchange and Redeem functions. Admin role has the ability to add new pools to a derivative or remove it.
- `EmergencyShutdown` functionality was updated in order to allow both UMA DAO and Jarvis DAO to have access to it in the case of an issue that puts in danger the funds of users. 
- `PerpaetualPoolParty.sol` is a derived contract that inherit from  `PerpetualLiquidatablePoolParty.sol`, `PerpetualPositionManagerPoolParty.sol` and  `FeePayerPoolParty.sol`. Each one of These has its own library for gas optimization:
`PerpetualLiquidatablePoolPartyLib.sol`, `PerpetualPositionManagerPoolPartyLib.sol`, `FeePayerPoolPartyLib.sol`
- The derivative contract has a whitelist which prevents anyone but Synthereums pool to mint synthetic assets; this prevent an attacker to "spam" our protocol by increasing the GCR.

# Implementation and code base

The `DerivativeFactory` contracts can be found here are available for a review by anyone [here](https://gitlab.com/jarvis-network/apps/exchange/mono-repo/-/tree/feature/uma-integration-part-2/libs/contracts/contracts).

The `PerpetualPoolParty` contracts can be found and are available for a review by anyone [here](https://gitlab.com/jarvis-network/apps/exchange/UMAprotocol/-/tree/jarvis-dev/for-upstream/perpetual-pool-party/packages/core/contracts).

# Security considerations

One of the most important consideration is that the forked code is still not audited. The UMA's team has reviewed it, we have done an internal audit and our trusted security partners are auditing it. To mitigate risks, we have opted for a very soft and capped launch (only 20k usd worth of asset will be able to be minted as well as having the emergencyShutdown functionality enabled.

Currently there is no economical incentive for liquidating undercapitalized positions (positions where the CR drops below 100%). Although, Forex pairs are not very volatile and rarely move by more than 10% a year, and we have set liquidation at 120% so it is quite unlikely to experience this situation.

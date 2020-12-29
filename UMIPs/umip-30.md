# Headers

| UMIP-30  |                                                                                                                                          |
|------------|------------------------------------------------------------------------------------------------------------------------------------------|
| UMIP Title | Register new financial contract with DVM                                                                                                |
| Authors    | Pascal Tallarida (pascal@jarvis.exchange) |
| Status     |                                                                                                                                     |
| Created    | December 29, 2020      

# Summary

Due to necessity and after discussing with the UMA team their protocol was forked. This fork allowed for addition of a few functionalities which were important building blocks of the project. Some of the unnecessary functionalities were removed and parts of the codebase were split in a helper library which allows gas optimization when deployment of the contracts without surpassing the gas limit. The newly updated DerivativeFactory contract inherits most of the original functionalities, but also adds specific ones for the needs of the project.

Once registered with the DVM, our `DerivativeFactory` contract will use the liquidation/dispute system set up by UMA, while maintaining the flexibility of deploying new derivative contracts (creating new synthetic assets) or deploying a derivative and linking it an already existing synthetic asset.

# Motivation

The forking of the UMA protocol was a neccessary step in order to align the `DerivativeFactory.sol` with the needs of our project. 
Making some modifications to the contract allowed us to achieve lower gas consumption for deployment, add the functionality to link newly deployed derivatives to an already existing synthetic tokens and to also deploy new derivatives thus creating new synthetic tokens.
Registering the `DerivativeFactory.sol` with the UMA DVM would allow our synthetic assets to be backed by the UMA liquidation/dispute system.


# Technical Specification

- `DerivativeFactory.sol` allows the deployment of `PerpetualPoolParty.sol`
- `DerivativeFactory.sol` contract allow  to deploy derivative contracts (create new synthetic tokens) or deploy  a derivative and link it to an already existing synthetic token.
- `DerivivaticeFactory.sol` is the derived contract of `PerpetualPoolPartyCreator.sol` (that uses `PerpeualPoolPartyLib.sol` for gas optmization).  Adding this contract as Creator role in UMA registry, allow the derivatives deployed to integrate the DVM
- When deploying a new derivative contract (`PerpetualPoolParty.sol`) the `DerivativeFactory.sol` can set any ERC-20 token as collateral, meaning that it allows the support of multiple collateral tokens including those that accrue interest (inflationary). This adds additional flexibility to the contract in maintaining a collateral currency which is preffered by the community and also most stable in terms of technical risks. 
- The forked and updated version of `PerpetualPoolParty.sol` deployed by `DerivativeFactory.sol` is set with gas optimization in mind. Due to adding more functionalities to it the gas limit for deployment was overpassed, so the overall architecture was changed by using library contracts which hold some of the functionalities, thus significantly lowering the gas costs of deployment.
- Removing of `fundingRate` as a functionality from the `DerivativeFactory.sol`, since our goal is to keep the peg between the underlying asset and the synthetic asset using arbitrage opportunities. Also there is a price agreement between users and liquidity providers through metasignatures in our Synthereum pools. This creates an arbitrage system between primary market (our protocol) and secondary markets like Uniswap, incentivizing the users to maintain the peg.
- Two types of roles were set-up in the `PerpetualPoolParty.sol` which is deployed by the `DerivativeFactory.sol` - Admin and Pool. The pools act as a token sponsors and they are attached to the corresponding derivative, thus allowing the calling of Mint,Exchange and Redeem functions. Admin role has the ability to add new pools to a derivative or remove it.
- `EmergencyShutdown` functionality was updated in order to allow both UMA DAO and Jarvis DAO to have access to it in the case of an issue that puts in danger the funds of users. 
- `PerpaetualPoolParty.sol` is a derived contract that inherit from  `PerpetualLiquidatablePoolParty.sol`, `PerpetualPositionManagerPoolParty.sol` and  `FeePayerPoolParty.sol`. Each one of These has its own library for gas optimization:
`PerpetualLiquidatablePoolPartyLib.sol`, `PerpetualPositionManagerPoolPartyLib.sol`, `FeePayerPoolPartyLib.sol`
- A restriction of access to derivative has been set for only the Synthereum pools. This restriction prevents a possible 'troll' attack, in which the attacker can mint without passing through the pool, using a big amount of collateral, thus increasing the GCR (Global Collateralization Ratio) of the derivative. By doing that the attacked can prevent the LP (Liquidity Provider) of a pool to cover with collateral new positions when users try to mint or exchange synthetic assets, thus generating a DOS condition in Synthereum.

# Implementation and code base

The `DerivativeFactory` contracts can be found here are available for a review by anyone [here](https://gitlab.com/jarvis-network/apps/exchange/mono-repo/-/tree/feature/uma-integration-part-2/libs/contracts/contracts).

The `PerpetualPoolParty` contracts can be found and are available for a review by anyone [here](https://gitlab.com/jarvis-network/apps/exchange/UMAprotocol/-/tree/jarvis-dev/for-upstream/perpetual-pool-party/packages/core/contracts).

# Security considerations

One of the most important consideration is that the forked code is still not audited. Although our trusted partners are working on that and the UMA team has reviewed the codebase, you should consider that there might be some unexpected issues. However for this reason the `emergencyShutdown` functionality is set and also we'll be launching the project with a set limit for users on how much funds they can pass through the protocol.

Currently there is still the risk of lacking incentive for liquidating undercapitalized positions (positions where the GCR has dropped below 100%). At the beginning our team as sole liquidity provider will mitigate this issue by liquidating immediatelly positions that are undercollateralized and we will also use a high initial collateralization ratio. In the future a reserve fund will be added which will automatically deposit additional collateral on a position in case it drops below the 100% collateralization ratio thus keeping the incentive for a liquidation process.

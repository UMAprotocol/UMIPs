# Headers

| UMIP-30  |                                                                                                                                          |
|------------|------------------------------------------------------------------------------------------------------------------------------------------|
| UMIP Title | Register new financial contract with DVM                                                                                                |
| Authors    | Pascal Tallarida (pascal@jarvis.exchange) |
| Status     |                                                                                                                                     |
| Created    | December 29, 2020      

# Summary

Due to necessity and after discussing with the UMA team their protocol was forked. This fork allowed for addition of a few functionalities which were important building blocks of the project. Some of the unnecessary functionalities were removed and parts of the codebase were split in a helper library which allows gas optimization when deployment of the contracts without surpassing the gas limit. The newly updated DerivativeFactory contract inherits most of the original functionalities, but also adds specific ones for the needs of the project.

Once registered with the DVM, our `DerivativeFactory` contract will use the liquidation/dispute system set up by UMA, while maintaining the flexibility of deploying new derivative contracts (creating new synthetic assets) or deploying an updated version of already existing derivative contracts and linking them to the same synthetic asset.

# Motivation

There are a few motivational points regarding this fork, which are outlined below:

- `DerivativeFactory` contract can deploy new derivative contracts (create new synthetic assets) or update existing ones by redeploying them while at the same time linking them to an already existing synthetic asset. The second point allows a smoother user experience by eliminating the possibility to have multiple versions of one and the same synthetic asset.
- When deploying a new derivative contract the `DerivativeFactory` can set any ERC-20 token as collateral, meaning that it allows the support of multiple collateral tokens including those that accrue interest (inflationary). This adds additional flexibility to the contract in maintaining a collateral currency which is preffered by the community and also most stable in terms of technical risks. 
- The forked and updated version of `DerivativeFactory` is set with gas optimization in mind. Due to adding more functionalities to it the gas limit for deployment was overpassed, so the overall architecture was changed by using a library contract which holds some of the functionalities and passes them to the `DerivativeFactory`, thus significantly lowering the gas costs of deployment.
- Removing of `fundingRate` as a functionality from the `DerivativeFactory`, since our goal is to keep the peg between the underlying asset and the synthetic asset using arbitrage opportunities. Also there is a price agreement between users and liquidity providers through metasignatures. This creates an arbitrage system between primary market (our protocol) and secondary markets like Uniswap, incentivizing the users to maintain the peg.
- Two types of roles were set-up in the `DerivativeFactory` - Admin and Pool. The pools act as a token sponsors and they are attached to the corresponding derivative, thus allowing the calling of Mint,Exchange and Redeem functions. Admin role has the ability to add new pools to a derivative or remove it.
- `EmergencyShutdown` functionality was updated in order to allow both UMA DAO and Jarvis DAO to have access to it in the case of an issue that puts in danger the funds of users. 


# Technical Specification



# Implementation

The implementation and all contracts are available for a review by anyone [here](https://gitlab.com/jarvis-network/apps/exchange/mono-repo/-/tree/feature/uma-integration-part-2/libs/contracts/contracts).


# Security considerations




# Headers

| UMIP-34  |                                                                                                                                          |
|------------|------------------------------------------------------------------------------------------------------------------------------------------|
| UMIP Title | Add `SynthereumDerivativeFactory` as `Creator` in DVM registry                                                                                                |
| Authors    | Iliyan Iliev (iliyan.iliev@jarvis.exchange) |
| Status     | Last Call                                                                                                                                    |
| Created    | December 29, 2020

# Summary

Due to necessity and after discussing with the UMA team, their perpetual contract system was modified to fit the needs of our protocol. The contracts that were modified: 

- `PerpetualCreator.sol` was modified to create`SynthereumPerpetualPoolPartyCreator.sol`
- `Perpetual.sol` was modified to create `SynthereumPerpetualPoolParty.sol`
- `SynthereumDerivativeFactory.sol` is a new contract that is derived from `SynthereumPerpetualPoolPartyCreator.sol` to restrict deployment access. 

Below is an overview of the modifications:

The deposit/withdraw and create/redeem functions in `SynthereumPerpetualPoolParty.sol` can only be called by the Synthereum protocol.

All funding rate logic was removed from `SynthereumPerpetualPoolParty.sol`. In Synthereum, the token sponsor is a contract and any synthetic asset bought/sold on the open market can be created/burned in exchange for its exact value in collateral based on a price feed, which guarantees a perfect arbitrage between Synthereum and DEXs, thus maintaining the peg.

Since our assets are perpetual, if we wanted to upgrade or change something in the derivative contract (change of collateral, for instance) it would require a new perpetual token to be deployed, which will create friction for end-users, liquidity providers, and protocols where our synthetic tokens are integrated. Thus, we wanted to be able to deploy a new derivative contract, but link it to the preexisting perpetual token. This upgradability was added in `SynthereumPerpetualPoolPartyCreator.sol`.

`SynthereumPerpetualPoolParty.sol` was split into separate libraries in order to optimize the gas consumption. Note: this is detailed below in the Technical Specification section.

The `emergencyShutdown` functionality in `SynthereumPerpetualPoolParty.sol` has been modified to not only be callable by the UMA DVM, but also by the Jarvis DAO.

Once `SynthereumDerivativeFactory.sol` receives the `Creator` role it will register every `SynthereumPerpetualPoolParty.sol` that is deployed through it with `Registry.sol` so they can request prices from the DVM.

# Motivation

The forking of the UMA contracts was a necessary step in order to align the `DerivativeFactory.sol` with the needs of our project. It also allowed us to go faster with the development as otherwise we would have had to add tons of code and complexity to our code base.
Making some modifications to the contract allowed us to achieve lower gas consumption for deployment, add the functionality to link newly deployed derivatives to an already existing synthetic tokens and to also deploy new derivatives thus creating new synthetic tokens. Adding this functionality provides our users with a better UX, due to the fact that there won't be multiple versions of the same synthetic asset even if a new derivative contract is deployed for that synthetic asset, thus there won't be the need for users or liquidity providers to transfer their funds in order to back another synthetic asset.
Giving `Creator` role to `DerivativeFactory.sol` would allow our synthetic assets to be backed by the UMA liquidation/dispute system, since every newly deployed derivative (`PerpetualPoolParty.sol`) is registered with the DVM.

# Technical Specification

### Here is a breakdown on the whole deployment process of a new derivative:

1. Our DAO address (which is currently a team address until the DAO is set up) calls `deployPoolAndDerivative` of `SynthereumDeployer.sol`.
2. `SynthereumDeployer.sol` calls `createPerpetual` function of `SynthereumDerivativeFactory.sol` and this function will call `createPerpetual` function of the base contract `SynthereumPerpetualPoolPartyCreator.sol` that will deploy the new `SynthereumPerpetualPoolParty.sol`.
3. `SynthereumDeployer.sol` calls `createPool` function of `SynthereumPoolFactory.sol` and this function will call `createPool` function of the base contract `SynthereumPoolCreator.sol` that will deploy the new `SynthereumPool.sol`.
4. `SynthereumDeployer.sol` links the newly deployed `SynthereumPool.sol` to the newly deployed `SynthereumPerpetualPoolParty.sol` and assignes the roles in `SynthereumPerpetualPoolParty.sol` to `SynthereumPool.sol`, which are `Admin` and `Pool`.

### Modifications done: 

-  The derivative contract (`SynthereumPerpetualPoolParty.sol`) has a restricted access for deposit/withdraw and create/redeem, which prevents anyone but Synthereums pool (`SynthereumPool.sol`) to mint or redeem synthetic assets; this prevent an attacker to "spam" our protocol by increasing the Global Collateralization Ratio (GCR).
- `SynthereumDerivativeFactory.sol` contract allow to deploy derivatives (create new synthetic tokens) or deploy a derivative and link it to an already existing synthetic token.
- `SynthereumDerivativeFactory.sol` is the derived contract of `SynthereumPerpetualPoolPartyCreator.sol`(that uses `SynthereumPerpetualPoolPartyLib.sol` for gas optimization).  Adding this contract as Creator role in UMA registry, allow the derivatives deployed to integrate the DVM
- When deploying a new derivative contract (`SynthereumPerpetualPoolParty.sol`) the `SynthereumDerivativeFactory.sol` can set any ERC-20 token as collateral, meaning that it allows the support of multiple collateral tokens including those that accrue interest (inflationary). This adds additional flexibility to the contract in maintaining a collateral currency which is preferred by the community and also most stable in terms of technical risks. 
- The forked and updated version of `SynthereumPerpetual.sol`, now called `SynthereumPerpetualPoolParty.sol`, deployed by `SynthereumDerivativeFactory.sol` is set with gas optimization in mind. Due to adding more functionalities to it the gas limit for deployment was overpassed, so the overall architecture was changed by using library contracts which hold some of the functionalities, thus significantly lowering the gas costs of deployment.
- Removing of `fundingRate` as a functionality from the `Perpetual.sol`(`SynthereumPerpetualPoolParty.sol`), since we do not need such feature in order to maintain the peg; Synthereum's synthetic assets are always redeemable for their exact value in collateral tokens against a price feed, insuring constant arbitrage, and therefore a strong peg.
- Two types of roles were set-up in the `SynthereumPerpetualPoolParty.sol` which is deployed by the `SynthereumDerivativeFactory.sol` - Admin and Pool. The pools act as a token sponsors and they are attached to the corresponding derivative, thus allowing the calling of Mint,Exchange and Redeem functions. Admin role has the ability to add new pools to a derivative or remove it.
- `EmergencyShutdown` functionality was updated in order to allow both UMA DAO and Jarvis DAO to have access to it in the case of an issue that puts in danger the funds of users. 

### Nesting of the contracts:

1. `Perpetual.sol`, now called `SynthereumPerpetualPoolParty.sol` is a derived contract that inherit from `PerpetualLiquidatable.sol`, now called `SynthereumPerpetualLiquidatablePoolParty.sol`.
2. `PerpetualLiquidatable.sol`, now called `SynthereumPerpetualLiquidatablePoolParty.sol` is derived contract that inherit from `PerpetualPositionManager.sol`, now called `SynthereumPerpetualPositionManagerPoolParty.sol`.
3. `PerpetualPositionManager.sol`, now called `SynthereumPerpetualPositionManagerPoolParty.sol` is derived contract that inherit from `FeePayer.sol`, now called `SynthereumFeePayerPoolParty.sol`.

Each one of These has its own library for gas optimization:
1. `SynthereumPerpetualPoolPartyCreator.sol` uses `SynthereumPerpetualPoolPartyLib.sol` for gas optimization.
2. `SynthereumPerpetualLiquidatablePoolParty.sol` uses `SynthereumPerpetualLiquidatablePoolPartyLib.sol` for gas optimization.
3. `SynthereumPerpetualPositionManagerPoolParty.sol` uses `SynthereumPerpetualPositionManagerPoolPartyLib.sol` for gas optimization.
4. `SynthereumFeePayerPoolParty.sol` uses `SynthereumFeePayerPoolPartyLib.sol` for gas optimization.

# List of deployed contracts:

- [SynthereumFinder](https://etherscan.io/address/0xD451dE78E297b496ee8a4f06dCF991C17580B452) 
- [SynthereumDeployer](https://etherscan.io/address/0x592108F92F6e570f1A47f32c459a03c90aCe05a7)
- [SynthereumPoolRegistry](https://etherscan.io/address/0xefb040204CC94e49433FDD472e49D4f3538D5346)
- [SynthereumFactoryVersioning](https://etherscan.io/address/0x1fBb59a3Fff02989342FD0761AE62f01334b5244)
- [SynthereumSyntheticTokenFactory](https://etherscan.io/address/0xAb6EEDb096376a493E0e888D2738a6a0A493cC3e)
- [FeePayerPoolPartyLib](https://etherscan.io/address/0xB0d0A057060c266b76B110C762471C91a80eD292) 
- [PerpetualPositionManagerPoolPartyLib](https://etherscan.io/address/0xf953f99F6E3907D14658f906988EacDc08387AAd)
- [PerpetualLiquidatablePoolPartyLib](https://etherscan.io/address/0xA758F41c32dB16BF9354ca230a9eC73edd0AD4c0)
- [PerpetualPoolPartyLib](https://etherscan.io/address/0xd8C00bD1BD98D0880e0eA70af81a65348aE73Ef2) 
- [SynthereumDerivativeFactory](https://etherscan.io/address/0x98c1f29A478fb4e5da14c2BcA0380e67ac2A964a#code) 
- [SynthereumPoolLib](https://etherscan.io/address/0xDB026D6c3450F5F28f3a035E158E1B68AfCE8f9F) 
- [SynthereumPoolFactory](https://etherscan.io/address/0x2097E7f338eB44C69a48c3f9eBea7dEeeb88f63F)

# Implementation and code base

The `SynthereumDerivativeFactory` contracts can be found here are available for a review by anyone [here](https://gitlab.com/jarvis-network/apps/exchange/mono-repo/-/tree/feature/uma-integration-part-2/libs/contracts/contracts).

The `SynthereumPerpetualPoolParty` contracts can be found and are available for a review by anyone [here](https://gitlab.com/jarvis-network/apps/exchange/UMAprotocol/-/tree/jarvis-dev/for-publish/0.3.x/packages/core/contracts).

# Security considerations

The forked code has been officially audited by a third party company (Halborn), with whom we are working on security across our whole project. The security audit can be seen [here](https://gitlab.com/jarvis-network/apps/exchange/mono-repo/-/blob/dev/docs/security-audits/jarvis-perpetualpoolparty-halborn-audit.pdf)
Two low impact issues were found by the auditors and will be addressed as soon as possible. 

However the protocol itself (Synthereum) hasn't been audited yet, so there is still the chance of issues arrising.To mitigate all risks, we have opted for a very soft and capped launch (only 20k usd worth of asset will be able to be minted as well as having the `emergencyShutdown` functionality enabled. As example a possibility for an attacker to exploit our protocol, which could potentially drain capital from PerpetualPoolParty contract, thus rendering synthetic assets linked to those pools become undercapitalized (collateralization ratio to drop below 100%) and therefore becoming worthless. In order to mitigate this as we mentioned we'll cap the system until we are fully audited and have ran several whitehack test and also we'll be adding a daily withdraw limitation, so even in the worse case scenario we as a foundation can cover the losses of users. We'll also purchase cover on that limit using various protocols (Nexus, Unslashed) as well as setting up our own insurance fund. 

Currently there is no economical incentive for liquidating undercapitalized positions (positions where the CR drops below 100%). Although, Forex pairs are not very volatile and rarely move by more than 10% a year, and we have set liquidation at 120% so it is quite unlikely to experience this situation.

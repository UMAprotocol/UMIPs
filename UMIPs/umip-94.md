# Headers

| UMIP-94  |                                                                                                                                          |
|------------|------------------------------------------------------------------------------------------------------------------------------------------|
| UMIP Title | Add `SelfMintingDerivativeFactory` as `Creator` in DVM registry                                                                                                |
| Authors    | Pascal Tallarida (pascal@jarvis.network)                 |
| Status     | Draft                                                 |
| Created    | 05/08/2021   
| Discourse link    |                                    |

# Summary

Last year, we have forked the perpetual contracts implementation of UMA and proposed the [UMIP-34](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-34.md) to integrate it within the DVM. We called this contract PerpetualPoolParty. This fork allows our synthetic assets to be multi-collateralized (multiple collateral linked to multiple Derivatives contract can back the same synthetic asset), perpetual (but without stability fee, funding rate etc.), and permissioned (only our whitelisted Smart Contracts can mint them).

The UMA’s governance approved this fork earlier this year, allowing us to launch our mainnet.

The PerpetualPoolParty was a “broker contract” allowing the end-users to trade against a smart contract (the broker's liquidity pool) which is the sole Token Sponsor: when a user wants to buy a synthetic asset, it triggers a mint transaction where the liquidity pool self-mints a synthetic fiat with a collateral in USDC deposited by liquidity providers, and sell this synthetic fiat for USDC to the end-user, at the Chainlink price, within the same transaction.

Now we are about to launch our “bank contract” which allows anyone to be a Token Sponsor, pretty much like the EMP. Yet, we could not use the EMP due to some specification of our protocols (multi-collateral synthetic assets, perpetual, set minting limits, etc.). So we forked PerpetualPoolParty.

The goal of this UMIP is to integrate `SelfMintingDerivativeFactory` in the DVM.

Once `SelfMintingDerivativeFactory.sol` receives the `Creator` role it will register every `SelfMintingPerpetualMultiParty.sol` that is deployed through it with the UMA Registry so they can request prices from the DVM.

# Motivation

The "broker contract" was the first piece of our protocol to allow anyone to swap a synthetic assets for USDC at the oracle price (using Chainlink); this allows for the creation of a primary market, and help synthetic assets listed on secondary markets to maintain their peg through arbitrage. Although, the "broker contract" requires liquidity to function, which limits the issuance of synthetic assets.

The "bank contract" will allow us to scale as it will allow anyone to self-mint perpetual synthetic assets by depositing a supported collateral, without funding fees or interests. The combination of the two contracts (bank and broker) provides a mechanism to maintain a peg: if the price is above the peg, one can mint a synthetic asset, sell it on a secondary market for USDC, and use part of these USDC to buy back the synthetic assets from the broker contract, to burn them and redeem their collateral. It also provides an instant liquidity to any synthetic assets minted though the "bank contract": one could use $UMA to self-mint jEUR, and instantly sell them for USDC at the oracle price. Today, self-minting a synthetic dollar using UMA occurs a slippage when selling it.

The "bank contract" charges a fee, paid in the collateral deposited, when the user mints, deposits, repays and redeems. The fees are then transferred to the Jarvis protocol's treasury. 

Giving `Creator` role to `SelfMintingDerivativeFactory.sol` would allow more scalable and liquid synthetic assets to be backed by the UMA liquidation/dispute system, since every newly deployed derivative (`SelfMintingPerpetualMultiParty.sol`) is registered with the DVM.

# Technical Specification

### Here is a breakdown on the whole deployment process of a new derivative:

1. Our DAO address (which is currently a team address until the DAO is set up) calls `deployOnlySelfMintingDerivative()` of `Deployer.sol`.
2. `Deployer.sol` calls `createPerpetual()` function of `SelfMintingDerivativeFactory.sol` and this function will use the `createPerpetual()` function of the contract `SelfMintingPerpetutalMultiPartyCreator.sol` that will call `SelfMintingPerpetualMultiPartyLib.sol` which will deploy a new `SelfMintingPerpetualMultiParty.sol` contract.
3. In the process of deployment `SelfMintingDerivativeFactory.sol` uses the internal function of `SelfMintingPerpetutalMultiPartyCreator.sol` called `_setControllerValues()` to set the CapMintLimit, CapDepositRatio and Fee for the new `SelfMintingPerpetualMultiParty.sol` in the `SelfMintingController.sol`.


### Modifications done: 

1. Transaction fees : we have added functions to calculate and to transfer fees that are being paid when a user mint, redeem and repay. Fees are paid with the collateral. Fee calculation = the number of tokens to mint, redeem or repay * GCR * fee (in %).

2. Deposit collateral ratio (DCR) is capped : this is the ratio between the deposited collateral and number of tokens minted. It comes in addition to the GCR: the latter sets a collateral ratio limit below which it is not possible to mint; the DCR sets a limit above which it is not possible to mint; this is done in order to prevent someone to manipulate the GCR. Like the GCR, the DCR is used in the mint, deposit and repay function.

3. Minting is capped : it limits the number of tokens that the derivatives can mint so we can scale according to the demand, liquidity and security. Caps will be increased as security audits are being completed, and as liquidity on our Broker contracts (PerpetualPoolParty) deepen. Also the `CapMintLimit` parameter allows us to avoid a situation in which arbitrage opportunities could potentially be blocked thus affecting the peg of our synthetic tokens across various DEXes. By setting the cap below the currently minted synthetic assets on our broker contract we ensure that an attacker can not self-mint a synthetic asset and redeem an amount equal to the total amount of assets minted from our broker contract, which would block users from redeeming USDC from the broker contract until new tokens are minted and this could lead to impossibility to perform arbitrage and keep the peg with secondary markets.
Under certain conditions, limiting the cap has a downside: if there is not enough synthetic asset on the secondary market to buy them to liquidate a position, it is possible that the limit prevents minting enough synthetic to do so.

4. Make the contract permissionless : the PerpertualPoolParty contract was permissioned (only whitelisted pools can be a Sponsor). We changed this so anyone can become a Sponsor, like it is now in any UMA derivatives of course.

5. Remove the liquidity pool logic : the current PerpetualPoolParty contract works with liquidity pools.

6. The derivatives parameters (CapDepositLimit, CapMintLimit and Fee) are now stored in a controller contract (`SelfMintingController.sol`): this allows us to change those parameters while keeping the same derivatives. 

7. In the factory smart contract, we can only link the derivative contract to an existing synthetic asset, which have been previously deployed.

8. Fees, deposit limit, mint limit are upgradable through the `SelfMintingController.sol` contract.

No change for the liquidation. 

### Nesting of the contracts:

1. `SelfMintingPerpetualMultiParty.sol` is a derived contract that inherit from `SelfMintingPerpetualLiquidatableMultiParty.sol`.
2. `SelfMintingPerpetualLiquidatableMultiParty.sol` is derived contract that inherit from `SelfMintingPerpetualPositionManagerMultiParty.sol`.
3. `SelfMintingController.sol` contract is used to track and update the CapDepositLimit, CapMintLimit and Fee for the self-minting derivatives.

Each one of those contract has its own library for gas optimization:
1. `SelfMintingPerpetutalMultiPartyCreator.sol` uses `SelfMintingPerpetualMultiPartyLib.sol` for gas optimization.
2. `SelfMintingPerpetualLiquidatableMultiParty.sol` uses `SelfMintingPerpetualLiquidatableMultiPartyLib.sol` for gas optimization.
3. `SelfMintingPerpetualPositionManagerMultiParty.sol` uses `SelfMintingPerpetualPositionManagerMultiPartyLib.sol` for gas optimization.

# List of deployed contracts:


# Implementation and code base

The `SelfMintingDerivativeFactory.sol` and all adjacent contracts can be found here are available for a review by anyone [here](https://gitlab.com/jarvis-network/apps/exchange/mono-repo/-/tree/feature/selfish-minting/libs/contracts/contracts/contracts/derivative/self-minting/v1).

The `SelfMintingController.sol`, `SelfMintingRegistry.sol` and `Deployer.sol` contracts can be found and are available for a review by anyone [here](https://gitlab.com/jarvis-network/apps/exchange/mono-repo/-/tree/feature/selfish-minting/libs/contracts/contracts/contracts/core).

# Security considerations

This contract is a fork of the broker contract with all its corresponding contracts, which were audited. However this contract has not yet been audited.

As of now any position opened through the bank contract (`SelfMintingPerpetualMiltiParty.sol`) could become undercapitalized, meaning that the CR could drop below 100%, thus making the position not profitable to be liquidated. This possible threat is magnified by the high volatility of possible collateralTokens used for the self-minting derivatives. However by running liquidation bots the possible undercapitalization situation can be avoided. Another solution which can be implemented to avoid this situation is to have a reserve fund which will automatically deposit additional collateral in the self-minting derivative if the position becomes undercapitalized.
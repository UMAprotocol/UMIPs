# Headers

| UMIP-94  |                                                                                                                                          |
|------------|------------------------------------------------------------------------------------------------------------------------------------------|
| UMIP Title | Add `selfMintingDerivativeFactory` as `Creator` in DVM registry                                                                                                |
| Authors    | Pascal Tallarida (pascal@jarvis.network)                 |
| Status     | Draft                                                 |
| Created    | 05/08/2021   
| Discourse link    |                                    |

# Summary

Last year, we have forked the perpetual contracts implementation of UMA and proposed the [UMIP-34](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-34.md) to integrate it within the DVM. We called this contract PerpetualPoolParty. This fork allows our synthetic assets to be multi-collateralized (multiple collateral linked to multiple Derivatives contract can back the same synthetic asset), perpetual (but without stability fee, funding rate etc.), and permissioned (only our whitelisted smartcontracts can mint them).

The UMA’s governance approved this fork earlier this year, allowing us to launch our mainnet.

The PerpetualPoolParty was a “broker contract” allowing the end-users to trade against a smartcontract (the broker's liquidity pool) which is the sole Token Sponsor: when a user wants to buy a synthetic assets, it triggers a mint transaction where the liquidity pool self-mints a synthetic fiat with a collateral in USDC deposited by liquidity providers, and sell this synthetic fiat for USDC to the end-user, at the Chainlink price, within the same transaction.

Now we are about to launch our “bank contract” which allows anyone to be a Token Sponsor, pretty much like the EMP. Yet, we could not use the EMP due to some specification of our protocols (multi-collateral synthetic assets, perpetual, set minting limits, etc.). So we forked PerpetualPoolParty.

The goal of this UMIP is to integrate `selfMintingDerivativeFactory` in the DVM.

Once `selfMintingDerivativeFactory.sol` receives the `Creator` role it will register every `SynthereumPerpetualPoolParty.sol` that is deployed through it with `Registry.sol` so they can request prices from the DVM.

# Motivation

The "broker contract" was the first piece of our protocol to allow anyone to swap a synthetic assets for USDC at the oracle price (using Chainlink); this allows for the creation of a primary market, and help synthetic assets listed on secondary markets to maintain their peg through arbitrage. Although, the "broker contract" requires liquidity to function, which limits the issuance of synthetic assets.

The "bank contract" will allow us to scale as it will allow anyone to self-mint perpetual synthetic assets by depositing a supported collateral, without funding fees or interests. The combination of the two contracts (bank and broker) provides a mechanism to maintain a peg: if the price is above the peg, one can mint a synthetic asset, sell it on a secondary market for USDC, and use part of these USDC to buy back the synthetic assets from the broker contract, to burn them and redeem their collateral. It also provides an instant liquidity to any synthetic assets minted though the "bank contract": one could use $UMA to self-mint jEUR, and instantly sell them for USDC at the oracle price. Today, self-minting a synthetic dollar using UMA occurs a slippage when selling it.

The "bank contract" charges a fee, paid in the collateral deposited, when the user mints, deposits, repays and redeems. The fees is then transferred to the Jarvis protocol's treasury. 

Giving `Creator` role to `SynthereumPoolDerivativeFactory.sol` would allow more scalable and liquid synthetic assets to be backed by the UMA liquidation/dispute system, since every newly deployed derivative (`SynthereumPoolDerivativeFactory.sol`) is registered with the DVM.

# Technical Specification

### Here is a breakdown on the whole deployment process of a new derivative:

1. Our DAO address (which is currently a team address until the DAO is set up) calls `deployPoolAndDerivative` of `SynthereumDeployer.sol`.
2. `SynthereumDeployer.sol` calls `createPerpetual` function of `SynthereumDerivativeFactory.sol` and this function will call `createPerpetual` function of the base contract `SynthereumPerpetualPoolPartyCreator.sol` that will deploy the new `SynthereumPerpetualPoolParty.sol`.
3. `SynthereumDeployer.sol` calls `createPool` function of `SynthereumPoolFactory.sol` and this function will call `createPool` function of the base contract `SynthereumPoolCreator.sol` that will deploy the new `SynthereumPool.sol`.
4. `SynthereumDeployer.sol` links the newly deployed `SynthereumPool.sol` to the newly deployed `SynthereumPerpetualPoolParty.sol` and assignes the roles in `SynthereumPerpetualPoolParty.sol` to `SynthereumPool.sol`, which are `Admin` and `Pool`.

### Modifications done: 

1. Transaction fees : we have added functions to calculate and to transfer fees that are being paid when a user mint, redeem and repay. Fees are paid with the collateral. Fee calculation = the number of tokens to mint, redeem or repay * GCR * fee (in %).

2. Deposit collateral ratio (DCR) is capped : this is the ratio between the deposited collateral and number of tokens minted. It comes in addition to the GCR: the latter sets a collateral ratio limit below which it is not possible to mint; the DCR sets a limit above which it is not possible to mint; this is done in order to prevent someone to manipulate the GCR. Like the GCR, the DCR is used in the mint, deposit and repay function.

3. Minting is capped : it limits the number of tokens that the derivatives can mint so we can scale according to the demand, liquidity and security. Caps will be increased as security audits are being completed, and as liquidity on our Broker contracts (PerpetualPoolParty) deepen. Under certain conditions, limiting the cap has a downside: if there is not enough synthetic asset on the secondary market to buy them to liquidate a position, it is possible that the limit prevents minting enough synthetic to do so.

4. Make the contract permissionless : the PerpertualPoolParty contract was permissioned (only whitelisted contract can be a Sponsor). We changed this so anyone can become a Sponsor, like it is now in any UMA derivatives of course.

5. Remove the liquidity pool logic : the current PerpetualPoolParty contract works with liquidity pools.

6. The derivatives values are now stored in a comptroller contract: this allows us to change the logic of how we calculate these variables while keeping the same derivatives. In the factory smart contract, we can only link the derivative contract to an existing synthetic asset, which have been previously deployed using PerpetualPoolParty.

7. Fees, deposit ratio, mint limit are upgradable.

No change for the liquidation. 

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

Two security audits have been conducted by Halborn: 

- The UMA's forked contract [December 27, 2020](https://gitlab.com/jarvis-network/apps/exchange/mono-repo/-/blob/dev/docs/security-audits/halborn/01-jarvis-perpetualpoolparty.pdf).
- The other parts of the protocol [March 09, 2021](https://gitlab.com/jarvis-network/apps/exchange/mono-repo/-/blob/dev/docs/security-audits/halborn/02-jarvis-v3-smart-contracts-report-v1.pdf).

We have published an answer to the audits [here](https://gitlab.com/jarvis-network/apps/exchange/mono-repo/-/blob/dev/docs/security-audits/halborn/02-response-to-jarvis-v3-smart-contracts-report-v1.md).

Another team (Ubik) is currently auditing our contracts as well. 

Currently there is no economical incentive for liquidating undercapitalized positions (positions where the CR drops below 100%). Although, Forex pairs are not very volatile and rarely move by more than 10% a year, and we have set liquidation at 120% so it is quite unlikely to experience this situation.
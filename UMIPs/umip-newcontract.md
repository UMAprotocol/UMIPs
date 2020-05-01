# Headers
| UMIP-4     |                                                                                                                                          |
|------------|------------------------------------------------------------------------------------------------------------------------------------------|
| UMIP Title | Register new financial contract with DVM                                                                                                 |
| Authors    | Matt Rice (matt@umaproject.org), Prasad Tare (prasad@umaproject.org), Chris Maree (chris@umaproject.org), Nick Pai (nick@umaproject.org) |
| Status     | Draft                                                                                                                                    |
| Created    | April 30, 2020                                                                                                                           |


# Summary

This UMIP registers the `ExpiringMultiParty` template with the DVM. 
This financial contract template enables the creation of priceless synthetic tokens, as described [here](https://docs.umaproject.org/uma/synthetic_tokens/explainer.html). 

Synthetic tokens are collateral-backed tokens whose value fluctuates depending on the tokens’ reference index. 
The proposed contract design has the following features:
- Contract parameters can be customized by the initial deployer
- Anyone can mint synthetic tokens by depositing Dai as collateral
- Anyone can liquidate undercollateralized positions
- Anyone can dispute invalid liquidations within a 2-hour liveness period 
- Disputes will be resolved by the DVM, and the contract otherwise does not require an on-chain price feed

# Motivation

Up until now, other synthetic token designs have required the smart contract to know the value of the collateral at all times, as reported by an on-chain price feed. 
This is a problem because it is costly to maintain from a gas and DevOps perspective and leaves contracts open to price-feed manipulation attacks.
“Priceless” synthetic tokens differ because they do not require an on-chain price feed to indicate whether the contract is properly collateralized. 
Instead, they have a liquidation mechanism that allows anyone to liquidate an undercollateralized position. 
They can do so by providing rewards to counterparties or third parties for identifying improperly collateralized positions. 
To confirm that these positions are improperly collateralized, these contracts may rely on a “Data Verification Mechanism” (DVM). 
This makes the proposed design more decentralized and resilient against manipulation.

This is the first “priceless” financial contract template to be registered with the DVM. 

# Technical Specification

“Priceless” synthetic tokens are synthetic tokens that are securely collateralized without an on-chain price feed. These tokens are designed with mechanisms to incentivize token sponsors (those who create synthetic tokens) to properly collateralize their positions. These mechanisms include a liquidation and dispute process that allows token holders to be rewarded for identifying improperly collateralized token sponsor positions. The dispute process relies on an oracle, the UMA DVM, to settle disputes regarding liquidations.

A deployment of a priceless synthetic token is defined by the following parameters. The contract template that is registered with the UMA DVM will hardcode or restrict some of these parameters, as indicated below. All other parameters can be customized in individual deployments of the contract. 

- expirationTimestamp: These are discretized to monthly expires on the 1st day of each month at 12:00:00 UTC. The maximum timestamp is June 30, 2021. 
- collateralAddress
- priceFeedIdentifier
- syntheticName
- syntheticSymbol
- collateralRequirement
- disputeBondPct
- sponsorDisputeRewardPct
- disputerDisputeRewardPct
- minSponsorTokens
- timerAddress: Hardcoded to 0x0000000000000000000000000000000000000000.
- withdrawalLiveness: Hardcoded to 120 min.
- liquidationLiveness: Hardcoded to 120 min.

## Launching a New Synthetic Token

To launch a new type of synthetic token for which an existing market does not yet exist, that synthetic token’s smart contract must first be parameterized and deployed. Anyone (a “Contract Deployer”) can parameterize and deploy this contract. 
After the contract is deployed, anyone (“Token Sponsors”) can interact with the contract to create synthetic tokens.

Token Sponsors deposit collateral into the contract to collateralize synthetic tokens, which they can then withdraw and trade with others. 
The first token sponsor to create synthetic tokens is able to immediately withdraw synthetic tokens from the contract. 
Any following token sponsors must collateralize their positions by at least as much as the system’s average collateralization ratio among all token sponsor positions that have not been liquidated (“GCR”). 
Requiring new token sponsors to collateralize their positions by as much as the GCR provides some assurances that so long as those token sponsors collateralized below the GCR have not yet been liquidated, those above the GCR need not be at risk of liquidation.

## Managing Token Sponsor Positions

Token sponsors can deposit additional collateral at any time. Token sponsors can withdraw excess collateral in one of two ways: a “fast” withdrawal or “slow” withdrawal.

### “Fast” withdrawal:

A “fast” withdrawal allows a token sponsor to withdraw excess collateral from his position immediately, so long as the resulting position is collateralized by at least as much as the global collateralization ratio (GCR). 
Requiring withdrawals to result in collateralization at least as high as the GCR provides some assurances that so long as the other token sponsors collateralized below the GCR have not yet been liquidated, this token sponsor should not be liquidated after making this withdrawal.

### “Slow” withdrawal:

If the token sponsor wishes to withdraw collateral from his position that would bring his collateralization below the global collateralization ratio, he can do so via a “slow” withdrawal. 
Because withdrawing this amount of collateral could potentially jeopardize the solvency of the fungible synthetic tokens, this “slow”, 2-part, withdrawal process allows other token holders to flag if a withdrawal would render the token sponsor insolvent.

In a “slow” withdrawal, there are two parts: The token sponsor submits a withdrawal request to the contract indicating the amount of collateral he wishes to withdraw and the timestamp of the request.

During this period, any token holder can liquidate the token sponsor’s position if they believe a withdrawal of the amount indicated in the withdrawal request would bring the token sponsor’s collateralization below the “collateralization requirement” at the time of liquidation. 
If the “withdrawal liveness period” of 2 hours passes without a token holder liquidating the token sponsor, the token sponsor may withdraw collateral from his position up to the amount requested.

## Liquidation and Dispute

At any time, a token holder may liquidate a token sponsor’s position. Liquidations happen immediately without calling the oracle.
Anyone may dispute a liquidation within the “liquidation liveness period” of 2 hours.

To liquidate a token sponsor position, a token holder submits tokens to the contract and posts a liquidation bond. 
The liquidation bond covers the cost of calling the DVM if the liquidation is disputed. 
If the liquidation is not disputed, the liquidation bond is returned to the liquidator. 
The tokens are submitted for 3 purposes: to indicate the size of the position to be liquidated, to close the token sponsor’s position, and to attest to the liquidator’s belief that the token sponsor’s position should be liquidated. 
The liquidator will lose a portion of the collateral corresponding to the tokens if their liquidation is disputed and found to be invalid.

Here are three ways in which a liquidation can be resolved:

1. No one disputes the liquidation during the liquidation liveness period. 
After the liquidation liveness period ends, collateral deposited by the token sponsor is returned to the liquidator, proportional to the number of synthetic tokens the liquidator has submitted in liquidation. 

2. Someone disputes the liquidation during the liquidation liveness period. 
To do this, the disputer must post a bond. Once the dispute is raised, a price request is made to the UMA DVM. 
This price request will return the value of the price identifier at the time of the liquidation, which will determine if the token sponsor was undercollateralized and resolve the "dispute".

2a. If the price returned by the DVM indicates that the token sponsor was undercollateralized at the time of the liquidation:
- The disputer will lose their bond.
- The liquidator will receive all of the token sponsor position’s collateral.
- The token sponsor will not receive any of the collateral they have previously deposited into the position. 

2b. If the price returned by the DVM indicates that the token sponsor was not undercollateralized at the time of the liquidation:
- The disputer will receive back their dispute bond and a dispute reward.
- The liquidator will receive collateral equalling: (i) the value of the token at the time of liquidation as determined by the DVM, less (ii) the dispute reward paid to the disputer, less (iii) the improper liquidation reward paid to the original token sponsor.
- The token sponsor will receive any remaining collateral and a reward for the improper liquidation.

## Redeeming Tokens

Before the expiration date of the token, tokens may only be redeemed by token sponsors. 
A token sponsor redeems a token by submitting it to the contract to be burned and receiving collateral proportional to the total amount of collateral that the token sponsor has deposited to the contract.

## Redeeming After Expiry

After the expiration timestamp for the synthetic tokens, anyone may settle the contract. 
This calls on the UMA DVM to return the value of the token’s price identifier at the expiration timestamp.

After this value is returned to the contract and the contract is settled, any token holder can redeem the tokens against the contract. 
Redemption of the tokens returns the token holder collateral equal to the price identifier value returned by the UMA DVM. Sponsors may also withdraw any excess collateral from the contract after settlement.

Additional details can be found [here](https://docs.umaproject.org/uma/synthetic_tokens/explainer.html).

# Rationale

Please see the individual PRs for the rationale behind each PR. 

# Implementation

Please see this [directory](https://github.com/UMAprotocol/protocol/tree/master/core/contracts/financial-templates/implementation). 
The directory contains both the [implementation](https://github.com/UMAprotocol/protocol/blob/master/core/contracts/financial-templates/implementation/ExpiringMultiParty.sol) of the `ExpiringMultiParty` template and the [deployer contract](https://github.com/UMAprotocol/protocol/blob/master/core/contracts/financial-templates/implementation/ExpiringMultiPartyCreator.sol) that will be registered with the DVM to allow users to deploy their own `ExpiringMultiParty` contract.

# Security considerations

Please see the individual PRs for details on how each affects the security of the UMA ecosystem. This repo will be audited by OpenZeppelin, and the audit report will be made available [here](https://docs.umaproject.org/uma/index.html).  

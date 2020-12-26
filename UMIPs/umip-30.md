# Headers

| UMIP-30  |                                                                                                                                          |
|------------|------------------------------------------------------------------------------------------------------------------------------------------|
| UMIP Title | Register new financial contract with Creator Role                                                                                                |
| Authors    | Pascal Tallarida (pascal@jarvis.exchange) |
| Status     |                                                                                                                                     |
| Created    | December 26, 2020      

# Summary

This UMIP provisionally registers the `???` template with the DVM. 
This financial contract template enables the creation of priceless synthetic tokens, as described [here](https://docs.umaproject.org/uma/synthetic_tokens/explainer.html). 

Synthetic tokens are collateral-backed tokens whose value fluctuates depending on the tokens’ reference index. 

The proposed contract design has the following features:
- Contract parameters can be customized by the initial deployer or anyone whose had been assigned with an Admin role
- Anyone can mint synthetic tokens by depositing USDC as collateral. The collateral provided by the user is 100%, while the rest of the collateral is provided by a Liquidity Provider (reffered as LP in this document)
- Anyone can liquidate undercollateralized positions
- Anyone can dispute invalid liquidations within a 2-hour liveness period 
- Disputes will be resolved by the DVM, and the contract otherwise does not require an on-chain price feed

# Motivation

Up until now, other synthetic token designs have required an on-chain price feed, which makes it extremely expensive to maintain and near to impossible to update in real time according to the price changes in the underlying assets. 
Priceless synthetic tokens does not require an on-chain price feed and at the same time securely offer mechanisms for sufficient collateralization. 
Liquidity providers are incentivized to keep the collateralization ratio above the GCR (Global Collateralization Ratio), while in the meantime the users have access to multiple financial assets for diversifying and protecting their investments from negative changes in the legacy financial system. An example is the dependency of most investments in the DeFi space to the USD, which value has been deminishing over the past few months, causing the overall portfolio value of investors to also diminish. Giving access to more currencies represented by synthetic tokens allows the DeFi ecosystem grow exponentialy. 
Moreover access to local currencies (as ex. African Rand - ZAR) through synthetic tokens could potentially increase the overall DeFi users and have a positive effect in the whole ecosystem, causing more people, especially those 'unbanked', to join a parallel financial system.
Synthetic tokens would also allow users in the DeFi space to invest in other assets from the traditional financial system like stocks, commodities and indexes. 
With a secured collateralization ratio and a back-up liquidation system provided by the DVM, those synthetic tokens and the protocol behind them could become a bulding block for many other areas in the DeFi space like securities, crypto loans and deposits.

# Technical Specification

Priceless synthetic tokens are tokens that track the price of a tradditional financial instrument, without an on-chain price feed.
The synthetic tokens require proper collateralization based on the underlying asset, thus users and liquidity providers are required to provide the necessary amount to overcollateralize a certain position. 
Token sponsors (those who create/mint synthetic tokens) are required to provide 100% of the collateral required for a certain position and the other 50% are provided by the LPs (liquidity providers) in order to achieve a greater collateralization ratio than the GCR.
LPs are required to keep track of collateralized positions and the collateralization ratio and fund those position with additionals capital in order to keep the collateralization ratio above the GCR and avoid liquidation. The LPs are incentivized to do so with portion of the fees paid by the Token Sponsors when creating new synthetic tokens.
Anyone is able to start a liquidation process on an malicious LP that has allowed the collateralization ratio of its positions to drop below the GCR.
The liquidation process can be disputed during the liveness period after which the position is liquidated (in case of no dispute) and the liquidator receives the the deposited collateral funds by the LP.
Both liquidation process and dispute process rely on an Oracle, the UMA DVM, to settle those processes.
The protocol has the ability to create new derivative contracts for new financial assets or update existing ones while linking them to the same synthetic token, thus avoiding a new synthetic token with the same underlying asset being created.
An implementation of an emergency shutdown functionality is also available and can be triggered in case of emergency (faulty processes within the protocol, which could lead to substantial financial losses for the users) by the UMA DAO and the Jarvis DAO.
The deployed derivatives have no expiration time stamp thus providing users access to perpetual assets.
The collateral currency used within the protocol is USDC, but support for multiple collateral currencies is added as well as support for interest-bearing collateral currencies.
The creation and deployment of new derivatives linked to the protocol can be accessed and performed only by an address registered with the Admin role. 
Addresses registered with the Maintainer role can add or remove liquidity providers.
The financial contract gives access to user to three distinct operations - mint/exchange/redeem.
 - Minting allows the creation of new synthetic tokens by token sponsors
 - Redeeming allows the token sponsor or any other individual which holds synthetic tokens to redeem those synthetic assets for the collateral behind it. If the price of the synthetic asset have increase the additional amount is paid by the collateral provided by the LP, thus the LP loses funds. If the price of the synthetic asset have decreased when redeem is performed the Redeemer receives less than the initial provided collateral thus sustaining a loss. The excess collateral goes to the liquidity provider as a profit. In the Redeem process the synthetic tokens send by the users for the collateral are burned.
 - Exchanging allows the transfer of collateral backing one synthetic token to another, thus giving the user the ability to exchange their synthetic tokens with one underlying asset for another synthetic tokens with a different underlying asset. The process includes burning the initial synthetic tokens, transfering required collateral to another derivative contract, minting the new synthetic tokens and sending them to the user. Exchange price between the underlying assets is used in order to keep the collateralization ratio above the GCR. 

Other general parameters can be found below:


## Launching a new synthetic token

A new synthetic token can be launched by the protocol due to its Creator role and ability to deploy not yet existing derivative contracts. Of course in order to do so a price identifier UMIP have to be passed by the UMA DAO in order to setup the DVM with the proper tools to handle liquidation or dispute processes.

Already deployed derivatives can be updated by redeploying a new derivative linked to the same synthetic asset, thus avoiding the creation of an entirely new synthetic token and requiring Token Sponsors and Liquidity providers to move their funds to a new synthetic token.

## Managing collateralization ratio and liquidity provers obligations

Liquidity providers can deposit additional funds at any time in order to increase the collateralization ratio for a position either due to the fact that the position is becoming undercollateralized or to increase the general collateralalization ratio.

Liquidity providers can withdraw the excess collateral via "fast" or "slow" withdrawal.

## "Fast" withdrawal

A “fast” withdrawal allows a token sponsor to withdraw excess collateral from his position immediately, so long as the resulting position is collateralized by at least as much as the global collateralization ratio (GCR). 
Requiring withdrawals to result in collateralization at least as high as the GCR provides some assurances that so long as the other token sponsors collateralized below the GCR have not yet been liquidated, this token sponsor should not be liquidated after making this withdrawal.

## "Slow" withdrawal


## Liquidation and Dispute

At any time, anyone can start a liquidation process on a liquidity providers position, if he believes that the total collateralization ratio of said position has dropped below the global collateralization ratio.

The liquidation process is handled by UMA DVM and is executed after the liveness period has passed.

The liveness period alows for disputes to be raised in case the LP or anyone else believe that the liquidation process has been started wrongfully.

To liquidate the position of an LP (liquidity provider) the liquidator submits tokens to the contract and a liquidation bond.

If the liquidation process is disputed and has been found wrong, the liquidator loses his bond and his deposited tokens are returned to him.

In the case where the liquidation process passes the liveness period, the bond is returned to the liquidator as well as the collateral deposited originally for the position and corresponding to the deposited token amount by the liquidator.

Here are ways in which a liquidation can be resolved:

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
- The token sponsor (in our case the LP) will receive any remaining collateral and a reward for the improper liquidation.

# Implementation

Please see the following directories:


# Security considerations




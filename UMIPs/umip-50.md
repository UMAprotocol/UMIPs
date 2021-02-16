# Headers
| UMIP-4     |                                                                                                                                          |
|------------|------------------------------------------------------------------------------------------------------------------------------------------|
| UMIP Title | Register new Perpetual financial contract with DVM                                                                                                 |
| Authors    | John Shutt (john@umaproject.org) |
| Status     | Draft                                                                                                                                    |
| Created    | February 16, 2021                                                                                                                           |


## Summary (2-5 sentences)

This UMIP registers the `Perpetual` template with the DVM. This financial contract template enables the creation of non-expiring priceless synthetic tokens, through the use of the optimistic oracle and a funding rate mechanism.

# Motivation & Rationale

The Perpetual contract template will allow for the creation of non-expiring synthetic assets, which are useful for a wide variety of use cases. A simple example would be a synthetic asset that tracks the price of a stock index without an expiration date. This can be easier for token holders, token sponsors, and liquidity providers to manage, as it does not require them to roll over to a new token on some expiration date.

# Technical Specification

Like the expiring multi-party contract template, the perpetual template is used to create synthetic tokens that are securely collateralized without an on-chain price feed. These tokens are designed with mechanisms to incentivize token sponsors (those who create synthetic tokens) to properly collateralize their positions. These mechanisms include a liquidation and dispute process that allows token holders to be rewarded for identifying improperly collateralized token sponsor positions. The dispute process relies on an oracle, the UMA DVM, to settle disputes regarding liquidations.

Unlike the expiring multi-party template, the perpetual template includes a funding rate mechanism, which allows for contracts that track a price continually without ever expiring. Funding rate proposals are made optimistically and disputes can be forwarded to the DVM.

For details on optimistic funding rate and price proposals, see UMIP-49, which describes the optimistic oracle.

A deployment of a perpetual synthetic token is defined by the following parameters.

- address collateralAddress
- bytes32 priceFeedIdentifier
- bytes32 fundingRateIdentifier
- string syntheticName
- string syntheticSymbol
- FixedPoint.Unsigned collateralRequirement
- FixedPoint.Unsigned disputeBondPercentage
- FixedPoint.Unsigned sponsorDisputeRewardPercentage
- FixedPoint.Unsigned disputerDisputeRewardPercentage
- FixedPoint.Unsigned minSponsorTokens
- FixedPoint.Unsigned tokenScaling
- uint256 withdrawalLiveness
- uint256 liquidationLiveness

Deploying a perpetual synthetic token also requires deploying a `ConfigStore` with the following parameters.

- uint256 timelockLiveness (Liveness period (in seconds) for an update to currentConfig to become official.)
- FixedPoint.Unsigned rewardRatePerSecond (Reward rate paid to successful proposers. Percentage of 1 E.g., .1 is 10%.)
- FixedPoint.Unsigned proposerBondPercentage (Bond % (of given contract's PfC) that must be staked by proposers. Percentage of 1, e.g. 0.0005 is 0.05%.)
- FixedPoint.Signed maxFundingRate (Maximum funding rate % per second that can be proposed.)
- FixedPoint.Signed minFundingRate (Minimum funding rate % per second that can be proposed.)
- uint256 proposalTimePastLimit (Funding rate proposal timestamp cannot be more than this amount of seconds in the past from the latest update time.)

# Implementation

Please see this [directory](https://github.com/UMAprotocol/protocol/tree/master/core/contracts/financial-templates/implementation).
The directory contains both the [implementation](https://github.com/UMAprotocol/protocol/blob/master/core/contracts/financial-templates/perpetual-multi-party/implementation/Perpetual.sol) of the `Perpetual` template and the [deployer contract](https://github.com/UMAprotocol/protocol/blob/master/core/contracts/financial-templates/perpetual-multi-party/implementation/PerpetualCreator.sol) that will be registered with the DVM to allow users to deploy their own `Perpetual` contract.

# Security considerations

This repo has been audited by OpenZeppelin, and the final audit report will be made available [here](https://docs.umaproject.org/uma/index.html).

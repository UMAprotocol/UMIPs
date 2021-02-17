## Headers
| UMIP-54    |                                                                                                                                          |
|------------|------------------------------------------------------------------------------------------------------------------------------------------|
| UMIP Title | Approve New EMP Financial Contract Template              |
| Authors    | John Shutt (john@umaproject.org) |
| Status     | Draft                                                                                                                             |
| Created    | February 16, 2021                                                                                                                           |

## Summary
This UMIP will have the effect of introducing a new ExpiringMultiParty contract template that allows for optimistic expiry price settlement. A description of the optimistic oracle can be found in UMIP-52.

The template also allows deployers to use custom financial product libraries to transform the price, the identifier passed to the optimistic oracle or DVM, and the collateralization requirement. Examples of financial product libraries can be found in this [directory](https://github.com/UMAprotocol/protocol/tree/master/packages/core/contracts/financial-templates/common/financial-product-libraries). (If you do not want to use a financial product library, you can pass the zero address `0x0`.)

Additionally, the token precision matches the collateral precision for contracts deployed with this template, reducing the complexity of price calculation and the potential for errors.

## Motivation & Rationale

This UMIP will allow optimistic settlement of expiry price through the new optimistic oracle, with a liveness window for disputes. This puts less demand on the DVM, which only comes into the picture in the event of a dispute. It also speeds up the settlement of expiry prices significantly, making the protocol more efficient.

## Technical Specification
To accomplish this upgrade, a new financial contract template must be deployed.

After deployment, this new `ExpiringMultiPartyCreator` contract should be approved as a ContractCreator in the Registry. The optimistic oracle described in UMIP-52 will need to be deployed, and the DVM will need to be upgraded to handle ancillary data. Bots should also be updated to handle the new EMP template.

Note: the voters only vote for the approval -- the deployment has no effect on the protocol until added as a ContractCreator.

A deployment of an expiring multi-party synthetic token is defined by the following parameters.

- uint256 expirationTimestamp
- address collateralAddress
- bytes32 priceFeedIdentifier
- string syntheticName
- string syntheticSymbol
- FixedPoint.Unsigned collateralRequirement
- FixedPoint.Unsigned disputeBondPercentage
- FixedPoint.Unsigned sponsorDisputeRewardPercentage
- FixedPoint.Unsigned disputerDisputeRewardPercentage
- FixedPoint.Unsigned minSponsorTokens
- uint256 withdrawalLiveness
- uint256 liquidationLiveness
- address financialProductLibraryAddress

## Implementation

Please see this [directory](https://github.com/UMAprotocol/protocol/tree/master/packages/core/contracts/financial-templates/expiring-multiparty). The directory contains both the [implementation](https://github.com/UMAprotocol/protocol/blob/master/packages/core/contracts/financial-templates/expiring-multiparty/ExpiringMultiParty.sol) of the `ExpiringMultiParty` template and the [deployer contract](https://github.com/UMAprotocol/protocol/blob/master/packages/core/contracts/financial-templates/expiring-multiparty/ExpiringMultiPartyCreator.sol) that will be registered with the DVM to allow users to deploy their own `ExpiringMultiParty` contract.

## Security considerations

This repo has been audited by OpenZeppelin, and the final audit report can be reviewed [here](https://blog.openzeppelin.com/uma-audit-phase-4/)

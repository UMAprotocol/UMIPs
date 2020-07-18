## Headers
| UMIP-9     |                                                                                                                                          |
|------------|------------------------------------------------------------------------------------------------------------------------------------------|
| UMIP Title | Approve Updated EMP Financial Contract Template              |
| Authors    | Matt Rice (matt@umaproject.org), Clayton Roche (clayton@umaproject.org) |
| Status     | Last Call                                                                                                                                    |
| Created    | July 16, 2020                                                                                                                           |

## Summary (2-5 sentences)
This UMIP will have the effect of introducing a slightly modified financial contract template that:
- Still allows users to deploy the EMP (synthetic expiring token) contract.
- Respects the collateral currency whitelist introduced in UMIP-8 to allow simpler and faster adoption of new collateral currencies.
- Allows the liquidation and withdrawal liveness parameters to be set to any time period that’s at least 1 second (previously hardcoded at 2 hours, or 7200 seconds).
- Allows the expiry time to be set to any future timestamp.

## Motivation
Up until now, the parameters allowed for an EMP contract have been strict and inflexible. To update the collateral currencies, one would need to deploy a new template. Expiries could only be at the beginning of the month, and all liveness periods had to be 2 hours. These parameter choices were made to keep the risks as low as possible as the first few EMPs were being deployed on mainnet. Now that there have been multiple successful deployments of the EMP contract, we propose that these parameters become more flexible to allow anyone to experiment with parameters of their choice.

## Technical Specification
To accomplish this upgrade, a new financial contract template must be deployed:
- A modified `ExpiringMultiPartyCreator` contract will need to be deployed. The notable changes include:
	- On each attempted deployment, this contract should query the `“CollateralWhitelist”` address using the `Finder` contract to find the whitelist address. Then it should verify that the provided collateral currency is on said whitelist.
	- On each attempted deployment, this contract should allow any timestamp to be provided as the expiry. Note: the `ExpiringMultiParty` contract has a check that requires the timestamp to be in the future at deployment time.
	- On each attempted deployment, this contract should allow the deployer to pass in the withdrawal and liquidation liveness, and it should check that they are both > 0.
	- The EMP that is deployed by the creator will have minor changes in the events it produces detailed [here](https://github.com/UMAprotocol/protocol/pull/1753).

After deployment, this new `ExpiringMutltiPartyCreator` contract should be approved as a ContractCreator in the Registry.

Note: the voters only vote for the approval -- the deployment has no effect on the protocol until added as a ContractCreator.

## Rationale

Part of the rationale behind this change is that it’s simpler to deploy one `ExpiringMultiPartyCreator` contract that allows users to deploy almost any EMP parameterization than deploying an `ExpiringMultiPartyCreator` contract each time there’s a new use case.

## Implementation

Please see this [directory](https://github.com/UMAprotocol/protocol/tree/master/core/contracts/financial-templates/expiring-multiparty). The directory contains both the [implementation](https://github.com/UMAprotocol/protocol/blob/master/core/contracts/financial-templates/expiring-multiparty/ExpiringMultiParty.sol) of the `ExpiringMultiParty` template and the [deployer contract](https://github.com/UMAprotocol/protocol/blob/master/core/contracts/financial-templates/expiring-multiparty/ExpiringMultiPartyCreator.sol) that will be registered with the DVM to allow users to deploy their own `ExpiringMultiParty` contract. Note: the changes specified above are currently in progress, so the current version may not match the specification yet.

The new `ExpiringMultiPartyCreator` contract changes since the previously approved version were implemented [here](https://github.com/UMAprotocol/protocol/pull/1746). Additionally, the minor event changes that were made to the `ExpiringMultiParty` contract are implemented [here](https://github.com/UMAprotocol/protocol/pull/1753). These are the only changes that have been made since the previous version of the `ExpiringMultiPartyCreator` was deployed and approved.

## Security considerations
These changes *have not* been audited. However, the changes are deemed to be minor and an audit is expected to come soon after its addition to the system. This is deemed to be safe because no *stateful logic* has been changed in the `ExpiringMultiParty` and the `ExpiringMultiPartyCreator` changes only affect the possible parameterizations of the `ExpiringMultiParty` contracts that can be deployed.

As before, anyone deploying a new priceless token contract should take care to parameterize the contract appropriately to avoid the loss of funds for users. Additionally, the contract deployer should ensure that there is a network of liquidators and disputers ready to perform the services necessary to keep the contract solvent. Anyone planning to use a synthetic token (as a sponsor or tokenholder) should validate that the token is solvent and well-parameterized before using since there are configurations and states that make the proposed contract unsafe.

These considerations should be taken more seriously now that there are fewer limitations on what parameters a deployer can specify for an EMP contract.

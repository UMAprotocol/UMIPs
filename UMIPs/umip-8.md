## Headers
| UMIP-8     |                                                                                                                                          |
|------------|------------------------------------------------------------------------------------------------------------------------------------------|
| UMIP Title | Add Global Collateral Currency Whitelist              |
| Authors    | Matt Rice (matt@umaproject.org), Clayton Roche (clayton@umaproject.org) |
| Status     | Draft                                                                                                                                    |
| Created    | July 16, 2020                                                                                                                           |

## Summary (2-5 sentences)
This UMIP will have the effect of introducing a new global whitelist contract that will allow new collateral currencies to be added without deploying any new contracts. Previously a new financial contract template would need to be deployed to use a new collateral currency. 


## Motivation
Up until now, to update the collateral currencies, one would need to deploy a new financial contract template since financial contract templates were expected to have a frozen and limited list of collateral currencies. To make the protocol more scalable, it seems sensible to make adding a collateral currency to all existing financial contract templates as easy as proposing a simple governance vote that would approve two Governor transactions: one to add it to the whitelist and another to add a flat final fee for that currency.


## Technical Specification
To accomplish this upgrade, a few actions will need to be taken:
- A new `AddressWhitelist` contract will need to be deployed.
	- The Governor contract should be this contract’s owner.
	- Note: because Dai is already used as a collateral currency, Dai will be included in this whitelist from the start without requiring a separate vote.
- A transaction will need to be proposed to add this new AddressWhitelist’s address to the Finder contract under the name “CollateralWhitelist”.
	- This is how other contracts will find the collateral whitelist and reference it.

Note: this change will only create the whitelist. New financial contract templates that *respect* this whitelist will need to be deployed for it to become useful.



## Rationale

The rationale behind this change is that it fits into a larger goal of making it simpler for the community to make useful changes to the protocol.




## Implementation

The AddressWhitelist contract can be found [here](https://github.com/UMAprotocol/protocol/blob/master/core/contracts/common/implementation/AddressWhitelist.sol). It has been audited and will require no changes.



## Security considerations
Please see the individual PRs for details on how each affects the security of the UMA ecosystem. This repo has been audited by OpenZeppelin, and the final audit report will be made available [here](https://docs.umaproject.org/uma/index.html).

This security consideration already existed, but it’s worth noting in this change. Any collateral currencies that are whitelisted but have a small or 0 final fee will open the UMA voting system to DoS attacks. DoS attacks will not break the smart contracts, but they could make voting impractical in the short term while the community discusses how to stop the attack and disregard (or discard) the troublesome requests.




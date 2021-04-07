## Headers
| UMIP-72   |                                                                                                                                          |
|------------|------------------------------------------------------------------------------------------------------------------------------------------|
| UMIP Title | Add BAL as approved collateral currency              |
| Authors    | Mhairi McAlpine (mhairi@umaproject.org |
| Status     | Last Call                                                                                                                                    |
| Created    | March 30, 2021                                                                                                                           |
| [Discourse Link](https://discourse.umaproject.org/t/add-bal-as-approved-collateral-currency/510)    |                                                                                                                     |

## Summary (2-5 sentences)
This UMIP will add BAL as an approved collateral currency. This will involve adding BAL to the whitelist and adding a flat final fee to charge per-request. The proposed final fee is 8 BAL per request.

## Motivation

BAL is an ERC20 token which is used for governance by the Balancer Protocol.  It can be used to vote on proposals and steer the direction of the protocol.

Adding BAL as a collateral type will allow for a variety of contract deployments. These could be used with the BAL/USD price identifiers that are also being proposed, to create BAL backed yield dollars, or BAL covered calls. 

## Technical Specification
To accomplish this upgrade, two changes for each currency need to be made:

- The BAL address, [0xba100000625a3754423978a60c9317c58a424e3d](https://etherscan.io/address/0xba100000625a3754423978a60c9317c58a424e3d), needs to be added to the collateral currency whitelist introduced in UMIP-8.
- A final fee of 8 needs to be added for BAL in the Store contract.


## Rationale

The rationale behind this change is giving deployers more useful collateral currency options.

8 was chosen as the final fee for BAL, because this is approximately ~$400 at current BAL prices whcih is approximately equivalent to other collateral currencies.

## Implementation

This change has no implementation other than the two aforementioned governor transactions that will be proposed.

## Security considerations

Adding BAL as a collateral does not present any major foreseeable risks to the protocol.

The main implication is for contract deployers and users who are considering using contracts with BAL as the collateral currency. They should recognize and accept the volatility risk of using this asset, and ensure appropriate required collateralization ratios, as well as a network of liquidators and support bots to ensure solvency.


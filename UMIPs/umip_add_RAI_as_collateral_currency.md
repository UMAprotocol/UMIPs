## Headers
| UMIP   |                                                                                                                                          |
|------------|------------------------------------------------------------------------------------------------------------------------------------------|
| UMIP Title | Add RAI as approved collateral currency              |
| Authors    | Ashutosh Varma (ashutoshvarma11@live.com) |
| Status     | Draft                                                                                                                                    |
| Created    | April 1, 2021                                                                                                                           |
| Discourse Link    |   [LINK](https://discourse.umaproject.org/t/add-rai-as-approved-collateral-currency/626)                                                                                                                  |

## Summary (2-5 sentences)
This UMIP proposes adding RAI as a collateral type to UMA Protocol, allowing the usage of RAI as collateral currency.
This will involve adding RAI to the whitelist and adding a flat final fee to charge per-request. The proposed final fee is 160 RAI as per request.

## Motivation

RAI is an ERC20 Token. It is ETH backed reflex index with a managed float regime. The RAIUSD exchange rate is determined by supply
and demand while the protocol that issues RAI tries to stabilize its price by constantly de or revaluing it using Redemption Rate.

Adding RAI as a collateral types will allow for a variety of contract deployments.
These could be used with the R3-APR21 and R3-MAY21 price identifiers that are also being proposed, to create
redemption rate synthetic futures, or call options on RAI redemption rate. 

## Technical Specification
To accomplish this upgrade, two changes for each currency need to be made:

- The RAI address, [0x03ab458634910AaD20eF5f1C8ee96F1D6ac54919 ](https://etherscan.io/address/0x03ab458634910AaD20eF5f1C8ee96F1D6ac54919 ),
  needs to be added to the collateral currency whitelist introduced in UMIP-8.
- A final fee of 150 needs to be added for RAI in the Store contract.


## Rationale

The rationale behind this change is giving deployers more useful collateral currency options.

160 was chosen as the final fee for RAI, because this is approximately ~$500 at current RAI prices whcih is approximately equivalent to other collateral currencies.

## Implementation

This change has no implementation other than the two aforementioned governor transactions that will be proposed.

## Security considerations

Adding RAI as a collateral does not present any major foreseeable risks to the protocol.

The main implication is for contract deployers and users who are considering using contracts with RAI as the collateral currency.
They should recognize and accept the volatility risk of using this asset, and ensure appropriate required collateralization ratios,
as well as a network of liquidators and support bots to ensure solvency.

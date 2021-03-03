## Headers
- UMIP <#> 
- UMIP title: ANT as collateral
- Author Chandler De Kock (chandler@umaproject.org) and Joseph Charlesworth (joe@aragon.org)
- Status: Draft
- Created: <2 March 2021>
- Discourse Link: <https://discourse.umaproject.org/t/ant-as-collateral/297>

## Summary (2-5 sentences)
Aragon Association would like to propose adding ANT as a collateral type to UMA Protocol in order to be able create KPI options for the Aragon community. The first step in this process involves adding ANT as a collateral type. The second step will involve establishing a suitable KPI in conjunction with the Aragon community for use in the KPI option.

## Motivation
Adding ANT as a collateral type is required in order to be able to create a KPI option, collateralised by ANT. We see these as a sophisticated method to grow the Aragon community in conjunction with mutually agreed KPIs with ANT holders. 

## Technical Specification
To accomplish this upgrade, two changes need to be made:

- The ANT address, 0xa117000000f279d81a1d3cc75430faa017fa5a2e, needs to be added to the collateral currency whitelist introduced in UMIP-8.
- A final fee of 250 ANT needs to be added in the Store contract.

## Rationale
Adding ANT as collateral to UMA protocol is a pre-requisite to being able to use ANT as collateral in a KPI option. 

## Implementation
This change has no implementation other than proposing the aforementioned governance transaction that will be proposed.

## Security considerations
Adding ANT as a collateral does not present any major foreseeable risks to the protocol.

The main implication is for contract deployers and users who are considering using contracts with ANT as the collateral currency. They should recognise and accept the volatility risk of using this asset, and ensure appropriate required collateralization ratios, as well as a network of liquidator and support bots to ensure solvency.
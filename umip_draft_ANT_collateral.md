## Headers
- UMIP <#> 
- UMIP title: ANT as collateral
- Author Chandler De Kock (chandler@umaproject.org) and Joseph Charlesworth (joe@aragon.org)
- Status: Approved
- Created: <2 March 2021>
- Discourse Link: <https://discourse.umaproject.org/t/ant-as-collateral/297>

## Summary (2-5 sentences)
Aragon Association would like to propose adding ANT as a collateral type to UMA Protocol in order to be able create KPI options for the Aragon community. The first step in this process involves adding ANT as a collateral type. The second step will involve establishing a suitable KPI in conjunction with the Aragon community for use in the KPI option.

## Motivation
Adding ANT as a collateral type is required in order to be able to create a KPI option, collateralised by ANT. We see these as a sophisticated method to grow the Aragon community in conjunction with mutually agreed KPIs with ANT holders. 

Aragon is one of the market leaders in decentralised governance technology software. Products includes Aragon client to build and manage DAOs, enterprise voting solutions for companies and governments and APIs to embed voting solutions into custom applications. Over 1,700 DAOs are powered by Aragon with over $650m of funds stored and over $1bn secured by Aragon smart contracts. As the native token of the Aragon network, ANT is used in governance votes for protocol upgrades and is staked by jurors in Aragon Court. Should the KPI options for the Aragon Network DAO be successful, we expect many other Aragon DAOs to follow suit with their own proposals for KPI options using UMA to grow their own communities. Besides the immediate KPI proposal, we're also keen on exploring the development of a synthetic index using UMA to track the global performance of all Aragon DAO tokens.

## Technical Specification
To accomplish this upgrade, two changes need to be made:

- The ANT address, 0xa117000000f279d81a1d3cc75430faa017fa5a2e, needs to be added to the collateral currency whitelist introduced in UMIP-8.
- A final fee of 120 ANT needs to be added in the Store contract. The lowest price over the past 3 months for ANT is $2.7 so 160 ANT is a little bit of a buffer from the ~$400 needed.

## Rationale
Adding ANT as collateral to UMA protocol is a pre-requisite to being able to use ANT as collateral in a KPI option. 

## Implementation
This change has no implementation other than proposing the aforementioned governance transaction that will be proposed.

## Security considerations
Adding ANT as a collateral does not present any major foreseeable risks to the protocol.

The main implication is for contract deployers and users who are considering using contracts with ANT as the collateral currency. They should recognise and accept the volatility risk of using this asset, and ensure appropriate required collateralization ratios, as well as a network of liquidator and support bots to ensure solvency.

## Headers
- UMIP-tbd
- UMIP title: Approve XIO As Collateral Type | XIO Yield Dollar Creation
- Author: Anthony Scarpulla (anthony@blockzerolabs.io) and Krasimir Raykov (kraykov1994@gmail.com)
- Status:
- Created: March 23, 2021
- Discourse Link: <https://discourse.umaproject.org/t/umip-tbd-approve-xio-as-collateral-type/377>

## Summary (2-5 sentences)
Blockzero Labs proposes adding XIO as a collateral type to UMA Protocol in order to create an XIO Yield Dollar. The XIO Yield Dollar would play a pivotal role in our upcoming UMA DeFi Accelerator, where participants would be incentivized during a “Synthetic Mining” competition to mine for the XIO Yield Dollar. The underlying goals are to increase UMA TVL and to help onboard new users into the UMA ecosystem.

The first step in this process simply involves adding XIO as a collateral type. The second step will involve establishing a front-end UI for the minting of the XIO Yield Dollar.

## Motivation
Adding XIO as a collateral type is required in order to be able to create the XIO Yield Dollar, collateralised by XIO - the primary token of Blockzero Labs. As mentioned above, the XIO Yield Dollar would play a pivotal role in our upcoming UMA DeFi Accelerator (launching on April 1st, 2021).

Blockzero Labs is crypto’s first community-driven token studio. From logo to launch, we build experimental tokens with our community. Our first project, Flashstake (current market cap of $4.8M), launched on January 1st, and the second, AquaFi, is due to arrive in April 2021.

Blockzero Labs has been active for over 2 years, with a current market cap of $8.9M. Liquidity in our XIO/ETH pool on Uniswap has grown every quarter since its inception in May of 2020, and it currently stands at over $6.3M. It is one of the most decentralized pools on the platform, with the largest single holder owning only 6% of the liquidity pool, amongst a total of 661 LP token holders. The XIO/ETH pool’s liquidity ranking on Uniswap is currently #112.

There are two primary roles for the XIO token within the Blockzero Labs ecosystem. First, the token acts as a governance token which allows community members (Citizens) to vote on important topics and decisions. Second, the XIO token acts as a redemption mechanism for future Blockzero assets. Holding XIO gives users the ability to access and claim alternative tokens. In the future, the XIO token will also be the primary governance token for the Blockzero Index (Treasury).

Our team comprises over 22 core members, and we boast a wider community of over 8,000 dedicated community members we call “Citizens.” We take pride in being one of the most open and transparent communities in crypto, as evidenced by our regular Youtube livestreams, AMAs and open discussions, and high-quality engagement across our Social Forum and Telegram channels.

We are dedicated to consistent innovation and ideation within the DeFi space, and future projects may encompass the likes of: a deflationary DEX, DeFi insurance, tokenized yield swaps, and the creation of a Blockzero Index (Treasury). All of this is to say that we are extremely optimistic around the role that we can play in the greater DeFi/crypto ecosystem in the months and years to come.

UMA Accelerator Motivation & Overview:

Over the course of one month (April 1st-30th, 2021), Blockzero will launch three unique campaigns designed to drive education, engagement and adoption of UMA’s various protocols and dapps. Within each phase, there will be an increasing amount of $XIO available to be earned by participants, as well as a varying amount of UMA’s KPI Options.

More specifically, $35K USD worth of XIO and 1,400 of UMA’s KPI Options would be used to incentivize users to acquire and hold synthetic tokens during a “Synthetic Mining” competition during Phase 3 of our Accelerator campaign, with the potential “XIO Yield Dollar” being one of the main assets users would be incentivized to interact with.

We see this as an innovative method of growing both the Blockzero and UMA communities alike, mainly by educating, incentivizing and onboarding users into the UMA ecosystem. A final outline of this program will be released via our Medium on March 25th, 2021.

## Technical Specification
To accomplish this upgrade, two changes need to be made:

- The XIO address, 0x0f7F961648aE6Db43C75663aC7E5414Eb79b5704, needs to be added to the collateral currency whitelist introduced in UMIP-8.
- A final fee of 1500 $XIO needs to be added in the Store contract. This is approximately $500 at current XIO rates.

## Rationale
Adding XIO as collateral to UMA protocol is a prerequisite to being able to use XIO as collateral, and to create a XIO Yield Dollar.


## Implementation
This change has no implementation other than proposing the aforementioned governance transaction that will be proposed.

## Security considerations
Adding XIO as a collateral does not present any major foreseeable risks to the protocol.

The main implication is for contract deployers and users who are considering using contracts with XIO as the collateral currency. They should recognize and accept the volatility risk of using this asset, and ensure appropriate required collateralization ratios, as well as a network of liquidators and support bots to ensure solvency.

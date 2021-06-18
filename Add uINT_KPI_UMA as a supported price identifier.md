## Headers

| **UMIP #** *Leave blank - an UMIP no will be assigned at proposal stage*
              
| ------------------- | ------------------------------------------------------------- |
| **UMIP Title**          | **Add** *uINT_KPI_UMA* **as a supported price identifier**|
| **Authors**             | *Brittany Madruga (brittany.madruga@gmail.com*                                                      |
| **Status**              | **Draft**                                                         |
| **Created**             | *06/08/2021*                                             |
| **Discourse Link**      | *Insert link to discourse topic  **after**  it has been moved into draft UMIPs_*            |

# Summary 

**The DVM should support requests for** UMA protocol integrations.

Key Performance Indicator(KPI) options are synthetic tokens that redeem to protocol tokens with the redemption value determined by performance against that indicator. One example of a KPI metric is Integrations. Integrations serve to measure the activity of the protocol rather than assigning all of the value to the dollar amount generated by the protocol, as previously seen in UMA’s TVL KPI option. 

This UMIP enables the DVM to support price requests based on the number of qualifying integrations that occur during a specified timeline.

A synthetic option is minted against a base collateral, in this case UMA, which expires at 23:59:59 (UTC) September 30th 2021. 


# Motivation

The primary motivation for the development of KPI options is to allow protocols to incentivize Defi users to assist them to reach the protocol's identified targets by leveraging their community resources by sharing their value with their community members.

Using integrations as a key metric directly benefits the UMA protocol because it encourages the community to build relationships in the broader DeFi community with the intention of providing tools that may be useful to teams who are currently unaware of what UMA has to offer. This creates a win-win across the board because it allows us to showcase our products and our products can then help other protocols to complete their goals. 

By establishing the terms of a qualifying integration, it allows for the community to reach out in a way that aligns with the current priorities of the UMA protocol- attracting attention to our strongest products and encouraging teams to test out a wide variety of use cases.


**It is anticipated that this Price Identifier will be used to create KPI Options, however it is acknowledged that it may be used for a variety of purposes.**

# Data Specifications

Voters should assess the status of deployed contracts using (insert link to UMAverse dashboard?). For an integration to be displayed on the UMAverse dashboard, it must meet the following criteria:

Any contract that falls into one of the categories listed below that has been funded with at least $10,000 of value. 
* Call or Put options
* KPI options
* Range Bonds
* Integration with Optimistic Oracle
* Long/Short Pair (LSP) Contract

Note: a contract that has been launched and funded by UMA will not count. However, a contract launched by UMA but funded by an external party does count.

The applied timeframe for this UMIP will be between 1622505600 and 1633046399, meaning that all qualifying integrations launched during this timeframe should be counted. 

**DVM Discretion** 

The UMAverse dashboard should not be considered the *only* source of truth. The DVM has the ability and responsibility to challenge the validity of any integration that has been included or excluded from the UMAverse dashboard if the broader consensus is that it is within the spirit of this UMIP to do so. 

This UMIP is meant to identify integrations with UMA that are good faith experiments and product launches, as a way to gauge DeFi community engagement with the protocol. Some qualitative indicators of a valid integration (as opposed to a manipulative one) are:
* Governance proposals discussing and approving a particular product launch
* A properly funded contract that remains in place for longer than 30 days
* Discussion within the UMA discord surrounding interest and strategy for a product launch.

This list is by no means all-inclusinve, but rather a reference point for the DVM if any ambiguities or challenges should come up. Any and all questions surrounding the validity of an integration can be brought up in further detail in the voting channel on the UMA discord. 
# Technical Specifications

- **Price identifier name:**  *uINT_KPI_UMA*
- **Base: Number of qualified integrations
- **There is no quote currency in this option, as design feature. The collateral redemption is tied to the** *number of qualified integrations* **by design**
 - **Intended Collateral Currency** *UMA*.
- **Rounding:** *Round to 4 decimal places* 
 - If the value returned is greater than 1.2000, round down to 1.2000 to provide a ceiling price.
 

# Rationale

Specifics of this design were chosen to establish a minimum payout that will definitely occur, with the maximum payout being within reach. One idea behind this is that if we make sure we can reach our KPI, then we can turn around and launch another before this one expires to keep that positive momentum going strong. 

* Variable scaling is set up to reward implementations that occur before launch (between June 1 and launch date), but to provide the highest incentive to go out and get new integrations at the start of launch date. It also decreases the rate of reward after the intended payout threshold to create a plateau rather than running into a hard stop at the ceiling. 

* The decision to stick to the listed product types was made in order to bring focus to the products we want to push the most at this time.
* Setting it up to allow for all qualified launches to be counted throughout the period rather than just at the time of expiry helps to ensure that we are not missing out on any integrations that might expire before the KPI option does. 
* Choosing a starting timestamp of June 1 helps to reward the community for the integrations they have already started on and help keep momentum going while the current KPI expires. 
* In order to reward the extra work that goes into larger integrations, any qualifying integration valued over $1 million will be worth 2 integrations. 


# Implementation

Step 1: Assess all contracts launched in the timeframe listed above (not sure yet how to do that, open to feedback on alternative "price feeds" if any should be included beyond the UMAverse dashboard).

Step 2: Assign 1 point for qualifying integrations, and 0 points for non-qualifying integrations. If a qualifying integration is worth $1 million or more, assign 2 points. 

Step 3: Add up the total number of points assigned to qualifying integrations. This total number of points will be used in the following step.

Step 4: Determine the value of 1 uINT token (in UMA) by increasing the value of the uINT token (starting at 0) incrementally according to the following amounts:

* 0.0167 for the first 10 points.
* 0.0583 for the next 15 points.
* 0.0417 for the next 3 points.
* 0.0167 for any points beyond that.

Step 5: return the appropriate value (in UMA) per uINT that corresponds to the total number of points tallied. If value returned is greater than 1.2000, return 1.2000.

Example: if a voter establishes a tally of 12 points, they would say that 1uINT = (5 x 0.0167) + (7 x 0.0583) = 0.4917 UMA. 

# Security Considerations

How could metric manipulation occur?

* By establishing a minimum value for qualifying integrations, it ensures that the cost of manipulation is higher than the possible reward for doing so. Additionally, the DVM voters have the ability to determine if it appears that someone is acting maliciously and can disqualify any integrations that majority believe should not be included.

How could this price ID be exploited?

* I’m not sure it can be, since it is based on the definition of the metric. Thoughts?

Do the instructions for determining the price provide people with enough certainty?

* Yes.
	
Are there any current or future possible concerns with the way the price identifier is defined?

* It could be determined that the scaling is not appropriate in the event of overwhelming failure of the option. This would happen if we achieved too few integrations or if we had an unexpected number of integrations from one particular team. The latter can be remedied by the voting power of the DVM, as discussed above. 
* Additionally, there is the potential for ambiguities to present that have not been considered at the time of writing. In this case it will be up to the DVM to determine the resolution of those ambiguities. We anticipate hitting the ceiling, so it is possible that any ambiguities that arise will be non-significant. 
* It is possible that over the course of the KPI option, UMA could determine there are other products they would like to prioritize that are not defined in this UMIP. In that case, another KPI option can be launched to include that product.

Are there any concerns around if the price identifier implementation is deterministic?

* No?
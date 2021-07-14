## Headers

| UMIP                |                                                               |
| ------------------- | ------------------------------------------------------------- |
| UMIP Title          | Add **General KPI options* as a supported price identifier |
| Authors             | **Chandler De Kock** **Reinis Martinsons**                                                           |
| Status              | Draft                                                         |
| Created             | **14 July**                                              |
| Discourse Link      | **Create a post in [UMA's Discourse](https://discourse.umaproject.org/c/umips/18) and link here**            |

## Summary
`General KPI Price Identifier` will allow any team to use the KPI identifier to track any verifiable key performance metric a team would want to create KPI options for. Ancillary data will guide voters to reach the KPI result correctly.

This UMIP outlines the critical considerations for any user of this identifier. The user acknowledges that extra steps are required to use the identifier for their specific KPI to resolve at expiry.

## Motivation
Price (or data) Identifiers for KPI options tend to be project-specific, time sensitive, and not reusable identifiers for other projects to make use of. Instead, this identifier sets a general standard for all metric-based feeds and removes the need to create individual proposals for KPI identifiers. 

The user of the General KPI Price Identifier is intended to have their project report their specific metric themselves in the interest of incentivizing their users.

## Data Specification
Since the project running KPI options is expected to provide some visibility on the target metric, it is reasonable to assume that the user of the `General KPI Price Identifier` provides an endpoint for serving this data. The role of UMA DVM would be to verify and deliver human judgment failover considering the linked source code of the end server and general target objectives and calculation methodology.

To accomplish this, the structure of the ancillary data will require these inputs:

- **Metric:**  short description reflecting the metric and units to be measured.
- **Endpoint:** -link to data endpoint that should return JSON key-value pair response including the metric at expiration.
- **Method:**  link to a descriptive source covering the objective and methodology for calculating a particular metric. This methodology should include how the calculation of the metric is measured. Links to repositories and explainer documentation are strongly recommended. Cleary articulate any post-processing required
- **Fallback:** (optional) - In the event of the end-point not working or reporting false outcomes, a fallback ensures that UMA token holders can arrive at the proper result. If the methodology source demonstrates a fallback alternative, this field can be optional. 

The data should also have the following accessibility requirements:

- Be open and freely queriable by UMA token holders
- Have the ability to reference the measure at any point in time historically, but specifically be able to report the contract expiry outcome.
- Have clear documentation of the reported figures
- Clear instructions on what processing is happening on the reported data. 

## Technical Implementation

TO DO
 
## Rationale

The technical implementation of this price feed is to allow flexibility for project teams to self-report their own KPI metric. Scalability at the cost of clarity and security trade-off occurs when off-loading the reporting requires externally. 
 
The user of this UMIP accepts responsibility to provide the information passed through via ancillary data is sufficient to resolve price requests. Suppose the user of the price identifier cannot give enough information for UMA token holders to determine the outcome. In that case, UMA token holders can expire the contract in a worthless state or a result that will deem the options to have a value of zero (or as close to zero as the terms allow). 

This UMIP also allows the use of KPI measures that may, in some part, rely on information that a trusted party may report. The assumption is that the party reporting the numbers is either trusted or has a vested interest in ensuring the accuracy of the price, but this is not guaranteed. As such, the voter follows i) the methodology outlined in the ancillary data, ii) the fall back alternative outlined in the ancillary data, iii) the most commonly agreed metric to measure a KPI (If and only if this measure is trusted). If none of these outcomes are achieved or the data source is corrupted then the options can be expired to zero (or as close to worthless). 

## Security considerations

This UMIP makes it easier for teams to launch their KPI options without having a pre-approved methodology. This opens the DVM to a potential situation where a price resolution may not be reached since the data is ambiguous or cannot be verified. This concern should be addressed by allowing price resolutions for this price identifier to return a no-answer resulting in the options expiring at as close to zero as possible. 

An additional security concern is that of manipulation by the controlling entity of the data. Since the creator of a KPI can also be the entity reporting the results, there can be a trusted intermediary involved. To ensure the integrity of the reported figures, each price request will require a link to the methodology of how the feed is being calculated. It should be noted that a price request may be sent without an viable method attached and will be up to the voters to discern the accuracy of the reported figures.

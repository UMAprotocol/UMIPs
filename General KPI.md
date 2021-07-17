## Headers

| UMIP                |                                                               |
| ------------------- | ------------------------------------------------------------- |
| UMIP Title          | Add **General KPI options* as a supported price identifier |
| Authors             | **Chandler De Kock** **Reinis Martinsons**                                                           |
| Status              | Draft                                                         |
| Created             | **14 July**                                              |
| Discourse Link      | **Create a post in [UMA's Discourse](https://discourse.umaproject.org/c/umips/18) and link here**            |

# Summary

`General KPI Price Identifier` will allow any team to use the KPI identifier to track any verifiable key performance metric a team would want to create KPI options for. Ancillary data will guide voters to reach the KPI result correctly.

This UMIP outlines the critical considerations for any user of this identifier. The user acknowledges that extra steps are required to use the identifier for their specific KPI to resolve at expiry.

# Motivation

Price (or data) Identifiers for KPI options tend to be project-specific, time sensitive, and not reusable identifiers for other projects to make use of. Instead, this identifier sets a general standard for all metric-based feeds and removes the need to create individual proposals for KPI identifiers. 

The user of the General KPI Price Identifier is intended to have their project report their specific metric themselves in the interest of incentivizing their users.

# Data Specifications

-----------------------------------------
- Price identifier name: General KPI Price Identifier
- Markets & Pairs: Should be described in the `Metric` parameter and detailed in the linked `Method` document from the ancillary data
- Example data providers: `Endpoint` parameter from the ancillary data
- Cost to use: Should be explained in the linked `Method` document from the ancillary data
- Real-time data update frequency: Not applicable for KPI options
- Historical data update frequency: Should be specified in the `Interval` parameter from the ancillary data

Since the project running KPI options is expected to provide some visibility on the target metric, it is reasonable to assume that the user of the `General KPI Price Identifier` provides an endpoint for serving this data. The role of UMA DVM would be to verify and deliver human judgment failover considering the linked source code of the end server and general target objectives and calculation methodology. Required data for setting project specific data should be provided through ancillary data.

The data should also have the following accessibility requirements:

- Be open and freely queryable by UMA token holders
- Have the ability to reference the measure at any point in time historically, but specifically be able to report the contract expiry outcome
- Have clear documentation of the reported figures
- Clear instructions on what processing is happening on the reported data
- Methodology document and source code for the data endpoint service should be hosted on platform providing full versioning history with the ability to detect whether any modifications have been made

# Technical Specifications

-----------------------------------------
- Price identifier name:  General KPI Price Identifier
- Base Currency: Determined by the `Metric` parameter from the ancillary data
- Quote Currency: NA
- Rounding: Determined by the linked document in the `Method` parameter from the ancillary data

## Ancillary Data Specifications

When converting ancillary data to UTF8 string it must contain price request parameters expressed as key-value pairs and delimited by ":", colons. The below listed key parameters will be used to instruct voters how to resolve a given price request for this identifier and request timestamp:

- `Metric`:  Short description reflecting the metric and units to be measured.
- `Endpoint`: Link to data endpoint that should return the `Metric` at request timestamp. The response format should comply with the linked document from the `Method` parameter. The data endpoint should either allow passing the timestamp as parameter or returned data should include timestamp value for each returned data point.
- `Method`:  Link to a descriptive source covering the objective and methodology for calculating a particular metric. This methodology should include how the calculation of the metric is measured. Links to repositories and explainer documentation are strongly recommended. Clearly articulate any post-processing required.
- `Fallback` (optional): In the event of the end-point not working or reporting false outcomes, a fallback ensures that UMA token holders can arrive at the proper result. If the methodology source demonstrates a fallback alternative, this field can be optional.
- `Key`: Which key value from the `Endpoint` response should be used by voters for further processing of the price request.
- `Interval`: This describes how request timestamps for pricing queries should be rounded and what is the granularity of historical data update frequency.
- `Aggregation` (optional): In case any time series data processing is required this describes processing method used (e.g. calculating TWAP, finding peak value, etc.) and also sets the start timestamp for such aggregation.
- `Rounding`: This is integer number defining how many digits should be left to the right of decimal delimiter after rounding.
- `Scaling` (optional): This is integer number defining power of 10 scaling to be applied after rounding.

When designing the ancillary data KPI options deployer should be aware that the total size of ancillary data cannot exceed 8192 bytes also accounting for any ancillary data stamping by Optimistic Oracle. This limit would be checked by the LSP creator contract upon the deployment.

As an example, possible ancillary data for Aragon v2 migration KPI options (as specified in [UMIP-81](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-81.md) is listed below if it was using `General KPI Price Identifier` instead:

```
Metric: Assets under management in USD migrated to v2 by qualified Aragon v1 DAOs by request timestamp, Endpoint: datafeed.aragon.org/organizations, Method: github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-81.md, Key: total, Interval: Updated each day at midnight, Rounding: -6
```
***Note:** UMIP-81 has been provided only as an illustration of possible `Method` document. In reality it should be more focused document developed by KPI launch team without going through UMIP approval process*

# Rationale

The technical implementation of this price feed is to allow flexibility for project teams to self-report their own KPI metric. Scalability at the cost of clarity and security trade-off occurs when off-loading the reporting requires externally. 
 
The user of this UMIP accepts responsibility to provide the information passed through via ancillary data is sufficient to resolve price requests. Suppose the user of the price identifier cannot give enough information for UMA token holders to determine the outcome. In that case, UMA token holders can expire the contract in a worthless state or a result that will deem the options to have a value of zero (or as close to zero as the terms allow). 

This UMIP also allows the use of KPI measures that may, in some part, rely on information that a trusted party may report. The assumption is that the party reporting the numbers is either trusted or has a vested interest in ensuring the accuracy of the price, but this is not guaranteed. As such, the voter follows i) the methodology outlined in the ancillary data, ii) the fall back alternative outlined in the ancillary data, iii) the most commonly agreed metric to measure a KPI (If and only if this measure is trusted). If none of these outcomes are achieved or the data source is corrupted then the options can be expired to zero (or as close to worthless). 

# Implementation

1. The value of this price identifier is determined by performing a GET request at the `Endpoint` parameter from the ancillary data of price request. Unless the data returned by the `Endpoint` already includes the `Metric` values across all required timestamps the voters should also pass the timestamp parameter to their GET request in the format following the instructions in the linked `Method` document.
When passing on the timestamp parameter or observing the returned time series data the voters should consider the price request timestamp and any required timestamp rounding as described in the `Interval` parameter from the ancillary data. The voters should take note of the returned `Key` value.
2. In case the optional `Aggregation` parameter is set in the ancillary data voters should also collect `Key` values across all timestamps at intervals set in the `Interval` parameter from the start timestamp (as provided in the `Aggregation` parameter) till the price request timestamp and perform any time series processing function described in the `Aggregation` parameter from the ancillary data. As a convenience, KPI options deployer might also provide the expected aggregated value in the `Endpoint` response, but voters are strongly advised to verify this value independently by performing time series processing defined in the `Aggregation` parameter.
3. If `Rounding` parameter from the ancillary data is non-negative then round the obtained `Key` value (or the result of its aggregation) leaving `Rounding` number of digits after the decimal delimiter. In case the `Rounding` parameter is negative then round to the nearest 10 to the power of absolute `Rounding` value. For example, if `Rounding` is -6 then one should round the value to the nearest million (10^6).
4. If `Scaling` parameter is passed in the ancillary data then multiply the rounded value with 10 to the power of `Scaling`. For example, `Scaling` value of 6 would multiply by 1 million while -3 would effectively divide by 1 thousand.
5. It is recommended to perform any additional post processing in the financial product library so that voters can focus on resolving the raw value of `Metric` in question. In case when the available financial product libraries are missing the required functionality and it is impractical to develop new library KPI options deployer might include additional post processing instructions that voters must perform in the linked `Method` document from the ancillary data.

Voters should ensure that their results do not differ from broad market consensus. In particular, voters should verify whether the `Endpoint` source code referenced in the linked `Method` document is consistent with the objective and methodology for calculating particular metric, as well as attempt to run the data service independently and check the accuracy of data provided by the `Endpoint` service. In the event of the `Endpoint` not working or reporting false outcomes voters should follow any fallback instructions found in the linked `Method` document or the optional `Fallback` parameter in the ancillary data.

Voters should also carefully follow any versioning history to the linked `Method` document and the `Endpoint` service source code. While it is possible that methodology and code could be improved over time in order to clarify any original oversight or fix bugs, voters should ensure that any changes are consistent with the original KPI options program launch objectives.

In case the ancillary data provided does not comply with the ancillary data specification in this price identifier (to the extent that voters are unable to reasonable figure out what are the intended values of the required parameters) or the linked `Method` document is ambiguous or incomplete with unclear or missing fallback method, the voters should resolve the price request as zero. Though, the linked `Method` document might include any other positive non-zero fallback value that the voters should return in case of any unresolvable ambiguity and voters should respect this fallback value to the extent it is clearly formulated in the linked `Method` document.

# Security considerations

This UMIP makes it easier for teams to launch their KPI options without having a pre-approved methodology. This opens the DVM to a potential situation where a price resolution may not be reached since the data is ambiguous or cannot be verified. This concern should be addressed by allowing price resolutions for this price identifier to return a no-answer resulting in the options expiring at as close to zero as possible.

An additional security concern is that of manipulation by the controlling entity of the data. Since the creator of a KPI can also be the entity reporting the results, there can be a trusted intermediary involved. To ensure the integrity of the reported figures, each price request will require a link to the methodology of how the feed is being calculated. It should be noted that a price request may be sent without a viable method attached and will be up to the voters to discern the accuracy of the reported figures.



## Headers

| UMIP-117            |                                                                                                        |
| ------------------- | ------------------------------------------------------------------------------------------------------ |
| UMIP Title          | Add General_KPI as a supported price identifier                                                        |
| Authors             | Chandler De Kock (chandler@umaproject.org), Reinis Martinsons (reinis@umaproject.org)                  |
| Status              | Last call                                                                                              |
| Created             | July 14, 2021                                                                                          |
| Discourse Link      | [UMA's Discourse](https://discourse.umaproject.org/t/create-general-kpi-options-price-identifier/1259) |

# Summary

`General_KPI` price identifier will allow any team to use the KPI identifier to track any verifiable key performance metric a team would want to create KPI options for. Ancillary data will guide voters to reach the KPI result correctly.

This UMIP outlines the critical considerations for any user of this identifier. The user acknowledges that extra steps are required to use the identifier for their specific KPI to resolve at expiry.

# Motivation

Price (or data) Identifiers for KPI options tend to be project-specific, time sensitive, and not reusable identifiers for other projects to make use of. Instead, this identifier sets a general standard for all metric-based feeds and removes the need to create individual proposals for KPI identifiers. 

The user of the `General_KPI` price identifier is intended to have their project report their specific metric themselves in the interest of incentivizing their users.

# Data Specifications

-----------------------------------------
- Price identifier name: General_KPI
- Markets & Pairs: Should be described in the `Metric` parameter and detailed in the linked `Method` document from the ancillary data
- Example data providers: `Endpoint` parameter from the ancillary data
- Cost to use: Should be explained in the linked `Method` document from the ancillary data
- Real-time data update frequency: Not applicable for KPI options
- Historical data update frequency: Should be specified in the `Interval` parameter from the ancillary data

Since the project running KPI options is expected to provide some visibility on the target metric, it is reasonable to assume that the user of the `General_KPI` price identifier provides an endpoint for serving this data. The role of UMA DVM would be to verify and deliver human judgment failover considering the linked source code of the end server and general target objectives and calculation methodology. Required data for setting project specific data should be provided through ancillary data.

The data should also have the following accessibility requirements:

- Be open and freely queryable by UMA token holders
- Have the ability to reference the measure at any point in time historically, but specifically be able to report the contract expiry outcome
- Have clear documentation of the reported figures
- Clear instructions on what processing is happening on the reported data
- Methodology document and source code for the data endpoint service should be hosted on platform providing full versioning history with the ability to detect whether any modifications have been made

# Technical Specifications

-----------------------------------------
- Price identifier name: General_KPI
- Base Currency: Determined by the `Metric` parameter from the ancillary data
- Quote Currency: NA
- Rounding: Determined by the `Rounding` parameter from the ancillary data

## Ancillary Data Specifications

When converting ancillary data to UTF8 string it must contain price request parameters expressed as a list of key-value pairs delimited by `,` (commas) and each key-value pair further delimited by `:` (colons). If a value should contain `,` or `:` characters, such value should be enclosed in double quotes. The below listed key parameters will be used to instruct voters how to resolve a given price request for this identifier and request timestamp:

- `Metric`: Short description reflecting the metric and units to be measured.
- `Endpoint`: Link to data endpoint that should return the `Metric` at request timestamp. The response format should comply with the linked document from the `Method` parameter. The data endpoint should either allow passing the timestamp as parameter or returned data should include timestamp value for each returned data point.
- `Method`: Link to a descriptive source covering the objective and methodology for calculating a particular metric. This methodology should include how the calculation of the metric is measured. Links to repositories and explainer documentation are strongly recommended. Clearly articulate any post-processing required.
- `Fallback` (optional): In the event of the end-point not working or reporting false outcomes, a fallback ensures that UMA token holders can arrive at the proper result. If the methodology source demonstrates a fallback alternative, this field can be optional.
- `Key`: Which key value from the `Endpoint` response should be used by voters for further processing of the price request.
- `Interval`: This describes how request timestamps for pricing queries should be rounded and what is the granularity of historical data update frequency.
- `Aggregation` (optional): In case any time series data processing is required this describes processing method used (e.g. calculating TWAP, finding peak value, etc.) and also sets the start timestamp for such aggregation.
- `Rounding`: This is integer number defining how many digits should be left to the right of decimal delimiter after rounding.
- `Scaling` (optional): This is integer number defining power of 10 scaling to be applied after rounding. This is not to be confused with additional scaling performed by voting dApp, and it is just an optional transformation for scaling reported metric from the `Endpoint` instead (e.g. transforming USD to billions of USD).
- `Unresolved` (optional): This is numeric value that voters should return for unresolvable price request (defaults to zero if omitted).

KPI options launcher can also add any arbitrary ancillary data fields as long as they are clearly documented in the linked `Method` document and voters are instructed on how to interpret them for price processing.

When designing the ancillary data KPI options deployer should be aware that the total size of ancillary data cannot exceed 8192 bytes also accounting for any ancillary data stamping by Optimistic Oracle. This limit would be checked by the LSP creator contract upon the deployment.

As an example, possible ancillary data for UMA TVL KPI options (as specified in [UMIP-65](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-65.md) is listed below if it was using `General_KPI` price identifier instead:

```
Metric:TVL in UMA financial contracts measured in billions of USD,
Endpoint:"https://api.umaproject.org/uma-tvl",
Method:"https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-65.md",
Key:currentTvl,
Interval:Updated every 10 minutes,
Rounding:-7,
Scaling:-9
```
Key-value pairs above are separated by newlines just for readability, but no newlines should be used in real application. When this ancillary data dictionary (without newlines) is stored as bytes, the result would be:
```
0x4d65747269633a54564c20696e20554d412066696e616e6369616c20636f6e747261637473206d6561737572656420696e2062696c6c696f6e73206f66205553442c456e64706f696e743a2268747470733a2f2f6170692e756d6170726f6a6563742e6f72672f756d612d74766c222c4d6574686f643a2268747470733a2f2f6769746875622e636f6d2f554d4170726f746f636f6c2f554d4950732f626c6f622f6d61737465722f554d4950732f756d69702d36352e6d64222c4b65793a63757272656e7454766c2c496e74657276616c3a55706461746564206576657279203130206d696e757465732c526f756e64696e673a2d372c5363616c696e673a2d39
```
As for another example, possible ancillary data to implement UMA protocol DAO integrations KPI options (as specified in [UMIP-112](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-112.md)) is listed below:

```
Metric:Number of qualifying UMA DAO integrations,
Endpoint:"https://api.umaproject.org/uma-dao-integrations",
Method:"https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-112.md",
Key:currentIntegrations,
Interval:Updated daily,
Rounding:2,
startTimestamp:1622527200,
maxBaseIntegrations:15,
maxBonusIntegrations:3,
bonusMinValue:"$1,000,000",
bonusIntegrationsMultiplier:3.00,
floorIntegrations:3
```

Again, key-value pairs above are separated by newlines just for readability. When this ancillary data dictionary (without newlines) is stored as bytes, the result would be:

```
0x4d65747269633a4e756d626572206f66207175616c696679696e6720554d412044414f20696e746567726174696f6e732c456e64706f696e743a2268747470733a2f2f6170692e756d6170726f6a6563742e6f72672f756d612d64616f2d696e746567726174696f6e73222c4d6574686f643a2268747470733a2f2f6769746875622e636f6d2f554d4170726f746f636f6c2f554d4950732f626c6f622f6d61737465722f554d4950732f756d69702d3131322e6d64222c4b65793a63757272656e74496e746567726174696f6e732c496e74657276616c3a55706461746564206461696c792c526f756e64696e673a322c737461727454696d657374616d703a313632323532373230302c6d617842617365496e746567726174696f6e733a31352c6d6178426f6e7573496e746567726174696f6e733a332c626f6e75734d696e56616c75653a2224312c3030302c303030222c626f6e7573496e746567726174696f6e734d756c7469706c6965723a332e30302c666c6f6f72496e746567726174696f6e733a33
```

***Note:** UMIP-65 and UMIP-112 have been provided only as an illustration of possible `Method` documents. In reality it should be more focused document developed by KPI launch team without going through UMIP approval process.*

# Rationale

The technical implementation of this price feed is to allow flexibility for project teams to self-report their own KPI metric. Scalability at the cost of clarity and security trade-off occurs when off-loading the reporting requires externally. 
 
The user of this UMIP accepts responsibility to provide the information passed through via ancillary data is sufficient to resolve price requests. Suppose the user of the price identifier cannot give enough information for UMA token holders to determine the outcome. In that case, UMA token holders can resolve the price request to zero (unless other non-zero unresolvable state value was provided in the ancillary data). The payout to long KPI option token recipients in unresolvable state would depend on actual financial product library (FPL) used, but for the most common [Linear LSP](https://github.com/UMAprotocol/protocol/blob/master/packages/core/contracts/financial-templates/common/financial-product-libraries/long-short-pair-libraries/LinearLongShortPairFinancialProductLibrary.sol) or [Binary LSP](https://github.com/UMAprotocol/protocol/blob/master/packages/core/contracts/financial-templates/common/financial-product-libraries/long-short-pair-libraries/BinaryOptionLongShortPairFinancialProductLibrary.sol) FPLs that would expire the long KPI option tokens in a worthless state.

This UMIP also allows the use of KPI measures that may, in some part, rely on information that a trusted party may report. The assumption is that the party reporting the numbers is either trusted or has a vested interest in ensuring the accuracy of the price, but this is not guaranteed. As such, the voter follows i) the methodology outlined in the ancillary data, ii) the fall back alternative outlined in the ancillary data, iii) the most commonly agreed metric to measure a KPI (If and only if this measure is trusted). If none of these outcomes are achieved or the data source is corrupted then the price can be resolved to predefined value (defaulting to zero). 

# Implementation

1. The value of this price identifier is determined by performing a GET request at the `Endpoint` parameter from the ancillary data of price request. Unless the data returned by the `Endpoint` already includes the `Metric` values across all required timestamps the voters should also pass the timestamp parameter to their GET request in the format following the instructions in the linked `Method` document.
When passing on the timestamp parameter or observing the returned time series data the voters should consider the price request timestamp and any required timestamp rounding as described in the `Interval` parameter from the ancillary data. The voters should take note of the returned `Key` value.
2. In case the optional `Aggregation` parameter is set in the ancillary data voters should also collect `Key` values across all timestamps at intervals set in the `Interval` parameter from the start timestamp (as provided in the `Aggregation` parameter) till the price request timestamp and perform any time series processing function described in the `Aggregation` parameter from the ancillary data. As a convenience, KPI options deployer might also provide the expected aggregated value in the `Endpoint` response, but voters are strongly advised to verify this value independently by performing time series processing defined in the `Aggregation` parameter.
3. If any additional ancillary data fields are documented in the linked `Method` document, voters should follow all instructions in this document based on actual additional ancillary data fields passed in the price request.
4. If `Rounding` parameter from the ancillary data is non-negative then round the obtained `Key` value (or the result of its aggregation) leaving `Rounding` number of digits after the decimal delimiter. In case the `Rounding` parameter is negative then round to the nearest 10 to the power of absolute `Rounding` value. For example, if `Rounding` is -6 then one should round the value to the nearest million (10^6).
5. If `Scaling` parameter is passed in the ancillary data then multiply the rounded value with 10 to the power of `Scaling`. For example, `Scaling` value of 6 would multiply by 1 million while -3 would effectively divide by 1 thousand.
6. It is recommended to perform any additional post processing in the financial product library so that voters can focus on resolving the raw value of `Metric` in question. In case when the available financial product libraries are missing the required functionality and it is impractical to develop new library KPI options deployer might include additional post processing instructions that voters must perform in the linked `Method` document from the ancillary data.

Voters should ensure that their results do not differ from broad market consensus. In particular, voters should verify whether the `Endpoint` source code referenced in the linked `Method` document is consistent with the objective and methodology for calculating particular metric, as well as attempt to run the data service independently and check the accuracy of data provided by the `Endpoint` service. In the event of the `Endpoint` not working or reporting false outcomes voters should follow any fallback instructions found in the linked `Method` document or the optional `Fallback` parameter in the ancillary data.

Voters should also carefully follow any versioning history to the linked `Method` document and the `Endpoint` service source code. While it is possible that methodology and code could be improved over time in order to clarify any original oversight or fix bugs, voters should ensure that any changes are consistent with the original KPI options program launch objectives.

In case the ancillary data provided does not comply with the ancillary data specification in this price identifier (to the extent that voters are unable to reasonably figure out what are the intended values of the required parameters) or the linked `Method` document is ambiguous or incomplete with unclear or missing fallback method, the voters should resolve the price request as zero. Though, the optionally passed `Unresolved` parameter in the ancillary data might set any other non-zero fallback value that the voters should return in case of any unresolvable ambiguity and voters should respect this fallback value to the extent it is unambiguously recognizable in the passed ancillary data.

# Security considerations

This UMIP makes it easier for teams to launch their KPI options without having a pre-approved methodology. This opens the DVM to a potential situation where a price resolution may not be reached since the data is ambiguous or cannot be verified. This concern is addressed by allowing price resolutions for this price identifier to return a predefined value (defaulting to zero).

An additional security concern is that of manipulation by the controlling entity of the data. Since the creator of a KPI can also be the entity reporting the results, there can be a trusted intermediary involved. To ensure the integrity of the reported figures, each price request will require a link to the methodology of how the feed is being calculated. It should be noted that a price request may be sent without a viable method attached and will be up to the voters to discern the accuracy of the reported figures.



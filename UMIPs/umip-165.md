## Headers

| UMIP-165                |                                                               |
| ------------------- | ------------------------------------------------------------- |
| UMIP Title          | Add `NUMERICAL` as a supported data identifier |
| Authors             | John Shutt                                                     |
| Status              | Approved                                                         |
| Created             | July 18, 2022                                              |

# Summary 

The DVM should support data requests for the `NUMERICAL` data identifier. `NUMERICAL` is intended to be used with ancillary data to allow anyone to request an answer to a question with a numerical answer from UMA governance. This UMIP does not attempt to put any other restrictions on the content of the query, and instead leaves construction of the query up to the requester within ancillary data.

Data settlement can happen in four ways:
- Return the correct numerical value to answer the question in ancillary data, if the question can be resolved.
- Return the `unresolvable` value from ancillary data if the answer cannot be determined.
- Return the `tooEarly` value if the answer cannot be determined AND there is either an `earlyExpiration:1` key value pair present in ancillary data, or there is a specific last possible request timestamp listed or implied in the ancillary data question and the active data request timestamp falls before that. 

# Motivation

Similar to `YES_OR_NO_QUERY`, approving this data identifier will allow for a variety of products without the burden of having to vote in additional data identifiers. Unlike `YES_OR_NO_QUERY`, this identifier allows the DVM to return any number value as an answer depending on actual outcomes, rather than one of two pre-defined answers.

# Data Specifications 

It is not possible to define specific data sources or markets for this identifier. Determination of data sources and results are left entirely up to voters at the time of settlement, as the best method of determining the results for each request will depend on the question being asked.

# Data Feed Implementation

No data feed is needed (or possible) for this data identifier.

# Technical Specifications

-----------------------------------------
- Data identifier name: NUMERICAL
- Base Currency: NA
- Quote Currency: NA
- Rounding: NA
- Estimated current value of data identifier: NA

## Ancillary Data Specifications

When converted from bytes to UTF-8, the ancillary data should be a dictionary object containing `q` (question) and `unresolvable` keys and values. Optionally, you may include `tooEarly` and `earlyExpiration` keys and values.

```
q:"What was the total number of points scored by the Dallas Mavericks in their game against the Miami Heat January 6th, 2022?", unresolvable:0.5, tooEarly:-57896044618658097711785492504343953926634992332820282019728.792003956564819968, earlyExpiration:1
```

The q value should contain the question that UMA voters should answer with. 

When this ancillary data dictionary is stored as bytes, the result would be: `0x713a2257686174207761732074686520746f74616c206e756d626572206f6620706f696e74732073636f726564206279207468652044616c6c6173204d6176657269636b7320696e2074686569722067616d6520616761696e737420746865204d69616d692048656174204a616e75617279203674682c20323032323f222c20756e7265736f6c7661626c653a302e352c20746f6f4561726c793a2d35373839363034343631383635383039373731313738353439323530343334333935333932363633343939323333323832303238323031393732382e3739323030333935363536343831393936382c206561726c7945787069726174696f6e3a31`

When returned, the values should be scaled by 1e18. Typically voter dapps in the UMA ecosystem abstract this scaling away from voters, so, more often than not, voters should input the values as they appear in the ancillary data. Data requestors should be mindful of this, and not scale their ancillary data inputs.

If there are no `unresolvable` or `tooEarly` values present, values should default to:
- `unresolvable`: 0.5
- `tooEarly`: -57896044618658097711785492504343953926634992332820282019728.792003956564819968

# Rationale

This construction sacrifices assurances of determinism in favor of greater data identifier flexibility. The places the burden of correct construction on data requesters, but, in return, allows for quicker and easier development without needing to pass through  UMA governance for each additional distinct query. This will allow for quite bespoke and speedy contract construction.

`tooEarly` is intended to be used for situations where it is not a given that the data request (or contract settlement) should even occur yet. An example of this would be the UMA event-based expiry LSP. A request to settle an event-based expiry LSP can be submitted at any time but if the question can not be resolved yet it should be ignored.

The default `tooEarly` value is the minimum int256 value and is used as a "magic number" to indicate that an event-based expiry request is invalid and the contract should continue as normal. For example, if the question is related to a basketball game on January 6th and a settlement request comes in on January 5th, the question can not be resolved yet, and voters should return the `tooEarly` value with the magic number to reject the settlement request. This value also moves the decimal place 18 spaces to the left, due to the default behavior of the UMA voting interface to scale input values to 18 decimals. After scaling by the interface, the value will be -57896044618658097711785492504343953926634992332820282019728792003956564819968

Notice that a `unresolvable` value would never be returned earlier than the final data request time noted in the ancillary data or the requesting contract's expiration timestamp and a `tooEarly` value would never be returned after that point. Consider an unresolvable question like, "Was the weather nice on January 6th, 2022?" If the question was asked on January 7th, 2022, you would return the `unresolvable` value. If the same question was asked on January 5th, 2022, you would return the `tooEarly` value.

# Implementation

1. Voters should decode the ancillary data and attempt to interpret the UTF-8 question.
2. Voters should first determine if this is an event-based expiry data request. This can either be designated in ancillary data by identifying that there is a key:value pair of `earlyExpiration:1` present, or by reading the question and determining that data request timestamp (if using the original `OptimisticOracle` contract) or the data proposal timestamp (if using `OptimisticOracleV2`) is earlier than the expected event resolution time noted in ancillary data.
3. If this is an event-based expiry data request, voters should first determine if the question in the ancillary data can be resolved definitively at this point in time. If not, voters should return the `tooEarly` value if there is one, and the default `tooEarly` value from `Ancillary Data Specifications` if there is not. If yes, the voters should continue the process to assess the question.
4. If UMA voters believe that the answer to the question can be resolved, they should return what they believe to be the correct numerical value to answer the question.
5. If a voter cannot make a determination about what the correct answer to the question is, or there is no question present, UMA voters should return the `unresolvable` value (in the example given, they would return `0.5`).
6. If there are no `tooEarly` or `unresolvable` values in the ancillary data, voters should use the default values listed in `Ancillary Data Specifications`.
7. If there is no ancillary data or it is not interpretable to UTF-8, voters should return 0.5.

# Security Considerations

This construction sacrifices assurances of determinism in favor of greater data identifier flexibility. Users of this data identifier should be careful to construct a question in a way that they can be sure that a deterministic outcome can be reached. 

There are also potential contract-level attacks that could result from people intentionally asking non-deterministic questions and using this to their advantage. As a rule, users of any contract that uses this data identifier should be sure to review the ancillary data used beforehand. 

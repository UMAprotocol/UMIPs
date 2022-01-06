## Headers

| UMIP-107                |                                                               |
| ------------------- | ------------------------------------------------------------- |
| UMIP Title          | Add `YES_OR_NO_QUERY` as a supported price identifier |
| Authors             | Sean Brown, Matthew Rice, John Shutt, Mhairi McAlpine                                                     |
| Status              | Approved                                                         |
| Created             | June 3rd, 2021                                              |
| [Discourse Link](https://discourse.umaproject.org/t/add-binary-query-tbd-name-as-a-supported-price-identifier/1161)      |             |

# Summary 

The DVM should support price requests for the `YES_OR_NO_QUERY` price identifier. `YES_OR_NO_QUERY` is intended to be used with ancillary data to allow anyone to request an answer to a "yes or no" question from UMA governance. This UMIP does not attempt to put any other restrictions on the content of the query, and instead leaves construction of the query up to the requester within ancillary data.

Price settlement can happen in four ways:
- Return the `p1` value from ancillary data if the answer is "NO".
- Return the `p2` value from ancillary data if the answer is "YES".
- Return the `p3` value from ancillary data if the answer cannot be determined.
- Return the `p4` value if the answer cannot be determined AND there is either an `earlyExpiration:1` key value pair present in ancillary data, or there is a specific last possible request timestamp listed in the ancillary data question and the active price request timestamp falls before that. 

# Motivation

Approving this price identifier will allow for a variety of products without the burden of having to vote in additional price identifiers. Users could create:
- Prediction markets
- Insurance products
- Binary options  

# Data Specifications 

It is not possible to define specific data sources or markets for this identifier. Determination of data sources and results are left entirely up to voters at the time of settlement, as the best method of determining the results for each request will depend on the question being asked.

# Price Feed Implementation

No price feed is needed (or possible) for this price identifier.

# Technical Specifications

-----------------------------------------
- Price identifier name: YES_OR_NO_QUERY
- Base Currency: NA
- Quote Currency: NA
- Rounding: None, there is a predetermined set of results.
- Estimated current value of price identifier: NA


## Ancillary Data Specifications

When converted from bytes to UTF-8, the ancillary data should be a dictionary object containing q (question), p1, p2, p3 and p4 keys and values. p4 is optional and will only apply in certain situations.

```
q:Did the Dallas Mavericks beat the Miami Heat January 6th, 2022?, p1:0, p2:1, p3:0.5, earlyExpiration:1
```

The q value should contain the question that UMA voters should answer with. 

When this ancillary data dictionary is stored as bytes, the result would be: `0x713a446964207468652044616c6c6173204d6176657269636b73206265617420746865204d69616d692048656174204a616e75617279203674682c20323032323f2c2070313a302c2070323a312c2070333a302e352c206561726c7945787069726174696f6e3a31`

When returned, the `p1-p3` values should be scaled by 1e18. Typically voter dapps in the UMA ecosystem abstract this scaling away from voters, so, more often than not, voters should input the values as they appear in the ancillary data. Price requestors should be mindful of this, and not scale their ancillary data inputs.

If there are no p1, p2, p3 or p4 values present, values should default to:
- p1: 0
- p2: 1
- p3: 0.5
- p4: -57896044618658097711785492504343953926634992332820282019728.792003956564819968

# Rationale

This construction sacrifices assurances of determinism in favor of greater price identifier flexibility. The places the burden of correct construction on price requesters, but, in return, allows for quicker and easier development without needing to pass through  UMA governance for each additional distinct query. This will allow for quite bespoke and speedy contract construction.

p4 is intended to be used for situations where it is not a given that the price request (or contract settlement) should even occur yet. An example of this would be the UMA event-based expiry LSP. A request to settle an event-based expiry LSP can be submitted at any time but if the question can not be resolved yet it should be ignored.

The default p4 value is the minimum int256 value and is used as a "magic number" to indicate that an event-based expiry request is invalid and the contract should continue as normal. For example, if the question is related to a basketball game on January 6th and a settlement request comes in on January 5th, the question can not be resolved yet, and voters should return the p4 value with the magic number to reject the settlement request. This value also moves the decimal place 18 spaces to the left, due to the default behavior of the UMA voting interface to scale input values to 18 decimals. After scaling by the interface, the value will be -57896044618658097711785492504343953926634992332820282019728792003956564819968

Notice that a p3 value would never be returned earlier than the final price request time noted in the ancillary data or the requesting contract's expiration timestamp and a p4 value would never be returned after that point. Consider an unresolvable question like, "Was the weather nice on January 6th, 2022?" If the question was asked on January 7th, 2022, you would return the p3 value. If the same question was asked on January 5th, 2022, you would return the p4 value.

# Implementation

1. Voters should decode the ancillary data and attempt to interpret the UTF-8 question.
2. Voters should first determine if this is an "early expiration" price request. This can either be designated in ancillary data by identifying that there is a key:value pair of `earlyExpiration:1` present, or by reading the question and determining that price request timestamp of the request is earlier than the final possible price request time noted in ancillary data.
3. If this is an "early expiration" price request, voters should first determine if the question in the ancillary data can be resolved definitively at this point in time. If not, voters should return the p4 value. If yes, the voters should continue the process to assess the question.
4. If UMA voters believes that the answer to the question is no, they should vote return the p1 value (in the example given, they would return `0`).
5. If UMA voters believe that the answer to the question is yes, they should return the p2 value (in the example given, they would return `1`).
6. If a voter cannot make a determination about what the correct answer to the question is, or there is no question present, UMA voters should return the p3 value (in the example given, they would return `0.5`).
7. If there are no p1, p2, p3, p4 values in the ancillary data, voters should use the default values listed in `Ancillary Data Specifications`.
8. If there is no ancillary data or it is not interpretable to UTF-8, voters should return 0.5.

# Security Considerations

This construction sacrifices assurances of determinism in favor of greater price identifier flexibility. Users of this price identifier should be careful to construct a question in a way that they can be sure that a deterministic outcome can be reached. 

There are also potential contract-level attacks that could result from people intentionally asking non-deterministic questions and using this to their advantage. As a rule, users of any contract that uses this price identifier should be sure to review the ancillary data used beforehand. 

## Headers

| UMIP                |                                                               |
| ------------------- | ------------------------------------------------------------- |
| UMIP Title          | Add `BINARY_QUERY` as a supported price identifier (need a better name) |
| Authors             | Sean Brown, Matthew Rice, John Shutt, Mhairi McAlpine                                                     |
| Status              | Draft                                                         |
| Created             | June 3rd, 2021                                              |
| [Discourse Link](https://discourse.umaproject.org/t/add-binary-query-tbd-name-as-a-supported-price-identifier/1161)      |             |

# Summary 

The DVM should support price requests for the `BINARY_QUERY` price identifier. `BINARY_QUERY` is intended to be used with ancillary data to allow anyone to request an answer to a "yes or no" question from UMA governance. This UMIP does not attempt to put any other restrictions on the content of the query, and instead leaves construction of the query up to the requester within ancillary data.

Settlement can happen in three ways:
- Return the `p1` value from ancillary data if the answer is "NO".
- Return the `p2` value from ancillary data if the answer is "YES".
- Return the `p3` value from ancillary data if the answer cannot be determined.

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
- Price identifier name: BINARY_QUERY
- Base Currency: NA
- Quote Currency: NA
- Rounding: None, there is a predetermined set of results.
- Estimated current value of price identifier: NA


## Ancillary Data Specifications

When converted from bytes to UTF-8, the ancillary data should be a dictionary object containing q (question), p1, p2 and p3 keys and values:

```
q:Did the Dallas Mavericks win the NBA Finals in 2021?, p1:0, p2:1, p3:0.5
```

The q value should contain the question that UMA voters should answer. 

When this ancillary data dictionary is stored as bytes, the result would be: `0x7175657374696f6e3a446964207468652044616c6c6173204d6176657269636b732077696e20746865204e42412046696e616c7320696e20323032313f`

# Rationale

This construction sacrifices assurances of determinism in favor of greater price identifier flexibility. The places the burden of correct construction on price requesters, but, in return, allows for quicker and easier development without needing to pass through  UMA governance for each additional distinct query. This will allow for quite bespoke and speedy contract construction.

# Implementation

1. Voters should decode the ancillary data and attempt to interpret the UTF-8 question.
2. If UMA voters believes that the answer to the question is no, they should vote return the p1 value (in the example given, they would return `0`).
3. If UMA voters believe that the answer to the question is yes, they should return the p2 value (in the example given, they would return `1`).
4. If a voter cannot make a determination about what the correct answer to the question is, or there is no question present, UMA voters should return 0.5.
5. If there are no p1, p2, p3 values in the ancillary data voters should use 0, 1, 0.5 respectively.
6. If there is no ancillary data or it is not interpretable to UTF-8, voters should return 0.5.

# Security Considerations

This construction sacrifices assurances of determinism in favor of greater price identifier flexibility. Users of this price identifier should be careful to construct a question in a way that they can be sure that a deterministic outcome can be reached. 

There are also potential contract-level attacks that could result from people intentionally asking non-deterministic questions and using this to their advantage. As a rule, users of any contract that uses this price identifier should be sure to review the ancillary data used beforehand. 
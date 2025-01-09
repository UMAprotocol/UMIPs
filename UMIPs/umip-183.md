## Headers

| UMIP-183            |                                                                   |
| ------------------- | -------------------------------------------------------------     |
| UMIP Title          | Add `MULTIPLE_VALUES` as a supported price identifier             |
| Authors             | Lee Poettcker                                                     |
| Status              | Approved                                                          |
| Created             | January 9, 2025                                                   |

# Summary 

The DVM should support OOV2 requests for the `MULTIPLE_VALUES` price identifier. `MULTIPLE_VALUES` is intended to allow for up to 7 unsigned 32 bit integers to be encoded into a single oracle price. The request should define the event, how to evaluate values for the event, and labels for all values requested. The oracle will return the values encoded into a single `int256` price that can be decoded by the integrating smart contract. The [oracle UI](https://oracle.uma.xyz) will handle all encoding and decoding for users and only display human readable values.

# Motivation
Currently sports betting platforms are making binary requests for multiple markets that are all settled based on the scores from a single sports game. This is unnecessary and costly. This UMIP will allow the OO to report the scores of two sports teams in one encoded price. Then integrators can decode the scores from the price and evaluate the scores to settle multiple markets. Sports games are the initial motivation for this UMIP, but it is generalizable to any request for multiple integer values from a single event.

# Data Specifications 

It is not possible to define specific data sources for this identifier. Data sources can be defined by the requester or left up to proposers, disputers and voters at the time of settlement. 

# Price Feed Implementation

No price feed is defined for this price identifier.

# Technical Specifications

-----------------------------------------
- Price identifier name: MULTIPLE_VALUES
- Base Currency: N/A
- Quote Currency: N/A
- Rounding: values encoded into the price must be unsigned integers
- Estimated current value of price identifier: N/A


# Ancillary Data Specifications
When converted from bytes to UTF-8, interpret the string as a stringified JSON object in the following form:

```ts
{
  // the title of the request
  title: string; 
  // description of the request
  description: string; 
  // Values will be encoded into the settled price in the same order as the provided Labels. The oracle UI will display each Label along with an input field. 7 Labels maximum.
  Labels: string[] 
}

```

Example ancillary data for a sports game:
```ts
{
    "title": "Los Angeles Lakers vs Boston Celtics",
    "description": "Final scores for the Los Angeles Lakers vs Boston Celtics NBA game scheduled for Jan 7, 2025.",
    "labels": [
            "Lakers",
            "Celtics"
     ]
}
```

# Rationale
This specification is not as compact as `YES_OR_NO` in terms of bytes used, but allows a more expressive format for proposers and improved user experience when interacting with the Oracle UI. With this specification requesters can easily validate their ancillary data using typescript, or a javascript runtime schema validator, giving them confidence that their data will be rendered correctly to end users.

# Implementation
Voters should decode the ancillary data to decipher the values requested and the order they should be encoded in. The values should be encoded into a `int256` response as per the following:

- The values should ordered as per the label array included in the decoded ancillary data and encoded as such:  
  ```ts
    Int256  
    | 32 bits  | 32 bits | 32 bits |...  
    | unused   | value0  | value1  |... | value6  |  
    | 224-255  | 192-223 | 160-191 |... |  0-31   |  
  ```
- Example Encoding:
  ```ts
    uint32 value0 = 107;  
    uint32 value1 = 133;  
    ...  
    uint32 value6 = 157;  
    int256 price = int256(uint256(value0)) << 192  |  int256(uint256(value1)) << 160 | … |  int256(uint256(value6))
  ```
- Example Decoding:  
  ```ts
  uint32 value0_decoded = uint32(uint256(price >> 192));  
  uint32 value1_decoded = uint32(uint256(price >> 160));  
  …  
  uint32 value6_decoded = uint32(uint256(price));
  ```

Other valid responses are:  
- **No answer possible**: if values can not be resolved (e.g. the specified event was cancelled) or encoded into a price as per the above (e.g. the ancillary data of the request specified more than 7 labels, any single value exceeds 32 bits) the request should resolve to `57896044618658097711785492504343953926634992332820282019728792003956564819967` or `type(int256).max`.  
- **Early answer**: if the request is marked as “event based expiry” and proposed before the game has expired, the request should resolve to `-57896044618658097711785492504343953926634992332820282019728792003956564819968` or `type(int256).min`


# Security Considerations

Encoding scores into a single response requires careful implementations by front-ends and technical users proposing directly to RPCs. Decoding price responses requires integrator smart contracts to carefully parse responses and ensure all possible int256 responses are handled safely and correctly.

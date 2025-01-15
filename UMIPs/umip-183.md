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
  labels: string[] 
}

```

Example ancillary data for a sports game:
```ts
{
    "title": "Los Angeles Lakers vs Boston Celtics",
    "description": `Final scores for the "Los Angeles Lakers" vs "Boston Celtics" NBA game scheduled for Jan 7, 2025.`,
    "labels": [
            "Lakers",
            "Celtics"
     ]
}
```

When converting UTF-8 stringified JSON to hex, all double quotes (") within the ancillary data must be escaped with a backslash (\) to ensure proper ancillary data parsing and support for automated verification.

For example, with the above JSON string the string to be converted to hex is:
```
'{\"title\":\"Los Angeles Lakers vs Boston Celtics\",\"description\":\"Final scores for the \\"Los Angeles Lakers\\" vs \\"Boston Celtics\\" NBA game scheduled for Jan 7, 2025.\",\"labels\":[\"Lakers\",\"Celtics\"]}'
```

The hex representation of the above string is:
```
0x7b227469746c65223a224c6f7320416e67656c6573204c616b65727320767320426f73746f6e2043656c74696373222c226465736372697074696f6e223a2246696e616c2073636f72657320666f7220746865205c224c6f7320416e67656c6573204c616b6572735c22207673205c22426f73746f6e2043656c746963735c22204e42412067616d65207363686564756c656420666f72204a616e20372c20323032352e222c226c6162656c73223a5b224c616b657273222c2243656c74696373225d7d
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

If there are fewer than 7 labels provided, the values should be encoded starting with the most significant positions, leaving the least significant positions unused. The unused positions must be set to zero. Any non-zero values present in these unused positions will render the price invalid.

Other valid responses are:  
- **No answer possible**: Voters should resolve the request to `57896044618658097711785492504343953926634992332820282019728792003956564819967` or `type(int256).max` if any of the following conditions are met:
  - The event cannot be resolved (e.g., it was canceled).
  - The price cannot be encoded as specified (e.g., more than 7 labels, any value exceeds 32 bits).
  - The ancillary data is invalid JSON or does not match the specified TypeScript schema. However, voters should attempt to decode and interpret the ancillary data, and ignoring any data beyond the last closing bracket (}) is acceptable to properly parse the JSON.
- **Early answer**: if the request is marked as “event based expiry” and proposed before the game has expired, the request should resolve to `-57896044618658097711785492504343953926634992332820282019728792003956564819968` or `type(int256).min`


# Security Considerations

Encoding scores into a single response requires careful implementations by front-ends and technical users proposing directly to RPCs. Decoding price responses requires integrator smart contracts to carefully parse responses and ensure all possible int256 responses are handled safely and correctly.

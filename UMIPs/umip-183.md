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

- Price identifier name: MULTIPLE_VALUES
- Base Currency: N/A
- Quote Currency: N/A
- Rounding: values encoded into the price must be unsigned integers
- Estimated current value of price identifier: N/A


# Ancillary Data Specifications
When converted from bytes to UTF-8, the ancillary data must be a valid stringified JSON object in the following form:

```ts
{
  // the title of the request
  title: string; 
  // description of the request
  description: string; 
  // Values will be encoded into the settled price in the same order as the provided Labels. The oracle UI will display each label along with an input field. 7 labels maximum.
  labels: string[];
}

```

Example of a correctly formatted stringified JSON object:
```
{"title":"Los Angeles Lakers vs Boston Celtics","description":"Final scores for the \"Los Angeles Lakers\" vs \"Boston Celtics\" NBA game scheduled for Jan 7, 2025.","labels":["Lakers","Celtics"]}
```

The hex representation of the above string is:
```
0x7b227469746c65223a224c6f7320416e67656c6573204c616b65727320767320426f73746f6e2043656c74696373222c226465736372697074696f6e223a2246696e616c2073636f72657320666f7220746865205c224c6f7320416e67656c6573204c616b6572735c22207673205c22426f73746f6e2043656c746963735c22204e42412067616d65207363686564756c656420666f72204a616e20372c20323032352e222c226c6162656c73223a5b224c616b657273222c2243656c74696373225d7d
```

# Rationale
This specification is not as compact as `YES_OR_NO` in terms of bytes used, but allows a more expressive format for proposers and improved user experience when interacting with the Oracle UI. With this specification requesters can easily validate their ancillary data using typescript, or a javascript runtime schema validator, giving them confidence that their data will be rendered correctly to end users.

# Implementation
Voters should decode the ancillary data to decipher the values requested and the order they should be encoded in. The values should be encoded into a `int256` response as per the following:

- The values should ordered as per the indexing from label array included in the decoded ancillary data and encoded as such:  
  ```ts
    Int256  
    | 32 bits  | 32 bits | 32 bits |... | 32 bits |
    | unused   | value6  | value5  |... | value0  |  
    | 224-255  | 192-223 | 160-191 |... |  0-31   |  
  ```

For each label provided in the `labels` array, its corresponding value (if present) is encoded into the following bit ranges:
- The **first label** (`labels[0]`) corresponds to the first 32 bits (bits 0–31).
- The **second label** (`labels[1]`) corresponds to the next 32 bits (bits 32–63).
- This pattern continues up to the **seventh label** (`labels[6]`), which corresponds to bits 192–223.

If there are fewer than 7 labels provided, the values should be encoded starting with the least significant positions, leaving the most significant positions unused. The unused positions must be set to zero. Any non-zero values present in these unused positions will render the price invalid. The most significant 32 bits are always unused to prevent collisions with the other valid responses below.

Other valid price responses are:  
- **No answer possible**: Voters should resolve the request to `57896044618658097711785492504343953926634992332820282019728792003956564819967` or `type(int256).max` if any of the following conditions are met:
  - The event cannot be resolved (e.g., it was canceled).
  - The price cannot be encoded as specified (e.g., more than 7 labels, any value exceeds 32 bits).
  - The ancillary data is invalid JSON or does not match the specified TypeScript schema. However, voters should attempt to decode and interpret the ancillary data, and ignoring any data beyond the last closing bracket (}) is acceptable to properly parse the JSON.
- **Early answer**: if the request is marked as “event based expiry” and proposed before the game has expired, the request should resolve to `-57896044618658097711785492504343953926634992332820282019728792003956564819968` or `type(int256).min`

Note: when decoding a price, to prevent misinterpretation prices should first be checked against the special values above before decoding into individual values.
  
- Example Encoding in Solidity:
  ```solidity
    function encodeValues(uint32[] memory values)
        external
        pure
        returns (int256 encodedPrice)
    {
        require(values.length <= 7, "Maximum of 7 values allowed");

        for (uint256 i = 0; i < values.length; i++) {
            encodedPrice |= int256(uint256(values[i])) << (32 * i);
        }
    }
  ```
- Example Encoding in Javascript:
  ```js
  function encodeValues(values: number[]): bigint {
    if (values.length > 7) {
      throw new Error("Maximum of 7 values allowed");
    }

    let encodedPrice = BigInt(0);

    for (let i = 0; i < values.length; i++) {
      if (!Number.isInteger(values[i])) {
        throw new Error("All values must be integers");
      }
      if (values[i] > 0xffffffff || values[i] < 0) {
        throw new Error("Values must be uint32 (0 <= value <= 2^32 - 1)");
      }
      encodedPrice |= BigInt(values[i]) << BigInt(32 * i);
    }

    return encodedPrice;
  }

  ```
- Example Decoding in Solidity:  
  ```solidity
  function isTooEarly(int256 price) external pure returns (bool) {
        return price == type(int256).min ? true : false;
  }
  function isUnresolvable(int256 price) external pure returns (bool) {
        return price == type(int256).max ? true : false;
  }
  function decodePriceAtIndex(int256 encodedPrice, uint256 index)
        external
        pure
        returns (uint32 decodedValue)
  {
        require(index < 7, "Index out of range");
        decodedValue = uint32(uint256(encodedPrice >> (32 * index)));
  }
  ```
- Example Decoding in Javascript:
  ```js
  function isTooEarly(price: bigint): boolean {
    const MIN_INT256 = -(BigInt(2) ** BigInt(255));
    return price === MIN_INT256;
  }

  function isUnresolvable(price: bigint): boolean {
    const MAX_INT256 = (BigInt(2) ** BigInt(255)) - BigInt(1);
    return price === MAX_INT256;
  }

  function decodePriceAtIndex(encodedPrice: bigint, index: number): number {
    if (index < 0 || index > 6) {
      throw new Error("Index out of range");
    }
    return Number((encodedPrice >> BigInt(32 * index)) & BigInt(0xFFFFFFFF));
  }
  ```
- For example, encoding the following values:
  [0, 1, 2, 3, 4, 5, 6],
  results in the following price:
  37662610419627592771030380598185861001628732695723288559616
  

# Security Considerations

Encoding scores into a single response requires careful implementations by front-ends and technical users proposing directly to RPCs. Decoding price responses requires integrator smart contracts to carefully parse responses and ensure all possible int256 responses are handled safely and correctly.

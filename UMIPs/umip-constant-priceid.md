# Headers

| UMIP-XYZ | |
|---------|-|
| UMIP Title | Add CONSTANT as a price identifier |
| Authors | Sean Brown (@smb2796) |
| Status | Draft |
| Created | 04/21/21 |
| Discourse | |

# Summary

The DVM should support price requests for a CONSTANT price identifier. CONSTANT will always return the value, that is specified in the ancillary data passed along with the price request, or default to a value of "1" if no ancillary data is used.

# Motivation

For some financial products, it is useful to have a price identifier that simply returns a constant number. As an example, UMA's KPI options always need to be worth 2 UMA before expiry. This can also be accomplished in other ways - like using a financial product library - but for some contract deployers it may be easier to not need to deploy a custom library and instead just set their price by using this price identifier.

This constant identifier will also be the first price identifier to reference ancillary data.

# Markets & Data Sources

None. This price identifier is just a constant and does not refer to any market.

# PRICE FEED IMPLEMENTATION

This price identifier will use the [ExpressionPriceFeed](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/ExpressionPriceFeed.js). To use ancillary data with this price identifier, a features will need to be added to the price feeds to allow for the decoding and use of ancillary data. Since this price identifier can be used without ancillary data, it should not be blocked by the lack of ancillary data functionality in the price feeds.

# TECHNICAL SPECIFICATIONS

- Price Identifier Name: CONSTANT
- Base Currency: NA
- Quote currency: NA
- Rounding: No rounding is necessary. The value returned should always be exactly equal to the value passed in ancillary data, or equal to 1 if no ancillary data is used.


When converted from bytes to UTF-8, accompanying ancillary data should follow this format:
```
constant:2
```

2 should be replaced with the constant value that the contract deployer wants to use.

When stored as bytes, the example above would be: 0x636f6e7374616e743a32.

# RATIONALE
No rationale is needed. The motivation for this price identifier is explained in `motivation` and there is no plausible alternative for how to return a constant value.
	
# IMPLEMENTATION

1. Look at the price request and get the ancillary data.
2. Decode the ancillary data from bytes to UTF-8.
3. If no ancillary data is provided, or there is ancillary data but it cannot be converted to the format in `Technical Specifications`, return 1. 
4. If there is ancillary data that maps to the constant:value format, return the `constant` value.

# SECURITY CONSIDERATIONS

Adding this price identifier poses no risk to the UMA system. Since there should be no inconsistency in the result that should be returned, there is no risk of lack of determinism in this approach, as long as the price requester specifies their ancillary data correctly. 
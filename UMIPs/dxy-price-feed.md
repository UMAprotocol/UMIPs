## Headers

| UMIP-XXX; DXY Feed            |                                                      |
| ------------------- | ---------------------------------------------------- |
| UMIP Title          | Add DXY as a supported price identifier |
| Authors             | ???                                             |
| Status              | In-progress                                            |
| Created             | ???    |



# Summary

The DVM should support price requests for the [US Dollar Index](https://en.wikipedia.org/wiki/U.S._Dollar_Index) (DXY).

The canonical identifier should be `DXY`.

# Motivation

Adding DXY would allow synthetic assets for the US Dollar Index to be created, which would in turn allow various derivatives to be built on top of this token.

DXY is a well-defined and publicly accessible metric, and so will be trivial to resolve by the Oracle.

# Data Specifications

- Price identifier name: DXY

- Example data providers:
    - https://www.tradingview.com/symbols/TVC-DXY/
    - https://www.marketwatch.com/investing/index/dxy

- Real-time data update frequency:
    - Daily

# Price feed implementation

[implementation](https://github.com/Signo-App/uma-protocol/blob/new-price-feed/packages/financial-templates-lib/src/price-feed/MarketStackPriceFeed.ts)

# Technical Specifications

- Price identifier name: DXY
- Rounding: Round to 3 decimal places (4th decimal place digit >= 5 rounds up and < 5 rounds down)
- Estimated current value of price identifier: 106.534 (17 Aug 2022 09:19 UTC)

# Rationale

TODO

Rationale should explain why the particular above technical specifications were chosen.

# Implementation

TODO

How exactly should voters determine the price when they have to do so?

# Security considerations

The inclusion of this requested price identifier should not present a security concern for DVM.

TODO: are there more?
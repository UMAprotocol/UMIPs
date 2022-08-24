## Headers

| DXY Feed            |                                                      |
| ------------------- | ---------------------------------------------------- |
| UMIP Title          | Add **DXY** as a supported price identifier |
| Authors             | Sumero                                             |
| Status              | Draft                                            |
| Created             | 2022.8.24    |
| Discourse Link      |             |

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

Implemented as a price feed "plugin" [here](https://github.com/Signo-App/uma-protocol/blob/new-price-feed/packages/financial-templates-lib/src/price-feed/MarketStackPriceFeed.ts). Uses the MarketStack platform.

# Technical Specifications

- Price identifier name: DXY
- Rounding: Round to 3 decimal places (4th decimal place digit >= 5 rounds up and < 5 rounds down)
- Estimated current value of price identifier: 106.534 (17 Aug 2022 09:19 UTC)

# Rationale

DXY is a calculated index that is very difficult to manipulate in the short term without exhorbitant cost, so no TWAP is needed.

We chose to use the daily open price, updated daily, because this is easier to fetch via various APIs for historical data.

# Implementation

Voters should first determine the day of the request's timestamp.

Voters should then go to https://www.tradingview.com/chart/?symbol=TVC%3ADXY, and make sure the interval is set to "1 day" (see B on the below image). Voters should then mouse-over the day determined, and look at the Open price (C on the below image) and record this number. This is the value for the TVC market.

Then voters should do the same for the additional two markets of CAPITALCOM and ICEUS. These can be chosen by clicking the DXY symbol on the top left (see A on the below image) and selecting the appropriate choice (each choice source is listed on its right)

![tradingview ux](images/tradingview-ux.png)

Voters should then add these values up and divide by 3 to get the mean value, then round to 3 decimal places to arrive at the final value.

Voters should determine whether the returned price differs from broad market consensus. This is meant to provide flexibility in any unforeseen circumstances as voters are responsible for defining broad market consensus.

# Security considerations

The inclusion of this requested price identifier should not present a security concern for DVM. There is a clearly defined method of determining a canonical price, and the data needed is publicly available.
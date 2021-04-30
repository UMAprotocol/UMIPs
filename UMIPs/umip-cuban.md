## Headers

| UMIP-x                |                                                               |
| ------------------- | ------------------------------------------------------------- |
| UMIP Title          | Add CRYPTO_vs_SP500 as a supported price identifier |
| Authors             | Sean Brown (@smb2796)                                                     |
| Status              | Draft                                                         |
| Created             | 04-29-21                                              |
| Discourse Link      |             |

# Summary 

The DVM should support price requests for `CRYPTO_vs_SP500` price identifier. `CRYPTO_vs_SP500` is binary identifier where the payout is determined by the comparative price performance of a one asset against the performance of the S&P 500.

# Motivation

# Data Specifications

-----------------------------------------
- Price identifier name: CRYPTO_vs_SPY 
- Markets & Pairs: Determined by ancillary data. If no ancillary data is provided, ETHUSD should be used for `CRYPTO` and follow the methodology described in [UMIP-6](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-6.md). The index value of the S&P 500 will also need to be used. The value of the S&P 500 Index can be queried from any reputable data provider. One example might be Google Finance. 
- Example data providers: NA
- Cost to use: NA
- Real-time data update frequency: NA
- Historical data update frequency: NA

# Price Feed Implementation

This identifier is intended to be used in a non-liquidatable EMP, so it does not need a real-time price feed. At expiry, voters should follow the methodology described in the `Implementation` section to determine the correct price.

# Technical Specifications

-----------------------------------------
- Price identifier name: CRYPTO_vs_SP500
- Base Currency: NA
- Quote Currency: NA
- Rounding: This is an integer, so no rounding is necessary
- Estimated current value of price identifier: 0

When converted from bytes to UTF-8, the ancillary data should be a dictionary containing `asset` and `starttimestamp` keys like so:
```
asset:ETHUSD, starttimestamp:1619707080
```

The `asset` key should return the asset the voters should use in the performance comparison calculation detailed in the `Implementation` section. The `starttimestamp` key should return the starting benchmark time for when performance comparisons should begin.

If the value of `asset` is null or does not obviously map to an existing approved price identifier, this should default to `ETH`. If the value of `starttimestamp` is null or is not a unix timestamp later than 01/01/2021 00:00 UTC, the value should default to `1619707080`.

When the example ancillary data dictionary is stored as bytes, the result would be: `0x61737365743a4554485553442c20737461727474696d657374616d703a31363139373037303830`.

# Rationale



# Implementation

Default values if no ancillary data is provided in the price request:
- `asset`: ETHUSD
- `starttimestamp`: 1619707080

1. The value of `asset` should be queried at `starttimestamp` following the methodology described in that price identifier's UMIP. If no ancillary data is provided, voters should calculate the value of ETHUSD at `starttimestamp`. (`asset_t1`)
2. The value of the S&P 500 Index should be queried at `starttimestamp`. If this timestamp falls outside of market trading hours, the last available close price should be used. (`s&p_t1`)
3. Steps 1 & 2 should be repeated substituting the price request timestamp for `starttimestamp`. (`asset_t2` and `s&p_t2`)
4. Find the relative change between `asset_t2` and `asset_t1`.  (`asset_t2` - `asset_t1`)/`asset_t1` = `asset_performance`.
5. Find the relative change between `s&p_t2` and `s&p_t1`.  (`s&p_t2` - `s&p_t1`)/`s&p_t1` = `s&p_performance`.
6. If `asset_performance` > `s&p_performance`, voters should return 0.
7. If `s&p_performance` >= `asset_performance`, voters should return 1.


# Security Considerations

## Headers

| UMIP-XXX; CPI Feed            |                                                      |
| ------------------- | ---------------------------------------------------- |
| UMIP Title          | Add CPI as a supported price identifier |
| Authors             | ???                                             |
| Status              | In-progress                                            |
| Created             | ???    |



# Summary

The DVM should support price requests for the Consumer Price Index (MORE SPECIFIC INFO NEEDED - no ambiguity!)

The canonical identifier should be `CPI`.

# Motivation

???

# Data Specifications

- Price identifier name: CPI

- Example data providers:
    - https://fred.stlouisfed.org/series/CPALTT01USM657N
    - ???

- Real-time data update frequency:
    - ???

# Price feed implementation

???

  # Technical Specifications

- Price identifier name: CPI
- Rounding: Round to 8 decimal places (ninth decimal place digit >= 5 rounds up and < 5 rounds down)
-----------------------------------------
- Price identifier name: MAGICUSDC
- Base Currency: MAGIC
- Quote Currency: USDC
- Rounding: Round to 8 decimal places (ninth decimal place digit >= 5 rounds up and < 5 rounds down)
- Estimated current value of price identifier: 0.45 (26 MAy 2022 16:24:00 UTC)

# Rationale

MAGIC token has predominant volume in Sushiswap at the time of writing the UMIP with average volume of 1.3M, folowed by the OKX  pool with average volume of 94K. For this price identifier it is also assumed that 1 USDT = 1 USD holds at all times.

MAGIC has predominant liquidity and volume activity in the AMMs paired with WETH. In order to mitigate attempted price manipulation a two-week  TWAP would be applied.


# Implementation

Voters should query for the price of MAGIC/WETH and MAGIC/USDC on SushiSwap. When determining the price for MAGIC/USDC it should also take into account MAGIC/USDT on OKX. Use the ETH/USDC price as specified via UMIP-6. Recommended endpoints are provided in the markets and data sources section (To be added by DevX). 

### MAGICUSDC

1. Query the MAGICUSDC price from SushiSwap using a 2-week TWAP.
2. Query the MAGICUSDT price from OKX using a 2-week TWAP.
3. Add the 2 week TWAP from Sushiswap to the 2-week TWAP from OKX and divide by two to receive the average price of Magic between Sushiswap and OKX
4. Query the ETH/USD price as per UMIP-6 using a 2-week TWAP. 
5. Multiply the MAGICUSDC price by the ETH/USD price and round to 8 decimals to get the MAGIC/USD price.
6. (for USD/MAGIC) Take the inverse of the result of step 3, before rounding, (1/ MAGIC/USD) to get the USD/MAGIC price, and round to 8 decimals.

### MAGICETH

1. Query the MAGICETH price from SushiSwap using a 2-week TWAP.
2. Query the ETH/USD price as per UMIP-6 using a 2-week TWAP. 
3. Multiply the MAGICETH price by the ETH/USD price and round to 8 decimals to get the MAGIC/ETH price.
 

For both implementations, voters should determine whether the returned price differs from broad market consensus. This is meant to provide flexibility in any unforeseen circumstances as voters are responsible for defining broad market consensus.

# Security considerations

The inclusion of this requested price identifier should not present a security concern for DVM.

Liquidity is ample specially in the Sushiswap pool, currently over 150M, it should allow the usage of its price feed, even for liquidatable contracts.

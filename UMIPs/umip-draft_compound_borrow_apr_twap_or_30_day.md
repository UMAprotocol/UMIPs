## HEADERS
| UMIP [#]     |                                                                                                                                  |
|------------|------------------------------------------------------------------------------------------------------------------------------------------|
| UMIP Title | Price identifiers for CAR: [COMPUSDCAPR-TWAP-OR-30DAY-FEB28/USD] [COMPUSDCAPR-TWAP-OR-30DAY-MAR28/USD]                                                                                                  |
| Authors    | Evan Mays <me@evanmays.com>
| Status     | Draft                                                                                                                                   |
| Created    | January 23, 2020                                                                             
<br>

<br>
<br>

# SUMMARY

The DVM should support price requests for the [COMPUSDCAPR-TWAP-OR-30DAY-FEB28/USD] and [COMPUSDCAPR-TWAP-OR-30DAY-MAR28/USD] price index.

A synthetic token, referred to as 'CAR', will be created with this price identifier.

This price index should resolve in one of two ways, depending on the DVM timestamp.

## [COMPUSDCAPR-TWAP-OR-30DAY-FEB28/USD]
```
CUTOFF = 1614470400 # Feb 28, 2021 00:00:00 UTC
if dvm_timestamp >= CUTOFF:
  Resolve price to the [COMPUSDCAPR-30DAY/USD] from UMIP # (TODO: Get this number from the draft UMIP when it goes to last call), 30 day total annualized interest rate on borrowing USDC from Compound.
else:
  Resolve price to the 2-hour Time-Weighted Average Price for the Uniswap or Balancer price of the CAR token quoted in USD. CAR token address in technical specification.
```

## [COMPUSDCAPR-TWAP-OR-30DAY-MAR28/USD]
```
CUTOFF = 1616889600 # Mar 28, 2021 00:00:00 UTC
if dvm_timestamp >= CUTOFF:
  Resolve price to the [COMPUSDCAPR-30DAY/USD] from UMIP # (TODO: Get this number from the draft UMIP when it goes to last call), 30 day total annualized interest rate on borrowing USDC from Compound.
else:
  Resolve price to the 2-hour Time-Weighted Average Price for the Uniswap or Balancer price of the CAR token quoted in USD. CAR token address in technical specification.
```

# MOTIVATION

The motivation for calculating [COMPUSDCAPR-30DAY/USD] is described in UMIP #. Potential use cases are also in UMIP #.

The motivation for using a different price depending on the DVM timestamp is similar to UMIP-22. For the creation of a APR futures contract, we use the TWAP pre-expiry and the true [COMPUSDCAPR-30DAY/USD]. This allows the expiring multiparty to stay collateralized at the price the market expects [COMPUSDCAPR-30DAY/USD] will be at expiration. This allows traders to bet on the expectation of the APR over the period of specific months in the future, rather than betting on aggregated real time interest rates.

Potential uses for `CAR` are described in UMIP #.

<br>

# MARKETS, DATA SOURCES, AND PRICE FEED IMPLEMENTATION

This price should be queried from the highest volume Uniswap or Balancer pool (Whichever one is deemed more legitimate by the UMA token holders) on Ethereum where at least one asset in the pair is CAR.

This price should be updated second by using the time weighted average price from the past 2 hours. Data can be queried from Uniswap/Balancer event logs on any Ethereum full node.

Liquidator bots with access to an Ethereum full node can use this [Uniswap implementation](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/UniswapPriceFeed.js) and this [Balancer implementation](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/BalancerPriceFeed.js) for free to query current and historical data.

<br>


# TECHNICAL SPECIFICATIONS

**1. Price Identifier Name** - [COMPUSDCAPR-TWAP-OR-30DAY/USD]

**2. Base Currency** - CAR token or [COMPUSDCAPR-30DAY/USD] (Compound Borrowing USDC Interest Annual Percentage Rate over 30 days)

**3. Quote currency** - USD

**4. Intended Collateral Currency** - USDC

**5. Collateral Decimals** - 6

**6a. Rounding Pre Cutoff** - 6 decimal places. (decimal place >= 5 rounds up)
**6b. Rounding Post Cutoff** - As described in UMIP # [COMPUSDCAPR-30DAY/USD]
<br>

# RATIONALE

UMIP # has a full rationale behind calculating the aggregated 30 day borrowing rate.

Due to the lack of ambiguity on calculating the TWAP, UMA token holders should all converge on the same price. Therefore, we don't require rounding pre cutoff.

We use TWAP as opposed to the average price at the end of each block. This causes collateralization requirements to be more accurate as block times are highly variable.

Most volume is expected to be on the Uniswap USDC/CAR pools.

Further rationale for using a 2 hour TWAP is in the UMIP-22 Rationale section.

<br>

# IMPLEMENTATION

For price requests made before the cutoff, (`1614470400` for `[COMPUSDCAPR-TWAP-OR-30DAY-FEB28/USD]` and `1616889600` for `[COMPUSDCAPR-TWAP-OR-30DAY-MAR28/USD]`), use the same 2 hour TWAP calculation implementation from UMIP-22.

1. The end TWAP timestamp equals the price request timestamp.
2. The start TWAP timestamp is defined by the end TWAP timestamp minus the TWAP period (2 hours in this case).
3. A single Uniswap/Balancer price is defined for each timestamp as the price that the ETH/uGAS pool returns at the end of the latest block whose timestamp is <= the timestamp that is queried for.
4. The TWAP is an average of the prices for each timestamp between the start and end timestamps. Each price in this average will get an equal weight.
5. As the token price will already implicitly be tracking the GASETH-1M-1M price, it should be left as returned without any scaling transformation.
6. The final price should be returned with the synthetic token as the denominator of the price pair and should be submitted with 18 decimals.

All prices for a 2 hour window should be from the same exchange. If a Uniswap pool has the highest volume for the past 2 hours, voters should use the Uniswap pool. If a Balancer pool has the highest volume for the past 2 hours, voters should use the Balancer pool.

For price requests made after or on the cutoff, (`1614470400` for `[COMPUSDCAPR-TWAP-OR-30DAY-FEB28/USD]` and `1616889600` for `[COMPUSDCAPR-TWAP-OR-30DAY-MAR28/USD]`), use [COMPUSDCAPR-30DAY/USD] from UMIP #.

<br>

# Security considerations

Security considerations are similar to UMIP-22. The trading price of CAR is the expected aggregate compound interest rate at the end of February and March. This is slow moving by default, so price manipulation if the two-hour TWAP should be challenging.

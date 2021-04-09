## HEADERS
| UMIP [#]     |                                                                                                                                  |
|------------|------------------------------------------------------------------------------------------------------------------------------------------|
| UMIP Title | Add R3-APR21/RAI and R3-MAY21/RAI as supported price identifiers                                                                                          |
| Authors    | Ashutosh Varma (ashutoshvarma11@live.com)
| Status     | Draft                                                                                                                                 |
| Created    | April 1, 2021
| Link to Discourse    | [LINK](https://discourse.umaproject.org/t/add-rai-redemption-rate-apr-as-price-identifiers/624)                                                                               


# SUMMARY 

This UMIP will reference a synthetic token to be created with this price identifier.
This token will be referred to as 'R3' (Rai Redemption Rate) and will represent the token that tracks these identifiers.

The DVM should support price requests for the R3-APR21/RAI and R3-MAY21/RAI price indices.

The DVM should support requests for a price that resolves to either the median monthly RAI annualized redemptionRate
coefficient or a 2-hour Time-Weighted Average Price (TWAP) on the highest volume Uniswap RAI/R3 pool.
The price resolution method to use will depend on the timestamp the price request was made at.

For a price request made at or after the expiry timestamp, the price will be resolved with the RAI annualized redemption rate
coefficient calculation defined as per R3 token Technical Specification.

For a price request made before the expiry timestamp, the price will be resolved to a 2-hour TWAP for the Uniswap price of the
listed synthetic token in RAI.

## R3-APR21/RAI
The R3 token tied to this price identifier will expire on the cutoff timestamp `1619568000` (28 April 2021 12:00:00 AM).
```
CUTOFF = 1619568000         # 28 April 2021 12:00:00 AM
if dvm_timestamp >= CUTOFF:
  Resolve price to the 30-day total RAI annualized redemptionRate coefficient. (See implementation)
else:
  Resolve price to the 2-hour Time-Weighted Average Price for the Uniswap price of the R3 token quoted in RAI. R3 token address in the technical specification.
```

## R3-MAY21/RAI
The R3 token tied to this price identifier will expire on the cutoff timestamp `1622160000` (28 May 2021 12:00:00 AM).
```
CUTOFF = 1622160000         # 28 May 2021 12:00:00 AM
if dvm_timestamp >= CUTOFF:
  Resolve price to the 30-day total RAI annualized redemptionRate coefficient. (See implementation)
else:
  Resolve price to the 2-hour Time-Weighted Average Price for the Uniswap price of the R3 token quoted in RAI. R3 token address in the technical specification.
```


# MOTIVATION

The DVM currently does not support reporting 30 days medianised RAI redemption rate coefficient or a two-hour TWAP of the R3 token.

1. What are the financial positions enabled by creating this synthetic that does not already exist?

    - The usage of a two-hour TWAP for liquidations, then an aggregated price at expiration is similar to UMIP-22.
      This setup allows us to create synthetic futures. This will enable RAI holders (those who hold, speculate on or use RAI in other protocols and apps)
      to hedge against redemption rate volatility which allows them to "lock in" future returns from redeeming or selling RAI.
      Other users may wish to speculate on the redemption rate for a specific month in the future.
      Providing a price feed for the settlement of a financial contract is a prerequisite
      
    - Supporting the R3-APR21/RAI and R3-MAY21/RAI price identifiers would also enable the creation of similar
      products like call options on redemption rate that use RAI as collateral.
    

2. Please provide an example of a person interacting with a contract that uses this price identifier. 
  - People that hold RAI are directly affected by the redemption rate.
    R3 would allow them to hedge their positions by taking a bet on future redemption rate changes.
  - A RAI holder wants to mitigate the risk due to the volatility of the redemption rate, so he mints the synth and sells it in the market.
    Now at the end of the month if average redemption increases then synth will settle for a higher price and he/she will lose some
    collateral but the increase in RAI market price (due to redemption rate) will cover the cost of lost collateral.

<br> 

# MARKETS & DATA SOURCES

### Pre Cutoff
This price should be queried from the highest volume Uniswap pool (Whichever one is deemed more legitimate by the UMA token holders)
on Ethereum where at least one asset in the pair is R3. It's expected that a single Uniswap pool will have 99% of the liquidity and
volume so confusion will not arise.

All the data can be queried from the Uniswap V2 subgraph: https://thegraph.com/explorer/subgraph/uniswap/uniswap-v2

1. What markets should the price be queried from? It is recommended to have at least 3 markets.
    - Uniswap
    
4. How often is the provided price updated?

    - On every Ethereum block (i.e. every ~15 seconds)

5. Provide recommended endpoints to query for historical prices from each market listed. 

    - ```graphql
      {
        pair(
            id: POOL_ADDRESS,
            block: {number: BLOCK_NUMBER}    
        ){
            token0Price
            token1Price
         }  
      }

      ```

6.  Do these sources allow for querying up to 74 hours of historical data? 

    - Yes

7. Is an API key required to query these sources? 

    - No

8. Is there a cost associated with usage? 

    - No

9. If there is a free tier available, how many queries does it allow for?

    - No limits at the moment.

10.  What would be the cost of sending 15,000 queries?

     - $0


### Post Cutoff

The source of truth for this data is the annualized value of RAI OracleRelayer contact's `redemptionRate()` method.
As of the writing of this UMIP, the agreed-upon RAI OracleRelayer smart contract address is 0x4ed9C0dCa0479bC64d8f4EB3007126D5791f7851.

This price identifier aggregates the value returned by `redemptionRate()` over every block from the 30 days ending at the cutoff/expiration
timestamp (1619568000 for R3-APR21/RAI and 1622160000 for R3-MAY21/RAI).

It is recommended to gather the raw data from an Ethereum archive node. Alternatively, this annualized value is indexed in the
[RAI Subgraph]( https://subgraph.reflexer.finance/subgraphs/name/reflexer-labs/rai).
As of writing this UMIP, the RAI Subgraph is free and will remain so.

All of these endpoints give the redemption rate coefficient per block for historical blocks, however, converting the data from RAI OracleRelayer
to APR (subgraph already has annualized rate) is required, and 30-day median aggregation is still required for both sources. (Read the implementation section)


1. What sources should the price be queried from? It is recommended to have at least 3 sources.

    - RAI Official Subgraph -  https://subgraph.reflexer.finance/subgraphs/name/reflexer-labs/rai
    - APR of RAI OracleRelayer contact's `redemptionRate()`

4. How often is the provided price updated?

    - Every 4 hours (14,400s), (see [`updateRateDelay`](https://docs.reflexer.finance/current-system-parameters#ratesetter))

6.  Do these sources allow for querying up to 74 hours of historical data? 

    - Yes

7.  How often is the provided price updated?

    - Every 4 hours (14,400s), (see [`updateRateDelay`](https://docs.reflexer.finance/current-system-parameters#ratesetter))

8. Is an API key required to query these sources? 

    - No

9. Is there a cost associated with usage? 

    - No

10. If there is a free tier available, how many queries does it allow for?

    - No limits at the moment.

11.  What would be the cost of sending 15,000 queries?

     - $0

<br>

# PRICE FEED IMPLEMENTATION

For the creation of the R3 token, it is desired that the DVM return either the 30-day median annualized rate, or a 2-hour TWAP on the market price of R3.
The type of price that the DVM will return is dependent on the timestamp the price request is made at.
This timestamp is the expiry timestamp of the contract that is intended to use this price identifier,
so the TWAP calculation is used pre-expiry and the closing index value of the R3 calculation is used at expiry.

This is very similar to the uGAS token and this design is outlined in [UMIP 22](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-22.md).

Because the redemptionRate is only used at expiry, it will not be possible for a token sponsor to become undercollateralized based upon its movement.
This means that only the Uniswap TWAP will need to be queried in real-time with a price feed.

[Here](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/UniswapPriceFeed.js)
is a reference implementation for an off-chain price feed that calculates the TWAP of a token-based on Uniswap price data. 

<br>

# TECHNICAL SPECIFICATIONS

## R3-APR21/RAI
**1. Price Identifier Name** - R3-APR21/RAI

**2. Base Currency** - R3-APR21

**3. Quote currency** - RAI

**4. Intended Collateral Currency** - RAI

- Does the value of this collateral currency match the standalone value of the listed quote currency? 

    - YES

- Is your collateral currency already approved to be used by UMA financial contracts? If no, submit a UMIP to have the desired collateral currency approved for use. 
    - NO, but there is a separate pending UMIP for approving RAI as collateral currency

**5. Collateral Decimals** - 18

**6. Rounding** - Round to nearest 2 decimal places (third decimal place digit >= 5 rounds up and < 5 rounds down) 

## R3-MAY21/RAI
**1. Price Identifier Name** - R3-MAY21/RAI

**2. Base Currency** - R3-MAY21

**3. Quote currency** - RAI

**4. Intended Collateral Currency** - RAI

- Does the value of this collateral currency match the standalone value of the listed quote currency? 

    - YES

- Is your collateral currency already approved to be used by UMA financial contracts? If no, submit a UMIP to have the desired collateral currency approved for use. 
    - NO, but there is a separate pending UMIP for approving RAI as collateral currency

**5. Collateral Decimals** - 18

**6. Rounding** - Round to nearest 2 decimal places (third decimal place digit >= 5 rounds up and < 5 rounds down) 

<br>

# RATIONALE
### Pre-cutoff

Due to the lack of ambiguity on calculating the TWAP, UMA token holders should all converge on the same price.
However, to be consistent with post-cutoff rounding, we will round pre-cutoff to 2 decimal places.

A 2-hour TWAP was chosen to mitigate any risk of attempted price manipulation attempts on the market price of the synthetic.
To meaningfully manipulate the price that token sponsors’ collateralization is calculated with, an attacker would have to manipulate
the trading price of a token for an extended amount of time. This is described further in the Security Considerations section.

Most volume is expected to be on the Uniswap RAI/R3 pools.

Further rationale for using a two-hour TWAP is in the UMIP-22 Rationale section.

### Post-cutoff

We're using a rolling 30 day period to increase the cost of manipulating the APR price.

We use geometric mean, as opposed to arithmetic mean, to include the effect of rate compounding.

We use an annual percentage rate, as opposed to a 24hr percentage rate or per-second rate, to increase usability.

The ground truth data for this is in the RAI OracleRelayer smart contract on the Ethereum blockchain.
Any differences in UMA governor results for this price identifier should be due to rounding errors that propagate through the calculation (numerical instability)
as opposed to multiple data sources being the truth (as is the case with looking at the price of bitcoin on different exchanges).

We mitigate the effects of numerical instability by rounding to the nearest two decimal places.
Different algorithms for calculating the geometric mean result in tiny differences in the result.
Rounding to 2 decimal places hides small differences in geometric mean calculations. For example,
if person A calculates the price request result as 1.53453 $RAI and person B calculates the price request result as 1.53489 $RAI, both will agree on 1.53 $RAI.


<br>

# IMPLEMENTATION

### Pre-cutoff

For price requests made before the cutoff, (`1619568000` for `R3-APR21/RAI` and `1622160000` for `R3-MAY21/RAI`),
use the same two-hour TWAP calculation implementation from UMIP-22.

1. The end TWAP timestamp equals the price request timestamp.
2. The start TWAP timestamp is defined by the end TWAP timestamp minus the TWAP period (2 hours in this case).
3. A single Uniswap price is defined for each timestamp as the price that the RAI/R3 pool returns at the end of the latest block whose timestamp is <= the timestamp that is queried for.
4. The TWAP is an average of the prices for each timestamp between the start and end timestamps. Each price in this average will get equal weight.
5. As the token price will already implicitly be tracking the R3-MAY21/RAI/RAI or R3-APR21/RAI/RAI price, it should be left as returned without any scaling transformation.
6. The final price should be returned with the synthetic token as the denominator of the price pair and should be submitted with 18 decimals.
   But rounded to 2 decimal places. For example, if the value is 1.38482747, then we round to 2 decimal places and convert 1-to-1 to RAI for 1.38 RAI.
   However, RAI on Ethereum uses 18 decimal places so voters must submit 1.380000000000000000 RAI.


### Post-cutoff
Since redemption rate can be negative also and EMPs don't support negative indexes as of now. We will use the Redemption Rate Coefficient for the settlement of synths.
```
Redemption Rate Coefficient = Redemption Rate + 1
```

RAI OracleRelayer contact's `redemptionRate()` and subgraphs both returns Redemption Rate Coefficient


For price requests made after or on the cutoff, (`1619568000` for `R3-APR21/RAI` and `1622160000` for `R3-MAY21/RAI`), use the below geometric mean calculation.

This implementation works with [RAI subgraph](https://subgraph.reflexer.finance/subgraphs/name/reflexer-labs/rai).
To use it with other data sources, modify the `get_rates()` function.

The script below takes `end_timestamp` and calculates the 30 days geometric mean of redemption rate coefficient  APR. UMA token holders should define these as follows.
```
end_timestamp = DVM timestamp
```

```python
import argparse
import math
from typing import Dict, List

import requests

SUBGRAPH_URL = "https://subgraph.reflexer.finance/subgraphs/name/reflexer-labs/rai"
UPDATEDELAY = 4 * 60 * 60


def gen_query(start_timestamp: int, end_timestamp: int, max: int = 1000):
    return {
        "query": f"""
            {{
                redemptionRates(
                    first: 1000,
                    orderBy: createdAt,
                    orderDirection: desc,
                    where: {{createdAt_gte: {start_timestamp}, createdAt_lte: {end_timestamp}}}
                ) {{
                    perSecondRate
                    createdAt
                    createdAtBlock
                }}
            }}
    """,
    }


def get_rates(end_timestamp: int, total_days: int = 30) -> List[float]:
    """
    Get the Redemption Rate Coefficient for the given time interval.
    
    start_timestamp = end_timestamp - total_days * 24 * 3600

    Filter the rates as,
    start_timestamp <= timestamp <= end_timestamp

    Return
    ------
    float
        List of Redemption Rate Coefficients
    """
    ideal_count: int = (total_days * 24 * 3600) // UPDATEDELAY
    start_timestamp: int = end_timestamp - total_days * 24 * 60 * 60

    all_rates: List[Dict[str, str]] = requests.post(
        SUBGRAPH_URL, json=gen_query(start_timestamp, end_timestamp)
    ).json()["data"]["redemptionRates"]

    # snaity check to make sure all rates are consecutive and none is missing
    for i in range(1, len(all_rates)):
        # list is in desc order
        prev = all_rates[i]
        curr = all_rates[i - 1]
        diff = int(curr["createdAt"]) - int(prev["createdAt"])
        if diff >= UPDATEDELAY + 1 * 3600:
            print(
                f"WARNING: The record {prev} and {curr} is {diff} seconds apart, "
                f"{diff-UPDATEDELAY} seconds more than updateRateDelay"
            )

    # print(len(all_rates))
    print(
        f"INFO: Total {len(all_rates)} rates found between {start_timestamp}"
        f" (beginning of the 30 day period) and {end_timestamp}."
    )
    print(f"      (It should be close to {ideal_count})")
    return [float(r["perSecondRate"]) for r in all_rates]


def calculate_geometric_mean(dataset_list: List[float]):
    return math.prod(dataset_list) ** (1 / len(dataset_list))


def get_apr_for_month(end_timestamp: int) -> float:
    return pow(
        calculate_geometric_mean(get_rates(end_timestamp, total_days=30)),
        365 * 24 * 3600,
    )


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Calculate rolling 30 day geometric mean of RAI Redemption Rate APR"
    )
    parser.add_argument(
        "--end-timestamp",
        type=int,
        help="Timestamp of DVM price request (end of 30 day period, inclusive)",
        required=True,
    )
    args = parser.parse_args()
    apr = get_apr_for_month(args.end_timestamp)

    print()
    print(f"Calculated 30 Day Geometric Mean - {apr}")
    print(f"Rounded (2 Decimals) - {round(apr, 2)}")

```

<br>

# Security considerations
Security considerations are similar to UMIP-22.

Security considerations are focused on the use of the token price for monitoring collateral ratios.
- Token price manipulation - Under illiquid market conditions, an attacker could attempt to drive prices down to withdraw more collateral than normally allowed or drive prices up to trigger liquidations. However, it is important to note that almost all attacks that have been performed on DeFi projects are executed with flash loans, which allows the attacker to obtain leverage and instantaneously manipulate a price
  and extract collateral. Additionally, flash loans will have no effect on a tradable token price because the TWAP calculation is measured based
  on the price at the end of each block. Collateralization based off of a TWAP should make these attacks ineffective and would require attackers
  to use significantly more capital and take more risk to exploit any vulnerabilities.
  
- Mismatch between TWAP and gap higher in token price - An aggressive gap higher in the token price accompanied by real buying and then a follow
  through rally could create a concern. In this scenario we could see the TWAP of the token significantly lag the actual market price and create an
  opportunity for sponsors to mint tokens with less collateral than what they can sell them from in the market. It is important to note that this is
  an edge case scenario either driven by an irrational change in market expectations or it can be driven by a “fat finger” mistake which is a vulnerability
  to any market. Even in this edge case, we believe the design of the token and the parameters chosen should mitigate risks. The current Expiring Multi Party
  (EMP) the contract requires sponsors to mint tokens with enough collateral to meet the Global Collateral Ratio (GCR) which has stood well above 200% for other
  contracts. Therefore, assuming the GCR is similar for R3, the market would need to first rally at least 100% before potentially being exposed.
  If the sponsor wishes to withdraw collateral below the GCR they would request a “slow withdrawal” which would subject him to a 2 hour “liveness period”
  where anybody can liquidate the position if it fell below the required collateral ratio. The combination of the GCR and 2 hours “liveness period” allows
  the 2 hours TWAP to “catch up” to the market price and would protect from this scenario and deter sponsors from attempting to exploit it.


Also, The trading price of R3 is the expected aggregate RAI redemption rate at the end of April and May.
This is slow-moving by default, so price manipulation for the two-hour TWAP should be challenging.
However, the price may be volatile during earlier periods of the month.
This is due to the lack of information about the future.
It is expected these prices become less volatile as the cutoff/expiration date nears.

Security considerations, like the ones above, have been contemplated and addressed,
but there is potential for security holes to emerge due to the novelty of this price identifier.

Additionally, anyone deploying a new priceless token contract referencing this identifier should take care to parameterize the contract
appropriately to avoid the loss of funds for synthetic token holders. Contract deployers should also ensure that there is a network of
liquidators and disputers ready to perform the services necessary to keep the contract solvent.

## HEADERS

| UMIP 232          |                                                                                                 |
| ----------------- | ----------------------------------------------------------------------------------------------- |
| UMIP Title        | Add R3-10H-TWAP and R3-30D-GM as supported price identifiers                                    |
| Authors           | Ashutosh Varma (ashutoshvarma11@live.com)                                                       |
| Status            | Draft                                                                                           |
| Created           | April 1, 2021                                                                                   |
| Link to Discourse | [LINK](https://discourse.umaproject.org/t/add-rai-redemption-rate-apr-as-price-identifiers/624) |

# SUMMARY

This UMIP will reference a synthetic token to be created with this price identifier.
This token will be referred to as 'R3' (Rai Redemption Rate) and will represent the token that tracks these identifiers.

The DVM should support price requests for the R3-10H-TWAP and R3-30D-GM price indices.

The DVM should support requests for a price that resolves to either the 30 day geometric mean (R3-30D-GM) or
a 10-hour Time-Weighted Average Price (R3-10H-TWAP) of RAI redemption rate coefficient APR

The price resolution method to use will depend on the timestamp the price request was made at.

For a price request made at or after the expiry timestamp, the price will be resolved with the R3-30D-GM,
30 day geometric mean of redemption rate coefficient APR calculation defined as per R3 token Technical Specification.

For a price request made before the expiry timestamp, the price will be resolved to R3-10H-TWAP, a 10-hour TWAP of
redemption rate coefficient APR.

# MOTIVATION

The DVM currently does not support reporting 30 day geometric mean or 10-hr TWAP of RAI redemption rate coefficient APR.

1. What are the financial positions enabled by creating this synthetic that does not already exist?

   - The usage of a 10-hour TWAP for liquidations, then an aggregated price at expiration is similar to UMIP-22.
     This setup allows RAI users to create synthetic futures. This will enable RAI holders (those who hold, speculate on or use RAI in other protocols and apps)
     to hedge against redemption rate volatility which allows them to "lock in" future returns from redeeming or selling RAI.
     Other users may wish to speculate on the redemption rate for a specific month in the future.

     To understand better how redemption rate affect RAI see [How does RAI work? in FAQ](https://reflexer.finance/faq)

     Providing a price feed for the settlement of a financial contract is a prerequisite

   - Supporting the R3-10H-TWAP and R3-30D-GM price identifiers would also enable the creation of similar
     products like call options on redemption rate that use RAI as collateral.

2. Please provide an example of a person interacting with a contract that uses this price identifier.

- People that hold RAI are directly affected by the redemption rate.
  R3 would allow them to hedge their positions by taking a bet on future redemption rate changes.
- A RAI holder wants to mitigate the risk due to the volatility of the redemption rate, so he mints the synth and sells it in the market.
  Now at the end of the month if average redemption increases then synth will settle for a higher price and he/she will lose some
  collateral but the increase in RAI market price (due to redemption rate) will cover the cost of lost collateral.

<br>

# MARKETS & DATA SOURCES

The source of truth for this data is the RAI OracleRelayer contract's `redemptionRate()` method.
As of the writing of this UMIP, the agreed-upon RAI OracleRelayer smart contract address is [0x4ed9C0dCa0479bC64d8f4EB3007126D5791f7851](https://etherscan.io/address/0x4ed9C0dCa0479bC64d8f4EB3007126D5791f7851).

This price-feed needs aggregated data in order to calculate either 10-hr TWAP or 30-day geometric mean APR
depending upon timestamp, so data from `redemptionRate()` needs to be indexed at someplace. Subgraphs are obvious choice for this.

It is recommended to index the raw data from an Ethereum archive node. Alternatively, this value is indexed in the
[RAI Official Subgraph](https://subgraph.reflexer.finance/subgraphs/name/reflexer-labs/rai).
As of writing this UMIP, the RAI Subgraph is free and will remain so.

Governor should deploy their own subgraphs for indexing the data from `redemptionRate()`, source code for RAI's
official subgraph can be found [here](https://github.com/reflexer-labs/geb-subgraph).

The redemption rate coefficient is stored as a RAY decimal (27 decimals) so value from `redemptionRate()`
needs to be divided by 10^27 to convert it to normal decimal. Subgraphs does this conversion already before
indexing so data from them does not need conversion.

All of these, subgraph endpoint give the redemption rate coefficient per block for historical blocks,
however, converting this data to either 10-hr TWAP or 30-day GM APR is still required. (Read the implementation section)

1. What sources should the price be queried from? It is recommended to have at least 3 sources.

   - RAI Official Subgraph - https://subgraph.reflexer.finance/subgraphs/name/reflexer-labs/rai
   - RAI TheGraph Hosted Subgraph - https://thegraph.com/explorer/subgraph/reflexer-labs/rai-mainnet

2. How often is the provided price updated?

   - Every 4 hours (14,400s), (see [`updateRateDelay`](https://docs.reflexer.finance/current-system-parameters#ratesetter))

3. Provide recommended endpoints to query for indexed data from subgraphs.

   ```graphql
   {
     redemptionRates(
       first: 1000
       orderBy: createdAt
       orderDirection: desc
       where: { createdAt_gte: START_TIMESTAMP, createdAt_lte: END_TIMESTAMP }
     ) {
       annualizedRate
     }
   }
   ```

4. Do these sources allow for querying up to 74 hours of historical data?

   - Yes

5. Is an API key required to query these sources?

   - No

6. Is there a cost associated with usage?

   - No

7. If there is a free tier available, how many queries does it allow for?

   - No limits at the moment.

8. What would be the cost of sending 15,000 queries?

   - $0

<br>

# PRICE FEED IMPLEMENTATION

For the creation of the R3 token, it is desired that the DVM return either the 30 day geometric mean or a 10-hour TWAP.
The type of price that the DVM will return is dependent on the timestamp the price request is made at.

[Here](https://github.com/ashutoshvarma/protocol/blob/rai-price-feed/packages/financial-templates-lib/src/price-feed/RAIRedemptionRate.js)
is a reference implementation for an off-chain price feed that can both 10-hr TWAP and 30-day GM of redemption rate coefficient .

<br>

# TECHNICAL SPECIFICATIONS

## R3-10H-TWAP

**1. Price Identifier Name** - R3-10H-TWAP

**2. Base Currency** - R3

**3. Quote currency** - RAI

**4. Intended Collateral Currency** - RAI

- Does the value of this collateral currency match the standalone value of the listed quote currency?

  - YES

- Is your collateral currency already approved to be used by UMA financial contracts?

  - YES

**5. Collateral Decimals** - 18

**6. Rounding** - Round to nearest 2 decimal places (third decimal place digit >= 5 rounds up and < 5 rounds down)

## R3-30D-GM

**1. Price Identifier Name** - R3-30D-GM

**2. Base Currency** - R3

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

### R3-10H-TWAP (Pre-cutoff)

Due to the lack of ambiguity on calculating the TWAP, UMA token holders should all converge on the same price.
However, to be consistent with post-cutoff rounding, we will round pre-cutoff to 2 decimal places.

A 10-hour TWAP was chosen to mitigate any risk of attempted price manipulation attempts on the value of redemption rate.
To meaningfully manipulate the price that token sponsors’ collateralization is calculated with, an attacker would have to manipulate
the redemption rate for an extended amount of time. This is described further in the Security Considerations section.

Also a 10-hour TWAPs ensures that atleast 2 data points are used to calculate TWAP since redemption rate is
updated every 4 hours

### R3-30D-GM (Post-cutoff)

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

For querying the historical redemption rate coefficient APR, RAI subgraphs should be used, with sample query from
MARKET & DATA SOURCES

```graphql
{
  redemptionRates(
    first: 1000
    orderBy: createdAt
    orderDirection: desc
    where: { createdAt_gte: START_TIMESTAMP, createdAt_lte: END_TIMESTAMP }
  ) {
    annualizedRate
  }
}
```

### R3-10H-TWAP (Pre-cutoff)

For price requests made before the cutoff, use this 10-hour TWAP calculation implementation.

1. The end TWAP timestamp equals the price request timestamp.
2. The start TWAP timestamp is defined by the end TWAP timestamp minus the TWAP period (10 hours in this case).
3. A single redemption rate coefficient APR value is defined for each timestamp as the price that the subgraph
   returns at the end of the latest block whose timestamp is <= the timestamp that is queried for.
4. The TWAP is an average of the rates for each timestamp between the start and end timestamps.
   Each price in this average will get equal weight.
5. As the values from subgraph are integers, so it should be left as returned without any scaling transformation.
6. The final price should be submitted with 18 decimals but rounded to 2 decimal places. For example, if the value is
   1.384827478767976545678765456, then we round to 2 decimal places and convert 1-to-1 to RAI for 1.38 RAI.
   However, RAI on Ethereum uses 18 decimal places so voters must submit 1.380000000000000000 RAI.

**For Example:-**
If price request timestamp is T1, then calculate end TWAP timestamp (T2) by simply subtracting 10-hours.
Run the query with START_TIMESTAMP=T1 and END_TIMESTAMP=T2 and apply the above calculation on retrieved data to
get the 10-hour TWAP of redemption rate coefficient APR.

### Post-cutoff

```
GM = (product of values) ^ (1/number of values)
```

For price requests made after the cutoff, use this 30-day Geometric Mean calculation implementation.

1. The end GM timestamp equals the price request timestamp.
2. The start GM timestamp is defined by the end GM timestamp minus the GM period (30 days in this case).
3. Only rates whose timestamp is greater than equal to start GM timestamp and less than equal to end GM timestamp
   are used and rest should be discarded.
4. Calculate the product of all rates by simply multiplying them together.
5. Calculate the total number of rates.
6. The GM is the (value from step3) ^ 1/(value from step4).
7. The final price should be submitted with 18 decimals but rounded to 2 decimal places. For example, if the value is
   1.384827478767976545678765456, then we round to 2 decimal places and convert 1-to-1 to RAI for 1.38 RAI.
   However, RAI on Ethereum uses 18 decimal places so voters must submit 1.380000000000000000 RAI.

**For Example:-**
If price request timestamp is T1, then calculate end GM timestamp (T2) by simply subtracting 30-days.
Run the query with START_TIMESTAMP=T1 and END_TIMESTAMP=T2 and apply the above calculation on retrieved data to
get the 30-day GM of redemption rate coefficient APR.

<br>

# Security considerations

Security considerations are focused on the use of the redemption rate for monitoring collateral ratios.

- **Intentional Liquidation** - Since RAI dampen the ETH movement, any changes in ETH price are reflected shortly in RAI in form of
  change in redemption rate. Therefore an attacker could use this to cause intentional liquidations.
  Assume ETH price shoots up and R3 market price double in anticipation of increase in redemption rate.
  Now the attacker can mint the synths at considerably lower price and sell them to market at higher price which
  can result in intentional liquidations if his/her profit is higher than collateral locked.
  However it is important ot note that the current Expiring Multi Party (EMP) the contract requires sponsors to
  mint tokens with enough collateral to meet the Global Collateral Ratio (GCR) which has stood well above 200%.
  Therefore assuming the GCR is similar for R3 and additionally setting the minimum CR to 200% or above should prevent intentional liquidations. We believe the design of the token and the parameters chosen should mitigate risks. The combination of the GCR and minimum CR allows the 10 hours TWAP to “catch up” to the market price and
  would protect from this scenario and deter sponsors from attempting to exploit it.

Security considerations, like the ones above, have been contemplated and addressed,
but there is potential for security holes to emerge.

Additionally, anyone deploying a new priceless token contract referencing these identifier should take care to parameterize the contract
appropriately to avoid the loss of funds for synthetic token holders.
It is recommended to set higher minimum CR for priceless token contracts using this price feed.

Contract deployers should also ensure that there is a network of
liquidators and disputers ready to perform the services necessary to keep the contract solvent.

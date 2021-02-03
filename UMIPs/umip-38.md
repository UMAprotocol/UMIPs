## Headers
- UMIP-38
- UMIP title: Add price identifiers COMPUSDC-APR-FEB28/USDC and COMPUSDC-APR-MAR28/USDC
- Author Evan Mays <me@evanmays.com>
- Status: Last call
- Created: January 13, 2020

## Summary


The DVM should support price requests for the COMPUSDC-APR-FEB28/USDC and COMPUSDC-APR-MAR28/USDC price indices.

A synthetic token, referred to as 'CAR', will be created with this price identifier.

This price index should resolve in one of two ways, depending on the DVM timestamp.


**COMPUSDC-APR-FEB28/USDC**

The CAR token tied to this price identifier will expire on the cutoff timestamp `1614470400`.
```
CUTOFF = 1614470400 # Feb 28, 2021 00:00:00 UTC
if dvm_timestamp >= CUTOFF:
  Resolve price to the 30 day total annualized interest rate on borrowing USDC from Compound. (See implementation)
else:
  Resolve price to the 2-hour Time-Weighted Average Price for the Uniswap price of the CAR token quoted in USDC. CAR token address in technical specification.
```


**COMPUSDC-APR-MAR28/USDC**

The CAR token tied to this price identifier will expire on the cutoff timestamp `1616889600`.
```
CUTOFF = 1616889600 # Mar 28, 2021 00:00:00 UTC
if dvm_timestamp >= CUTOFF:
  Resolve price to the 30 day total annualized interest rate on borrowing USDC from Compound. (See implementation)
else:
  Resolve price to the 2-hour Time-Weighted Average Price for the Uniswap price of the CAR token quoted in USDC. CAR token address in technical specification.
```

## Motivation
The DVM currently does not support reporting aggregated USDC borrow interest rate APRs from Compound or a two-hour TWAP of the CAR token.

Pre Cutoff Cost: Calculating the two-hour TWAP is an easy calculation. The reference UMA liquidator bot implementation already has a two-hour TWAP Uniswap implementation.

Post Cutoff Cost: Calculating an aggregated statistic of compound USDC borrow rates on a confirmed range of blocks on the Ethereum blockchain is easy. All of the needed data can be computed from event logs on any Ethereum full node. An archive node allows direct querying of this data via contract methods. Additionally, this data can be accessed through querying the Compound Subgraph on the Graph Protocol, then running a simple aggregation function.

Opportunity: The usage of a two-hour TWAP for liquidations, then an aggregated price at expiration is similar to UMIP-22. This setup allows us to create futures. Compound USDC Borrow APR futures can help borrowers and traders hedge against interest rate volatility allowing them to "lock-in" future costs from Compound loans. This will enable taking multi-collateral backed loans out on Compound for new use cases. Other users may wish to speculate on the demand for borrowing USDC on Compound for a specific month in the future. Others may simply wish to hedge their deposit interest rate volatility. Providing a price feed for the settlement of a financial contract is a prerequisite.

Example Synthetic: `CAR-USDC-FEB28` will be a token that settles to the total annualized interest rate of borrowing USDC on Compound for (roughly) the month of February.

Example user: A trader takes out a large loan from Compound and the current APR is 10%. Compound APRs are volatile, however, the trader wishes to lock-in this APR for the next month. The trader can buy synthetic tokens tracking this price index. If APRs increase, the trader owes more interest on their loan, but their synthetic increases in value enough to cover the cost of the increased interest.

## Markets & Data sources

### Pre Cutoff
This price should be queried from the highest volume Uniswap pool (Whichever one is deemed more legitimate by the UMA token holders) on Ethereum where at least one asset in the pair is CAR. It's expected that a single Uniswap pool will have 99% of the liquidity and volume so confusion will not arise.

### Post Cutoff

The source of truth for this data is the Compound USDC cToken's (cUSDC) `borrowRatePerBlock()` method. As of the writing of this UMIP, the agreed-upon cUSDC smart contract address is `0x39aa39c021dfbae8fac545936693ac917d5e7563`. This price identifier aggregates the value returned by `borrowRatePerBlock()` over every block from the 30 days ending at the cutoff/expiration timestamp (`1614470400` for `COMPUSDC-APR-FEB28/USDC` and `1616889600` for `COMPUSDC-APR-MAR28/USDC`).


It is recommended to gather the raw data from an Ethereum archive node. Alternatively, this data is indexed in the [Graph Protocol](https://thegraph.com/explorer/subgraph/graphprotocol/compound-v2). As of writing this UMIP, Graph Protocol is free. However, they have plans to start charging for access in the future. In the future, querying 30 days worth of blocks may cost up to $20 USD. This UMIP's price identifier will only be used for the DVM to return the synthetic token's expiration price. Therefore, this high price won't be incurred by liquidator bots.

Raw data is also available for download at the [Tendies Exchange public endpoint](https://cache.tendies.exchange/borrow_rate_per_block.json). This endpoint is updated with every new block but delayed by 20 block confirmations. This endpoint is free to use. To generate a similar file, governors can use and/or modify this [open source indexer script](https://github.com/evanmays/tendies-exchange/tree/master/indexer).

All of these endpoints give the borrow rate per block for historical blocks, however converting this data to APR (and aggregation) is still required. (Read the implementation section)

## Price Feed Implementation
### Pre Cutoff
This price should be updated every second by using the time-weighted average price from the past 2 hours. Data can be queried from Uniswap event logs on any Ethereum full node.

Liquidator bots with access to an Ethereum full node can use this [Uniswap implementation](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/UniswapPriceFeed.js) for free to query current and historical data.

### Post Cutoff

The intention is that the aggregated APR won't be used for liquidations. This is because the DVM only switches to this price at the CAR token expiration. By the time this aggregated statistic will be used (at expiration), liquidations won't be possible anymore. Therefore, a price feed isn't required for liquidator bots to track this rolling APR. All liquidations will use a two-hour TWAP price feed. This setup is similar to UMIP-25/UMIP-22 (uGAS).

## Technical Specification

### COMPUSDC-APR-TWAP-OR-30DAY-FEB28/USDC


**1. Price Identifier Name** - COMPUSDC-APR-FEB28/USDC


**2. Base Currency** - CAR token with expiration at 1614470400 or Compound Borrowing USDC Interest Annual Percentage Rate

**3. Quote currency** - USDC

**4. Intended Collateral Currency** - USDC

**5. Collateral Decimals** - 6

**6a. Rounding Pre Cutoff** - Round to nearest 2 decimal places (third decimal place digit >= 5 rounds up and < 5 rounds down)

**6b. Rounding Post Cutoff** - Round to nearest 2 decimal places (third decimal place digit >= 5 rounds up and < 5 rounds down)

**7. Input processing** - If the cUSDC smart contract has an unexpected failure or hack, human intervention is required. For UMA tokenholders without access to archive nodes, in the case that [Tendies Exchange public endpoint](https://cache.tendies.exchange/borrow_rate_per_block.json) is down, tokenholders should use [Graph Protocol](https://thegraph.com/explorer/subgraph/graphprotocol/compound-v2). This is only required for the post-cutoff price.

**8. Pricing Interval** - Per block

**9. Dispute timestamp rounding** Round down (previous timestamp)

### COMPUSDC-APR-TWAP-OR-30DAY-MAR28/USDC


**1. Price Identifier Name** - COMPUSDC-APR-MAR28/USDC


**2. Base Currency** - CAR token with expiration at 1616889600 or Compound Borrowing USDC Interest Annual Percentage Rate

**3. Quote currency** - USDC

**4. Intended Collateral Currency** - USDC

**5. Collateral Decimals** - 6

**6a. Rounding Pre Cutoff** - Round to nearest 2 decimal places (third decimal place digit >= 5 rounds up and < 5 rounds down)

**6b. Rounding Post Cutoff** - Round to nearest 2 decimal places (third decimal place digit >= 5 rounds up and < 5 rounds down)

**7. Input processing** - If the cUSDC smart contract has an unexpected failure or hack, human intervention is required. For UMA tokenholders without access to archive nodes, in the case that [Tendies Exchange public endpoint](https://cache.tendies.exchange/borrow_rate_per_block.json) is down, tokenholders should use [Graph Protocol](https://thegraph.com/explorer/subgraph/graphprotocol/compound-v2). This is only required for the post-cutoff price.

**8. Pricing Interval** - Per block

**9. Dispute timestamp rounding** Round down (previous timestamp)

## Rationale

### Pre-cutoff

Due to the lack of ambiguity on calculating the TWAP, UMA token holders should all converge on the same price. However, to be consistent with post-cutoff rounding, we will round pre-cutoff to 2 decimal places.

We use the time-weighted average price (TWAP) as opposed to the average price at the end of each block. This causes collateralization requirements to be more accurate as block times are highly variable.

Most volume is expected to be on the Uniswap USDC/CAR pools.

Further rationale for using a two-hour TWAP is in the UMIP-22 Rationale section.

### Post-cutoff

We're using a rolling 30 day period to increase the cost of manipulating the APR price.

We use geometric mean, as opposed to arithmetic mean, to include the effect of interest compounding.

We use an annual percentage rate, as opposed to a monthly percentage rate, to increase usability. 1) Annual rates are large enough numbers that, combined with an easy to understand 1-to-1 APR to USDC ratio, result in prices (most of the time) in the range of $1 to $30. 2) Annual rates are more commonly used when discussing loan borrowing rates.

For clarification, here's an example of the 1-to-1 conversion. 7% APR is $7USDC and 3% APR is $3USDC.

There is a ground-truth for this price identifier. The ground truth data is in the Compound smart contract on the Ethereum blockchain. Any differences in UMA governor results for this price identifier should be due to rounding errors that propagate through the calculation (numerical instability) as opposed to multiple data sources being the truth (as is the case with looking at the price of bitcoin on different exchanges).

We mitigate the effects of numerical instability by rounding to the nearest two decimal places. Different algorithms for calculating the geometric mean result in tiny differences in the result. Rounding to 2 decimal places hides small differences in geometric mean calculations. For example, if person A calculates the price request result as $7.53453USDC and person B calculates the price request result as $7.53489USDC, both will agree on $7.53USDC.

## Implementation

### Pre-cutoff

For price requests made before the cutoff, (`1614470400` for `COMPUSDC-APR-FEB28/USDC` and `1616889600` for `COMPUSDC-APR-MAR28/USDC`), use the same two-hour TWAP calculation implementation from UMIP-22.

1. The end TWAP timestamp equals the price request timestamp.
2. The start TWAP timestamp is defined by the end TWAP timestamp minus the TWAP period (2 hours in this case).
3. A single Uniswap price is defined for each timestamp as the price that the USDC/CAR pool returns at the end of the latest block whose timestamp is <= the timestamp that is queried for.
4. The TWAP is an average of the prices for each timestamp between the start and end timestamps. Each price in this average will get an equal weight.
5. As the token price will already implicitly be tracking the COMPUSDC-APR-TWAP-OR-30DAY-FEB28/USDC or COMPUSDC-APR-TWAP-OR-30DAY-MAR28/USDC price, it should be left as returned without any scaling transformation.
6. The final price should be returned with the synthetic token as the denominator of the price pair and should be submitted with 6 decimals. But rounded to 2 decimal places. For example, if the APR is 7.38482747%, then we round to 2 decimal places and convert 1-to-1 to USDC for $7.38USDC. However, USDC on Ethereum uses 6 decimal places so voters must submit $7.380000USDC.

### Post-cutoff

For price requests made after or on the cutoff, (`1614470400` for `COMPUSDC-APR-FEB28/USDC` and `1616889600` for `COMPUSDC-APR-MAR28/USDC`), use the below geometric mean calculation.

This implementation works with the dataset from [Tendies Exchange public endpoint](https://cache.tendies.exchange/borrow_rate_per_block.json). To use it with other datasets, modify the `getBorrowRatePerBlock()` function. This implementation is updated as an [open source price feed script](https://github.com/evanmays/tendies-exchange/tree/master/indexer).

The script below expects a `start_block` and `end_block` for the 30 day period. UMA token holders should define these as follows.
```
start_block = The block the DVM Timestamp was mined in
start_timestamp = DVM Timestamp - 30 days
end_block = The block mined most recently after start_timestamp
```

These values can be put into this script. The script also expects `expected_blocks_per_year`. This is the number of blocks we expect Ethereum to mine in a year at current rates.UMA token holders should use `expected_blocks_per_year = round((end_block - start_block) * 365 / 30)`.

```python
import json
import sys
from database import Database
import math
import argparse

# startBlock index and endBlock index are inclusive
# order is not guaranteed
def getBorrowRatePerBlock(dataset_filename, start_block, end_block):
  """
  Multiple options to implement this function. Please see Markets & Data sources. In this example, we will process the results from the indexing script. https://github.com/evanmays/tendies-exchange/tree/master/indexer
  1. Process raw Ethereum full node event logs to reconstruct the borrow rate per block from the Compound USDC utilization rate
  2. Get historical data from Compound/Graph Protocol API
  3. Run a small indexing script every minute which calls the getBorrowRate method and indexes this data for later use indexed by block
  """
  dataset = Database(dataset_filename).loadOrCreateDictionary()

  # Filter blocks in target range
  filtered_dataset = {k: v for k, v in dataset.items() if start_block <= k <= end_block}

  # Validate dictionary has all the blocks in our range
  if not len(filtered_dataset) == end_block - start_block + 1:
      sys.exit(f"You are trying to get {end_block - start_block + 1} blocks but your dataset is missing {end_block - start_block + 1 - len(filtered_dataset)} block(s) in the range {start_block} to {end_block}")

  # Get list of all values (order doesn't matter for geometric mean)
  final_list = list(filtered_dataset.values())

  final_list = [1+(x/1e18) for x in final_list]
  return final_list

def geometricMean(dataset_list):
  return math.prod(dataset_list) ** (1/len(dataset_list))

# Geometric mean to get average per block return, then convert to APR
def getAPRforMonth(dataset_filename, start_block, end_block, expected_blocks_per_year):
  borrow_rate_of_block = getBorrowRatePerBlock(dataset_filename, start_block, end_block)
  avg_borrow_rate_per_block = geometricMean(borrow_rate_of_block)
  apr = avg_borrow_rate_per_block ** expected_blocks_per_year
  return apr

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Calculate rolling 30 day geometric mean of Compound USDC borrow APR')
    parser.add_argument('dataset_filename', type=str, help='The file of the borrowRatePerBlock dataset')
    parser.add_argument('--start-block', type=int, help='The block for the DVM price request (end of 30 day period, inclusive)', required=True)
    parser.add_argument('--end-block', type=int, help='The block at the beginning of the 30 day period (inclusive)', required=True)
    parser.add_argument('--expected-blocks-per-year', type=int, help='The expected number of ethereum blocks per year.', default=(6533 * 365))
    args = parser.parse_args()
    apr = getAPRforMonth(args.dataset_filename, args.start_block, args.end_block, args.expected_blocks_per_year)
    print(apr)
```

## Security considerations

Security considerations are similar to UMIP-22. The trading price of CAR is the expected aggregate compound interest rate at the end of February and March. This is slow moving by default, so price manipulation if the two-hour TWAP should be challenging. However, the price may be volatile during earlier periods of the month. This is due to the lack of information about the future. It is expected these prices become less volatile as the cutoff/expiration date nears.

Anyone relying on this data point should also note that manipulating the APR for a specific block is possible for users with large amounts of capital. These users can deposit this capital into the pool, remove this capital from the pool, or take large loans against the pool to significantly change the interest rate for a block. Aggregated APRs should mitigate this type of manipulation.

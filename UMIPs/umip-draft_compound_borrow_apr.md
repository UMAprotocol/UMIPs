## Headers
- UMIP <#>
- UMIP title: Add [COMPUSDCAPR-30DAY/USD] as a price identifier
- Author Evan Mays <me@evanmays.com>
- Status: Draft
- Created: January 13, 2020

## Summary
The DVM should support requests for aggregated USDC Borrow APRs on Compound. The aggregation is done over a period of 30 days.

## Motivation
The DVM currently does not support reporting aggregated USDC borrow interest rate APRs from Compound.

Cost: Calculating an aggregated statistic of compound USDC borrow rates on a confirmed range of blocks on the Ethereum blockchain is easy. All of the needed data can be computed from event logs on any Ethereum full node. An archive node allows direct querying of this data via contract methods. Additionally, this data can be accessed through querying the Compound Subgraph on the Graph Protocol, then running a simple aggregation function.

Opportunity: Compound USDC Borrow APR futures can help borrowers and traders hedge against interest rate volatility allowing them to "lock-in" future costs from Compound loans. This will enable taking multi-collateral backed loans out on Compound for new use cases. Other users may wish to speculate on the demand for borrowing USDC on Compound or hedge their deposit interest rate volatility. Providing a price feed for the settlement of a financial contract is a prerequisite.

Example Synthetic: We'll use a USDC as the collateral currency. In order to allow people to make bets on the APRs for specific months, this UMIP's price index will only be used at the synthetics expiration. This is similar to `GASETH-1M-1M's usage` from umip-25.

Example user: A trader takes out a large loan from Compound and the current APR is 10%. Compound APRs are volatile, however, the trader wishes to lock-in this APR for the next month. The trader can buy synthetic tokens tracking this price index. If APRs increase, the trader owes more interest on their loan, but their synthetic increases in value enough to cover the cost of the increased interest.

## Markets & Data sources

The source of truth for this data is the Compound USDC cToken's (cUSDC) `borrowRatePerBlock()` method. As of the writing of this UMIP, the agreed upon cUSDC smart contract address is `0x39aa39c021dfbae8fac545936693ac917d5e7563`. This price identifier aggregates the value returned by `borrowRatePerBlock()` over every block from the 30 days ending at the DVM timestamp.

It is recommended to gather the raw data from an Ethereum archive node. Alternatively, this data is indexed in the [Graph Protocol](https://thegraph.com/explorer/subgraph/graphprotocol/compound-v2). As of writing this UMIP, Graph Protocol is free. However, they have plans to start charging for access in the future. In the future, querying 30 days worth of blocks may cost up to $20 USD. This UMIP's price identifier will only be used for the DVM to return the synthetic token's expiration price. Therefore, this high price won't be incurred by liquidator bots.

Raw data is also available for download at the [Tendies Exchange public endpoint](https://cache.tendies.exchange/borrow_rate_per_block.json). This endpoint is updated with every new block, but delayed by 20 block confirmations. This endpoint is free to use. To generate a similar file, governors can use and/or modify this [open source indexer script](https://github.com/evanmays/tendies-exchange/tree/master/indexer).

All of these endpoints give the borrow rate per block for historical blocks, however converting this data to APR (and aggregation) is still required. (Read the implementation section)


## Technical Specification
The definition of this identifier should be:

* Identifier name: [COMPUSDCAPR-30DAY/USD]
* Base Currency: Compound Borrowing USDC Interest Annual Percentage Rate
* Quote Currency: USD
* Intended Collateral Currency: USDC.
* Collateral Decimals: 6
* Sources: Derivable from data on any Ethereum full node or data set of Compound Protocol data
* Rounding: Round to nearest 2 decimal places (third decimal place digit >= 5 rounds up and < 5 rounds down)
* Input processing: If the cUSDC smart contract has an unexpected failure or hack, human intervention is required. For UMA tokenholders without access to archive nodes, in the case that [Tendies Exchange public endpoint](https://cache.tendies.exchange/borrow_rate_per_block.json) is down, tokenholders should use [Graph Protocol](https://thegraph.com/explorer/subgraph/graphprotocol/compound-v2).
* Result Processing: Take the median of all votes submitted.
* Pricing Interval: Per block
* Dispute timestamp rounding: Round down (previous timestamp)

## Rationale

We're using a rolling 30 day period to increase the cost of manipulating the APR price.

We use geometric mean, as opposed to arithmetic mean, to include the effect of interest compounding.

We use an annual percentage rate, as opposed to a monthly percentage rate, to increase usability. 1) Annual rates are large enough numbers that, combined with an easy to understand 1-to-1 APR to USD ratio, result in prices (most of the time) in the range of $1 to $30. 2) Annual rates are more commonly used when discussing loan borrowing rates.

For clarification, here's an example of the 1-to-1 conversion. 7% APR is $7USD and 3% APR is $3USD.

There is a ground-truth for this price identifier. The ground truth data is in the Compound smart contract on the Ethereum blockchain. Any differences in UMA governor results for this price identifier should be due to rounding errors that propagate through the calculation (numerical instability) as opposed to multiple data sources being the truth (as is the case with looking at the price of bitcoin on different exchanges).

We mitigate the effects of numerical instability by rounding to the nearest two decimal places. Different algorithms for calculating the geometric mean result in tiny differences in the result. Rounding to 2 decimal places hides small differences in geometric mean calculations. For example, if person A calculates the price request result as $7.53453USD and person B calculates the price request result as $7.53489USD, both will agree on $7.53USD.

## Implementation

This implementation works with the dataset from [Tendies Exchange public endpoint](https://cache.tendies.exchange/borrow_rate_per_block.json). To use it with other datasets, modify the getBorrowRatePerBlock function. This implementation is updated as an [open source price feed script](https://github.com/evanmays/tendies-exchange/tree/master/indexer).

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

# Geometric mean to get total return, then convert to APY
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
This price identifier is expected to be volatile. Any contract relying on this identifier should maintain a high enough collateral ratio to prevent insolvency.

Anyone relying on this data point should also note that manipulating the APR for a specific block is possible for users with large amounts of capital. These users can deposit this capital into the pool, remove this capital from the pool, or take large loans against the pool to significantly change the interest rate for a block.

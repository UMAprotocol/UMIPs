## Headers
- UMIP <#>
- UMIP title: Add COMPUSDCAPR-1M as a price identifier
- Author Evan Mays <me@evanmays.com>
- Status: Draft
- Created: January 13, 2020

## Summary
The DVM should support requests for aggregated USDC Borrow APRs on Compound.

## Motivation
The DVM currently does not support reporting aggregated USDC borrow interest rate APRs from Compound.

Cost: Calculating an aggregated statistic of compound USDC borrow rates on a confirmed range of blocks on the Ethereum blockchain is easy. All of the needed data can be computed from event logs on any Ethereum full node. An archive node allows direct querying of this data via contract methods. Additionally, this data can be accessed through querying the Compound Subgraph on the Graph Protocol or the Compound team's historical API service, then running a simple aggregation function.

Opportunity: Compound USDC Borrow APR futures can help borrowers and traders hedge against interest rate volatility allowing them to "lock-in" future costs from Compound loans. Other users may wish to speculate on the demand for borrowing USDC on Compound or hedge their deposit interest rate volatility. Providing a price feed for settlement of a financial contract is a prerequisite.

## Technical Specification
The definition of this identifier should be:

* Identifier name: COMPUSDCAPR-1M
* Base Currency: Compound Borrowing USDC Interest Annual Percentage Rate
* Quote Currency: USD
* Sources: Derivable from data on any Ethereum full node or data set of Compound Protocol data
* Processing: Use the borrow rate per block to calculate the average APR (geometric mean) over a rolling 30 day period (See implementation section)
* Rounding: Round to nearest 2 decimal places (third decimal place digit >= 5 rounds up and < 5 rounds down)
* Pricing Interval: Per block
* Dispute timestamp rounding: Round down (previous timestamp)
* Output processing: Convert APR percentage to USD 1-to-1. (Example: 7% is $7USD and 3% is $3USD)


## Rationale
The decision to use a rolling 30 day period was done to increase the cost of manipulating the price.

We use geometric mean, as opposed to arithmetic mean, to include the effect of interest compounding.

The choice to use annual percentage rate as opposed to monthly percentage rate is due to usability. 1) Annual rates are large enough numbers that, combined with an easy to understand 1-to-1 APR to USD ratio, result in prices (most of the time) in the range of $1 to $30. 2) Annual rates are more commonly used when discussing loan borrowing rates.

The decision to round to the nearest 2 decimal places will help with numerical instability. Different algorithms for calculating the geometric mean result in tiny differences in the result. Rounding to 2 decimal places hides small differences in geometric mean calculations. For example, if person A calculates the price request result as $7.53453USD and person B calculates the price request result as $7.53489USD, both will agree on $7.53USD.

## Implementation
TODO: Implement getBorrowRatePerBlock() function and test implementation works in python and is numerically stable compared to alternative implementations in different programming languages and computing environments

```python
# startBlock index and endBlock index are inclusive
def getBorrowRatePerBlock(startBlock, endBlock):
  """
  Multiple options to implement this function
  1. Process raw Ethereum full node event logs to reconstruct the borrow rate per block from the Compound USDC utilization rate
  2. Get historical data from compound/graphprotocol api
  3. Run a small indexing script every minute which calls the getBorrowRate method and indexes this data for later use indexed by block
  """


def geometricMean(collection):
  product = collection.reduce((a, b) => a * b)
  root = product ** (1/len(percentPerBlock))
  return root

# Geometric mean to get total return, then convert to APY
def getAPRforMonth(startBlock, endBlock):
  borrow_rate_of_block = getBorrowRatePerBlock(startBlock, endBlock)
  avg_borrow_rate_per_block = geometricMean(borrow_rate_of_block.map(v => v + 1))
  apr = avg_borrow_rate_per_block ** EXPECTED_BLOCKS_PER_YEAR
  return apr
```

## Security considerations
This price identifier is expected to be volatile. Any contract relying on this identifier should maintain a high enough collateral ratio to prevent insolvency.

Anyone relying on this data point should also take note that manipulating the APR for a specific block is possible for users with large amounts of capital. These users can deposit this capital into the pool, remove this capital from the pool, or take large loans against the pool to significantly change the interest rate for a block.

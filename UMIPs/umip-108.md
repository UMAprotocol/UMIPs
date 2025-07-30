# Headers
| UMIP-108     |                                                                                                                                          |
|------------|------------------------------------------------------------------------------------------------------------------------------------------|
| UMIP Title | Add GASETH-0921 as a supported price identifier                                                                                             |
| Authors    | Ross (ross@yam.finance)
| Status     | Approved                                                                                                                               |
| Created    | June 15th, 2021                                                                                                                              |
| Link to Discourse| https://discourse.umaproject.org/t/add-ugas-0921-price-identifier/1196

## SUMMARY
This UMIP will reference a synthetic token to be created with this price identifier. This token will be referred to as 'uGAS' and will represent the token that tracks this identifier with the most ETH volume on Sushiswap unless a different contract is determined by voters to be more legitimate.

This follows the exact same process as UMIP-22 but uses a different timestamp.

The DVM should support requests for a price that resolves to either the median monthly Ethereum gas price or a 2-hour Time-Weighted Average Price (TWAP) on the highest volume Sushiswap ETH/uGAS pool. The price resolution method to use will depend on the the timestamp the price request was made at.

For a price request made at or after the Unix timestamp `1633046400` (October 1, 2021 00:00:00 UTC), the price will be resolved with the median monthly gas price calculation defined for GASETH-1M-1M in UMIP-20 with the modification that it uses `effective_gas_price` instead of `gas_price` in order to account for EIP-1559. Full logic for this change is embedded in the Implementation section below.

For a price request made before `1633046400`, the price will be resolved to a 2-hour TWAP for the Sushiswap price of the listed synthetic token in ETH. The synthetic token address will be listed in the Technical Specification section.


## MOTIVATION
The motivation for these price identifiers is explained in [umip-22](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-22.md).


# MARKETS & DATA SOURCES

Please refer to [umip-22](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-22.md).


# PRICE FEED IMPLEMENTATION

To further explain the price feed implementation beyond what is stated in [umip-22]: The price feed being used is the Uniswap price feed and only the Uniswap TWAP calculation will need to be queried in real-time. The Uniswap price feed is referenced [here](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/UniswapPriceFeed.js).


# TECHNICAL SPECIFICATIONS

**1. Price Identifier Name** - GASETH-0921

**2. Base Currency** - uGAS

**3. Quote currency** - ETH

**4. Intended Collateral Currency** - WETH

**5. Scaling Decimals** - 18 (1e18)

**6. Rounding** - Round to nearest 6 decimal places (seventh decimal place digit >= 5 rounds up and < 5 rounds down)

# IMPLEMENTATION
The identifier requires updated timestamps.

For a price request made at or after the Unix timestamp `1633046400` (October 1, 2021 00:00:00 UTC), the price will be resolved with the median monthly gas price calculation defined for GASETH-1M-1M in UMIP-20 with the modification that it uses `effective_gas_price` instead of `gas_price` in order to account for EIP-1559. Full logic for this change is below

For a price request made before `1633046400`, the price will be resolved to a 2-hour TWAP for the Uniswap price of the listed synthetic token in ETH. The synthetic token address will be listed in the Technical Specification section.

Updated rounding: 6 decimals

In order to account for the changes to the fee market included in EIP-1559, the following pseudo-algorithm is used to calculate the exact data point to report by a DVM reporter:

```python
def return_median(t, N)
    assert N in [1, 4, 24, 168, 720]
    minimum_ranges = {1: 200, 4: 800, 24: 4800, 168: 33600, 720: 134400} # a mapping between the durations 1HR, 4HR, 24HR (1D), 168HR (1W), 720HR(1M) and the corresponding minimum number of blocks that must have been mined within the period.
    
    # `t` is number of seconds since the epoch (unix time)
    end_block = block.at(timestamp=t) # rounded down
    offset = N - 3600*N # there are 3600 seconds/hour
    start_block = block.at(timestamp=(t-offset))  
    
    # the DVM imposes a minimum number of blocks within a given time period to ensure safety against price manipulation
    if end_block-start_block < minimum_ranges[N]:
        start_block = end_block - minimum_ranges[N]
    
    total_gas, rolling_sum = 0, 0
    TXes = []
    
    # loop over the block in the defined range starting with the least recent
    for b in range(start_block, end_block, 1):
        # gasUsed is in the header of each block
        total_gas += b.gasUsed
        for tx in b.transactions():
            gas_price = tx.effectiveGasPrice
            gas_used = tx.totalGasUsed
            TXes.append((gas_price, gas_used))
    
    # sort transactions by gas_price ascendingly
    sorted_TXes = sorted(TXes, key=lambda tup: tup[0])

    for gas_price, gas_used in sorted_TXes:
        rolling_sum += gas_used
        if rolling_sum > total_gas/2:
            return gas_price
```

An alternative method, for a DVM reporter to calculate this exact data point, would be to run the below SQL query against a public dataset of Ethereum node data such as Google BigQuery's `bigquery-public-data.crypto_ethereum.transactions` dataset. 

This query is parameterized with a UTC timestamp `t1`, a time range defined by the price identifier being used (i.e. 24HR) `N`, a lower bound of time `t2` defined by `t1 - N * 3600` and a minimum block amount `B` (explained in the *Rationale* section).

```sql
DECLARE halfway int64;
DECLARE block_count int64;
DECLARE max_block int64;

-- Querying for the amount of blocks in the preset time range. This will allow block_count to be compared against a given minimum block amount.
SET (block_count, max_block) = (SELECT AS STRUCT (MAX(number) - MIN(number)), MAX(number) FROM `bigquery-public-data.crypto_ethereum.blocks` WHERE timestamp BETWEEN TIMESTAMP(@t2) AND TIMESTAMP(@t1));

CREATE TEMP TABLE cum_gas (
  gas_price int64,
  cum_sum int64
);

-- If the minimum threshold of blocks is met, query on a time range
IF block_count >= @B THEN
INSERT INTO cum_gas (
  SELECT
    receipt_effective_gas_price,
    SUM(gas_used) OVER (ORDER BY receipt_effective_gas_price) AS cum_sum
  FROM (
    SELECT
      receipt_effective_gas_price,
      SUM(receipt_gas_used) AS gas_used
    FROM
      `bigquery-public-data.crypto_ethereum.transactions`
    WHERE block_timestamp 
    BETWEEN TIMESTAMP(@t2)
    AND TIMESTAMP(@t1)  
    GROUP BY
      receipt_effective_gas_price));
ELSE -- If a minimum threshold of blocks is not met, query for the minimum amount of blocks
INSERT INTO cum_gas (
  SELECT
    receipt_effective_gas_price,
    SUM(gas_used) OVER (ORDER BY receipt_effective_gas_price) AS cum_sum
  FROM (
    SELECT
      receipt_effective_gas_price,
      SUM(receipt_gas_used) AS gas_used
    FROM
      `bigquery-public-data.crypto_ethereum.transactions`
    WHERE block_number 
    BETWEEN (max_block - @B)
    AND max_block
    GROUP BY
      receipt_effective_gas_price));
END IF;

SET halfway = (SELECT DIV(MAX(cum_sum),2) FROM cum_gas);

SELECT cum_sum, gas_price FROM cum_gas WHERE cum_sum > halfway ORDER BY gas_price LIMIT 1;
```
If `block_count` falls below the minimum number of mined blocks, the query will medianize over a range defined by the minimum number of blocks, rather than the given time range. This is explained further in the *Rationale* section.

These implementations are provided for explanation purposes and as convenient ways for DVM reporters to calculate the GASETH price identifiers. DVM reporters are free to develop additional implementations, as long as the implementations agree with the computation methodology defined in the *Rationale* section and specifications of the *Technical Specifications* section.

# Security considerations

Please reference the security considerations section in [umip-22](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-22.md)

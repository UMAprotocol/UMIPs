# Headers
| UMIP-147        |                                                        |
|-------------------|--------------------------------------------------------|
| UMIP Title        | Add GASETH-LSP as a supported price identifier        |
| Authors           | Ross (ross@yam.finance)                                |
| Status            | Approved                                             |
| Created           | January 11th, 2022                                   |
| Link to Discourse | https://discourse.umaproject.org/t/gaseth-lsp-price-identifier/1395              |

# SUMMARY
This UMIP is focused on updating the existing `uGAS` price identifiers to be used in the Long/Short Pair contracts and will reference a synthetic token to be created with this price identifier. This token will be referred to as 'uGAS' and will represent a weighted median gas price on Ethereum. The timeframe of this median value will depend on the value in the ancillary data field of the contract.

The DVM should support requests for a price that resolves to the median monthly Ethereum gas price as specified in the implementation section, without needing the additional logic of previous UMIPs that contain EMP-specific AMM TWAP liquidation procedures. 


# MOTIVATION
This UMIP updates the existing motiviations for uGAS as described in [umip-16](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-16.md) and [umip-20](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-20.md). The motivation from [umip-22](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-22.md) is no longer needed as there is no liquidation process for LSP contracts.

From UMIP-16:
 
> Cost: Calculating an aggregatory statistic of gas prices on a confirmed block or range of blocks on the Ethereum blockchain is easy by virtue of the fact that all needed data is readily available on any Ethereum full node, whether run locally or accessed remotely through well-known providers such as Infura or Alchemy. Additionally, this data can be accessed through querying publicly accessible Ethereum blockchain data sets.
> 
> Opportunity: Gas options/futures can help users and developers hedge against gas volatility allowing them to budget their gas consumption efficiently. Providing a price feed for settlement is a prerequisite. 
 
From UMIP-20:
> For the creation of a tokenized gas price futures contract, it is desired that the DVM return the aggregatory gas price for 1 million units of gas. Using the gas price for a million units of gas is more suitable for a tokenized futures contract because tokens will actually represent a non-negligible amount of value. If a token was built with the identifiers defined in UMIP-16, participants would need to transact in millions/billions of tokens to capture any substantial value, as the price of each token would be somewhere in the range of 10-150 Gwei.

# MARKETS & DATA SOURCES

Information necessary to determine a price for this price identifier requres access to an ethereum full node, either run locally or accessed remotely through well-known providers such as Infura or Alchemy is. Additionally, this data can be accessed through querying publicly accessible Ethereum blockchain data sets like Google bigQuery.


# PRICE FEED IMPLEMENTATION
No price feed implementation is necessary for this price identifier as the price is determined by on-chain ethereum data.

# TECHNICAL SPECIFICATIONS

**1. Price Identifier Name** - GASETH-LSP

**2. Base Currency** - GAS

**3. Quote currency** - ETH

**4. Intended Collateral Currency** - WETH

**5. Scaling Decimals** - 18 (1e18)

**6. Rounding** - Round to nearest 6 decimal places (seventh decimal place digit >= 5 rounds up and < 5 rounds down)

# ANCILLARY DATA SPECIFICATIONS

When converted from bytes to UTF-8, the ancillary data should be a number `N`.

i.e. ``` N:720 ```

`N` is the total number of hours over which the median gas price is calculated. (The above number shows a 30 day median.) In order to work with the previous calculations, this number should be rounded to the nearest previously approved median time period (in whole hours) as seen in the *Rationale* section. This number is to then be used to determine the minimum number of blocks used to calculate the median gas price over that time period as described in that section and the *implementation* section.

When the above example ancillary data is stored as bytes, the result would be: `0x4e3a373230`

if there is no ancillary data present, this value should default to `720` which is 30 Days.

# RATIONALE

From UMIP-16:

> The volatility of gas prices on Ethereum is a well-recognized problem that is only made worse by the ever increasing network congestion in recent months. This creates an opportunity for options/futures underwriters to create financial products that help decentralized applications (dApps) and their users hedge against gas price variability and have a consistent risk-minimized experience. The UMA protocol is well-positioned to provide the necessary plumbing for such products to flourish. Such products will need to rely on the DVM as a settlement layer in case of disputes. Therefore, by supporting data feeds for gas prices, the DVM opens the door for a win-win-win situation between financial products, users/dAaps, and the Ethereum network at large.

In the following quote, the wording is taken from UMIP-16 but the `gas_price` parameter was updated to `effective_gas_price` to account for EIP-1559 as described in [UMIP-129](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-129.md). 

> Each transaction included in an Ethereum block pays an amount of Ether per 1 unit of gas consumed. That amount is (a) specified by a `effective_gas_price` parameter attached to a transaction, (b) is expressed in the smallest unit of the Ether currency which is `Wei`, and is set by the transaction submitter as a bid offered to the miners to have the transaction included. We therefore have a set of `effective_gas_price`s per block.
>
> There are two important factors to consider: (1) there is a block each 12-15 seconds in the Ethereum blockchain, and spikes in gas prices are routinely observed, and (2) miners can easily manipulate gas prices in a given block (especially in absence of a fee burn). Therefore, an aggregatory statistic needs to be computed over a sufficiently long range of blocks to proof against abnormalities whether due to extreme volatility or miner manipulation. We propose the median gas price over 1 hour (1HR), 4 hours (4HR), 1 day (1D), one week (1W), and 1 month (1M) periods _weighted by_ the gas used in a transaction. For safety and to proof against price manipulation and/or possible abnormal delays in block production, the DVM requires that a minimum number of blocks must have been mined within a given period. Otherwise, the DVM medianizes over a preset number of blocks defined in the following table:

Updated table clarifying median price durations to use for this UMIP.

 | Identifier | Number of Hours Contained (N) | Minimum number of mined blocks (B) |
 |-------------|--------------|----------------------------------|
 | GASETH-1HR | 1 | 200 |
 | GASETH-4HR | 4 | 800 |
 | GASETH-1D | 24 | 4800 |
 | GASETH-7D | 168 | 33600 |
 | GASETH-30D | 720 | 144000 |

> For example, if the GASETH-1HR is requested for `t1` = October 1st 2020 UTC 00:00:00, and the number of blocks mined between `t0` = September 30th 2020 UTC 23:00:00 and  `t1` is less than 200, then the DVM medianizes over the 200 blocks mined at time <= `t1` regardless of how long (in wall clock time) it took for these blocks to be mined.

# IMPLEMENTATION
DVM voters should use the timestamp from the contract that is being voted on. This timestamp can either be queried from the `expirationTimestamp` field in the LSP contract or from the `timestamp` field in the data of the `requestPrice` price function when `expire` is called. The time period to medianize over should be determined from the `N` variable in ancillary data, which should be rounded per the *Ancillary Data Specification*.

**The rest of this section is replicated from the *Implementation section* in [UMIP-129](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-129.md). **

In order to account for the changes to the fee market included in EIP-1559, the following pseudo-algorithm is used to calculate the exact data point to report by a DVM reporter:

```python
def return_median(t, N)
    assert N in [1, 4, 24, 168, 720]
    minimum_ranges = {1: 200, 4: 800, 24: 4800, 168: 33600, 720: 144000} # a mapping between the durations 1HR, 4HR, 24HR (1D), 168HR (1W), 720HR(1M) and the corresponding mimimum number of blocks that must have been mined within the period.
    
    # `t` is number of seconds since the epoch (unix time)
    end_block = block.at(timestamp=t) # rounded down
    offset = 3600*N # there are 3600 seconds/hour
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

From UMIP-16

>Anyone relying on this data point should take note of the fact that manipulating the gas prices in a **specific** block or a short range of blocks is achievable by miners whether to inflate or deflate them for their own self-interest or on behalf of an attacker that bribed them to do so. The longer the range the requested statistic covers, the less the risk of manipulation is. This risk will also be significantly inhibited once [fee burn](https://github.com/ethereum/EIPs/blob/master/EIPS/eip-1559.md) is introduced in the Ethereum blockchain, because stuffing/padding blocks will have a non-zero cost even to miners (PoW) or block-producers (PoS).
>
>A large enough number of UMA governers should be running their full node to ensure data integrity. Relying on third-party full nodes presents a risk of manipulation of data, however if at least **one** governer is relying on their own full node, such manipulation is easily detectable. Hence, the security model here is 1-of-N which is low-risk.

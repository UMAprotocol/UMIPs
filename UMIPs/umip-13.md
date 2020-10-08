# Headers
| UMIP-13     |                                                                                                                                          |
|------------|------------------------------------------------------------------------------------------------------------------------------------------|
| UMIP Title | Add GASETH-1HR GASETH-4HR GASETH-1D GASETH-1W GASETH-1M as a price identifiers                                                                                                 |
| Authors    | Ali Atiia, @aliatiia | Matt Rice, @mrice32
| Status     | Draft                                                                                                                                    |
| Created    | September 4, 2020                                                                                                                           |

## Summary (2-5 sentences)
The DVM should support requests for aggregatory gas prices on the Ethereum blockchain. 

## Motivation
The DVM currently does not support reporting aggregatory gas prices of finalized blocks on the Ethereum blockchain. 

Cost: Calculating an aggregatory statistic of gas prices on a confirmed block or range of blocks on the Ethereum blockchain is easy by virtue of the fact that all needed data is readily available on any Ethereum full node, whether run locally or accessed remotely through well-known providers such as Infura or Alchemy.

Opportunity: Gas options/futures can help users and developers hedge against gas volatility allowing them to budget their gas consumption efficiently. Providing a price feed for settlement is a prerequisite.

## Technical Specification

The definition of this identifier should be:
- Identifier name: GASETH-1HR GASETH-4HR GASETH-1D GASETH-1W GASETH-1M 
- Base Currency: ETH
- Quote Currency: GAS
- Sources: any Ethereum full node
- Result Processing: Exact
- Input Processing: see Implementation section
- Price Steps: 1 Wei (1e-18)
- Rounding: Closest: N/A because the median algorithm as described below cannot produce numbers with higher precision than 1 Wei (1e-18).
- Pricing Interval: 1 second
- Dispute timestamp rounding: down
- Output processing: None

## Rationale

The volatility of gas prices on Ethereum is a well-recognized problem that is only made worse by the ever increasing network congestion in recent months. This creates an opportunity for options/futures underwriters to create financial products that help decentralized applications (dApps) and their users hedge against gas price variability and have a consistent risk-minimized experience. The UMA protocol is well-positioned to provide the necessary plumbing for such products to flourish. Such products will need to rely on the DVM as a settlement layer in case of disputes. By supporting gas prices, the DVM opens the door for these products to offer their services and create a win-win situation with their customers in the Ethereum ecosystem.

Each transaction included in an Ethereum block pays an amount of Ether per 1 unit of gas consumed. That amount is (a) specified by a `gasPrice` parameter attached to a transaction, (b) is expressed in the smallest unit of the Ether currency which is `Wei`, and is set by the transaction submitter as a bid offered to the miners to have the transaction included. We therefore have a set of `gasPrice`s per block.

The reported price has to take two considerations in mind: (1) there is a block each 12-15 seconds in the Ethereum blockchain, and spikes in gas prices are routinely observed, and (2) miners can easily manipulate gas prices in a given block (especially in absence of a fee burn). Therefore, an aggregatory statistic needs to be computed over a sufficiently long range of blocks to eliminate these two vectors. We propose the median gas price over 1 hour (1HR), 4 hours (4HR), 1 day (1D), one week (1W), and 1 month (1M) periods _weighted by_ the gas used in a transaction. For safety and to proof against price manipulation, the DVM requires that a minimum number of blocks must have been mined within a given period. Otherwise, the DVM medianizes over a preset number of blocks defined in the following table:

| Identifier | Minimum number of mined blocks |
|------------|------------------------------------------------------------------------------------------------------------------------------------------|
| GASETH-1HR | 200 |
| GASETH-4HR | 800 |
| GASETH-1D | 4800 |
| GASETH-1W | 33600 |
| GASETH-1M | 134400 |


For example, if the GASETH-1HR is requested for `t1` = October 1st 2020 UTC 00:00:00, and the number of blocks mined btween `t0` = September 30th 2020 UTC 23:00:00 and  `t1` is less than 200, then the DVM medianizes over the 200 blocks mined at time <= `t1`.

## Implementation

The total gas used over the last 300 (GASETH-1HR), 1200 (GASETH-4HR) or 7200 (GASETH-24HR) blocks that were mined at or before the `timestamp` provided to DVM is computed. Transactions in this range are also sorted by `total_gas_consumed`. 

The pseudo-algorithm to calculate the exact data point to report by a DVM reporter is as follows:

```python
def return_median(t, N)
    assert N in [1, 4, 24, 168, 720]
    minimum_ranges = {1: 200, 4: 800, 24: 4800, 168: 33600, 720: 134400} # a mapping between the durations 1HR, 4HR, 24HR (1D), 168HR (1W), 720HR(1M) and the corresponding mimimum number of blocks that must have been mined within the period.
    
    # `t` is number of seconds since the epoch (unix time)
    end_block = block.at(timestamp=t) # rounded down
    offset = N - 3600*N # there are 3600 seconds/hour
    start_block = block.at(timestamp=(t-offset))  
    
    # the DVM imposes a minimum number of blocks within a given time period to ensure safety against price manipulation
    if end_block-start_block < minimum_ranges[N]:
        start_block = end_block-minimum_ranges[N]
    
    total_gas, rolling_sum = 0, 0
    TXes = []
    
    # loop over the block in the defined range starting with the least recent
    for b in range(start_block, end_block, 1):
        # gasUsed is in the header of each block
        total_gas += b.gasUsed
        for tx in b.transactions():
            gas_price = tx.gasPrice
            gas_used = tx.totalGasUsed
            TXes.append((gas_price, gas_used))
    
    # sort transactions by gas_price ascendingly
    sorted_TXes = sorted(TXes, key=lambda tup: tup[0])

    for gas_price, gas_used in sorted_TXes:
        rolling_sum += gas_used
        if rolling_sum > total_gas/2:
            return gas_price
```


## Security considerations

Anyone relying on this data point should take note of the fact that manipulating the gas prices in a **specific** block or a short range of blocks is achievable by miners whether to inflate or deflate them for their own self-interest or on behalf of an attacker that bribed them to do so. The longer the range the requested statistic covers, the less the risk of manipulation is. This risk will also be significantly inhibited once [fee burn](https://github.com/ethereum/EIPs/blob/master/EIPS/eip-1559.md) is introduced in the Ethereum blockchain, because stuffing/padding blocks will have a non-zero cost even to miners (PoW) or block-producers (PoS).

A large enough number of UMA governers should be running their full node to ensure data integrity. Relying on third-party full nodes presents a risk of manipulation of data, however if at least **one** governer is relying on their own full node, such manipulation is easily detectable. Hence, the security model here is 1-of-N which is low-risk.
=======
## Headers
| UMIP-13    |                                                                                                                                          |
|------------|------------------------------------------------------------------------------------------------------------------------------------------|
| UMIP Title | Add PERLUSD, USDPERL as price identifiers              |
| Authors    | TJ (tj@perlin.net) |
| Status     | Draft                                                                                                                                    |
| Created    | August 31, 2020                                                                                                                           |

## Summary (2-5 sentences)
The DVM should support price requests for the PERL/USD and USD/PERL price index.

## Motivation
The DVM currently does not support the PERLUSD or USDPERL price index.
Cost: 
Pricing of PERLUSD is easily accessible through open centralized exchange APIs. PERL is currently only trading on Binance.
Opportunity: A synthetic token that tracks the underlying assets would enable better price discovery by making it possible to have cash/PERL settled position on the underlying assets. It could be used as a hedging tool.
More information on the Perlin products can be found on the website: https://perlinx.finance/

## Technical Specification
The definition of this identifier should be:
- Identifier name: PERLUSD
- Base Currency: PERL
- Quote Currency: USD(T)
- Exchanges: Binance
- Result Processing: No processing.
- Input Processing: None. Human intervention in extreme circumstances where the result differs from broad market consensus.
- Price Steps: 0.00001 (5 decimals in more general trading format)
- Rounding: Closest, 0.5 up
- Pricing Interval: 60 seconds
- Dispute timestamp rounding: down

The definition of this identifier should be:
- Identifier name: USDPERL
- Base Currency: USD(T)
- Quote Currency: PERL
- Exchanges: Binance
- Result Processing: 1/PERLUSD.
- Input Processing: None. Human intervention in extreme circumstances where the result differs from broad market consensus.
- Price Steps: 0.00001 (5 decimals in more general trading format)
- Rounding: Closest, 0.5 up
- Pricing Interval: 60 seconds
- Dispute timestamp rounding: down



## Rationale

Prices are primarily used by Priceless contracts to calculate a synthetic token’s redemptive value in case of liquidation or expiration. Contract counterparties also use the price index to ensure that sponsors are adequately collateralized.
More complex computations (like incorporating additional exchanges, calculating a TWAP or VWAP, or imposing price bands, etc.) have the potential to add a greater level of precision and robustness to the definition of this identifier, particularly at settlement of each expiring synthetic token. However, we felt that the costs in increased complexity and mental load to the stakeholders who need to use it (like sponsors, liquidators, and disputers) outweighed the benefits, especially during this period where the synthetic  token is newly launched.
Currently the only exchanges with USD or stablecoin markets for $PERL is Binance. This may introduce a single point of failure. The price from PerlinX can be used as a reference if Binance goes down, and a backup data source is needed. However during normal operation, the price of PERL on PerlinX should closely track the value on Binance.

In the current setting, there will need to be a significant event that erodes confidence in Perlin Network and the token, at the same time where Binance is not operational for value on PerlinX to be used as reference. However this may pose a security issue depending on the depth of PERLUSD liquidity on PerlinX. This may be improved by listing on additional exchanges with genuine volume.

Over time, as liquidity in the $PERL token migrates across platforms, this identifier can be re-defined to add exchanges, remove exchanges, or change the way that the price is calculated. Any re-definition would be done via off-chain social consensus by $UMA-holders, and ultimately reflected in the way that $UMA-holders vote upon the price of $PERLUSD and $USDPERL when called to do so by disputers, or at settlement.


## Implementation

The value of this identifier for a given timestamp should be determined by querying for the price of PERLUSDT from Binance for that timestamp. While PERL is also trading on several other exchanges, most of the genuine volume happens on Binance, which forms the broad market consensus. 
While it's important for tokenholders to have redundancy in their sources, bots and users that interact with the system in realtime need fast sources of price information. In these cases, it can be assumed that the price on Binance is accurate enough.
[Here](https://github.com/UMAprotocol/protocol/blob/master/financial-templates-lib/price-feed/CryptoWatchPriceFeed.js) is a reference implementation for an offchain price feed based on the [CryptoWatch API](https://docs.cryptowat.ch/rest-api/). This feed should be used as a convenient way to query the price in realtime, but should not be used as a canonical source of truth for voters. Users are encouraged to build their own offchain price feeds that depend on other sources.

PerlinX will provide the live price feed on the website publicly, and may offer API access in the future.

## Security considerations
Adding this new identifier by itself poses little security risk to the DVM or priceless financial contract users. However, anyone deploying a new priceless token contract referencing this identifier should take care to parameterize the contract appropriately to the reference asset’s volatility and liquidity characteristics to avoid the loss of funds for synthetic token holders. Additionally, the contract deployer should ensure that there is a network of liquidators and disputers ready to perform the services necessary to keep the contract solvent.
$UMA-holders should evaluate the ongoing cost and benefit of supporting price requests for this identifier and also contemplate de-registering this identifier if security holes are identified. As noted above, $UMA-holders should also consider re-defining this identifier as liquidity in the underlying asset changes, or if added robustness (eg via TWAPs) are necessary to prevent market manipulation.

# Headers
| UMIP-13     |                                                                                                                                          |
|------------|------------------------------------------------------------------------------------------------------------------------------------------|
| UMIP Title | Add GASETH-1HR GASETH-3HR GASETH-24HR as a price identifiers                                                                                                 |
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
- Identifier name: GASETH-1HR GASETH-3HR GASETH-24HR
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

The reported price has to take two considerations in mind: (1) there is a block each 12-15 seconds in the Ethereum blockchain, and spikes in gas prices are routinely observed, and (2) miners can easily manipulate gas prices in a given block (especially in absence of a fee burn). Therefore, an aggregatory statistic needs to be computed over a sufficiently long range of blocks to eliminate these two vectors. We propose the median gas price over 300, 900, or 7200 blocks _weighted by_ the gas used in a transaction. These ranges corresponding to 1HR, 3HR, or 24H (1D) worth of blocks. 

## Implementation

The total gas used over the last 300 (GASETH-1HR), 900 (GASETH-3HR) or 7200 (GASETH-24HR) blocks that were mined at or before the `timestamp` provided to DVM is computed. Transactions in this range are also sorted by `total_gas_consumed`. 

The pseudo-algorithm to calculate the exact data point to report by a DVM reporter is as follows:

```python
def return_median(t, N)
    assert N==300 or N==900 or N==7200
    B0 = block.at(timestamp=t) # rounded down
    total_gas, rolling_sum = 0, 0
    TXes = []
    
    # loop over the most recent N blocks starting from the most recent block mined at <=timestamp t
    for b in range(B0, B0-N, -1):
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

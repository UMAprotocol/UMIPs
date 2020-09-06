# Headers
| UMIP-13     |                                                                                                                                          |
|------------|------------------------------------------------------------------------------------------------------------------------------------------|
| UMIP Title | Add GASETH as a price identifier                                                                                                 |
| Authors    | Ali Atiia, @aliatiia |
| Status     | Draft                                                                                                                                    |
| Created    | September 4, 2020                                                                                                                           |

## Summary (2-5 sentences)
The DVM should support requests for aggregatory gas prices on the Ethereum blockchain. 

## Motivation
The DVM currently does not support reporting aggregatory gas prices of finalized blocks on the Ethereum blockchain. 

Cost: Calculating an aggregatory statistic of gas prices on a confirmed block or range of blocks on the Ethereum blockchain is easy by virtue of the fact that all needed data is readily available on any Ethereum full node, whether run locally or accessed remotely through well-known providers such as Infura.

Opportunity: gas options/futures can help users and developers hedge against gas volatility allowing them to budget their gas consumption efficiently.

## Technical Specification

The definition of this identifier should be:
- Identifier name: GASETH
- Base Currency: ETH
- Quote Currency: GAS
- Sources: any Ethereum full node
- Result Processing: Exact
- Input Processing: see Implementation section
- Price Steps: 1 Wei
- Rounding: Closest, 0.5 up
- Pricing Interval: 1 block seconds
- Dispute timestamp rounding: down

## Rationale

the volatility of gas prices on Ethereum is a well-recognized problem that is only made worse by the ever increasing network congestion in recent months. This creates an opportunity for options/futures underwriters to create financial products that help decentralized applications (dApps) and their users hedge against gas price variability and have a consistent risk-minimized experience. The UMA protocol is well-positioned to provide the necessary plumbing for such products to be built. Such products will need to rely the DVM as a settlement layer in case of disputes. By supporting gas prices aggregatory statistics, the DVM opens the door for these products to offer their services and create a win-win situation with their customers in the Ethereum ecosystem.

Each transaction included in an Ethereum block pays an amount of Ether per 1 unit of gas consumed. That amount is (a) specified by a `gasPrice` parameter attached to a transaction, (b) is expressed in the smallest unit of the Ether currency which is `Wei`, and is set by the transaction submitter as a bid that she offers to the miners to have her transaction included. We therefore have a set of gasPrices per block.

A straight-forward yet sufficiently flexible aggregatory statistics that can serve as a proxy for the gas price in a given block is the $i$th percentile. But there is a block each 12-15 seconds in the Ethereum blockchain, and spikes in gas prices are routinely observed. Hence, a second-order statistic is also needed to smooth-out outliers. This also makes the feed manipulation-resistant (a risk which should be significantly minimized once EIP1559 is implemented). It may therefore be desireable to request from the DVM an aggregatory statistic over a range of blocks. Hence, the median of the $i$th percentiles over a range of blocks can be reported.


## Implementation

Data point requestors specify three positive integers: `B`, `R`, `i` where `B` is an Ethereum block number, `7000>=R>=B` is the maximum block implying the desired range is [`B`,`B+1`, ..,  `B`+`R`], and `P` is the desired percentile and must be in the set `{0, 1, 2, .., 100}`. Restricting `R` to 7000 implies a maximum range of ~1 day worth of Ethereum blocks which imposes a cap on how much data processing the DVM reporters must do. For `i=0` and `i=100`, the requester is effectively asking for the median of all the `min`'s and `max`'s of gas prices, respectively. For all other values, the requester is asking for `i`th percentile.

The pseudo-algorithm to calculate the exact data point to report by a DVM reporter is as follows:

```python
def return_median(B, R, i)
    Median = None
    Percentiles = []
    for b in range(B, B+R, 1):      
        transactions = provider.getTransactions(B)
        gas_prices = []
        for tx in transactions:
            gas_prices.append(tx.gasPrice)
        Percentiles.append(math.percentile(gas_prices, i)) # ensure determinism here
    return math.median(Percentiles) # ensure determinism here
```


## Security considerations

Anyone relying on this data point should take note of the fact that manipulating the gas prices in a **specific** block or a short range of blocks is achievable by miners whether to inflate or deflate them for their own self-interest or on behalf of an attacker that bribes them to do so. The longer the range the requested statistic covers, the less the risk of manipulation is.

A large enough number of UMA governers should be running their full node to ensure data integrity. Relying on third-party full nodes presents a risk of manipulation of data, however if at least **one** governer is relying on their own full node, such manipulation is easily detectable. Hence, the security model here is 1-of-N which is low-risk.

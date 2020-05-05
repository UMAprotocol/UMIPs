## Headers
UMIP-2

Title: Add ETHBTC as a price identifier

Author: Allison Lu, allison@umaproject.org

Status: Draft

Created: April 12, 2020

## Summary (2-5 sentences)
The DVM should support price requests for the ETH/BTC price index. 

## Motivation
The DVM currently does not support the ETHBTC index.

Cost: Pricing for this index is easy to access through open centralized exchange APIs, and
cross-exchange price discrepancies are typically <0.5%. 

Opportunity: A synthetic token that tracks ETHBTC could be used as a hedging tool. It can also be used
to create synthetic bitcoin or synthetic ETH.

## Technical Specification
The definition of this identifier should be the median of the ETHBTC trading pair price from 3
exchanges’ public APIs: Coinbase, Binance, and Bitstamp, unless that median value differs from “Broad
Market Consensus” as defined by the DVM’s decentralized human judgment. The calculation of median
should not include observation of ETHUSD or BTCUSD directly, and instead only look at the ETHBTC
trading pair on each exchange. The precision should be to 5 decimals with timestamp granularity to 60
seconds. If a request arrives that is in the middle of a minute, the resulting price should be the
price at the beginning of that minute.

## Rationale
We explored two primary alternative designs:
  1. Self-referential TWAP of synthetic token price pre-expiration
  2. More complex computations using centralized exchange prices

Prices are primarily used by Priceless contracts to calculate a synthetic token’s redemptive value in
case of liquidation or expiration. Contract counterparties also use the price index to ensure that
sponsors are adequately collateralized. If we use a self-referential TWAP of the synthetic token
price, it is relatively easy and possible to manipulate the token’s price pre-expiration and cause a
cascading series of sponsor liquidations that may exceed the amount of liquidity available to keep
the token contract solvent. Additionally, there may be complexity or ambiguity for DVM voters in case
there are multiple token contracts deployed simultaneously from the same identifier string.
Therefore, we decided against using self-referential prices. 

More complex computations using centralized exchange prices (like incorporating additional exchanges,
calculating a TWAP or VWAP, or imposing price bands, etc.) have the potential to add a greater level
of precision and robustness to the definition of this identifier. However, we felt that the costs in
increased complexity and mental load to the stakeholders who need to use it (like sponsors,
liquidators, and disputers) outweighed the benefits. We also considered an alternative set of
exchanges to Coinbase, Binance, and Bitstamp. However, based on reports from Bitwise, Cointelegraph,
and other news reports, we believe that many crypto exchange volumes had been overreported in the
past and the three that we selected had some of the highest genuine volumes in the industry.

## Implementation

The value of this identifier for a given timestamp should be determined by querying the price of
ETHBTC on Coinbase, Bitstamp, and Binance for that timestamp, taking the median, and determining
whether that median differs from broad market consensus. This is meant to be vague as the
tokenholders are responsible for defining broad market consensus.

Ultimately, how one queries the exchanges should be varied and determined by the voter to ensure
that there is no central point of failure.

While it's important for tokenholders to have redundancy in their sources, bots and users that
interact with the system in realtime need fast sources of price information. In these cases, it can
be assumed that the exchange median is accurate enough.

Here(LINK_TBD) is a reference implementation for an offchain price feed based on the
[CryptoWatch API](https://docs.cryptowat.ch/rest-api/). This feed should be used as a convenient
way to query the price in realtime, but should not be used as a canonical source of truth for
voters. Users are encouraged to build their own offchain price feeds that depend on other sources.

## Security considerations
Adding this new identifier by itself poses little security risk to the DVM or priceless financial
contract users. However, anyone deploying a new priceless token contract should take care to
parameterize the contract appropriately to avoid the loss of funds for synthetic token holders.
Additionally, the contract deployer should ensure that there is a network of liquidators and
disputers ready to perform the services necessary to keep the contract solvent.  

## Headers

- UMIP <#>
- UMIP title: Add AMPLUSD as a price identifier
- Author (alex, abgtrading30@gmail.com)
- Status: Draft
- Created: December 20, 2020

## Summary (2-5 sentences)

The DVM should support price requests for the AMPL/USD price index.

## Motivation

The DVM currently does not support the AMPL/USD price index.

Supporting the AMPLUSD price identifier would enable the creation of a synthetic AMPLUSD token, backed by USD. Token minters could obtain short exposure on the AMPL/USD index, while token holders could go long or use synthetic AMPL for functional purposes.

There are multiple practical uses and trading strategies for synthetic AMPL which include avoiding rebases, minting tokens for short exposure, and hedging underlying AMPL exposure. Background on Ampleforth and its rebase mechanism can be found in the project whitepaper: https://www.ampleforth.org/papers/

There is little cost associated with adding this price identifier, as there are multiple free and easily accessible data sources available.

## Technical Specification

The definition of this identifier should be:

- Identifier name: AMPLUSD
- Base Currency: AMPL
- Quote Currency: USD
- Data Sources: FTX, Bitfinex, Gate.io
- Result Processing: Median
- Input Processing: None. Human intervention in extreme circumstances where the result differs from broad market consensus.
- Price Steps: 0.0001 (4 decimals in more general trading format)
- Rounding: Closest, 0.5 up
- Pricing Interval: 60 seconds
- Dispute timestamp rounding: down

## Rationale

Prices are primarily used by Priceless contracts to calculate a synthetic token’s redemptive value in case of liquidation or expiration. Contract counterparties also use the price index to ensure that sponsors are adequately collateralized.

There is a lot to consider when deciding Ampleforth’s data sources. Part of Ampleforth’s rebase mechanism uses a market oracle, Chainlink, for price feeds. Chainlink sources prices using aggregators (BraveNewCoin, Kaiko, and CryptoCompare) for its volume weighted price. This is problematic as Kaiko is not a free resource and CryptoCompare is only free for personal projects and capped at 250,000 lifetime calls.

Other factors that are relevant to the volume and price for AMPL:

- Compared to other ERC-20 tokens, there is a high level of complexity for centralized exchanges to integrate AMPL due to its daily changes in supply potentially limiting adoption.
- The project has set up liquidity mining (Geyser programs) to incentivize liquidity on decentralized exchanges (Uniswap, Sushiswap, Balancer).
- One of its centralized exchanges, Kucoin, suffered a hack in September. Since the hack, there have been moments where the Kucoin pairs have reflected a lower market price compared to other exchanges. This creates hesitation in using it as one of the main data sources even though it has a high percentage of reported centralized exchange volume.

The option being proposed is to use the index price used by FTX, Bitfinex, and Gate.io for their perpetual futures contracts. This price is used for funding payments, liquidations, and takes multiple trading pairs into account. Using these sources will make manipulation difficult and all three of these exchanges have free price sources.

- FTX: Referred to as index price. The FTX AMPL_PERP contract uses the average of AMPL prices on FTX USD, FTX USDT, Bitfinex BTC, Bitfinex USD (Index), Kucoin BTC, and Kucoin USDT.
- Bitfinex: Referred to as mark price which uses the BFX Composite Index for the AMPL-PERP contract. This price is what is used on Bitfinex for funding payments and liquidations.
- Gate.io: Referred to as mark price which is an index type and relies on Gate.io and Bitfinex price sources.

As AMPL is added to more exchanges, the technical specification of this identifier could be modified to reflect more reliable exchanges based on volume.
Users should use these aggregators as a convenient way to query the price in real-time, but should not be used as a canonical source of truth for voters. Users are encouraged to build their own offchain price feeds that depend on other sources.

## Implementation

The value of AMPLUSD for a given timestamp can be determined with the following process:

1. AMPL/USD should be queried from Gate.io, Bitfinex, and FTX for that timestamp rounded to the nearest second. The results of these queries should be kept at the level of precision they are returned at.
2. The median of the AMPL/USD results should then be taken and determined whether that median differs from broad market consensus.
3. This result should be rounded to four decimal places.

This is meant to be vague as the tokenholders are responsible for defining broad market consensus. Ultimately, how one queries the exchanges should be varied and determined by the voter to ensure that there is no central point of failure.

While it's important for tokenholders to have redundancy in their sources, bots and users that interact with the system in real time need fast sources of price information. In these cases, it can be assumed that the exchange median is accurate enough.

The chosen AMPL/USD endpoints are:

| Endpoint                                                       | Field name of price |
| -------------------------------------------------------------- | ------------------- | ---------------------------------------------- |
| https://ftx.com/api/futures/AMPL-PERP                          | _index_             |
| https://api.gateio.ws/api/v4/futures/usdt/contracts/AMPL_USDT  | _mark_price_        | \* mark_type = index                           |
| https://api-pub.bitfinex.com/v2/status/deriv?keys=tAMPF0:USTF0 | _MARK_PRICE_        | \* MARK_PRICE based on the BFX Composite Index |

This is only a reference implementation, how one queries the exchanges should be varied and determined by the voter to ensure that there is no central point of failure.

## Security considerations

Adding this new identifier by itself poses little security risk to the DVM or priceless financial contract users. However, anyone deploying a new priceless token contract referencing this identifier should take care to parameterize the contract appropriately to avoid the loss of funds for synthetic token holders. Additionally, the contract deployer should ensure that there is a network of liquidators and disputers ready to perform the services necessary to keep the contract solvent.

I went back and forth on whether to use the Gate.io perpetual futures price or spot price. The futures price relies on Gate.io and Bitfinex which may place too much dependence on Bitfinex and lead to possible price manipulation. However, the Gate.io price still influences the price and watching over the course of a few days appears much less volatile than the spot price. The bottom line is that each one of these futures are heavily dependent on these price feeds for funding and liquidations. The UMA contract will be in a better position than even these exchanges by taking the median of the three sources.

$UMA-holders should evaluate the ongoing cost and benefit of supporting price requests for this identifier and also contemplate de-registering this identifier if security holes are identified. $UMA-holders should also consider re-defining this identifier as liquidity in the underlying asset changes, or if added robustness (eq via TWAPs) are necessary to prevent market manipulation.

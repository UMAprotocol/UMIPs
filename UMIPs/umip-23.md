# Disclaimer

This price identifier has been deprecated. It is highly recommended that contract deployers do not use this identifier in its current state for new contracts. Price requests from contracts created after 02/20/21 00:00 UTC will likely not be resolved correctly. 

Reasoning: The new EMP template proposed in [UMIP-54](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-54.md) requires that all price identifiers be scaled to 18 decimals. There are live contracts using the old EMP template which require this price identifier to be scaled equal the number of decimals in renBTC (8). Because of this, the DVM could return prices incorrectly for new contracts that use this identifier. 

## Headers
| UMIP-23     |                                                                                                                                          |
|------------|------------------------------------------------------------------------------------------------------------------------------------------|
| UMIP Title | Add BCHNBTC as a price identifier              |
| Authors    | Bae (bae@youmychicfila.com), K (k@youmychicfila.com) |
| Status     | Approved                                                                                                                                    |
| Created    | November 26, 2020                                                                                                                           |
 
## Summary (2-5 sentences)
The DVM should support price requests for the BCHN/BTC price index.
 
 
## Motivation
The DVM currently does not support the BCHN/BTC price index.
 
Supporting the BCHNBTC price identifier would enable the creation of an Bitcoin Cash N, backed by BTC. Token minters could go short on the BCHN/BTC index, while token holders could go long or use synthetic BCHN for functional purposes.
 
Due to the recent hard fork last week, there has been a divergence in the sha256 miners for BCH between supporting the A or N chains. Currently, BCHN is disproportionately winning, and there is no containerized way to allocate risk to taking a view on BCH natively in the Ethereum DeFi ecosystem aside from the iBCH synthetic on Synthetix, which we believe is unideal for BTC denominated entities looking to take a view on the BCHN/BTC spread. Further, given the large interest in iBCH, relative to the other i* synthetics on Synthetix, there exists empirical evidence that there is strong retail demand in the eth defi community to express short interest on BCH. Lastly, given the current regime, empirically retail has viewed BCH as levered beta on BTC which will fuel the longs for this synthetic minting. 
 
There is little cost associated with adding this price identifier, as there are multiple free and easily accessible data sources available.
 
## Technical Specification
The definition of this identifier should be:
 
- Identifier name: BCHNBTC
- Base Currency: BCHN
- Quote Currency: BTC
- Data Sources: Binance, Coinbase Pro, Huobi
- Result Processing: Median of BCH/BTC
- Input Processing: None. Human intervention in extreme circumstances where the result differs from broad market consensus.
- Decimals: 8
- Rounding: Closest, 0.5 up
- Pricing Interval: 60 seconds
- Dispute timestamp rounding: down
- Scaling Decimals: 8 (1e8)
 
## Rationale
Prices are primarily used by Priceless contracts to calculate a synthetic token’s redemptive value in case of liquidation or expiration. Contract counterparties also use the price index to ensure that sponsors are adequately collateralized.

BCHBTC uses [Binance](https://www.binance.com/en/support/announcement/ade106fd65974a9982fc5a32e063d0b0), [Coinbase Pro](https://help.coinbase.com/en/coinbase/getting-started/general-crypto-education/coinbase-update-on-november-2018-bch-hard-fork), and [Huobi](https://huobiglobal.zendesk.com/hc/en-us/articles/900004372123-Huobi-Global-Will-Support-The-Upcoming-Bitcoin-Cash-BCH-HardFork) for BCH/BTC price information. Most exchanges, namely the three we listed there for constructing the price, only view BCHN as the dominant fork, so their convention of BCH is just referring to BCHN, as is indicated in the hyperlinks. The objective was to construct a portfolio of liquid price feeds that maximized geographical diversity as well as user base with negatively/zero correlated downtimes. Binance and Huobi are widely regarded as the most liquid and highest ADV exchanges in the world, and have been so for quite some time. Further, each of the exchanges has "crypto SOTA" APIs with free REST + WSS functionality with generous rate limits and robust endpoints for prices that any user may hit, both real time and historically speaking. Further, Coinbase Pro has a fairly orthogonal user base to the above exchanges and serves as an additive signal to a notion of "fair value" of BCH/BTC, along with a user friendly API. All three of these exchanges have 24/7 customer support + devops team ensuring highly available programmatic access and have strong redundancy across a variety of geographies. Lastly, because Binance and Huobi also have the most liquid derivatives market for both BCH and BTC pairs, users on their platforms should be able to arbitrage the BCHN uma synths if they so please, thereby increasing popularity of these synthetics.
 
The decision to query for BCH/BTC instead of BCH/USD is due to three main reasons. Mostly BTC denominated users want to be able to express short-dated interest in the SHA256d coin space, particularly of BCHN given the recent hard fork. Also, from a capital efficiency standpoint, it is important to notice the magnitude of the correlation between BTC and BCH, which has been strong and positive (1 year perason correlation is approximately 0.75) in all bullish regimes of crypto. Given this, users are able to get by with thinner collateral ratio requirements given that they both tend to trend to together. In other words, more formally, the relative volatility of BCH/USD exceeds that of BCH/BTC by a stat sig amount given the positive correlation between them. Lastly, the use of BCH/USD with BTC as collateral would have resulted in a quanto effect where there would be embedded convexity (correlation conditional gamma) that users would have to either hedge out or be forced to take a view on. Given the only liquid place to hedge that is on Bitmex, and due to their recent legal troubles, we decided it would be inconvenient to impose that on users. Further, while we are no strangers to quanto derivatives, the core thesis here isn't to productize BCH-BTC correlation. 

## Implementation
 
The value of BCHBTC for a given timestamp can be determined with the following process.
 
1. BCH/BTC should be queried for from Binance, Huobi, and Coinbase Pro for the given timestamp rounded to the nearest second. The results of these queries should be kept at the level of precision they are returned at.
2. The median of the BCH/BTC results should then be taken.
3. This result should be rounded to eight decimal places.
 
Additionally, [CryptoWatch API](https://docs.cryptowat.ch/rest-api/) is a useful reference. This feed should be used as a convenient way to query the price in realtime, but should not be used as a canonical source of truth for voters. Users are encouraged to build their own offchain price feeds that depend on other sources.
 
Voters are responsible for determining if the result of this process differs from broad market consensus. This is meant to be vague as $UMA tokenholders are responsible for defining broad market consensus.
 
This is only a reference implementation, how one queries the exchanges should be varied and determined by the voter to ensure that there is no central point of failure.
 
## Security considerations
Adding this new identifier by itself poses little security risk to the DVM or priceless financial contract users given this is dealing with two of the most liquid cryptocurrencies in the whole cryptoverse. However, anyone deploying a new priceless token contract referencing this identifier should take care to parameterize the contract appropriately to avoid the loss of funds for synthetic token holders. Additionally, the contract deployer should ensure that there is a network of liquidators and disputers ready to perform the services necessary to keep the contract solvent.
 
$UMA-holders should evaluate the ongoing cost and benefit of supporting price requests for this identifier and also contemplate de-registering this identifier if security holes are identified.

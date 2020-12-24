## Headers
| UMIP-28     |                                                                                                                                          |
|------------|------------------------------------------------------------------------------------------------------------------------------------------|
| UMIP Title | Add ELASTIC_STABLESPREAD as a price identifier              |
| Authors    | Bae (bae@youmychicfila.com), K (k@youmychicfila.com) |
| Status     | Last Call                                                                                                                                    |
| Created    | December 23, 2020                                                                                                                           |
 
## Summary (2-5 sentences)
The DVM should support price requests for the ELASTIC_STABLESPREAD price index. ELASTIC_STABLESPREAD is defined as: `min(max(A - B + 1, 0), 2)`, where `A` refers to an equally weighted basket of {ESD, FRAX, BAC}. B is `MUSD`. ESD is Empty Set Dollar, an algorithmic stablecoin on Ethereum with a dynamic supply model. FRAX is a fractional-algorithmic stablecoin on Ethereum that operates on a creative approach to maintaining a peg via a partially collateralized approach. BAC is Basis Cash, a dynamic supply stablecoin on Ethereum, essentially a version of what the original Basis project meant to be a few years ago. `MUSD` is an autonomous and non-custodial stablecoin on mStable, representing a basket of stablecoins on Ethereum, namely USDT, USDC, TUSD, and DAI. 

## Motivation
The DVM currently does not support the ELASTIC_STABLESPREAD price index. 
 
Supporting the ELASTIC_STABLESPREAD price identifier would enable the creation of a linear combination of stablecoin baskets, both traditional Ethereum-based stablecoins as well as newer elastic-supply based models on Ethereum. Token minters could go short on the ELASTIC_STABLESPREAD index, while token holders could go long or use synthetic ELASTIC_STABLESPREAD for functional purposes.
 
There has been an increasing growth of seigniorage + elastic-supply based stablecoins over the last few months, and especially over the last few weeks given the success of ESD's launch. Each of these stablecoins have their own quirks and mechanisms in which they aim to target their peg. Historically, it appears that the elastic-supply based stablecoins are more susceptible to feedback loops where they will stay above their peg for an extended period of time or below their peg for an extended period of time. Currently, most of these are trading at a premium. Users will now be able to speculate on the "premium" of the seigniorage model for elastic supply based stablecoins. Currently, there does not exist a mechanism for users to express a view on the relative performance of which basket of stablecoins actually retains it peg better without actually acquiring the underlying constituents of the long basket and picking up a synthetic short position of the other basket. 

Further, we also believe ELASTIC_STABLESPREAD can act as a defi credit spread primitive where folks can build other products on top, such as an insurance based product where the premium of the insurance is tied to the divergence between the two baskets of stablecoins. Additionaly, one can view the probability of default of a stablecoin as `1 - min(price, 1)`. Given that each basket of stablecoins is a convex combination, then it is also a convex combination of default probabilities. ELASTIC_STABLESPREAD is then a difference of convex combination of default probabilities. We also believe that a CDS (credit default swap) can be built on top of this since they are effectively a function of default probabilities, and once ELASTIC_STABLESPREAD gets whitelisted as a price identifier, we will start development on such products.

Let's walk through some cases to better understand what happens in various cases for ELASTIC_STABLESPREAD. If both of these baskets were to trade at their theoretical value, then the resulting value of ELASTIC_STABLESPREAD will be 1. If the Ethereum based stablecoin basket loses its peg and appreciates in value relative to the non-Ethereum stablecoin basket, then the value of ELASTIC_STABLESPREAD will be less than 1. If the opposite happens, then it will be more than 1. It is important that this only measures "relative ability to maintain peg". That is, if both of them lose their peg in the same form, the resulting value still may be 1. 
 
There is little cost associated with adding this price identifier, as there are multiple free and easily accessible data sources available.
 
## Technical Specification
The definition of this identifier should be:
 
- Identifier name: ELASTIC_STABLESPREAD
- Base Currency: ELASTIC_STABLESPREAD
- Data Sources: {Uniswap V2: FRAX/ETH} for FRAX, {Uniswap V2: ESD/ETH} for ESD, {Uniswap v2: BAC/ETH} for BAC, {Balancer: MUSD/USDC, Uniswap V2: MUSD/USDC} for MUSD, {Uniswap v2: USDC/ETH} for ETH
- Result Processing: For each constituent asset of the basket, the average of exchanges. Normalizing the ETH result to USDC for FRAX, ESD, and BAC.
- Input Processing: None. Human intervention in extreme circumstances where the result differs from broad market consensus.
- Decimals: 8
- Rounding: Closest, 0.5 up
- Pricing Interval: 60 seconds
- Dispute timestamp rounding: down
 
## Rationale
Prices are primarily used by Priceless contracts to calculate a synthetic token’s redemptive value in case of liquidation or expiration. Contract counterparties also use the price index to ensure that sponsors are adequately collateralized.

For each of the constituents of ELASTIC_STABLESPREAD- FRAX, ESD, BAC, MUSD, we picked the most liquid exchange, including both CeFi and DeFi sources for diversity. On the DeFi side, Uniswap V2 and Balancer are widely regarded as high quality AMMs and due to their on-chain existence, are highly-available by default. 

The objective for ELASTIC_STABLESPREAD was to construct a portfolio of the most liquid and active Ethereum based stablecoins, both traditional and the newer elastic supply ones, and rather than using some complicated weighting scheme, we are initially imposing uniform weighting. If it turns out there is some user feedback around doing a market-cap weighting, ADV-weighting, etc. that can be future work for us. On the MUSD side, we were deciding between that and DUSD as both are convex combinations of liquid stablecoins but the latter is not liquid or active compared to the former. We also experimented with a variety of functional forms of computing a divergence of these two baskets to represent a credit spread. Computing the ratio of them had some promising properties, namely non-negativity constraints, but the nonlinearity of it had some subpar properties that might cause unfriendly UX as liquidations might cascade if the denominator went down X% as opposed to the numerator. So, we settled on an affine transformation, where if both baskets are indeed the same then the result will be 1.

## Implementation
 
The value of ELASTIC_STABLESPREAD for a given timestamp can be determined with the following process.
 
1. ESD, FRAX, BAC, MUSD should be queried for from the exchanges listed in the "Technical Specification" section for the given timestamp rounded to the nearest second. The results of these queries should be kept at the level of precision they are returned at.
2. For each one, the average of the prices should be calculated.
3. Then, calculate 1/3 * ESD + 1/3 * FRAX + 1/3 * BAC, denote this as `A`, which is in ETH terms
4. Perform A * ETH/USDC - MUSD + 1
5. Perform the maximum of the result of step 4 and 0. This is to ensure non-negativity. 
6. Perform the minimum of the result of step 5 and 2. This is to ensure symmetry.
7. This result should be rounded to eight decimal places.
 
Additionally, [CryptoWatch API](https://docs.cryptowat.ch/rest-api/) is a useful reference. This feed should be used as a convenient way to query the price in realtime, but should not be used as a canonical source of truth for voters. Users are encouraged to build their own offchain price feeds that depend on other sources.
 
Voters are responsible for determining if the result of this process differs from broad market consensus. This is meant to be vague as $UMA tokenholders are responsible for defining broad market consensus.
 
This is only a reference implementation, how one queries the exchanges should be varied and determined by the voter to ensure that there is no central point of failure.

As an example of how one may go about constructing such a feed programmatically, here is one that was put together as a standalone script with minimal dependencies: https://gist.github.com/chicfilabae/88b5805164d9d5347b9f72b371c237cb. As always, double-check the implementation as well as include additional measures for reliability to ensure reasonable assumptions around when the graph or cryptowatch isn't available. 
 
## Security considerations
Adding this new identifier by itself poses little security risk to the DVM or priceless financial contract users given this is dealing with some of the most liquid stablecoins in the whole cryptoverse, and the relative price volatility of them has been rather low due to their stablecoin properties. However, anyone deploying a new priceless token contract referencing this identifier should take care to parameterize the contract appropriately to avoid the loss of funds for synthetic token holders. Additionally, the contract deployer should ensure that there is a network of liquidators and disputers ready to perform the services necessary to keep the contract solvent.
 
$UMA-holders should evaluate the ongoing cost and benefit of supporting price requests for this identifier and also contemplate de-registering this identifier if security holes are identified.


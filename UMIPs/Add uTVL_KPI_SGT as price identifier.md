UMIP Title: Create KPI Options for SharedStake using SGT as Collateral; Using Price Identifiers for SGT, SGT/ETH UNI LP, and vETH2
Status: Draft
Authors: Warren Muffett and Chimera
Discourse: https://discourse.umaproject.org/t/add-utvl-kpi-sgt-as-a-price-identifier/860
Create: April 9th, 2021

Summary
Key Performance Indicator (KPI) options are synthetic tokens that redeem to protocol tokens with the redemption value determined by performance against that indicator. One example of a KPI is Total Value Locked (TVL).
This UMIP enables the DVM to support price requests based on the TVL of SharedStake.
A synthetic option is minted against a base collateral, in this case SGT, which expires at 00.00(UTC) December 31th 2021.
Options are redeemed on the basis of TVL/10^9, with a floor of 0.1 and a ceiling of 2.
The value staked is calculated by identifying the total values staked within the SGT pool, SGT/ETH LP liquidity mining pool, vETH2 pool, and the newly added pools - SGT/vETH2 LP and SaddlevETH2. The dollar value of each of the collateral types is then summed to provide the total value locked.
Motivation
The primary motivation for the development of KPI options is to allow protocols to incentivize Defi users to assist them to reach the protocol's identified goals. By leveraging their community resources, SharedStake can increase TVL, strengthen their governance token, and share value with their community members.
Total Value Locked (TVL) is a frequently quoted key performance indicator and one which has a level of prominence in key Defi dashboards as an indicator of the health and growth of a protocol. 
What are the financial positions enabled by creating this synthetic that do not already exist?
•	This synthetic token will allow the creation of tokens which expire to a set rate of the collateral asset tokens based on a pre-identified bounded ratio as determined by the TVL of the protocol at the time of expiry.
2.	Please provide an example of a person interacting with a contract that uses this price identifier.
•	SharedStake may leverage its community and/or its reputation by minting TVL Options for its token which can be redeemed to a token amount as determined by the TVL of the protocol at the expiry point.
•	A protocol community member, token holder, voter, or proximal Defi protocol participant may be gifted a TVL option by a protocol as an incentive to build the TVL of the protocol within the option timeframe and redeem at expiry.
•	Any user may purchase a TVL Option for a protocol that they believe has the potential for growth in TVL prior to expiry.
3.	The current TVL of SharedStake is approximately $37m as at 4:30(UTC) 19th April 2021.


Markets and Data Sources
There are now five assets approved as Collateral within SharedStake’s staking contracts. These pools are single sided SGT, SGT/ETH LP, vETH2 staking, SGT/vETH2 Uniswap LP, and the Saddle vETH2 pool. To maintain consistency with existing price identifier UMIPs, it is suggested that TVL is calculated using the deepest Dex pools on Uniswap and Sushiswap.
Additionally, there is a liquidity token that is accepted as collateral at Sharedstake.org, which the TVL can be calculated using the Uniswap liquidity / total circulating supply.
The contract addresses for the five staking pools are as shown below:
1. SGT: 0xc637dB981e417869814B2Ea2F1bD115d2D993597
2. SGT/ETH UNIv2 LP: 0x64A1DB33f68695df773924682D2EFb1161B329e8
3. vETH2: 0xA919D7a5fb7ad4ab6F2aae82b6F39d181A027d35
4. SGT/vETH2: 0x53dc9d5deb3b7f5cd9a3e4d19a2becda559d57aa
5. vETH2 Saddle Pool: 0xCF91812631e37C01c443a4fa02DfB59ee2DDbA7c

These pools consist of total tokens stake and the rewards that are to be distributed to stakers. This is easy to navigate with LP tokens by using Etherscan to understand the pools composition and split LPs from SGT rewards. 

It is proposed that these are treated in the above groups for the purposes of determining markets and data sources. For discussion on this see #Rationale
Required questions
1.	What markets should the price be queried from? It is recommended to have at least 3 markets.
i.	vETH2 - Should be prices 1 to 1 with ETH and can be found on Kraken, Binance and Coinbase (as per UMIP 6) https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-6.md)
ii.	Native ERC20 Token(SGT)
We recommend using the Uniswap TWAP. 
iii. Uniswap LP token for SGT/ETH. The pairing address is 0x3d07f6e1627da96b8836190de64c1aed70e3fc55. 
We recommend using the Uniswap TWAP. Reference UMIP 59. 
iv. Uniswap LP token for SGT/vETH2. The pairing address is 0xc794746df95c4b7043e8d6b521cfecab1b14c6ce. 
We recommend using the Uniswap TWAP. Reference UMIP 59.

To calculate the USD value in each pool, I recommend finding the total value of tokens staked within the earn page contracts and multiply them by the prices found in the respective uniswap pools. 

Note - see rationale for further discussion
2.	Which specific pairs should be queried from each market?
i.	ETH - see UMIP 6
ii.	Liquidity Provider Tokens - see UMIP 59
iii.	Native ERC20 Tokens - follow directions in PI UMIP if possible, otherwise [ERC20]/USD* markets, where USD* is either USD or USD stable coin.
3.	Provide recommended endpoints to query for real-time prices from each market listed.
i.	ETH - see UMIP 6
ii.	Liquidity Provider Tokens - see UMIP 59
iii.	Native ERC20 tokens - see relevant PI UMIPs, where no UMIP exist suitable endpoint should be identified at expiry.
4.	How often is the provided price updated?
i.	ETH - see UMIP 6
ii.	Liquidity Provider Tokens - see UMIP 59
iii.	Native ERC20 tokens - see relevant PI UMIPs, where no UMIP exists, provided price update tbd
5.	Provide recommended endpoints to query for historical prices from each market listed.
i.	ETH - see UMIP 6
ii.	Liquidity Provider tokens - see UMIP 59
iii.	Native ERC20 tokens - see relevant PI UMIPs, where no UMIP exists endpoint tbd.
6.	Do these sources allow for querying up to 74 hours of historical data?
o	See relevant UMIPs
7.	How often is the provided price updated?
o	Where updated prices are required, relevant UMIPs refer to the frequency
8.	Is an API key required to query these sources?
o	See Relevant UMIPs
9.	Is there a cost associated with usage?
o	See relevant UMIPS
10.	If there is a free tier available, how many queries does it allow for?
o	The cost impact of this PI would be negligible.
11.	What would be the cost of sending 15,000 queries?
•	There is no need to send 15, 000 queries for this price identifier as it does not require bots.


Price Feed Implementation
As there is no requirement for ongoing monitoring through liquidation or dispute bots, a price feed is not required. The only requirement is a query of the SGT TVL statistic at the timestamp 00.00(UTC) on 31th December according to the data and markets as defined above.


Technical Specifications
1. Price Identifier Name - uTVL_KPI_SGT
2. Base Currency - uTVL_SGT.
3. Quote currency
If your price identifier is a currency pair, your quote currency will be the denominator of your currency pair. If your price identifier does not have a quote currency, please explain the reasoning behind this.
•	There is no quote currency, the denominator is fixed at 10^9 (1 Billion)
•	This price identifier does not have a quote currency as it is designed not to be tied to a currency price metric.
•	The collateral redemption is designed to be tied to the value of the TVL of the protocol by design.
4. Intended Collateral Currency
•	SGT
Does the value of this collateral currency match the standalone value of the listed quote currency?
•	No, this is a design feature.
Is your collateral currency already approved to be used by UMA financial contracts? If no, submit a UMIP to have the desired collateral currency approved for use.
•	WAITING
5. Collateral Decimals
•	18
6. Rounding - Round to 2 decimal places.
•	If the price is 1.025, then this would be rounded up to 1.03. If the price is 1.0249999, then this would be rounded down to 1.02.
•	if the value returned is less than 0.05 round up to 0.1 to provide a floor price.
•	if the value returned is greater that 2 round down to 2 to provide a ceiling price.


RATIONALE
•	This synthetic is designed as an incentivization mechanism to leverage the SGT community, our partners and the wider DeFi userbase to grow our protocol as measured by our identified Key Performance Indicator of Total Value Locked.
•	This price identifier offers a guarantee that these options will be of value, even if this key metric is poor through the floor price mechanism, however the nature of SGT is such that the amount of value that can be locked in the protocol is potentially limitless and consequently a ceiling price is required to limit provide a cap.
•	The methods used to calculate the dollar value of each of the collateral currencies have been chosen to adhere to previous design decisions in such calculations through UMIPs that have already been approved through our governance procedure however note the following assumptions.

1.  It is assumed that SGT is a native ERC20 token and can be priced through its deepest pool.(Uniswap TWAP)
2.	It is assumed for this purpose that 1vEth2 = 1Eth
3.	A Liquidity Token (SGT/ETH Uni-V2) is approved to be staked within the SharedStake ecosystem. 
4.There are a variety of price identifiers for native ERC20 tokens. Calculation of the dollar value should follow the relevant UMIP where it exists, and where there is no Price Identifier UMIP, the three highest volume [ERC20]/USD* markets should be queried, and the median value used.
•	There is no need for price processing. This is a snapshot based on a particular time; however, it may be useful for TVL Options holders to have oversight of the ongoing TVL and consequently the value of their options on an ongoing basis. There should be a dashboard developed to track the TVL of SharedStake, which will be proposed through their governance site.
o	The use of dashboards was considered and I think it may be valuable to use DeFiLlama if the SharedStake team stays up to date with their additional pools. DeFiLlama remains versatile and willing to make quick updates for accuracy.(https://defillama.com/protocol/sharedstake)


IMPLEMENTATION
•	The total value locked is the dollar value of all five pools on SharedStake.org
•	The dollar value of each of the contracts should be calculated using the UMIPs and guidance in the Markets and Data section.
•	These should then be summed to obtain the total value locked (TVL) measured in dollars.

1.	What prices should be queried for and from which markets?
•	The dollar value of each of the contracts should be calculated using the UMIPs and guidance in the Markets and Data section.
•	Where there is no price identifier UMIP, the price should be queried from the highest volume USD* market

2.	Input processing
o	https://github.com/SharedStake/Contracts/blob/main/stakingPools.sol can be used to view the staking contracts deployed by SharedStake. 
•	The dollar value of each contract should then be calculated using the details supplied in the Markets and Data section referencing the relevant UMIPs
•	These should then be summed to obtain the total value locked (TVL) measured in dollars.

Security considerations
1.	Where could manipulation occur?
•	Negligible opportunities for manipulation.
2.	How could this price ID be exploited?
•	It is possible that as expiry approaches, a user may be able to purchase a large number of TVL option on the open market, should the TVL be significantly below the level required to achieve the ceiling level, then add large amounts of collateral to an SharedStake contract slightly before expiry to temporarily drive up the TVL, redeem the synthetic tokens, then withdraw the collateral immediately afterwards.
•	It is possible that a user may purchase uTVL_KPI_SGT at a low price, lock substantial amounts of collateral in SharedStake contracts causing the uTVL_KPI_SGT price to rise, then sell these tokens at a profit and immediately withdraw the collateral from the contracts.
3.	Do the instructions for determining the price provide people with enough certainty?
•	YES
4.	What are current or future concern possibilities with the way the price identifier is defined?
•	It is possible that price identifiers for collateral types may be altered prior to expiry
•	It is possible that collateral types may be removed. This would not impact on this PI as they would not feature in any relevant contract.
5.	Are there any concerns around if the price identifier implementation is deterministic?
•	NO

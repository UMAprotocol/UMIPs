Headers
| UMIP #

| ------------------- | ------------------------------------------------------------- |
| UMIP Title | Add uTVL_KPI_SDT as supported price identifier|
| Authors | Greg Tumbiola - Tumbiola@gmail.com |
| Status | Draft |
| Created | June 12th, 2021 |
| Discourse Link | Add uTVL_KPI_SDT as price identifier for KPI Options |

Summary
This UMIP enables the DVM to support price requests based on the TVL of Stake Dao.
The metric being used for Stake DAO’s KPI Options is to reach the key target of 10^9 ($1 billion) in TVL.

Motivation
This will allow the creation of tokens which will expire 30 days after issuance to the set rate of the collateral asset tokens based on a pre-identified bounded ratio as determined by the TVL of Stake DAO.

The primary motivation for Stake DAO’S KPI Options is to incentivize their community to assist them in reaching the protocol’s key target of 9^10 ($1 Billion) TVL by leveraging their community resources by sharing their value with their community members.

The approval of this price identifier will also directly benefit UMA by improving it’s own TVL as well.

It is anticipated that this Price Identifier will be used to create KPI Options, however it is acknowledged that it may be used for a variety of purposes.

Data Specifications
Voters should access the following endpoint as a source of truth for the calculation of TVL for Stake DAO. the sum of all the stats given in the endpoint make up the total TVL USD and should be used as total TVL USD key value.

This KPI Option’s value if the TVL target is satisfied can be redeemed for: 10 SDT
This KPI Option’s value if the TVL target is not satisfied can be redeemed for: 1 SDT
Note - see rationale for further discussion

Price identifier name: uTVL_KPI_SDT

Sources & Metrics:
https://uma.stakedao.org/api/tvl

Provider to use: On-chain data

Cost to use: none

Real-time data update frequency: frequency every 5 seconds

Historical data update frequency: N/A

Technical Specifications
Price identifier name: uTVL_KPI_SDT

Base: uTVL_SDT

There is no quote currency in this option, as design feature, instead the denominator is 10^9. The collateral redemption is tied to the TVL by design

Intended Collateral Currency: SDT

Floor limit if KPI not satisfied : 01 SDT

Ceiling limit if KPI is satisfied: 10 SDT

Rationale
This synthetic is designed as an incentivization mechanism to leverage the Stake DAO community, to grow their protocol as measured by their identified Key Performance Indicator of TVL (Total Value Locked).
This price identifier offers a guarantee that these options will be of value, even if this key metric is poor. However, the amount of value that can be locked in the protocol is potentially limitless and consequently a ceiling price of 10 SDT is required to provide a cap limit.
The methods used to calculate the dollar value of each of the collateral currencies have been chosen to adhere to previous design decisions in such calculations through UMIPs that have already been approved through our governance procedure.
There is no need for price processing. This is a snapshot based on a particular time, however it may be useful for TVL Options holders to have oversight of the ongoing TVL and consequently query the value of their options on an ongoing basis.
Implementation
As there is no requirement for ongoing monitoring through liquidation or dispute bots, a price feed is not required. The only requirement is a query of the SDT TVL statistic at the timestamp 00.00(UTC) on the date of expiry according to the data and markets as defined above under - DATA SPECIFICATIONS.

To independently acquire SDT TVL these steps should be taken:

Use the endpoint https://uma.stakedao.org/api/tvl

Add all stats to arrive at the total TVL USD of SDT.

This KPI Option’s value if the TVL target is satisfied can be redeemed for: 10 SDT
This KPI Option’s value if the TVL target is not satisfied can be redeemed for: 1 SDT
Note - see rationale for further discussion

As a fallback option voters can visit the following to independently acquire StakeDao TVL :

https://defillama.com/protocol/stakedao


Security Considerations
It is possible that as expiry approaches, a user may be able to purchase a large number of TVL option on the open market, should the TVL be significantly below the level required to achieve the ceiling level, then add large amounts of collateral to an SDT contract slightly before expiry to temporarily drive up the TVL, redeem the synthetic tokens, then withdraw the collateral immediately afterwards.
It is possible that a user may purchase uTVL_KPI_SDT at a low price, lock substantial amounts of collateral in SDT contracts causing the uTVL_KPI_SDT price to rise, then sell the these tokens at a profit and immediately withdraw the collateral from the contracts.
It is possible that as expiry approaches a user may purchase a large number uTVL_KPI_SDT at a low price near expiry on the open market should the TVL be significantly below the level required to achieve the ceiling of 10 $SDT per option, then deposit substantial amounts of collateral in SDT contracts with the intention of temporarily driving up the returns from the options, then immediately withdraw the collateral after expiry, causing an artificial spike in the TVL.
Technical solutions were explored however it was considered that given the variety of potential manipulation and that whatever constraints put in place to mitigate this could be gamed, the DVM was a superior method of addressing any such attempts. In the event of such a manipulation attempt, and a dispute being raised, voters should come to consensus on what a true measure of the TVL locked in the protocol would have been by excluding the collateral used in the manipulation attempt.
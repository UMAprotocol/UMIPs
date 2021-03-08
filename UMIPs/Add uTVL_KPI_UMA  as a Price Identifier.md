
## HEADERS
| UMIP [#]     |                                                                                                                                  |
|------------|------------------------------------------------------------------------------------------------------------------------------------------|
| UMIP Title | [Key Performance Indicator; Total Value Locked UMA Price Identifier                                                                                                  |
| Authors    | [Hart Lambur hart@umaproject.org, Mhairi McAlpine mhairi@umaproject.org]
	       
| Status     | [Draft]

| Created    | [4th March 2021] 

| [Link to Discourse   -  https://discourse.umaproject.org/t/add-utvl-kpi-uma-as-a-price-identifier/318]                                                                               
<br>
<br>
<br>

# SUMMARY 

Key Performance Indicator(KPI) options are synthetic tokens that redeem to protocol tokens with the redemption value determined by performance against that indicator. One example of a KPI is Total Value Locked (TVL).  

This UMIP enables the DVM to support price requests based on the TVL of UMA

A synthetic option is minted against a base collateral, in this case UMA, which expires at 00.00(UTC) June 30th 2021.

Options are redeemed on the basis of TVL/10^8, with a floor of 0.1 and a ceiling of 2.

The value locked is calculated using the methods included in previous UMIPs which have price identifies associated with collateral types where available, collateral types which do not have an associated Price Identifier, or which are not yet approved will follow these presidents where available. 

The dollar value of each of the collateral types is then summed to provide the total value locked.

  


# MOTIVATION

The primary motivation for the development of KPI options is to allow protocols to incentivise Defi users to assist them to reach the protocol's identified targets by leveraging their community resources by sharing their value with their community members.  

Total Value Locked(TVL) is a frequently quoted key performance indicator and one which has a level of prominence in key Defi dashboards as an indicator of the health of a protocol.  Within UMA, TVL plays the additional function of being the lower floor for the value of 0,5 $UMA, due to the design of UMA and the COC>POC inequality.

1. What are the financial positions enabled by creating this synthetic that do not already exist?

  - The DVM does not currently support any form of KPI options.  This synthetic token will allow the creation of tokens which expire to a set rate of the collateral asset tokens based on a pre-identified bounded ratio as determined by the TVL of the protocol at the time of expiry.

2. Please provide an example of a person interacting with a contract that uses this price identifier. 

 - A protocol may choose to leverage its community and/or its reputation by minting TVL Options for its token which can be redeemed to a token amount as determined by the TVL of the protocol at the expiry point.
 - A protocol community member, tokenholder, voter or proximal Defi prtocol participant may be gifted a TVL option by a protocol as an incentive to build the TVL of the protocol within the option timeframe and redeem at expiry.
 - Any user may purchase a TVL Option for a protocol that they believe has the potential for growth in TVL prior to expiry.   

3. The current TVL of UMA is approximately $83m as at 21.30(UTC) 5th March 2021.

<br> 

# MARKETS & DATA SOURCES

There are a variety of assets approved as Collateral within UMA's priceless contracts.
A list of these assets is [available on our docs site](https://docs.umaproject.org/uma-tokenholders/approved-collateral-currencies).  To maintain consistency with existing price identifier UMIPs, it is suggested that different markets are queried for different collateral types. These are grouped below. 

 - [wEth] - the wrapped native token of the Ethereum Network (henceforth referred to as ETH)
 - [renBTC, wBTC] - wrapped ERC20 versions of Bitcoin (henceforth referred to as BTC)
 - [DAI, USDC, USDT, rDai]  - ERC20 dollar stable coins (henceforth referred to as USD)
 - [wBTC-Eth, USDC-Eth, UNI-Eth, UMA-Eth] -UNI Liquidity Tokens (henceforth referred to as uLQ)
 - [bwBTC/ETH SLP] Sushi Liquidity Tokens (henceforth referred to a sLQ)

Additionally there are a number of “native” ERC20 tokens which are also accepted as collateral, namely
 - bBadger, 
 - PERL, 
 - DSD, 
 - renDoge, 
 - OCEAN, 
 - YAM, 
 - Aave, 
 - Link, 
 - SNX, 
 - UMA, 
 - UNI

It is proposed that these are treated in the above groups for the purposes of determining markets and data sources.  For discussion on this see #Rationale 

 **Required questions**

1. What markets should the price be queried from? It is recommended to have at least 3 markets.

	1. ETH 	- Kraken, Binance and Coinbase (as per UMIP 6)
https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-6.md)


	2. BTC 	-  Binance, Coinbase and Bitstamp (as per UMIP 7)
https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-7.md
Should other non-algorithmic derivations of BTC to be added to the accepted collateral currency whitelist prior to expiry, these should also be similarly grouped and  follow the calculation methods detailed in UMIP 7, see rationale for further details.
Note that the price identifier of UMIP 7 is depreciated, see rationale for further discussion


	3. USD 	- assumed to be exactly 1USD. 
Should other non-algorithmic USD stablecoins be added to the accepted collateral currency whitelist prior to expiry, these should also be similarly grouped and assumed to be worth exactly 1USD
Note - See rationale for further discussion

	4. uLQ 	- Uniswap (calculations performed as per UMIP 59)
https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-59.md
Should other Uniswap liquidity tokens be added to the accepted collateral currency whitelist prior to expiry, these should also be similarly calculated.
Note - see rationale for further discussion


	5. sLQ 	- Sushiswap (calculations performed as per UMIP 39)
https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-39.md
Should other Uniswap liquidity tokens be added to the accepted collateral currency whitelist prior to expiry, these should also be similarly calculated.
Note - see rationale for further discussion


	6. DSD - Uniswap (calculation performed as per UMIP 37
https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-37.md

	7. bBadger - Sushiswap (calculations performed as per UMIP 39)
https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-39.md

 	8. PERL - Binance (calculations performed as per UMIP 13)
https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-13.md

	9. Ocean - Binance, Bittrex, BitZ (calculations performed as per UMIP 46)
https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-46.md

	10. YAM - Sushiswap, Uniswap (calculations performed as per UMIP 50)
https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-50.md

	11. Aave, Link, SNX, UMA, UNI - Coinbase, Binance, OKEx (calculations performed as per UMIP 57
https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-57.md

	12. RenDoge.  Binance, Huobi, OKEx.

**Note - see rationale for further discussion**

2.  Which specific pairs should be queried from each market?
	1. ETH 	-  see UMIP 6 
	2. BTC 		- see UMIP 7
	3. USD 	 - no query requirement  
	4. uLQ 	- see UMIP 59
	5. sLQ 	- see UMIP 39
	6. DSD 	- see UMIP 37
	7. bBadger - 	- see UMIP 39
	8. PERL 	- see UMIP 13
	9. Ocean	- see UMIP 46
	10. YAM  - 	- see  UMIP 50
	11. Aave, Link, SNX, UMA, UNI - see UMIP 57
	12. RenDoge.  Doge/USDT

3. Provide recommended endpoints to query for real-time prices from each market listed. 

	1. ETH 	- see UMIP 6
	2. BTC 		- see UMIP 7
	3. USD 	 - no query requirement  
	4. uLQ 	- see UMIP 59
	5. sLQ 	- see UMIP 39
	6. DSD 	- see UMIP 37
	7. bBadger - 	- see UMIP 39
	8. PERL 	- see UMIP 13
	9. Ocean	- see UMIP 46
	10. YAM  - 	- see  UMIP 50
	11. Aave, Link, SNX, UMA, UNI - see UMIP 57
	12. RenDoge.  Binance -  
		https://api.cryptowat.ch/markets/binance/dogeusdt/price
 		https://api.cryptowat.ch/markets/bittrex/dogeusdt/price 
		https://api.cryptowat.ch/markets/huobi/dogeusdt/price

4. How often is the provided price updated?
	1. ETH 	- see UMIP 6
	2. BTC 		- see UMIP 7
	3. USD 	 - n/a - assumed to be consistent
	4. uLQ 	- see UMIP 59
	5. sLQ 	- see UMIP 39
	6. DSD 	- see UMIP 37
	7. bBadger - 	- see UMIP 39
	8. PERL 	- see UMIP 13
	9. Ocean	- see UMIP 46
	10. YAM  - 	- see  UMIP 50
	11. Aave, Link, SNX, UMA, UNI - see UMIP 57
	12. RenDoge - The lower bound on the update frequency is 1 minute.

5. Provide recommended endpoints to query for historical prices from each market listed. 

	1. ETH 	- see UMIP 6
	2. BTC 		- see UMIP 7
	3. USD 	 - n/a - historical price is always $1
	4. uLQ 	- see UMIP 59
	5. sLQ 	- see UMIP 39
	6. DSD 	- see UMIP 37
	7. bBadger - 	- see UMIP 39
	8. PERL 	- see UMIP 13
	9. Ocean	- see UMIP 46
	10. YAM  - 	- see  UMIP 50
	11. Aave, Link, SNX, UMA, UNI - see UMIP 57
	12. Rendoge  ??UNCLEAR??

6.  Do these sources allow for querying up to 74 hours of historical data? 

  	- See relevant UMIPs
 	- RenDoge ??Unclear??

7.  How often is the provided price updated?

   	- Where updated prices are required, relevant UMIPs refer to the frequency
	- RenDoge - lower bound is 1 minute 

8. Is an API key required to query these sources? 
	 - See Relevant UMIPs
 	 - API key is required to query cryptowatch for RenDoge 


9. Is there a cost associated with usage? 

	- See relevant UMIPS
	- - RenDoge, there is a cost associated with the use of cryptowatch.

10. If there is a free tier available, how many queries does it allow for?

    - The cost impact of this PI would be negligible.

11.  What would be the cost of sending 15,000 queries?

	 - There is no need to sent 15, 000 queries for this price identifier as it does not require bots. 

<br>

# PRICE FEED IMPLEMENTATION

As there is no requirement for ongoing monitoring through liquidation or dispute bots, a price feed is not required.  The only requirement is a query of the UMA TVL statistic at the timestamp 00.00(UTC) on 30th June according to the data and markets as defined above.

<br>

# TECHNICAL SPECIFICATIONS

**1. Price Identifier Name** - uTVL_KPI_UMA

**2. Base Currency** - uTVL_UMA. 

**3. Quote currency** 

If your price identifier is a currency pair, your quote currency will be the
denominator of your currency pair. If your price identifier does not have a quote currency, please explain the reasoning behind this.

- There is no quote currency, the denominator is fixed at 10^8 (100 Million)

 - This price identifier does not have a quote currency as it is designed not to be tied to a currency price metric,.

Please be aware that the value of any UMA synthetic token is the value of the price identifier in units of the collateral currency used. If a contract’s price identifier returns 1, and is collateralized in renBTC, each synthetic will be worth 1 renBTC. In most cases, the value of your quote currency and intended collateral currency should be equal.

- The collateral redemption is designed to be tied to the value of the TVL of the protocol by design.

**4. Intended Collateral Currency** - UMA

Does the value of this collateral currency match the standalone value of the listed quote currency? 

 - No, this is a design feature.

Is your collateral currency already approved to be used by UMA financial contracts? If no, submit a UMIP to have the desired collateral currency approved for use. 

 - YES 
 - UMA was approved as a collateral currency in[UMIP 56](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-56.md) 

**5. Collateral Decimals** 

 - 18


**6. Rounding** - Round to 2 decimal places.

 - If the price is 1.025, then this would be rounded up to 1.03. If the price is 1.0249999, then this would be rounded down to 1.02.
 - if the value returned is less than 0.05 round up to 0.1 to provide a floor price.
 - if the value returned is greater that 2 round down to 2 to provide a ceiling price. 

<BR>

# RATIONALE

- This synthetic is designed as an incentivisation mechanism to leverage the UMA community, our partners and the wider Defi userbase to grow our protocol as measured by our identified Key Performance Indicator of Total Value Locked. 

 - This price identifier offers a guarantee that these options will be of value, even if this key metric is poor through the floor price mechanism, however the nature of UMA is such that the amount of value that can be locked in the protocol is potentially limitless and consequently a ceiling price is required to limit provide a cap.


 - The methods used to calculate the dollar value of each of the collateral currencies have been chosen to adhere to previous design decisions in such calculations through UMIPs that have already been approved through our governance procedure however note the following assumptions.

1. It is assumed for this purpose that 1wEth = 1Eth

2. Two forms of wrapped Bitcoin (wBTC, RenBTC) are approved for use as collateral within the UMA Protocol. 
It is assumed that for this purpose, 1 renBTC=1wBTC=1BTC.  While that assumption may be somewhat inaccurate, it has minimal impact on the overall calculation,  cuts down on processing complexity, and works on a “common sense” attitude that wrapped bitcoin on the Eth chain are equivalent in value to native bitcoin.  
There are other forms of wrapped BTC which are not approved as collateral within the UMA protocol.  To maintain consistency it is suggested that this assumption is made for any other similar non-algorithmic wrapped Bitcoin.  

3. Four non-algorithmic dollar stablecoins (DAI, USDC, USDT, rDai]) are approved as collateral within the UMA Protocol. 
It is assumed for this purpose that 1DAI=1USDC=1USDT=1rDAI=$1.  While this assumption may be somewhat inaccurate, it has minimal impact on the overall calculation, cuts down on processing complexity and works on a “common sense” attitude that a dollar stablecoin is worth exactly $1.
There are other forms of dollar stablecoins which are not approved as collateral within the UMA protocol.  To maintain consistency it is suggested that this assumption is made for any other non-algorithmic stablecoin. 

4. Four Uniswap Liquidity Tokens (wBTC-Eth, USDC-Eth, UNI-Eth, UMA-Eth) are approved as collateral within the UMA protocol. 
It is recommended that any additional proposal to add Uniswap liquidity tokens as approved collateral currencies are evaluated against UMIP 59 and follow those market and data sources unless there is good reason for deviance

5. One Sushisaw Liquidity Token ( [bwBTC/ETH SLP) is approved as collateral in the UMA Protocol. 
It is recommended that any additional proposal to add Uniswap liquidity tokens as approved collateral currencies are evaluated against UMIP 39 and follow those market and data sources unless there is good reason for deviance.

6. RenDoge is approved as a collateral currency in UMA, however there is no associated price identifier UMIP.  
It is recommended that for this purpose, 1 RenDoge = 1 Doge.  While that assumption may be somewhat inaccurate, it has minimal impact on the overall calculation,  cuts down on processing complexity, and works on a “common sense” attitude that wrapped Doge on the Eth chain are equivalent in value to native doge. The most common doge pair is Doge/USDT, the three markets with greatest volume as reported by Coingecko were chosen.

 - There is no need for price processing.  This is a snapshot based on a particular time, however it may be useful for TVL Options holders to have oversight of the ongoing TVL and consequently the value of their options on an ongoing basis.  There are currently two dashboards that track the TVL of UMA - 
	 - [SimpleID](https://monitor.simpleid.xyz/uma)
 	- [Yuen](https://docs.google.com/spreadsheets/d/e/2PACX-1vSEMURxiVQuu6jSDp2zmI7kdKKaJjgmhWNiVjwStyJekDx9hWgclKzm_yv9iyj82IRP4d9dZ8rgvCCB/pubhtml) 

 - These currently monitor different contracts and calculate the value slightly differently.

 - The use of these dashboards was considered but rejected due to the potential for manipulation and the differences between their calculations of the values of the collateral assets and the value as determined by the relevant UMIPs.


<br>

# IMPLEMENTATION

 - The dollar value of each of the contracts should be calculated using the UMIPs and guidence in the Markets and Data section.  
 - These should then be summed to obtain the total value locked (TVL) measured in dollars.
 - The TVL as measured in dollars should then be divided by 10^8



1. **What prices should be queried for and from which markets?**

 - The dollar value of each of the contracts should be calculated using the UMIPs and guidence in the Markets and Data section.  

2. **Pricing interval**

    - This will vary for each value however the relevant UMIPs provide a guide to the pricing interval for each

3. **Input processing**

    - From the list of ExpiringMultiPartyCreator (available at https://github.com/UMAprotocol/protocol/blob/master/packages/affiliates/payouts/devmining-status.json), query all EMP addresses from createExpiringMultiParty() and call pfc() on all of them, repeat same steps for PerpetualCreator and just check the createPerpetual()  event, to identify the amount of each collateral type locked in UMA contracts. 

 - The dollar value of each contract should then be calculated using the details supplied in the Markets and Data section referencing the relevant UMIPs

 - These should then be summed to obtain the total value locked (TVL) measured in dollars.


4. **Result processing** 

    - Divide TVL by 10^8 and apply the food and ceiling price rounding.

<br>

# Security considerations

1. Where could manipulation occur?

 - Negligible opportunities for manipulation.

2. How could this price ID be exploited?

 - It is possible that as expiry approaches, a user may be able to purchase a large number of TVL option on the open market, should the TVL be significantly below the level required to achieve the ceiling level, then add large amounts of collateral to an UMA contract slightly before expiry to temporarily drive up the TVL, redeem the synthetic tokens, then withdraw liquidity immediately afterwards.

 - It is also possible that a user may purchase UMATVL at a low price, lock substantial amounts of collateral in UMA contracts causing the TVLUMA price to rise, then sell the UMATVL tokens at a profit and withdraw the liquidity.
  

3. Do the instructions for determining the price provide people with enough certainty?

 - YES

4. What are current or future concern possibilities with the way the price identifier is defined?

 - It is likely that new forms of collateral will be approved prior to the expiry date.  These need to be added to this price identifier to be considered for inclusion in the TVL calculations.
 - It is possible that price identifiers for collateral types amy be altered, consideration should be given to whether to stick to the above method of calculating TVL or update
 - It is possible that collateral types may be removed.  This would not impact on this PI as they would not feature in any relevant contract. 
 

5. Are there any concerns around if the price identifier implementation is deterministic?

 - This price identifier excludes collateral locked in Jarvis contracts and the optimistic oracle contracts.



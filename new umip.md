## Headers

| **UMIP #** *Leave blank - an UMIP no will be assigned at proposal stage*
              
| ------------------- | ------------------------------------------------------------- |
| **UMIP Title**          | **Add** * MPHUSD, USDMPH, APWUSD, USDAPW, SNOWUSD, USDSNOW, NDXUSD, USDNDX  * **as a supported price identifier**|
| **Authors**             | *Shawn C. Hagenah(Hagz 48)www.shawnhagenah99@yahoo.com *                                                      |
| **Status**              | **Draft**                                                         |
| **Created**             | *5/31/2021*                                             |
| **Discourse Link**      | *Insert link to discourse topic  **after**  it has been moved into draft UMIPs_*            |

# Summary 

**The DVM should support price requests for**

* List item

MPHUSD  
USDMPH 
APWUSD  
USDAPW
SNOWUSD  
USDSNOW 
NDXUSD  
USDNDX

* List item
The canonical identifiers should be
 `MPHUSD` , `USDMPH` , `APWUSD` , `USDAPW` , `SNOWUSD` , `USDSNOW` , `NDXUSD` , `USDNDX`

# Motivation
Adding these  price identifiers allows the use of the base currencies as collateral for minting synthetics or call options. See also the [related collateral UMIP]
Any of the base currencies could used to mint yield dollars or other synthetics, and liquidators could identify under collateralized positions by comparing the USD value of the locked collateral.
Base currency call options could be minted and paid out based on the USD price of the base currency at expiry.
KPI options tied to the price of the base currency could be minted, with a payout increasing as the base currency price increases.

# Data Specifications
-----------------------------------------

* List item

**Price identifier name:** *MPH*
 **Markets & Pairs:**    
  *Sushiswap: MPH/ETH* 
  *Uniswap: MPH/ETH*

- **Crypto Watch:** **https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/CryptoWatchPriceFeed.js
- **Cost to use:** *This price feed will use the Cryptowatch API. This API is free to use but does require a fee for heavier use. *
- **Real-time data update frequency: Frequency** - * 60 seconds*
- **Historical data update frequency: Frequency** - *60 seconds*

**# Price Feed Implementation**

-------------------------------------------------------

* List item

** Price identifier name**: APW
**Markets & Pairs**:
 *Sushiswap: APW/ETH*

- **Crypto Watch:** **https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/CryptoWatchPriceFeed.js
- **Cost to use:** *This price feed will use the Cryptowatch API. This API is free to use but doe require a fee for heavier use.
- **Real-time data update frequency: Frequency** - * 60 seconds*
- **Historical data update frequency: Frequency** - *60*

***#Price Feed Implementation***

-----------------------------------------------------------

* List item

**Price identifier name**: SNOW
**Markets & Pairs**:
 *Uniswap: SNOW/ETH*
 *Gate.io: SNOW/USDT*
 
 

- [CryptoWatch](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/CryptoWatchPriceFeed.js)-
 **Cost to use:** *This price feed will use the Cryptowatch API. This API is free to use but does require a fee for heavier use.*
- **Real-time data update frequency: Frequency** - * 60 seconds*
- **Historical data update frequency: Frequency** - *60 seconds*

*#Price Feed Implementation*
----------------------------------------------------------

* List item

**Price identifier name:** NDX
**Markets & Pairs**:
 *Uniswap:* NDX/ETH
 
 - [CryptoWatch](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/CryptoWatchPriceFeed.js)-
 **Cost to use:** *This price feed will use the Cryptowatch API. This API is free to use but does require a fee for heavier use.*
- **Real-time data update frequency: Frequency** - * 60 seconds*
- **Historical data update frequency: Frequency** - *60 seconds*

***#Price Feed Implementation***

# Technical Specifications
-----------------------------------------

* - **Price identifier name:**  *MPHUSD
- **Base Currency: MPH ** 
- **Quote Currency: USD**- **Estimated current value of price identifier:** *value* **at** *timestamp*

* - **Price identifier name:** *APWUSD*
- **Base Currency: APW**
- **Quote Currency: USD**-**Estimated current value of price identifier:** *value* **at** *timestamp*

* - **Price identifier name:** *SNOWUSD
-**Base Currency: SNOW**
-**Quote Currency: USD**-**Estimated current value of price identifier:** *value* **at** *timestamp*

* -**Price identifier name:** *NDXUSD*
-**Base Currency: NDX**
-**Quote Currency: USD**-**Estimated current value of price identifier:** *value* **at** *timestamp*


# Rationale

*Excepting MPH, APW, SNOW, and NDX as price identifiers, will help hasten the UMIP process for the afore mentioned protocols, if and when the decide to involve their communities in the programs that the UMA protocol has to offer. By supplying these price identifiers now, it will limit resources needed to create  PI UMIPs  and steps in the overall UMIP process for these protocols. This would cut down time from conception, to issuance of UMIPs, making a more user friendly product. Also resources could then be allocated to better assist these communities in creating their UMIPs for the UMA protocol. All data has come from reliable sources.

**MPH:**0x8888801af4d980682e47f1a9036e589479e835c5
*Market Cap:*$18.23M
*Liquidity*:Sushi/$110,057 Uniswap/$557,427
**APW:**0x4104b135dbc9609fc1a9490e61369036497660c8
*Market Cap:*$6,182,542
*Liquidity:*Sushiswap/$2,978,476
**SNOW:**0xfe9a29ab92522d14fc65880d817214261d8479ae
*Market Cap*:$3,864,768
*Liquidity:*Uniswap/$299,554
**NDX:**0x86772b1409b61c639eaac9ba0acfbb6e238e5f83
*Market Cap:*$1,634,532,273,252
*Liquidity:*Uniswap/$114,323

# Implementation

*Describe how UMA tokenholders should arrive at the price in the case of a DVM price request. Document each step a voter should take to query for and return a price at a specific timestamp.

**Step 1** 
**Step 2:** 
...
**Step** *n-1*:   Round to** *x* **decimals to get the** *BASK* **USD price**.
**Step** *n* :  **To get the USD** *BASK* **price, voters should take the inverse of the result of Step** *n-2* **(unrounded** *BASK* **USD price) then round to** *x* **decimal places.**

*This section should include an example calculation where you pick a specific timestamp and calculate the price at that timestamp.*

# Security Considerations

*All of these currencies while new to markets are popular and traded frequently on several established exchanges as well as some of the lesser known exchanges. While newer currencies can be questionable, after research was done these listed currencies it was determined they be beneficial to UMA protocol and the clients it serves. A summary of each of the listed currencies will be included with this UMIP.*
**BASK**: https://discourse.umaproject.org/u/Hagz48 
**APWINE**:https://discourse.umaproject.org/u/Hagz48
**MPH**:https://discourse.umaproject.org/u/Hagz48
**SNOW**:https://discourse.umaproject.org/u/Hagz48
**NDX**:https://discourse.umaproject.org/u/Britt

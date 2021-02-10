## Headers
| UMIP-47    |                                                                                                                                          |
|------------|------------------------------------------------------------------------------------------------------------------------------------------|
| UMIP Title | Add uSTONKS-APR21 as a price identifier              |
| Authors    | Sean Brown (smb2796), Kevin Chan (kevin-uma)  |
| Status     | Last Call                                                                                                                                    |
| Created    | Feb 2, 2021   
| [Discourse Link](https://discourse.umaproject.org/t/add-ustonks-mar21-price-identifier-umip/125) |  

## SUMMARY

The DVM should support price requests for a basket of stocks that represent the top ten tickers with the most comment volume on r/wallstreetbets. These ten stocks will be equally weighted to create an index named uSTONKS.

## MOTIVATION

The DVM currently does not support price identifiers for the creation of indices like uSTONKS.  Financial markets should be universally accessible — unrestrained by censorship, pre-existing financial and social capital, or nationality.  With the uSTONKS price identifier synthetic tokens can be created which will allow anybody to obtain exposure to the basket of stocks in a decentralized way.  This will allow unrestricted trading 24 hours a day, 7 days a week.

## MARKETS & DATA SOURCES

- Markets:

NYSE: GME, AMC, NOK, BB, 
NASDAQ: TSLA, PLTR, SNDL, AAPL, SPCE
NYSE Arca: SLV

- Pairs: Each stock listed above should be quoted in USD. As an example, the price of one share of GME should be reported in USD - (GME/USD).
- Live Price Endpoints

The stock prices do not need to be queried in real-time. Pre-expiry, this price identifier will return the price of the synthetic on Uniswap. An example of this is given in the `Price Feed Implementation` section.

- Update time: Every block
- Historical Price Endpoints:

The Google Sheets GOOGLEFINANCE function can be used to query for the close prices of each day for the 30 day period.

```
GOOGLEFINANCE("NYSE:GME", "price", DATE(2021,1,1), DATE(2021,1,30), "DAILY")
```

Documentation on its usage is available [here](https://support.google.com/docs/answer/3093281?hl=en).

- Do these sources allow for querying up to 74 hours of historical data? Yes
- How often is the provided price updated? The provided endpoint queries for prices on a daily basis. This is the level of granularity needed to determine the expiry price.
- Is an API key required to query these sources? No.
- Is there a cost associated with usage? No.
- If there is a free tier available, how many queries does it allow for? NA
- What would be the cost of sending 15,000 queries? $0.

## PRICE FEED IMPLEMENTATION
For the creation of the uSTONKS token, it is desired that the DVM return either the final closing index value of uSTONKS, or a 2-hour TWAP on the market price of uSTONKS-APR21. The type of price that the DVM will return is dependent on the timestamp the price request is made at. This timestamp is the expiry timestamp of the contract that is intended to use this price identifier, so the TWAP calculation is used pre-expiry and the closing index value of uSTONKS calculation is used at expiry.  This is very similar to the uGAS token and this design is outlined in [UMIP 22](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-22.md).

Because the uSTONKS index value is only used at expiry, it will not be possible for a token sponsor to become undercollateralized based upon its movement.  This means that only the Uniswap TWAP will need to be queried in real-time with a price feed.

[Here](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/UniswapPriceFeed.js) is a reference implementation for an off-chain price feed that calculates the TWAP of a token based on Uniswap price data. 

## TECHNICAL SPECIFICATIONS
- Price Identifier Name: uSTONKS-APR21
- Base Currency: uSTONKS-APR21
- Quote currency: None. This is an index, but will be used with USDC.
- Intended Collateral Currency: USDC
- Collateral Decimals: 6
- Rounding: Round to nearest 6 decimal places (seventh decimal place digit >= 5 rounds up and < 5 rounds down)

## RATIONALE
The uSTONKS token is an expiring token that settles at the end of the expiry month using the final exchange closing prices on the last business day of the month for the ten stocks in the basket.

This price identifier will conditionally use a different price calculation methodology depending on the implied expiry state of the contract making the price request. This choice was made because uSTONKS is a decentralized synthetic that trades continuously 24/7 whereas the underlying stocks in the uSTONKS index trade during exchange hours which leaves gaps in prices between 4:00PM EST close and 9:30AM EST open the next day and on weekends and market holidays.  Using price feeds from the exchanges to monitor collateral ratios of token sponsors could be problematic outside of market hours especially if there is significant news released or general macro market forces.  Though some stocks are traded after hours, the ability to extract this price data is difficult and the frequency may not be consistent across all ten stocks.  Therefore, using the uSTONKS token price itself to monitor collateral ratios is a much better alternative as it should reflect the actual price movements during exchange hours and also reflect expectations of price movements after market hours.

A 2-hour TWAP was chosen to mitigate any risk of attempted price manipulation attempts on the market price of the synthetic. To meaningfully manipulate the price that token sponsors’ collateralization is calculated with, an attacker would have to manipulate the trading price of a token for an extended amount of time. This is described further in the Security Considerations section.

The stocks chosen represent the stocks with the highest average comment volume on r/WallStreetBets. This index was picked on January 29th, 2021 using r/WallStreetBets comment analysis from swaggystocks.com, and will remain static throughout the life of the price identifier. 

## IMPLEMENTATION
Voters should determine which pricing implementation to use depending on when the price request was submitted.

**At Expiry**

If the price request's UTC timestamp is at 1619812800 (April 30, 2021 @ 4:00PM EST), a price request for uSTONKS for a given timestamp should be determined by performing the `At Expiry` process.

To create a baseline for the uSTONKS index, a base price for each stock was chosen. These prices are the closing prices of each on 12/31/2020 and can be used by voters as reference values for their calculations. Voters are highly encouraged to verify these values themselves. This basket is static - it will not change over the life of the contract.

| Ticker | Stock Price 12/31/2020 |
|------------|------------------------------------------------------------------------------------------------------------------------------------------|
| GME | 18.84 |
| AMC | 2.12 |
| NOK | 3.91 |
| BB | 6.63 |
| SLV | 24.57 |
| TSLA | 705.67 |
| PLTR | 23.55 |
| SNDL | 0.47 |
| AAPL | 132.69 |
| SPCE | 23.73 |

Each stock also is assigned an index value base. The index is equally weighted, so each stock is assigned a base of 10. This means that on 12/31/2020 at close, the uSTONKS index would have been worth 100 with every component making up 1/10th of that index.
 
To calculate the uSTONKS price, an UMA voter should:
1. Query for the close price of one component on March 31, 2021. It is recommended that voters use the Google Sheets GOOGLEFINANCE function.
2. Divide the March 31 price by the base price and multiply by the index value base (10) to get today’s index value. 
3. Perform this function for each component in the index and sum all of the results together.
4. Round the result of step three to six decimal places

An example of this calculation is shown in [this](https://docs.google.com/spreadsheets/d/1AtNzHvn_0na1miktsF2vmmB5fRj2_y793r-j7_m7P8M/edit?usp=sharing) Google Sheet.

It is possible that, over the life of this price identifier, certain situations could arise that would affect the validity of the index calculation. Guidance is provided below for certain situations, but voters are free to come to an alternative consensus if a flaw in the methodology is identified or an unforeseen event occurs. 

1. In the case of a stock split, the base price of the stock should be divided by the number of shares that the stock is being split into. As an example - if AMC issued a 4:1 stock split, the base price of AMC, 2.12, would be divided by 4 and the new base index price would be 0.53.
2. In the case of a stock consolidation, the process is the same as for a stock split, except the base price should be multiplied by the number of shares being consolidated. 

**Before Expiry**

If the price request's UTC timestamp is less than 1619812800 (April 30, 2021 @ 4:00PM EST), voters will need to calculate a 2-hour TWAP for the uSTONKS-APR21 token’s price in USDC. The following process should be used to calculate the TWAP.
1. The end TWAP timestamp equals the price request timestamp.
2. The start TWAP timestamp is defined by the end TWAP timestamp minus the TWAP period (2 hours in this case).
3. A single Uniswap price is defined for each timestamp as the price that the uSTONKS-APR21 / USDC pool returns in the latest block where the block timestamp is <= the price request timestamp. This is the price of 1 uSTONKS-APR21 token in USDC. 
4. The TWAP is an average of the prices for each timestamp between the start and end timestamps. Each price in this average will get an equal weight.
5. This results should be rounded to 6 decimals.

For both implementations, voters should determine whether the returned price differs from broad market consensus. This is meant to provide flexibility in any unforeseen circumstances as voters are responsible for defining broad market consensus.

## Security Considerations
Security considerations are focused on the use of the token price for monitoring collateral ratios.
- Token price manipulation - Under illiquid market conditions, an attacker could attempt to drive prices down to withdraw more collateral than normally allowed or drive prices up to trigger liquidations. However, it is important to note that almost all attacks that have been performed on DeFi projects are executed with flash loans, which allows the attacker to obtain leverage and instantaneously manipulate a price and extract collateral. Additionally, flash loans will have no effect on a tradable token price because the TWAP calculation is measured based on the price at the end of each block. Collateralization based off of a TWAP should make these attacks ineffective and would require attackers to use significantly more capital and take more risk to exploit any vulnerabilities.
- Mismatch between TWAP and gap higher in token price - An aggressive gap higher in the token price accompanied by real buying and then a follow through rally could create a concern. In this scenario we could see the TWAP of the token significantly lag the actual market price and create an opportunity for sponsors to mint tokens with less collateral than what they can sell them from in the market. It is important to note that this is an edge case scenario either driven by an irrational change in market expectations or it can be driven by a “fat finger” mistake which is a vulnerability to any market. Even in this edge case we believe the design of the token and the parameters chosen should mitigate risks. The current Expiring Multi Party (EMP) contract requires sponsors to mint tokens with enough collateral to meet the Global Collateral Ratio (GCR) which has stood well above 200% for other contracts. Therefore, assuming the GCR is similar for uSTONKS-APR21, the market would need to first rally at least 100% before potentially being exposed. If the sponsor wishes to withdraw collateral below the GCR they would request a “slow withdrawal” which would subject him to a 2 hour “liveness period” where anybody can liquidate the position if it fell below the required collateral ratio. The combination of the GCR and 2 hour “liveness period” allows the 2 hour TWAP to “catch up” to the market price and would protect from this scenario and deter sponsors from attempting to exploit it.

Security considerations, like the ones above, have been contemplated and addressed, but there is potential for security holes to emerge due to the novelty of this price identifier.

Additionally, anyone deploying a new priceless token contract referencing this identifier should take care to parameterize the contract appropriately to avoid the loss of funds for synthetic token holders. Contract deployers should also ensure that there is a network of liquidators and disputers ready to perform the services necessary to keep the contract solvent.

$UMA-holders should evaluate the ongoing cost and benefit of supporting price requests for this identifier and also contemplate de-registering this identifier or editing its implementation if security holes are identified.

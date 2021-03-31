## Headers
| UMIP - #    |                                                                                                                                          |
|------------|------------------------------------------------------------------------------------------------------------------------------------------|
| UMIP Title | Add OPENUSD, USDOPEN as price identifiers              |
| Authors    | Logan (Logan@opendao.io)|
| Status     | Draft                                                                                                                                 |
| Created    | March 31, 2021                                                                                                                           |
| Link to Discourse|    https://discourse.umaproject.org/t/adding-openusd-and-usdopen-as-price-identifiers/519                      |

## Summary 
The DVM should support price requests for the OPENUSD and USDOPEN price indexes.

## Motivation
The DVM currently does not support the OPENUSD and USDOPEN price indexes.

Supporting the OPENUSD and USDOPEN price identifiers would enable the creation of a call option primitive for OPEN tokens, creating a new opportunity for the OPEN token holders who would be able to write the option and provide LP against it.


OPEN has a circulating supply of 7.9 Million OPEN coins and a max supply of 100 Million. Uniswap is the current most active market trading it, and at the time of writing has a market cap of $12,951,898 with a 24 hour trading volume of $1.7 million. More information on OpenDAO can be found on the website: https://opendao.io/


## Markets and Data Sources

Uniswap is the main market where OPEN token is traded. There are other exchanges that offer OPEN, but their trading volume is low enough (or artificial enough) that they should not be included in determining the price. Due to the limited number of data sources, it is recommended to rely on the Uniswap data for determining the price by combining the data from both ETH/OPEN and USDT/OPEN.

Pairs:
- UNISWAP: ETH/OPEN
- UNISWAP: USDT/OPEN

Live Price Endpoints:
- UNISWAP ETHOPEN: https://info.uniswap.org/pair/0x1ddf85abdf165d2360b31d9603b487e0275e3928
- UNISWAP USDTOPEN: https://info.uniswap.org/pair/0x507d84fe072fe62a5f2e1f917be8cc58bdc53ef8

Update Time:
- The lower bound on price feeds is one minute.

Historical Price Endpoints:
- UNISWAP ETHOPEN: https://info.uniswap.org/pair/0x1ddf85abdf165d2360b31d9603b487e0275e3928
- UNISWAP USDTOPEN: https://info.uniswap.org/pair/0x507d84fe072fe62a5f2e1f917be8cc58bdc53ef8

Do these sources allow for querying up to 74 hours of historical data? 
- Yes

Is an API key required to query these sources?
- No

Is there a cost associated with usage?
- No

If there is a free tier available, how many queries does it allow for?
- No upper limit

What would be the cost of sending 15,000 queries?
- Free


## Price Feed Implementation
Associated OPEN price feeds are available via Uniswap.  No other further feeds required.

## Technical Specifications

- Price Identifier Name: OPENUSD
- Base Currency: OPEN
- Quote currency: USD
- Intended Collateral Currency: USDC
- Collateral Decimals: 6
- Rounding: Round to nearest 6 decimal places (seventh decimal place digit >= 5 rounds up and < 5 rounds down)

- Price Identifier Name: USDOPEN
- Base Currency: USD
- Quote Currency: OPEN
- Intended Collateral Currency: OPEN
- Collateral Decimals: 18
- Rounding: Nearest 18 decimal place (nineteenth decimal place digit >= 5 rounds up and < 5 rounds down)

- Does the value of this collateral currency match the standalone value of the listed quote currency?: 
YES

- Is your collateral currency already approved to be used by UMA financial contracts?: 
No. In progress. 

## Rationale
The addition of OPENUSD and USDOPEN fits into a larger goal of advancing the adoption of the UMA protocol. For example, Bob could write the option and provide LP against it, which means he makes fees from the trading of the option which can be quite healthy.
Bob risks losing his collateral if the strike price is reached, but Bob would probably not lock all of his tokens in the option contract (unless he does not believe the price is likely to be reached at all). If the price is reached then the appreciation in the token price for the rest of his holdings would more than cover any losses.


In addition OpenDAO will be proposing that these synths be whitelisted for UMA liquidity mining. This process would take OPEN tokens out of circulation, creating upward price pressure. It also adds up as TVL, which in turn would be an bull signal for OPEN token price as well as UMA token price (given that it uses UMA contracts underneath.)

Concerns regarding volume and data sources should be tempered by the fact that this identifier is only intended to be used currently for fully covered call options which will have no liquidation bots running.


## Implementation

Voters should query for the price of OPENUSD USDOPEN at the price request timestamp on Uniswap. Recommended endpoints are provided in the markets and data sources section above.

When using the recommended endpoints, voters should:

1) Check the specific time period in question on Uniswap. Both the OPENUSDT and OPENETH prices should be checked. 

2) The ETH value should be converted into the USD equivalent.

3) The mean of the dollar-converted OPENETH value and OPENUSDT value should be taken.

4) The mean value from step 3 should be rounded to six decimals to determine the OPENUSD price.

5) The value of USDOPEN will follow the exact same process but undergo one additional step: it will be the result of dividing 1/OPENUSD.

For both implementations, voters should determine whether the returned price differs from broad market consensus. This is meant to provide flexibility in any unforeseen circumstances as voters are responsible for defining broad market consensus.

This is only a reference implementation, how one queries the exchanges should be varied and determined by the voter to ensure that there is no central point of failure.


## Security considerations

Adding these new identifiers by themselves poses little security risk to the DVM or priceless financial contract users, given the intended application of the identifier. However, anyone deploying a new priceless token contract referencing this identifier should take care to parameterize the contract appropriately to avoid the loss of funds for synthetic token holders. Additionally, the contract deployer should ensure that there is a network of liquidators and disputers ready to perform the services necessary to keep the contract solvent.

Considering past UMIPs, volume and liquidity may be a concern, however, as we are only intending to create the availability of Open call options, we don’t expect to encounter any issues regarding the aforementioned volume and liquidity. 
